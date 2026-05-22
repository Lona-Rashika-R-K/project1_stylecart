export type Role = "customer" | "admin";

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice: number;
  sizes: string[];
  colors: string[];
  stock: number;
  images: string[];
  featured: boolean;
  popular?: boolean;
  createdAt?: unknown;
};

export type UserProfile = {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role: Role;
  profileImage?: string;
  createdAt?: unknown;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  stock?: number;
};

export type ShippingDetails = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type OrderStatus =
  | "Order Placed"
  | "Processing"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export type Order = {
  id: string;
  orderId: string;
  userId: string;
  items: CartItem[];
  shippingDetails: ShippingDetails;
  paymentMethod: "Cash on Delivery";
  paymentStatus: "Pending" | "Paid" | "Failed";
  orderStatus: OrderStatus;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  createdAt?: unknown;
};

export type Coupon = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount: number;
  active: boolean;
  expiryDate?: unknown;
};
