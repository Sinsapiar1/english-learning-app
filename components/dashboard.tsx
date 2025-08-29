/**
 * DASHBOARD COMPONENT - ENGLISH MASTER V3
 * Dashboard limpio y funcional
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, BarChart3, Settings, Star, Target, Clock, Zap } from 'lucide-react'
import { User, UserProgress, Level } from '@/lib/types'
import { ProgressService } from '@/lib/services/progress-service'
import { AntiRepetitionService } from '@/lib/services/anti-repetition'
import { LearningSession } from './learning-session'
import toast from 'react-hot-toast'

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
    loadUserProgress()
  }, [user.uid])

  const loadUserProgress = async () => {
    try {
      let progress = await progressService.getUserProgress(user.uid)
      
      if (!progress) {
        // Nuevo usuario - crear progreso inicial
        progress = await progressService.createUserProgress(user.uid, user.email)
      }
      
      setUserProgress(progress)
    } catch (error) {
      console.error('Error loading progress:', error)
      toast.error('Error cargando tu progreso')
    } finally {
      setLoading(false)
    }
  }

  const handleSessionComplete = async (sessionResult: any) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          sessionResult
        })
      })

      if (response.ok) {
        const { progress, levelUp } = await response.json()
        setUserProgress(progress)
        
        if (levelUp) {
          toast.success(`🎉 ¡Subiste a nivel ${progress.currentLevel}!`)
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Error actualizando progreso')
    }
    
    setShowSession(false)
  }

  const handleClearHistory = async () => {
    try {
      await antiRepetition.clearAllHistory(user.uid)
      toast.success('🧹 Historial limpiado. Próximas preguntas serán completamente nuevas.')
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error cargando progreso</h2>
          <button
            onClick={loadUserProgress}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
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
        onComplete={handleSessionComplete}
        onExit={() => setShowSession(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EM</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              English Master V3
            </h1>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  {userProgress.levelStats[userProgress.currentLevel].exercisesCompleted} ejercicios completados
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{userProgress.totalXP} XP</div>
                <div className="opacity-90">{Math.round(userProgress.accuracy * 100)}% precisión</div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="XP Total"
              value={userProgress.totalXP.toLocaleString()}
              icon={<Star className="w-6 h-6" />}
              color="bg-yellow-500"
            />
            <StatsCard
              title="Precisión"
              value={`${Math.round(userProgress.accuracy * 100)}%`}
              icon={<Target className="w-6 h-6" />}
              color="bg-green-500"
            />
            <StatsCard
              title="Ejercicios"
              value={userProgress.totalExercises.toString()}
              icon={<BarChart3 className="w-6 h-6" />}
              color="bg-blue-500"
            />
            <StatsCard
              title="Racha"
              value={`${userProgress.currentStreak} días`}
              icon={<Zap className="w-6 h-6" />}
              color="bg-purple-500"
            />
          </div>

          {/* Level Map */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Tu Progreso</h3>
            <div className="grid grid-cols-5 gap-4">
              {(['A1', 'A2', 'B1', 'B2', 'C1'] as Level[]).map((level) => {
                const stats = userProgress.levelStats[level]
                const isCurrent = userProgress.currentLevel === level
                const isCompleted = stats.isCompleted
                const isUnlocked = stats.isUnlocked
                
                return (
                  <div
                    key={level}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      isCurrent 
                        ? 'border-blue-500 bg-blue-50 shadow-lg' : 
                        isCompleted 
                          ? 'border-green-500 bg-green-50' :
                          isUnlocked 
                            ? 'border-gray-300 bg-gray-50' :
                            'border-gray-200 bg-gray-100 opacity-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {isCompleted ? '🏆' : isCurrent ? '🎯' : isUnlocked ? '🔓' : '🔒'}
                    </div>
                    <div className="font-bold">{level}</div>
                    <div className="text-sm text-gray-600">
                      {stats.exercisesCompleted} ejercicios
                    </div>
                    {isCurrent && (
                      <div className="text-xs text-blue-600 mt-1">
                        {Math.round(stats.accuracy * 100)}% precisión
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSession(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-center space-x-3">
                <Play className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">Comenzar Sesión</h3>
                  <p className="text-blue-100">8 ejercicios únicos nivel {userProgress.currentLevel}</p>
                </div>
              </div>
            </motion.button>

            {/* Emergency Clean */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-yellow-800">¿Ves preguntas repetidas?</h4>
                  <p className="text-sm text-yellow-700">Limpia el historial para ejercicios completamente nuevos</p>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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

// Stats Card Component
interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200/50">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} text-white`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  )
}