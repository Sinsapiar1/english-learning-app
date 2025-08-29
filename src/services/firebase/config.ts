/**
 * FIREBASE CONFIGURATION - ENGLISH MASTER APP
 * Configuración completa de Firebase con todas las funcionalidades
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

// Configuración de Firebase - REEMPLAZAR CON TUS CREDENCIALES
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "tu-api-key-aqui",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "english-master-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "english-master-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "english-master-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics (solo en producción)
let analytics: any = null;
let performance: any = null;

if (typeof window !== 'undefined') {
  // Analytics
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('📊 Firebase Analytics initialized');
    }
  });

  // Performance Monitoring
  if (import.meta.env.PROD) {
    performance = getPerformance(app);
    console.log('⚡ Firebase Performance initialized');
  }
}

export { analytics, performance };

// Configuración de emuladores para desarrollo
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const isEmulatorConnected = localStorage.getItem('firebase_emulator_connected');
  
  if (!isEmulatorConnected) {
    try {
      // Conectar a emuladores locales si están disponibles
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      
      localStorage.setItem('firebase_emulator_connected', 'true');
      console.log('🧪 Firebase emulators connected');
    } catch (error) {
      console.log('📡 Using production Firebase services');
    }
  }
}

// Configuración de persistencia de autenticación
auth.useDeviceLanguage();

console.log('🔥 Firebase initialized successfully');
console.log('🏗️ Environment:', import.meta.env.MODE);
console.log('📱 Project ID:', firebaseConfig.projectId);

export default app;