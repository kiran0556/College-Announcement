
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


// ⚠️ REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyDSr91d3iNdpSpLN6u7mxLpuetJITfQnEQ",
    authDomain: "college-announcement-app-2c49b.firebaseapp.com",
    projectId: "college-announcement-app-2c49b",
    storageBucket: "college-announcement-app-2c49b.firebasestorage.app",
    messagingSenderId: "681901594998",
    appId: "1:681901594998:web:08fa9abd45c3353f378257"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
