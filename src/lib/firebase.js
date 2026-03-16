import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLGoxq41yxUDltUNeAT9_9UfOHjSyyD5U",
  authDomain: "ftracker-a7476.firebaseapp.com",
  projectId: "ftracker-a7476",
  storageBucket: "ftracker-a7476.firebasestorage.app",
  messagingSenderId: "647974127981",
  appId: "1:647974127981:web:2331de8322368853aff264",
  measurementId: "G-2TQ7MTV9XC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
