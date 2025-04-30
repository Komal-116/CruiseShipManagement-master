
const firebaseConfig = {
    apiKey: "AIzaSyCtIVWDl1X2QV9dzbKwjmBFpzUc_zrtrGY",
    authDomain: "celestia-management.firebaseapp.com",
    databaseURL: "https://celestia-management-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "celestia-management",
    storageBucket: "celestia-management.firebasestorage.app",
    messagingSenderId: "1018991690511",
    appId: "1:1018991690511:web:159883eaa14c4db57e347a"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
const db = firebase.firestore();
window.db = firebase.firestore();
window.auth = firebase.auth();