/**
 * LEARNING SESSION - ENGLISH MASTER V3
 * Sesión completamente reconstruida
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import { ExerciseGenerator } from '../services/ExerciseGenerator'
import toast from 'react-hot-toast'

interface User {
  uid: string
  email: string
  apiKey?: string
}

interface UserProgress {
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  totalXP: number
  totalExercises: number
  accuracy: number
}

interface Exercise {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  level: string
  skillFocus: string
}

interface SessionResult {
  correctAnswers: number
  totalAnswers: number
  accuracy: number
  xpEarned: number
}

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
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const currentExercise = exercises[currentIndex]
  const isLastExercise = currentIndex === exercises.length - 1

  useEffect(() => {
    generateSession()
  }, [])

  const generateSession = async () => {
    try {
      setLoading(true)
      
      if (!user.apiKey) {
        throw new Error('No API key configured')
      }

      const generator = new ExerciseGenerator(user.apiKey)
      const generatedExercises = await generator.generateExercisesForLevel(
        userProgress.currentLevel,
        user.uid
      )

      setExercises(generatedExercises)
      console.log(`✅ Generated ${generatedExercises.length} exercises for ${userProgress.currentLevel}`)

    } catch (error) {
      console.error('❌ Session generation error:', error)
      toast.error('Error generando ejercicios')
      
      // Usar ejercicios de emergencia
      const emergencyExercises = getEmergencyExercises(userProgress.currentLevel)
      setExercises(emergencyExercises)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    
    setSelectedAnswer(answerIndex)
    setShowFeedback(true)
    
    if (answerIndex === currentExercise.correctAnswer) {
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
    const result: SessionResult = {
      correctAnswers,
      totalAnswers: exercises.length,
      accuracy: correctAnswers / exercises.length,
      xpEarned: correctAnswers * 15 + exercises.length * 5
    }

    onComplete(result)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Generando ejercicios nivel {userProgress.currentLevel}...
          </h2>
          <p className="text-gray-600">Creando contenido único para ti</p>
        </div>
      </div>
    )
  }

  if (!exercises.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error generando ejercicios</h2>
          <div className="space-y-3">
            <button
              onClick={generateSession}
              className="w-full bg-blue-500 text-white py-3 rounded-xl"
            >
              Reintentar
            </button>
            <button
              onClick={onExit}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl"
            >
              Volver
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
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
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

          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
            />
          </div>
        </div>
      </header>

      {/* Exercise */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-2xl p-8 shadow-xl"
          >
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {currentExercise.question}
              </h2>
              <p className="text-gray-600">Selecciona la respuesta correcta:</p>
            </div>

            <div className="space-y-3 mb-8">
              {currentExercise.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentExercise.correctAnswer
                const showResult = showFeedback

                let optionClass = "w-full p-4 text-left rounded-xl border-2 transition-all "
                
                if (!showResult) {
                  optionClass += isSelected 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                } else {
                  if (isCorrect) {
                    optionClass += "border-green-500 bg-green-50"
                  } else if (isSelected) {
                    optionClass += "border-red-500 bg-red-50"
                  } else {
                    optionClass += "border-gray-200 bg-gray-100"
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
                        <span className="font-bold">
                          {String.fromCharCode(65 + index)})
                        </span>
                        <span>{option}</span>
                      </div>
                      
                      {showResult && (
                        <div>
                          {isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
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
                          : '❌ Incorrecto, pero +5 XP'
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

            {/* Continue */}
            {showFeedback && (
              <button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg"
              >
                {isLastExercise ? 'Completar Sesión' : 'Siguiente Pregunta'}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

// Ejercicios de emergencia por nivel
function getEmergencyExercises(level: string): Exercise[] {
  const emergencyBank = {
    A1: [
      {
        id: 'emergency_a1_1',
        question: 'Estás en un banco y necesitas ayuda del empleado',
        options: ['Excuse me, can you help me?', 'Hello friend', 'Good morning', 'Thank you'],
        correctAnswer: 0,
        explanation: 'Para pedir ayuda formal: "Excuse me, can you help me?"',
        level: 'A1',
        skillFocus: 'formal_requests'
      }
    ],
    C1: [
      {
        id: 'emergency_c1_1',
        question: 'In an academic debate, how do you challenge a theoretical framework diplomatically?',
        options: [
          'While this framework offers valuable insights, I contend that its foundational assumptions may inadvertently constrain our understanding',
          'This theory has some problems',
          'I disagree with this approach',
          'The framework needs work'
        ],
        correctAnswer: 0,
        explanation: 'Academic critique requires diplomatic language: "While... offers insights, I contend that assumptions may constrain understanding"',
        level: 'C1',
        skillFocus: 'academic_critique'
      },
      {
        id: 'emergency_c1_2',
        question: 'How do you articulate the epistemological implications of quantum mechanics?',
        options: [
          'Quantum mechanics fundamentally challenges naive realism by demonstrating that observation is constitutive rather than merely revelatory of physical phenomena',
          'Quantum physics shows reality is strange',
          'Quantum mechanics changes science',
          'Physics proves reality is complex'
        ],
        correctAnswer: 0,
        explanation: 'Epistemological analysis: "constitutive rather than merely revelatory of phenomena"',
        level: 'C1',
        skillFocus: 'epistemological_analysis'
      }
    ]
  }

  return emergencyBank[level as keyof typeof emergencyBank] || emergencyBank.A1
}