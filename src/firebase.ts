import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Import the functions you need from the SDKs you need
 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfPvjt_Aq7UIQl2-vqJAwqhF7atKuAjfA",
  authDomain: "andraid-f9b6d.firebaseapp.com",
  projectId: "andraid-f9b6d",
  storageBucket: "andraid-f9b6d.firebasestorage.app",
  messagingSenderId: "107503164583",
  appId: "1:107503164583:web:a2f42989272d11506b4f82",
  measurementId: "G-7P9D0XGLTF"
};
 

// Initialize Firebase
let app;
let auth: any;
let googleProvider: any;
let db: any;
let storage: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { auth, googleProvider, db, storage };


