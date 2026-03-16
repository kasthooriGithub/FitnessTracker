import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase"; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  //  Sign Up (create user + save profile in Firestore)
  const signUp = async (email, password, fullName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const u = userCredential.user;

      // optional displayName
      if (fullName) {
        await updateProfile(u, { displayName: fullName });
      }

      // create profile in Firestore 
      await setDoc(doc(db, "profiles", u.uid), {
        id: u.uid,
        full_name: fullName || "",
        email: email,
        daily_steps_goal: 10000,
        daily_water_goal_ml: 2000,
        daily_calories_goal: 500,
        created_at: serverTimestamp(),
      });

      return { error: null, user: u };
    } catch (error) {
      return { error, user: null };
    }
  };

  // Sign In
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { error: null, user: userCredential.user };
    } catch (error) {
      return { error, user: null };
    }
  };

  // Sign Out
  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
