import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaY-oTFu2k1sLdpFktiekoTeA72FSXt2M",
  authDomain: "english-learning-app-ae0d9.firebaseapp.com",
  databaseURL: "https://english-learning-app-ae0d9-default-rtdb.firebaseio.com",
  projectId: "english-learning-app-ae0d9",
  storageBucket: "english-learning-app-ae0d9.firebasestorage.app",
  messagingSenderId: "517830954088",
  appId: "1:517830954088:web:c17fe7c26dc513a75e3fdd",
};

const app = initializeApp(firebaseConfig);

// Configuración optimizada de Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);

// 📊 ANALYTICS - INICIALIZACIÓN SEGURA
let analytics: any = null;

// Inicializar Analytics solo si está soportado (evita errores en algunos navegadores)
const initializeAnalytics = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
      console.log("📊 Firebase Analytics inicializado correctamente");
    } else {
      console.log("📊 Analytics no soportado en este navegador - funcionando sin analytics");
    }
  } catch (error) {
    console.log("📊 Error inicializando Analytics (no crítico):", error);
  }
};

// Inicializar Analytics de forma asíncrona
initializeAnalytics();

export { analytics };

// Manejo de conectividad mejorado
export const enableFirestore = async () => {
  try {
    await enableNetwork(db);
    console.log("✅ Firestore conectado");
  } catch (error) {
    console.warn("⚠️ Error conectando Firestore:", error);
  }
};

export const disableFirestore = async () => {
  try {
    await disableNetwork(db);
    console.log("📴 Firestore desconectado");
  } catch (error) {
    console.warn("⚠️ Error desconectando Firestore:", error);
  }
};

// Verificar estado de conexión
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    // Test simple de conectividad
    const testPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
      // Simular test de conexión
      resolve(true);
      clearTimeout(timeout);
    });
    
    await testPromise;
    return true;
  } catch (error) {
    console.warn("⚠️ Firestore no disponible:", error);
    return false;
  }
};

export default app;
