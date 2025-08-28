import React, { useState, useEffect, useCallback } from "react";
import MultipleChoice from "./MultipleChoice";
// ELIMINADA IMPORTACIÓN DE EJERCICIOS ESTÁTICOS - SOLO IA
import { IntelligentLearningSystem } from "../services/intelligentLearning";
import { SmartAISystem, SmartExercise } from "../services/smartAI";
import { ExerciseTracker } from "../services/exerciseTracker";
import { ContentHashTracker } from "../services/contentHashTracker";
import { ImprovedLevelSystem } from '../services/levelProgression';
import { LevelExerciseManager } from '../data/levelExercises';

interface LessonSessionProps {
  apiKey: string;
  userProgress: any;
  onSessionComplete: (results: any) => void;
  onExit: () => void;
  userId?: string;
}

const LessonSessionFixed: React.FC<LessonSessionProps> = ({
  apiKey,
  userProgress,
  onSessionComplete,
  onExit,
  userId,
}) => {
  // Estados SIMPLES
  const [exerciseNumber, setExerciseNumber] = useState(1);
  const [totalExercises] = useState(8);
  const [currentExercise, setCurrentExercise] = useState<SmartExercise | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [userWeaknesses, setUserWeaknesses] = useState<string[]>([]);
  
  // Estadísticas
  const [correctCount, setCorrectCount] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("");

  // Temas por nivel
  const getTopicsForLevel = (level: string) => {
    const allTopics = {
      A1: ["present simple", "past simple"],
      A2: ["present perfect", "prepositions", "adverbs"],
      B1: ["past perfect", "conditionals", "passive voice"],
      B2: ["subjunctive", "advanced grammar", "idioms"],
    };
    return allTopics[level as keyof typeof allTopics] || allTopics.A2;
  };

  // Inicializar sistema inteligente
  useEffect(() => {
    const initializeIntelligentSession = async () => {
      console.log("🧠 INICIANDO SESIÓN DE IA INTELIGENTE");
      
      // Obtener debilidades del usuario
      if (userProgress.userId) {
        try {
          const weaknesses = await IntelligentLearningSystem.analyzeUserWeaknesses(userProgress.userId);
          setUserWeaknesses(weaknesses);
          console.log("📉 DEBILIDADES IDENTIFICADAS:", weaknesses);
        } catch (error) {
          console.warn("⚠️ Error obteniendo debilidades:", error);
        }
      }
      
      // VERIFICAR API KEY ANTES DE EMPEZAR
      if (!apiKey) {
        console.error("🚨 NO HAY API KEY - REDIRIGIR A CONFIGURACIÓN");
        alert("⚠️ Necesitas configurar tu API Key de Google AI para usar ejercicios con IA. Ve a Configuración.");
        return;
      }
      
      console.log("🔑 API KEY DISPONIBLE - FORZANDO IA");
      
      // Cargar primer ejercicio inteligente
      await generateIntelligentExercise(1);
    };
    
    initializeIntelligentSession();
  }, [userProgress.level, userProgress.userId]);



  // GENERAR EJERCICIO INTELIGENTE CON EJERCICIOS ESPECÍFICOS POR NIVEL
  const generateIntelligentExercise = async (exerciseNum: number) => {
    setIsGenerating(true);
    
    try {
      // INTENTAR con el método mejorado primero
      if (apiKey) {
        try {
          const smartExercise = await SmartAISystem.generateSmartExerciseEnhanced({
            userId: userProgress.userId || 'anonymous',
            userLevel: userProgress.level,
            apiKey: apiKey,
            sessionNumber: exerciseNum,
            weakTopics: userWeaknesses,
            strengths: userProgress.strengths || [],
            preferredDifficulty: 'medium'
          });
          
          setCurrentExercise(smartExercise);
          setCurrentTopic(smartExercise.topic);
          return; // ✅ Éxito con IA mejorada
          
        } catch (error) {
          if (error.message === "IA_EXHAUSTED") {
            console.log("⚠️ IA agotada, usando método existente como fallback");
          } else {
            console.warn("⚠️ IA mejorada falló, intentando método original:", error);
          }
        }
      }
      
      // MANTENER toda la lógica existente como fallback
      console.log(`🎯 GENERANDO EJERCICIO ${exerciseNum}/8 PARA NIVEL ${userProgress.level}`);
      
      // PRIORIDAD 2: Intentar IA método original si hay API key
      if (apiKey) {
        try {
          const smartExercise = await SmartAISystem.generateSmartExercise({
            userId: userProgress.userId || 'anonymous',
            userLevel: userProgress.level,
            apiKey: apiKey,
            sessionNumber: exerciseNum,
            weakTopics: userWeaknesses,
            strengths: userProgress.strengths || [],
            preferredDifficulty: 'medium'
          });
          
          setCurrentExercise(smartExercise);
          setCurrentTopic(smartExercise.topic);
          return;
        } catch (error) {
          console.warn("⚠️ IA método original falló, usando ejercicio de emergencia:", error);
        }
      }
      
      // PRIORIDAD 3: Ejercicio de emergencia
      const emergencyExercise = generateEmergencyExercise(userProgress.level);
      setCurrentExercise(emergencyExercise);
      setCurrentTopic(emergencyExercise.topic);
      
    } finally {
      setIsGenerating(false);
    }
  };

  // Avanzar al siguiente ejercicio inteligente
  useEffect(() => {
    if (exerciseNumber > 1 && exerciseNumber <= totalExercises) {
      generateIntelligentExercise(exerciseNumber);
    }
  }, [exerciseNumber]);

  // Manejar respuesta CON TRACKING INTELIGENTE
  const handleAnswer = useCallback(async (correct: boolean, xpEarned: number, selectedAnswer?: number, responseTime?: number) => {
    if (correct) {
      setCorrectCount((prev) => prev + 1);
    }
    setTotalXP((prev) => prev + xpEarned);

    // TRACKING INTELIGENTE - Registrar interacción
    if (currentExercise && userProgress.userId) {
      try {
        await IntelligentLearningSystem.recordExerciseInteraction({
          exerciseId: currentExercise.id,
          userId: userProgress.userId,
          topic: currentExercise.topic || currentTopic,
          level: userProgress.level,
          isCorrect: correct,
          responseTime: responseTime || 5, // tiempo promedio si no se proporciona
          selectedAnswer: selectedAnswer || 0,
          correctAnswer: currentExercise.correctAnswer,
          hintsUsed: 0,
          confidence: correct ? 'high' : 'low',
          sessionId: sessionId,
          errorType: !correct ? `${currentExercise.topic}_error` : undefined
        });
        
        console.log("📊 INTERACCIÓN REGISTRADA EN FIREBASE");
      } catch (error) {
        console.error("❌ Error registrando interacción:", error);
      }
    }

    // MARCAR EJERCICIO COMO USADO CON SISTEMA ROBUSTO
    if (currentExercise) {
      ExerciseTracker.markExerciseAsUsed(userProgress.level, currentExercise.id);
    }

    // AVANZAR INMEDIATAMENTE - SIN PAUSA INNECESARIA
    setTimeout(() => {
      if (exerciseNumber >= totalExercises) {
        completeSession();
      } else {
        setExerciseNumber((prev) => prev + 1);
      }
    }, 200); // ✅ SÚPER RÁPIDO - Solo 0.2 segundos
  }, [exerciseNumber, totalExercises, currentExercise, userProgress.level, userProgress.userId, currentTopic, sessionId]);

  // Completar sesión
  const completeSession = useCallback(() => {
    if (sessionComplete) return;
    
    const finalAccuracy = correctCount / totalExercises;

    const recentSessionsKey = `recent_sessions_${userId || 'anonymous'}`;
    const recentSessions = JSON.parse(localStorage.getItem(recentSessionsKey) || "[]");
    
    const updatedSessions = [...recentSessions, finalAccuracy].slice(-10);
    localStorage.setItem(recentSessionsKey, JSON.stringify(updatedSessions));

    const levelProgress = ImprovedLevelSystem.calculateLevelProgress({
      currentLevel: userProgress.level,
      accuracy: Math.max(userProgress.accuracy, finalAccuracy), // Usar la mejor precisión
      totalExercises: (userProgress.completedLessons + 1) * 8,
      xp: userProgress.xp + totalXP,
      recentSessions: updatedSessions
    });

    console.log("📊 NIVEL PROGRESS:", levelProgress);

    const levelUp = levelProgress.canLevelUp && levelProgress.nextLevel !== userProgress.level;

    const results = {
      exercisesCompleted: totalExercises,
      correctAnswers: correctCount,
      totalAnswers: totalExercises,
      accuracy: finalAccuracy,
      xpEarned: totalXP,
      levelUp: levelUp,
      newLevel: levelUp ? levelProgress.nextLevel : userProgress.level,
      levelProgress: levelProgress,
      
      sessionData: {
        topicsStudied: [currentTopic],
        averageResponseTime: 5,
        difficulty: userProgress.level,
        timestamp: new Date().toISOString()
      }
    };

    setSessionComplete(true);

    const detailedProgress = {
      ...userProgress,
      accuracy: Math.max(userProgress.accuracy, finalAccuracy), // Usar la mejor precisión
      completedLessons: userProgress.completedLessons + 1,
      xp: userProgress.xp + totalXP,
      level: levelUp ? levelProgress.nextLevel : userProgress.level,
      lastSession: {
        date: new Date().toISOString(),
        accuracy: finalAccuracy,
        xpEarned: totalXP,
        exercisesCompleted: totalExercises,
        topicsStudied: [currentTopic]
      },
      levelProgress: levelProgress
    };

    localStorage.setItem("user_progress", JSON.stringify(detailedProgress));

    setTimeout(() => {
      onSessionComplete(results);
    }, 3000);

  }, [sessionComplete, correctCount, totalExercises, totalXP, userProgress, currentTopic, onSessionComplete]);

  // EJERCICIO DE EMERGENCIA CUANDO LA IA FALLA
  const generateEmergencyExercise = (level: string): SmartExercise => {
    const emergencyExercises = [
      {
        question: "What do you usually have for breakfast?",
        options: ["Coffee and toast", "Nothing", "Cereal", "Fruit"],
        correctAnswer: 0,
        explanation: "🎯 Una pregunta común sobre hábitos alimenticios. 'Usually' indica rutina.",
        topic: "daily routines"
      },
      {
        question: "How often do you exercise?",
        options: ["Every day", "Never", "Sometimes", "Once a week"],
        correctAnswer: 2,
        explanation: "🎯 'How often' pregunta sobre frecuencia. 'Sometimes' es una respuesta común.",
        topic: "frequency"
      },
      {
        question: "Where do you work?",
        options: ["In an office", "At home", "In a store", "I don't work"],
        correctAnswer: 1,
        explanation: "🎯 'Where do you work?' pregunta sobre ubicación laboral.",
        topic: "work"
      },
      {
        question: "What's your favorite movie genre?",
        options: ["Action", "Comedy", "Drama", "Horror"],
        correctAnswer: 1,
        explanation: "🎯 'Favorite' significa favorito. Los géneros de películas son vocabulario útil.",
        topic: "entertainment"
      }
    ];
    
    const randomExercise = emergencyExercises[Math.floor(Math.random() * emergencyExercises.length)];
    
    return {
      id: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: randomExercise.question,
      instruction: "Selecciona la respuesta más apropiada",
      options: randomExercise.options,
      correctAnswer: randomExercise.correctAnswer,
      explanation: randomExercise.explanation,
      xpReward: 8,
      topic: randomExercise.topic,
      level: level,
      source: 'emergency',
      difficulty: 'medium',
      learningFocus: [randomExercise.topic]
    };
  };

  // Pantalla de resultados
  if (sessionComplete) {
    const finalAccuracy = (correctCount / totalExercises) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-6">
            {finalAccuracy >= 80 ? "🎉" : finalAccuracy >= 60 ? "👍" : "💪"}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¡Sesión Completada!
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ejercicios:</span>
              <span className="font-bold text-purple-600">
                {totalExercises}/{totalExercises}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Correctas:</span>
              <span className="font-bold text-green-600">
                {correctCount}/{totalExercises}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Precisión:</span>
              <span className="font-bold text-blue-600">
                {finalAccuracy.toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">XP:</span>
              <span className="font-bold text-yellow-600">+{totalXP}</span>
            </div>
          </div>

          <button
            onClick={() =>
              onSessionComplete({
                exercisesCompleted: totalExercises,
                correctAnswers: correctCount,
                accuracy: correctCount / totalExercises,
                xpEarned: totalXP,
              })
            }
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // Sesión activa
  const progress = (exerciseNumber / totalExercises) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onExit}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Salir
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🤖 Sesión de Aprendizaje Inteligente
              </h1>
              <p className="text-gray-600">
                {currentTopic} • Nivel {userProgress.level} • IA Personalizada
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">XP</p>
              <p className="font-bold text-green-600">+{totalXP}</p>
            </div>
          </div>

          {/* Progreso */}
          <div className="bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Ejercicio {exerciseNumber} de {totalExercises}
            </span>
            <span>Correctas: {correctCount}</span>
          </div>
        </div>

        {/* Ejercicio actual */}
        {isGenerating ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-pulse text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">
              IA Generando Ejercicio Único...
            </h3>
            <p className="text-gray-600 mb-4">
              Creando ejercicio personalizado nivel {userProgress.level}
            </p>
            <div className="text-sm text-gray-500 bg-blue-50 rounded-lg p-2">
              💡 Cada ejercicio es completamente único gracias a tu IA personal
            </div>
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        ) : currentExercise ? (
          <div className="relative">
            <MultipleChoice
              question={currentExercise}
              onAnswer={handleAnswer}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-gray-600">No hay ejercicios disponibles</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-600">
              {exerciseNumber}
            </div>
            <div className="text-sm text-gray-600">Actual</div>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-green-600">
              {correctCount}
            </div>
            <div className="text-sm text-gray-600">Correctas</div>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.max(0, exerciseNumber - 1 - correctCount)}
            </div>
            <div className="text-sm text-gray-600">Incorrectas</div>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-purple-600">+{totalXP}</div>
            <div className="text-sm text-gray-600">XP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonSessionFixed;