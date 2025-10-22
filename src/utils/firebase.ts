import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

//Analisar depois que pode ter vunerabilidade no codigo abaixo

const firebaseConfig = {
  apiKey: "AIzaSyDgU5ZcxW7r6E6kfOdGNn3GOYgwy_boiQA",
  authDomain: "buteco-sao-benedito.firebaseapp.com",
  projectId: "buteco-sao-benedito",
  storageBucket: "buteco-sao-benedito.firebasestorage.app",
  messagingSenderId: "587286989697",
  appId: "1:587286989697:web:0b36f87e3c479750207680"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);