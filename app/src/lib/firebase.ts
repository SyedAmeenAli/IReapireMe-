import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBSxs1uX7DH6yYVdZM597NX65UR1eff1SE",
  authDomain: "irepairme.firebaseapp.com",
  projectId: "irepairme",
  storageBucket: "irepairme.firebasestorage.app",
  messagingSenderId: "572428475394",
  appId: "1:572428475394:web:5930b32f1da5bd33115b1b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
