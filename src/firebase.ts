import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
