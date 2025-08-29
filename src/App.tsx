/**
 * APP PRINCIPAL - ENGLISH MASTER V3
 * Aplicación completamente reconstruida
 */

import React, { useState, useEffect } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { Toaster } from 'react-hot-toast'
import { auth } from './lib/firebase'
import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'
import { APIKeySetup } from './components/APIKeySetup'
import { LoadingSpinner } from './components/LoadingSpinner'

interface User {
  uid: string
  email: string
  displayName?: string
  apiKey?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsAPIKey, setNeedsAPIKey] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const apiKey = localStorage.getItem('gemini_api_key')
        
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          apiKey: apiKey || undefined
        }
        
        setUser(userData)
        setNeedsAPIKey(!apiKey)
      } else {
        setUser(null)
        setNeedsAPIKey(false)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleAPIKeySetup = (apiKey: string) => {
    localStorage.setItem('gemini_api_key', apiKey)
    setUser(prev => prev ? { ...prev, apiKey } : null)
    setNeedsAPIKey(false)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <AuthScreen />
  }

  if (needsAPIKey) {
    return <APIKeySetup onComplete={handleAPIKeySetup} />
  }

  return (
    <>
      <Dashboard user={user} />
      <Toaster position="top-right" />
    </>
  )
}

export default App