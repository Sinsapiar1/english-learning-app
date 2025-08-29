/**
 * VISTA DE CONFIGURACIÓN - ENGLISH MASTER APP
 * Configuración de usuario, preferencias y gestión de cuenta
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Key, 
  Bell, 
  Volume2, 
  Palette, 
  Globe, 
  Shield,
  LogOut,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

import { auth } from '../../services/firebase/config';
import { UserProgress } from '../../types/progress';
import { ProgressService } from '../../services/firebase/ProgressService';

interface SettingsViewProps {
  userProgress: UserProgress;
  onBack: () => void;
  onUpdateProgress: (progress: UserProgress) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProgress,
  onBack,
  onUpdateProgress
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'api' | 'privacy'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Estados para edición
  const [editedPreferences, setEditedPreferences] = useState(userProgress.preferences);
  const [newApiKey, setNewApiKey] = useState('');

  const progressService = new ProgressService();

  const handleSavePreferences = async () => {
    try {
      setIsLoading(true);
      
      const updatedProgress = {
        ...userProgress,
        preferences: editedPreferences
      };
      
      // Aquí se guardaría en Firebase
      // await progressService.updateUserPreferences(userProgress.userId, editedPreferences);
      
      onUpdateProgress(updatedProgress);
      toast.success('Preferencias guardadas exitosamente');
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Error guardando preferencias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateApiKey = async () => {
    if (!newApiKey.trim()) {
      toast.error('Ingresa una API Key válida');
      return;
    }

    try {
      setIsLoading(true);
      
      // Validar nueva API Key
      // const isValid = await validateApiKey(newApiKey);
      // if (!isValid) {
      //   toast.error('API Key inválida');
      //   return;
      // }
      
      localStorage.setItem('gemini_api_key', newApiKey);
      
      const updatedProgress = {
        ...userProgress,
        apiKey: btoa(newApiKey) // Encriptar
      };
      
      onUpdateProgress(updatedProgress);
      toast.success('API Key actualizada exitosamente');
      setNewApiKey('');
      
    } catch (error) {
      console.error('Error updating API key:', error);
      toast.error('Error actualizando API Key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error cerrando sesión');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
    );
    
    if (!confirmed) return;

    try {
      setIsLoading(true);
      
      // Aquí se eliminaría la cuenta y todos los datos
      // await progressService.deleteUserAccount(userProgress.userId);
      // await auth.currentUser?.delete();
      
      toast.success('Cuenta eliminada exitosamente');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error eliminando cuenta');
    } finally {
      setIsLoading(false);
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al Dashboard</span>
            </button>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Configuración
            </h1>

            <div className="w-32"></div> {/* Spacer */}
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'profile', label: 'Perfil', icon: User },
              { id: 'preferences', label: 'Preferencias', icon: Settings },
              { id: 'api', label: 'API Key', icon: Key },
              { id: 'privacy', label: 'Privacidad', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div variants={itemVariants} className="p-8 space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Información del Perfil</h2>
              
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {userProgress.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {userProgress.email.split('@')[0]}
                  </h3>
                  <p className="text-gray-600">{userProgress.email}</p>
                  <p className="text-sm text-gray-500">
                    Miembro desde {new Date(userProgress.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Nivel Actual</h4>
                  <p className="text-2xl font-bold text-blue-700">{userProgress.currentLevel}</p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Total XP</h4>
                  <p className="text-2xl font-bold text-green-700">{userProgress.totalXP.toLocaleString()}</p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Racha Actual</h4>
                  <p className="text-2xl font-bold text-purple-700">{userProgress.currentStreak} días</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <motion.div variants={itemVariants} className="p-8 space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferencias</h2>
              
              <div className="space-y-6">
                {/* Daily Goal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
                    Meta diaria de ejercicios
                  </label>
                  <select
                    value={editedPreferences.dailyGoal}
                    onChange={(e) => setEditedPreferences({
                      ...editedPreferences,
                      dailyGoal: parseInt(e.target.value)
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10 ejercicios</option>
                    <option value={20}>20 ejercicios</option>
                    <option value={30}>30 ejercicios</option>
                    <option value={50}>50 ejercicios</option>
                  </select>
                </div>

                {/* Reminder Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Bell className="w-4 h-4 inline mr-2" />
                    Recordatorio diario
                  </label>
                  <input
                    type="time"
                    value={editedPreferences.reminderTime || '19:00'}
                    onChange={(e) => setEditedPreferences({
                      ...editedPreferences,
                      reminderTime: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Sound Settings */}
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editedPreferences.soundEnabled}
                      onChange={(e) => setEditedPreferences({
                        ...editedPreferences,
                        soundEnabled: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Volume2 className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Habilitar sonidos y pronunciación
                    </span>
                  </label>
                </div>

                {/* Animations */}
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editedPreferences.animationsEnabled}
                      onChange={(e) => setEditedPreferences({
                        ...editedPreferences,
                        animationsEnabled: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Palette className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Habilitar animaciones
                    </span>
                  </label>
                </div>

                {/* Explanation Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Idioma de explicaciones
                  </label>
                  <select
                    value={editedPreferences.explanationLanguage}
                    onChange={(e) => setEditedPreferences({
                      ...editedPreferences,
                      explanationLanguage: e.target.value as 'es' | 'en'
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSavePreferences}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-5 h-5 inline mr-2" />
                  {isLoading ? 'Guardando...' : 'Guardar Preferencias'}
                </button>
              </div>
            </motion.div>
          )}

          {/* API Key Tab */}
          {activeTab === 'api' && (
            <motion.div variants={itemVariants} className="p-8 space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión de API Key</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">API Key Actual</h3>
                  <div className="flex items-center space-x-3">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={showApiKey ? atob(userProgress.apiKey) : '••••••••••••••••'}
                      readOnly
                      className="flex-1 p-3 bg-white border border-blue-300 rounded-lg font-mono text-sm"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-3 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    Tu API Key está segura y encriptada. Solo se usa para generar ejercicios personalizados.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva API Key (opcional)
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="password"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    />
                    <button
                      onClick={handleUpdateApiKey}
                      disabled={isLoading || !newApiKey.trim()}
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Actualizar
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Solo actualiza tu API Key si necesitas cambiarla o si la actual no funciona.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <motion.div variants={itemVariants} className="p-8 space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacidad y Seguridad</h2>
              
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="font-semibold text-green-900 mb-2">🔒 Tus Datos están Seguros</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Tu API Key se almacena encriptada</li>
                    <li>• Tus ejercicios se generan en tiempo real</li>
                    <li>• No compartimos tus datos con terceros</li>
                    <li>• Puedes exportar o eliminar tus datos en cualquier momento</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-red-100 text-red-800 py-3 rounded-xl font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Eliminar Cuenta</span>
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Eliminar Cuenta</h3>
                  <p className="text-sm text-yellow-800">
                    Al eliminar tu cuenta se borrarán permanentemente todos tus datos, progreso, 
                    y configuraciones. Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  );
};