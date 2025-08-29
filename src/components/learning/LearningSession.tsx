/**
 * SESIÓN DE APRENDIZAJE - EXPERIENCIA COMPLETA
 * English Master App - Ejercicios Interactivos con IA
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  Lightbulb,
  Volume2,
  RotateCcw
} from 'lucide-react';

import { GeminiService, Exercise } from '../../services/ai/GeminiService';
import { UserProgress, Level, SessionResults } from '../../types/progress';

interface LearningSessionProps {
  userProgress: UserProgress;
  apiKey: string;
  onComplete: (results: SessionResults) => void;
  onExit: () => void;
}

export const LearningSession: React.FC<LearningSessionProps> = ({
  userProgress,
  apiKey,
  onComplete,
  onExit
}) => {
  // Estados principales
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartTime] = useState(new Date());
  
  // Estados de progreso
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [skillsFocused, setSkillsFocused] = useState<string[]>([]);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);

  const geminiService = new GeminiService(apiKey);
  const currentExercise = exercises[currentIndex];
  const isLastExercise = currentIndex === exercises.length - 1;

  // Timer para rastrear tiempo
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60));
    }, 60000);

    return () => clearInterval(timer);
  }, [sessionStartTime]);

  // Generar ejercicios al iniciar
  useEffect(() => {
    generateSession();
  }, []);

  const generateSession = async () => {
    try {
      setIsLoading(true);
      
      const currentLevelStats = userProgress.levelProgress[userProgress.currentLevel];
      
      const generatedExercises = await geminiService.generateExercises({
        userId: userProgress.userId,
        level: userProgress.currentLevel,
        weakAreas: currentLevelStats.weakAreas,
        completedExercises: currentLevelStats.exercisesCompleted,
        sessionNumber: currentLevelStats.sessionsCompleted + 1
      });

      setExercises(generatedExercises);
      setIsLoading(false);
      
      console.log(`🎯 Sesión generada: ${generatedExercises.length} ejercicios nivel ${userProgress.currentLevel}`);
      
    } catch (error) {
      console.error('❌ Error generando sesión:', error);
      setIsLoading(false);
      // TODO: Mostrar error al usuario
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const isCorrect = answerIndex === currentExercise.correct_answer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      // Agregar área débil
      setWeakAreas(prev => [...prev, currentExercise.skill_focus]);
    }
    
    // Agregar skill enfocado
    setSkillsFocused(prev => Array.from(new Set([...prev, currentExercise.skill_focus])));
  };

  const handleContinue = () => {
    if (isLastExercise) {
      completeSession();
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const completeSession = () => {
    const sessionResults: SessionResults = {
      userId: userProgress.userId,
      sessionId: `session_${Date.now()}`,
      level: userProgress.currentLevel,
      exercisesCompleted: exercises.length,
      correctAnswers,
      totalAnswers: exercises.length,
      accuracy: correctAnswers / exercises.length,
      xpEarned: correctAnswers * 10 + (exercises.length * 5), // 10 XP por correcto + 5 bonus por ejercicio
      timeSpent,
      skillsFocused: Array.from(new Set(skillsFocused)),
      weakAreasIdentified: Array.from(new Set(weakAreas)),
      startTime: sessionStartTime,
      endTime: new Date()
    };

    onComplete(sessionResults);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Loading State
  if (isLoading) {
    return (
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Generando tu sesión personalizada...
          </h2>
          <p className="text-gray-600">
            Creando ejercicios específicos para tu nivel {userProgress.currentLevel}
          </p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (!exercises.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-4"
        >
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No se pudieron generar ejercicios
          </h2>
          <p className="text-gray-600 mb-6">
            Verifica tu conexión y API key, luego intenta de nuevo.
          </p>
          <div className="space-y-3">
            <button
              onClick={generateSession}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Intentar de nuevo
            </button>
            <button
              onClick={onExit}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onExit}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Salir</span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>{correctAnswers}/{exercises.length}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{timeSpent} min</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{currentIndex + 1} de {exercises.length}</span>
            </div>
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Exercise Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200/50">
              
              {/* Situation Context */}
              {currentExercise.situation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 rounded-xl p-4 mb-6"
                >
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Situación:</h3>
                  <p className="text-blue-700">{currentExercise.situation}</p>
                </motion.div>
              )}

              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentExercise.question}
                  </h2>
                  <button
                    onClick={() => speakText(currentExercise.question)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600">Selecciona la respuesta correcta:</p>
              </motion.div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentExercise.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentExercise.correct_answer;
                  const showResult = showFeedback;

                  let optionClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ";
                  
                  if (!showResult) {
                    optionClass += isSelected 
                      ? "border-blue-500 bg-blue-50 text-blue-800" 
                      : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100";
                  } else {
                    if (isCorrect) {
                      optionClass += "border-green-500 bg-green-50 text-green-800";
                    } else if (isSelected && !isCorrect) {
                      optionClass += "border-red-500 bg-red-50 text-red-800";
                    } else {
                      optionClass += "border-gray-200 bg-gray-100 text-gray-600";
                    }
                  }

                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showFeedback}
                      className={optionClass}
                      whileHover={!showFeedback ? { scale: 1.01 } : {}}
                      whileTap={!showFeedback ? { scale: 0.99 } : {}}
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
                            {isCorrect && (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            )}
                            {isSelected && !isCorrect && (
                              <XCircle className="w-6 h-6 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`rounded-xl p-6 mb-6 ${
                      selectedAnswer === currentExercise.correct_answer
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {selectedAnswer === currentExercise.correct_answer ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold mb-2 ${
                          selectedAnswer === currentExercise.correct_answer
                            ? 'text-green-800'
                            : 'text-red-800'
                        }`}>
                          {selectedAnswer === currentExercise.correct_answer
                            ? '🎉 ¡Correcto! +10 XP'
                            : '❌ Incorrecto, pero +3 XP por intentar'
                          }
                        </h3>
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">
                            <strong>Explicación:</strong> {currentExercise.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Continue Button */}
              {showFeedback && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>
                      {isLastExercise ? 'Completar Sesión' : 'Siguiente Pregunta'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};