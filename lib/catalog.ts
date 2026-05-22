import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { fallbackProducts } from "@/lib/constants";
import type { Product } from "@/lib/types";

function readLocalProducts() {
  if (typeof window === "undefined") return fallbackProducts;
  const saved = window.localStorage.getItem("stylecart-products");
  if (!saved) return fallbackProducts;
  const savedProducts = JSON.parse(saved) as Product[];
  const savedIds = new Set(savedProducts.map((product) => product.id));
  return [...savedProducts, ...fallbackProducts.filter((product) => !savedIds.has(product.id))];
}

function writeLocalProducts(products: Product[]) {
  if (typeof window !== "undefined") window.localStorage.setItem("stylecart-products", JSON.stringify(products));
}

export async function getProducts(): Promise<Product[]> {
  if (!db) return readLocalProducts();
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(query(productsRef, orderBy("createdAt", "desc")));
    const products = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product);
    return products.length ? products : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!db) return readLocalProducts().filter((product) => product.featured);
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(query(productsRef, where("featured", "==", true), limit(8)));
    const products = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product);
    return products.length ? products : fallbackProducts.filter((product) => product.featured);
  } catch {
    return fallbackProducts.filter((product) => product.featured);
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!db) return readLocalProducts().find((product) => product.id === id) ?? null;
  try {
    const snapshot = await getDoc(doc(db, "products", id));
    if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() } as Product;
    return fallbackProducts.find((product) => product.id === id) ?? null;
  } catch {
    return fallbackProducts.find((product) => product.id === id) ?? null;
  }
}

export async function saveProduct(product: Omit<Product, "id">, id?: string) {
  if (!db) {
    const products = readLocalProducts();
    const generatedId = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const nextId = id ?? (generatedId || `product-${Date.now()}`);
    const nextProduct = { ...product, id: nextId };
    writeLocalProducts(id ? products.map((item) => (item.id === id ? nextProduct : item)) : [nextProduct, ...products]);
    return nextId;
  }
  const payload = { ...product, createdAt: product.createdAt ?? serverTimestamp() };
  const productsRef = collection(db, "products");
  if (id) {
    await updateDoc(doc(db, "products", id), payload);
    return id;
  }
  const created = await addDoc(productsRef, payload);
  return created.id;
}

export async function removeProduct(id: string) {
  if (!db) {
    writeLocalProducts(readLocalProducts().filter((product) => product.id !== id));
    return;
  }
  await deleteDoc(doc(db, "products", id));
}

export async function uploadProductImage(file: File) {
  if (!storage) return URL.createObjectURL(file);
  const fileRef = ref(storage, `products/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
