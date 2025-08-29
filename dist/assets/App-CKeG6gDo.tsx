/**
 * ENGLISH MASTER APP - APLICACIÓN PRINCIPAL
 * Sistema completo de aprendizaje de inglés con IA personalizada
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Firebase
import { auth } from './services/firebase/config';

// Services
import { ProgressService } from './services/firebase/ProgressService';

// Components
import { AuthScreen } from './components/auth/AuthScreen';
import { APIKeySetup } from './components/auth/APIKeySetup';
import { Dashboard } from './components/dashboard/Dashboard';
import { LearningSession } from './components/learning/LearningSession';
import { ProgressView } from './components/progress/ProgressView';
import { SettingsView } from './components/settings/SettingsView';

// Types
import { UserProgress, SessionResults } from './types/progress';

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
      />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">English Master</h2>
      <p className="text-gray-600">Cargando tu experiencia personalizada...</p>
    </motion.div>
  </div>
);

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('English Master Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Algo salió mal
            </h2>
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. Por favor recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

// Main App Component
const App: React.FC = () => {
  // Estados principales
  const [user, setUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'session' | 'progress' | 'settings'>('dashboard');

  const progressService = new ProgressService();

  // Inicialización de la app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          console.log('👤 Usuario autenticado:', user.email);
          setUser(user);
          
          // Cargar progreso del usuario
          let progress = await progressService.getUserProgress(user.uid);
          
          if (!progress) {
            console.log('🆕 Nuevo usuario detectado');
            // Verificar si tiene API key guardada
            const savedAPIKey = localStorage.getItem('gemini_api_key');
            if (savedAPIKey) {
              console.log('🔑 API Key encontrada, inicializando progreso...');
              progress = await progressService.initializeUserProgress(user.uid, user.email!, savedAPIKey);
              setApiKey(savedAPIKey);
            }
          } else {
            console.log('📊 Progreso del usuario cargado');
            // Usuario existente - cargar API key
            const decryptedKey = atob(progress.apiKey); // Desencriptar
            setApiKey(decryptedKey);
          }
          
          setUserProgress(progress);
        } else {
          console.log('👤 Usuario no autenticado');
          setUser(null);
          setUserProgress(null);
          setApiKey('');
        }
      } catch (error) {
        console.error('❌ Error en inicialización:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Manejar completación de sesión
  const handleSessionComplete = async (sessionResults: SessionResults) => {
    if (!user || !userProgress) return;
    
    try {
      console.log('📊 Completando sesión:', sessionResults);
      
      const updatedProgress = await progressService.updateProgress(user.uid, sessionResults);
      setUserProgress(updatedProgress);
      
      // Verificar level up
      if (updatedProgress.currentLevel !== userProgress.currentLevel) {
        console.log(`🎉 LEVEL UP: ${userProgress.currentLevel} → ${updatedProgress.currentLevel}`);
        // TODO: Mostrar celebración de level up
      }
      
      // Volver al dashboard
      setCurrentView('dashboard');
      
    } catch (error) {
      console.error('❌ Error completando sesión:', error);
    }
  };

  // Manejar configuración de API Key
  const handleAPIKeySetup = async (key: string) => {
    if (!user) return;
    
    try {
      console.log('🔑 Configurando API Key para usuario:', user.email);
      
      const progress = await progressService.initializeUserProgress(user.uid, user.email!, key);
      setApiKey(key);
      setUserProgress(progress);
      
      console.log('✅ Usuario inicializado exitosamente');
      
    } catch (error) {
      console.error('❌ Error configurando API Key:', error);
    }
  };

  // Estados de carga
  if (loading) {
    return <LoadingSpinner />;
  }

  // Usuario no autenticado
  if (!user) {
    return <AuthScreen />;
  }

  // Usuario sin API Key configurada
  if (!apiKey || !userProgress) {
    return <APIKeySetup onComplete={handleAPIKeySetup} />;
  }

  // Aplicación principal
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/"
                element={
                  currentView === 'dashboard' ? (
                    <Dashboard
                      userProgress={userProgress}
                      onStartSession={() => setCurrentView('session')}
                      onViewProgress={() => setCurrentView('progress')}
                      onSettings={() => setCurrentView('settings')}
                    />
                  ) : currentView === 'session' ? (
                    <LearningSession
                      userProgress={userProgress}
                      apiKey={apiKey}
                      onComplete={handleSessionComplete}
                      onExit={() => setCurrentView('dashboard')}
                    />
                  ) : currentView === 'progress' ? (
                    <ProgressView
                      userProgress={userProgress}
                      onBack={() => setCurrentView('dashboard')}
                    />
                  ) : (
                    <SettingsView
                      userProgress={userProgress}
                      onBack={() => setCurrentView('dashboard')}
                      onUpdateProgress={setUserProgress}
                    />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
      
      {/* Notificaciones */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </ErrorBoundary>
  );
};

export default App;