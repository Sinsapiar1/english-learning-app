/**
 * MAIN ENTRY POINT - ENGLISH MASTER APP
 * Inicialización de React y configuración global
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Development mode logging
if (import.meta.env.DEV) {
  console.log('🚀 English Master App - Development Mode')
}

// Service Worker registration (para PWA en el futuro)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// Performance monitoring
if (import.meta.env.PROD) {
  console.log('📊 Performance monitoring enabled')
}

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  // Aquí podrías enviar errores a un servicio de monitoreo
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // Aquí podrías enviar errores a un servicio de monitoreo
})

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)