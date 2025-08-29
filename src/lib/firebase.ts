/**
 * FIREBASE CONFIG - ENGLISH MASTER V3
 */

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBXbYwzxYxYxYxYxYxYxYxYxYxYxYxYxYx",
  authDomain: "english-master-v3.firebaseapp.com",
  projectId: "english-master-v3",
  storageBucket: "english-master-v3.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export default app