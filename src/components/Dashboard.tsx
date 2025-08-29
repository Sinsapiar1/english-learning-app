/**
 * DASHBOARD - ENGLISH MASTER V3
 * Dashboard completamente reconstruido
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Star, Target, BarChart3, Zap } from 'lucide-react'
import { LearningSession } from './LearningSession'
import { ProgressService } from '../services/ProgressService'
import { AntiRepetitionService } from '../services/AntiRepetitionService'
import toast from 'react-hot-toast'

interface User {
  uid: string
  email: string
  displayName?: string
  apiKey?: string
}

interface UserProgress {
  userId: string
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  totalXP: number
  totalExercises: number
  accuracy: number
  currentStreak: number
}

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSession, setShowSession] = useState(false)

  const progressService = new ProgressService()
  const antiRepetition = new AntiRepetitionService()

  useEffect(() => {
    loadProgress()
  }, [user.uid])

  const loadProgress = async () => {
    try {
      let progress = await progressService.getUserProgress(user.uid)
      
      if (!progress) {
        // Crear progreso inicial - detectar si es usuario avanzado
        const initialLevel = user.email.includes('expert') || user.email.includes('advanced') ? 'C1' : 'A1'
        progress = await progressService.createUserProgress(user.uid, user.email, initialLevel)
      }
      
      setUserProgress(progress)
    } catch (error) {
      console.error('Error loading progress:', error)
      toast.error('Error cargando progreso')
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    try {
      await antiRepetition.clearAllHistory(user.uid)
      toast.success('🧹 Historial limpiado completamente')
    } catch (error) {
      toast.error('Error limpiando historial')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu progreso...</p>
        </div>
      </div>
    )
  }

  if (!userProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error cargando progreso</h2>
          <button
            onClick={loadProgress}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (showSession) {
    return (
      <LearningSession
        user={user}
        userProgress={userProgress}
        onComplete={(result) => {
          setUserProgress(prev => prev ? {
            ...prev,
            totalXP: prev.totalXP + result.xpEarned,
            totalExercises: prev.totalExercises + result.totalAnswers,
            accuracy: (prev.accuracy * prev.totalExercises + result.accuracy * result.totalAnswers) / (prev.totalExercises + result.totalAnswers)
          } : null)
          setShowSession(false)
        }}
        onExit={() => setShowSession(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">EM</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">English Master V3</h1>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user.email.split('@')[0]} 👋
            </p>
            <p className="text-xs text-gray-500">
              Nivel {userProgress.currentLevel} • {userProgress.currentStreak} días
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          
          {/* Level Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Nivel {userProgress.currentLevel}
                </h2>
                <p className="opacity-90">
                  {userProgress.totalExercises} ejercicios completados
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{userProgress.totalXP} XP</div>
                <div className="opacity-90">{Math.round(userProgress.accuracy * 100)}% precisión</div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600">XP Total</span>
              </div>
              <p className="text-2xl font-bold">{userProgress.totalXP}</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">Precisión</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(userProgress.accuracy * 100)}%</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">Ejercicios</span>
              </div>
              <p className="text-2xl font-bold">{userProgress.totalExercises}</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-600">Racha</span>
              </div>
              <p className="text-2xl font-bold">{userProgress.currentStreak} días</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSession(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl"
            >
              <div className="flex items-center justify-center space-x-3">
                <Play className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">Comenzar Sesión</h3>
                  <p className="text-blue-100">8 ejercicios únicos nivel {userProgress.currentLevel}</p>
                </div>
              </div>
            </motion.button>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-yellow-800">¿Preguntas repetidas?</h4>
                  <p className="text-sm text-yellow-700">Limpia para ejercicios completamente nuevos</p>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  🧹 Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}