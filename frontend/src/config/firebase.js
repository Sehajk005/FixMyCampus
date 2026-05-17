import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, onValue, off } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dummy_api_key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mock.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://mock.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mock.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '12345',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123:web:abc',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
export { app, ref, onValue, off };
