"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db, isFirebaseConfigured, storage } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";

type SignupData = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const demoProfile: UserProfile = {
  uid: "demo-user",
  fullName: "Demo Customer",
  email: "demo@stylecart.test",
  phone: "9876543210",
  address: "MG Road, Bengaluru",
  role: "customer",
  profileImage: ""
};

async function readProfile(uid: string) {
  if (!db) return demoProfile;
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? ({ uid, ...snapshot.data() } as UserProfile) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      const savedProfile = typeof window !== "undefined" ? window.localStorage.getItem("stylecart-profile") : null;
      const nextProfile = savedProfile ? ({ ...demoProfile, ...JSON.parse(savedProfile) } as UserProfile) : null;
      setUser(nextProfile ? ({ uid: nextProfile.uid, email: nextProfile.email } as User) : null);
      setProfile(nextProfile);
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setProfile(currentUser ? await readProfile(currentUser.uid) : null);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      async login(email, password) {
        if (!auth) {
          const nextProfile: UserProfile = {
            ...demoProfile,
            email: email || demoProfile.email,
            role: email.toLowerCase().includes("admin") ? "admin" : "customer"
          };
          window.localStorage.setItem("stylecart-profile", JSON.stringify(nextProfile));
          setUser({ uid: nextProfile.uid, email: nextProfile.email } as User);
          setProfile(nextProfile);
          return nextProfile;
        }
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const nextProfile = await readProfile(credential.user.uid);
        setProfile(nextProfile);
        return nextProfile;
      },
      async signup(data) {
        if (!auth || !db) {
          const profileData: UserProfile = {
            uid: "demo-user",
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            role: "customer",
            profileImage: ""
          };
          window.localStorage.setItem("stylecart-profile", JSON.stringify(profileData));
          setUser({ uid: profileData.uid, email: profileData.email } as User);
          setProfile(profileData);
          return;
        }
        const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const profileData: UserProfile = {
          uid: credential.user.uid,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          role: "customer",
          profileImage: "",
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, "users", credential.user.uid), profileData);
        setProfile(profileData);
      },
      async logout() {
        if (!auth) {
          window.localStorage.removeItem("stylecart-profile");
          setUser(null);
          setProfile(null);
          return;
        }
        await signOut(auth);
      },
      resetPassword: (email) => (auth ? sendPasswordResetEmail(auth, email) : Promise.resolve()),
      async updateProfile(data) {
        if (!user) throw new Error("You must be logged in.");
        if (!db) {
          setProfile((current) => {
            const nextProfile = current ? { ...current, ...data } : ({ ...demoProfile, ...data } as UserProfile);
            window.localStorage.setItem("stylecart-profile", JSON.stringify(nextProfile));
            return nextProfile;
          });
          return;
        }
        await updateDoc(doc(db, "users", user.uid), data);
        setProfile((current) => (current ? { ...current, ...data } : current));
      },
      async uploadProfileImage(file) {
        if (!user) throw new Error("You must be logged in.");
        if (!storage || !db) {
          const url = URL.createObjectURL(file);
          setProfile((current) => {
            const nextProfile = current ? { ...current, profileImage: url } : ({ ...demoProfile, profileImage: url } as UserProfile);
            window.localStorage.setItem("stylecart-profile", JSON.stringify(nextProfile));
            return nextProfile;
          });
          return url;
        }
        const imageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}-${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        await updateDoc(doc(db, "users", user.uid), { profileImage: url });
        setProfile((current) => (current ? { ...current, profileImage: url } : current));
        return url;
      }
    }),
    [loading, profile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
