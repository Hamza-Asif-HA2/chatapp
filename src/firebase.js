// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDbmUwuqt66zkMEkMZInmnv_0UEST8Nmj0",
    authDomain: "encryptedchat-54e23.firebaseapp.com",
    projectId: "encryptedchat-54e23",
    storageBucket: "encryptedchat-54e23.firebasestorage.app",
    messagingSenderId: "83267652028",
    appId: "1:83267652028:web:a6726093e8a85160cc83b9",
    measurementId: "G-ZDZS20DB8S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };