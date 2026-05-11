import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDpRdNYLgyjB0lWRXIijVdRVMoBKC8RecI",
  authDomain: "fixmycampus-f6faf.firebaseapp.com",
  databaseURL: "https://fixmycampus-f6faf-default-rtdb.firebaseio.com",
  projectId: "fixmycampus-f6faf",
  storageBucket: "fixmycampus-f6faf.firebasestorage.app",
  messagingSenderId: "968827100661",
  appId: "1:968827100661:web:e4ba041ccbbc5a0f8c14bc"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const feedRef = ref(db, 'feed');
console.log("Connecting to Firebase...");
onValue(feedRef, (snapshot) => {
  console.log("Data received:", snapshot.val());
  process.exit(0);
}, (error) => {
  console.error("Firebase Error:", error);
  process.exit(1);
});

// timeout if stuck
setTimeout(() => {
  console.log("Timeout waiting for Firebase");
  process.exit(1);
}, 5000);
