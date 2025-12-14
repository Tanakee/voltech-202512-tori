import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// TODO: Firebaseコンソールから取得した設定値に書き換えてください
// https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "AIzaSyCwct7TCe2YMfvg8xsczqrFvdQ3zRqDQfI",
  authDomain: "twido-2c548.firebaseapp.com",
  projectId: "twido-2c548",
  storageBucket: "twido-2c548.firebasestorage.app",
  messagingSenderId: "70748637266",
  appId: "1:70748637266:web:0fad865d62463cdf1d378b",
  measurementId: "G-P1LZ8VMQRW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized:", app.name);

// Use initializeFirestore to configure settings
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
// export const auth = getAuth(app);
