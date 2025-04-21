import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBHjKNl5dWzdWdxGs4XGnFMog-Y6LcHvS4",
    authDomain: "cruiseship-38d84.firebaseapp.com",
    projectId: "cruiseship-38d84",
    storageBucket: "cruiseship-38d84.firebasestorage.app",
    messagingSenderId: "539235267272",
    appId: "1:539235267272:web:2d6a1ca0732e90c8282bfd",
    measurementId: "G-E2BWJ1K6ZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
