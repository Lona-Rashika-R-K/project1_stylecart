import admin from "firebase-admin";
import { readFileSync } from "node:fs";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  console.error("Set FIREBASE_SERVICE_ACCOUNT_PATH to your Firebase service account JSON file.");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const products = [
  {
    name: "Denim Utility Jacket",
    description: "Structured denim jacket with roomy pockets, contrast stitching, and an easy everyday fit.",
    category: "Women",
    price: 2499,
    discountPrice: 1999,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Black"],
    stock: 20,
    images: ["https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80"],
    featured: true,
    popular: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: "Linen Camp Shirt",
    description: "Breathable linen blend shirt with a relaxed collar and soft garment-washed handfeel.",
    category: "Men",
    price: 1899,
    discountPrice: 1499,
    sizes: ["M", "L", "XL"],
    colors: ["White", "Tan", "Green"],
    stock: 14,
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80"],
    featured: true,
    popular: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: "Runner Knit Sneaker",
    description: "Lightweight knit sneaker with cushioned sole and clean styling for daily movement.",
    category: "Shoes",
    price: 3299,
    discountPrice: 2799,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
    stock: 5,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"],
    featured: true,
    popular: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

const coupons = [
  {
    code: "STYLE10",
    discountType: "percentage",
    discountValue: 10,
    minimumOrderAmount: 1000,
    active: true,
    expiryDate: admin.firestore.Timestamp.fromDate(new Date("2027-12-31"))
  }
];

for (const product of products) {
  await db.collection("products").add(product);
}

for (const coupon of coupons) {
  await db.collection("coupons").doc(coupon.code).set(coupon);
}

console.log(`Seeded ${products.length} products and ${coupons.length} coupon.`);
