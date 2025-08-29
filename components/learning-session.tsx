/**
 * LEARNING SESSION - ENGLISH MASTER V3
 * Sesión de aprendizaje limpia y robusta
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import { User, UserProgress, Exercise, SessionResult } from '@/lib/types'
import toast from 'react-hot-toast'

interface LearningSessionProps {
  user: User
  userProgress: UserProgress
  onComplete: (result: SessionResult) => void
  onExit: () => void
}

export function LearningSession({ user, userProgress, onComplete, onExit }: LearningSessionProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessionStartTime] = useState(new Date())
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const currentExercise = exercises[currentIndex]
  const isLastExercise = currentIndex === exercises.length - 1

  useEffect(() => {
    generateSession()
  }, [])

  const generateSession = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          level: userProgress.currentLevel,
          apiKey: user.apiKey
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate exercises')
      }

      const { exercises } = await response.json()
      setExercises(exercises)
      
      console.log(`🎯 Session generated: ${exercises.length} exercises`)

    } catch (error) {
      console.error('❌ Session generation error:', error)
      toast.error('Error generando ejercicios. Usando ejercicios de respaldo.')
      
      // Fallback a ejercicios locales
      setExercises([])
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    
    setSelectedAnswer(answerIndex)
    setShowFeedback(true)
    
    const isCorrect = answerIndex === currentExercise.correctAnswer
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1)
    }
  }

  const handleContinue = () => {
    if (isLastExercise) {
      completeSession()
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    }
  }

  const completeSession = () => {
    const timeSpent = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60)
    
    const sessionResult: SessionResult = {
      sessionId: `session_${Date.now()}`,
      userId: user.uid,
      level: userProgress.currentLevel,
      exercises,
      correctAnswers,
      totalAnswers: exercises.length,
      accuracy: correctAnswers / exercises.length,
      xpEarned: correctAnswers * 15 + exercises.length * 5,
      timeSpent,
      completedAt: new Date()
    }

    onComplete(sessionResult)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Generando ejercicios nivel {userProgress.currentLevel}...
          </h2>
          <p className="text-gray-600">Creando contenido único para ti</p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (!exercises.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No se pudieron generar ejercicios</h2>
          <p className="text-gray-600 mb-6">Verifica tu API key y conexión</p>
          <div className="space-y-3">
            <button
              onClick={generateSession}
              className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={onExit}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onExit}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Salir</span>
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-600">
                {currentIndex + 1} de {exercises.length}
              </div>
              <div className="text-sm text-blue-600 font-medium">
                {correctAnswers} correctas
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Exercise Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              
              {/* Situation */}
              {currentExercise.situation && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Situación:</h3>
                  <p className="text-blue-700">{currentExercise.situation}</p>
                </div>
              )}

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {currentExercise.question}
                </h2>
                <p className="text-gray-600">Selecciona la respuesta correcta:</p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentExercise.options.map((option, index) => {
                  const isSelected = selectedAnswer === index
                  const isCorrect = index === currentExercise.correctAnswer
                  const showResult = showFeedback

                  let optionClass = "w-full p-4 text-left rounded-xl border-2 transition-all "
                  
                  if (!showResult) {
                    optionClass += isSelected 
                      ? "border-blue-500 bg-blue-50 text-blue-800" 
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  } else {
                    if (isCorrect) {
                      optionClass += "border-green-500 bg-green-50 text-green-800"
                    } else if (isSelected && !isCorrect) {
                      optionClass += "border-red-500 bg-red-50 text-red-800"
                    } else {
                      optionClass += "border-gray-200 bg-gray-100 text-gray-600"
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showFeedback}
                      className={optionClass}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold">
                            {String.fromCharCode(65 + index)})
                          </span>
                          <span className="text-lg">{option}</span>
                        </div>
                        
                        {showResult && (
                          <div>
                            {isCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                            {isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-6 mb-6 ${
                      selectedAnswer === currentExercise.correctAnswer
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {selectedAnswer === currentExercise.correctAnswer ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-bold mb-2 ${
                          selectedAnswer === currentExercise.correctAnswer
                            ? 'text-green-800'
                            : 'text-red-800'
                        }`}>
                          {selectedAnswer === currentExercise.correctAnswer
                            ? '🎉 ¡Correcto! +15 XP'
                            : '❌ Incorrecto, pero +5 XP por intentar'
                          }
                        </h3>
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                          <p className="text-gray-700">{currentExercise.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Continue Button */}
              {showFeedback && (
                <button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isLastExercise ? 'Completar Sesión' : 'Siguiente Pregunta'}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}