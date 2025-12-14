import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { Platform } from 'react-native';

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
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
console.log("Firebase initialized:", app.name);

// Initialize Firestore
let db;
try {
  // Try to initialize with settings
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
  });
} catch (e: any) {
  // If already initialized with different settings (e.g. HMR), fallback to existing instance
  console.log("Firestore already initialized, using existing instance.");
  db = getFirestore(app);
}

// Initialize Auth with Persistence
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth, db };

