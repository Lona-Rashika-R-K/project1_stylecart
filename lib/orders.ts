import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CartItem, Coupon, Order, OrderStatus, ShippingDetails } from "@/lib/types";

const demoCoupons: Coupon[] = [{ code: "STYLE10", discountType: "percentage", discountValue: 10, minimumOrderAmount: 500, active: true }];

function readLocalOrders() {
  if (typeof window === "undefined") return [];
  const saved = window.localStorage.getItem("stylecart-orders");
  return saved ? (JSON.parse(saved) as Order[]) : [];
}

function writeLocalOrders(orders: Order[]) {
  if (typeof window !== "undefined") window.localStorage.setItem("stylecart-orders", JSON.stringify(orders));
}

export function calculateTotals(items: CartItem[], coupon?: Coupon | null) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const eligible = coupon?.active && subtotal >= coupon.minimumOrderAmount;
  const discount = eligible
    ? coupon.discountType === "percentage"
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : coupon.discountValue
    : 0;
  const deliveryCharge = subtotal > 2500 || subtotal === 0 ? 0 : 50;
  return { subtotal, discount, deliveryCharge, totalAmount: Math.max(subtotal - discount + deliveryCharge, 0) };
}

export async function findCoupon(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  if (!db) return demoCoupons.find((coupon) => coupon.code === normalized) ?? null;
  const firestore = db;
  const snapshot = await getDocs(query(collection(firestore, "coupons"), where("code", "==", normalized)));
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Coupon;
}

export async function placeOrder(userId: string, items: CartItem[], shippingDetails: ShippingDetails, coupon?: Coupon | null) {
  const totals = calculateTotals(items, coupon);
  if (!db) {
    const order: Order = {
      id: `demo-${Date.now()}`,
      orderId: `SC-${Date.now()}`,
      userId,
      items,
      shippingDetails,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      orderStatus: "Order Placed",
      ...totals,
      createdAt: new Date().toISOString()
    };
    writeLocalOrders([order, ...readLocalOrders()]);
    window.localStorage.setItem(`stylecart-cart-${userId}`, JSON.stringify([]));
    return { id: order.id, orderId: order.orderId, ...totals };
  }
  const firestore = db;
  return runTransaction(firestore, async (transaction) => {
    for (const item of items) {
      const productRef = doc(firestore, "products", item.productId);
      const productSnap = await transaction.get(productRef);
      const currentStock = productSnap.exists() ? Number(productSnap.data().stock ?? 0) : item.stock ?? 0;
      if (currentStock < item.quantity) throw new Error(`${item.name} does not have enough stock.`);
      transaction.update(productRef, { stock: increment(-item.quantity) });
    }

    const orderId = `SC-${Date.now()}`;
    const orderRef = doc(collection(firestore, "orders"));
    transaction.set(orderRef, {
      orderId,
      userId,
      items,
      shippingDetails,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      orderStatus: "Order Placed",
      ...totals,
      createdAt: serverTimestamp()
    });
    transaction.set(doc(firestore, "cart", userId), { userId, items: [], updatedAt: serverTimestamp() });
    return { id: orderRef.id, orderId, ...totals };
  });
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (!db) return readLocalOrders().filter((order) => order.userId === userId);
  const firestore = db;
  const snapshot = await getDocs(query(collection(firestore, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Order);
}

export async function getAllOrders(): Promise<Order[]> {
  if (!db) return readLocalOrders();
  const firestore = db;
  const snapshot = await getDocs(query(collection(firestore, "orders"), orderBy("createdAt", "desc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Order);
}

export async function getOrder(idOrOrderId: string): Promise<Order | null> {
  if (!db) return readLocalOrders().find((order) => order.id === idOrOrderId || order.orderId === idOrOrderId) ?? null;
  const firestore = db;
  const direct = await getDoc(doc(firestore, "orders", idOrOrderId));
  if (direct.exists()) return { id: direct.id, ...direct.data() } as Order;

  const snapshot = await getDocs(query(collection(firestore, "orders"), where("orderId", "==", idOrOrderId)));
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Order;
}

export async function updateOrderStatus(id: string, orderStatus: OrderStatus) {
  if (!db) {
    writeLocalOrders(readLocalOrders().map((order) => (order.id === id ? { ...order, orderStatus } : order)));
    return;
  }
  const firestore = db;
  await updateDoc(doc(firestore, "orders", id), { orderStatus });
}
