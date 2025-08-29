/**
 * CONFIGURACIÓN DE API KEY - ONBOARDING COMPLETO
 * English Master App - Setup Inicial del Usuario
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Lightbulb,
  Zap,
  Shield
} from 'lucide-react';

import { GeminiService } from '../../services/ai/GeminiService';

interface APIKeySetupProps {
  onComplete: (apiKey: string) => void;
}

export const APIKeySetup: React.FC<APIKeySetupProps> = ({ onComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [currentStep, setCurrentStep] = useState<'intro' | 'setup' | 'validate'>('intro');

  const validateAPIKey = async (key: string): Promise<boolean> => {
    try {
      const geminiService = new GeminiService(key);
      
      // Test básico de conectividad
      const testExercises = await geminiService.generateExercises({
        userId: 'test_user',
        level: 'A1',
        weakAreas: [],
        completedExercises: 0,
        sessionNumber: 1
      });

      return testExercises && testExercises.length > 0;
    } catch (error) {
      console.error('API Key validation error:', error);
      return false;
    }
  };

  const handleValidateKey = async () => {
    if (!apiKey.trim()) {
      setError('Por favor ingresa tu API Key');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      setError('La API Key debe comenzar con "AIza"');
      return;
    }

    setIsValidating(true);
    setError('');
    
    try {
      const isValid = await validateAPIKey(apiKey.trim());
      
      if (isValid) {
        localStorage.setItem('gemini_api_key', apiKey.trim());
        onComplete(apiKey.trim());
      } else {
        setError('API Key inválida o sin permisos. Verifica que esté activa y tenga acceso a Gemini.');
      }
    } catch (error) {
      setError('Error validando API Key. Verifica tu conexión a internet.');
    } finally {
      setIsValidating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Pantalla de introducción
  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto text-center space-y-8"
        >
          <motion.div variants={itemVariants}>
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">EM</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              ¡Bienvenido a English Master!
            </h1>
            <p className="text-xl text-gray-600 max-w-lg mx-auto">
              La primera app de inglés 100% personalizada con IA que se adapta a tu nivel real
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-3 gap-6 my-12"
          >
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="font-bold text-lg mb-2">IA Personal</h3>
              <p className="text-gray-600 text-sm">
                Ejercicios únicos generados específicamente para tu nivel y debilidades
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl mb-4">🇪🇸</div>
              <h3 className="font-bold text-lg mb-2">Pedagogía Real</h3>
              <p className="text-gray-600 text-sm">
                A1: Preguntas en español → Respuestas en inglés. Lógica que funciona.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="font-bold text-lg mb-2">Progreso Real</h3>
              <p className="text-gray-600 text-sm">
                A1 → A2 → B1 → B2 con requisitos específicos y progresión lógica
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              onClick={() => setCurrentStep('setup')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Comenzar Configuración
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Pantalla de configuración
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200/50">
          
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Configura tu API Key Personal
            </h2>
            <p className="text-gray-600">
              Necesitas tu propia API Key de Google AI Studio para generar ejercicios únicos
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                ¿Por qué necesitas tu propia API Key?
              </h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 mt-0.5 text-blue-600" />
                  <span><strong>Control total:</strong> Tus datos y progreso son 100% privados</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 mt-0.5 text-blue-600" />
                  <span><strong>Ejercicios ilimitados:</strong> Genera tantos como necesites</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 mt-0.5 text-blue-600" />
                  <span><strong>Personalización máxima:</strong> IA adaptada a tu progreso específico</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              Cómo obtener tu API Key (2 minutos):
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div className="flex-1">
                  <p className="text-gray-800">
                    Ve a{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                    >
                      Google AI Studio
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-gray-800 flex-1">Haz clic en "Create API Key" y selecciona tu proyecto</p>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-gray-800 flex-1">Copia la API Key y pégala abajo</p>
              </div>
            </div>
          </motion.div>

          {/* API Key Input */}
          <motion.div variants={itemVariants} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google AI Studio API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError('');
                }}
                placeholder="AIzaSy..."
                className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg font-mono"
                disabled={isValidating}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Validation Button */}
          <motion.button
            variants={itemVariants}
            onClick={handleValidateKey}
            disabled={!apiKey.trim() || isValidating}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!isValidating ? { scale: 1.01 } : {}}
            whileTap={!isValidating ? { scale: 0.99 } : {}}
          >
            {isValidating ? (
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Validando API Key...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Validar y Continuar</span>
              </div>
            )}
          </motion.button>

          {/* Security Note */}
          <motion.div variants={itemVariants} className="mt-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">🔒 Tu API Key es segura</p>
                  <p>Se almacena localmente en tu dispositivo y solo se usa para generar tus ejercicios personalizados.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};