
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyCLs-uSNjkKm1LgkIne9AlVn2QeFAYtqqg",
  authDomain: "studiofarajnext.firebaseapp.com",
  projectId: "studiofarajnext",
  storageBucket: "studiofarajnext.firebasestorage.app",
  messagingSenderId: "448578143537",
  appId: "1:448578143537:web:3f92f69e64db0eb3969c10",
  measurementId: "G-ZRN8CFWT4W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
