# StyleCart Roadmap

## Phase 1: Firebase Setup

- Create Firebase project.
- Enable Email/Password Authentication.
- Add Firestore database and Firebase Storage.
- Copy web app keys into `.env.local`.
- Deploy `firestore.rules`, `storage.rules`, and `firestore.indexes.json`.

## Phase 2: Data and Admin

- Run `npm run seed` with a service account.
- Create an admin user through signup.
- Change `users/{uid}.role` to `admin`.
- Upload production product images through the admin dashboard.

## Phase 3: Customer MVP

- Validate login and signup flows.
- Browse home, categories, listing filters, and product details.
- Add products to cart, apply `STYLE10`, checkout with Cash on Delivery.
- Confirm order appears in profile and admin dashboard.

## Phase 4: Hardening

- Add Firebase Emulator tests for Firestore rules.
- Add form-level loading states and toast notifications.
- Add server-side order creation through Cloud Functions for stronger stock and coupon validation.
- Add analytics events for product views, cart actions, and checkout.

## Phase 5: Future Features

- Stripe, Razorpay, UPI, and card payments.
- Reviews and ratings collection.
- Email confirmations through Firebase Cloud Functions.
- Advanced shipment tracking.
- Return and refund management.
- Product recommendations and admin analytics.
