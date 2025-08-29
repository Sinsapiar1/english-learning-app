import React, { useState, useEffect, useCallback } from "react";
import MultipleChoice from "./MultipleChoice";
// IMPORTACIONES PARA SESIÓN COMPLETA
import { IntelligentLearningSystem } from "../services/intelligentLearning";
import { SmartAISystem, SmartExercise } from "../services/smartAI";
import { PersonalizedLessonGenerator } from "../services/geminiAI";
import { SessionHashTracker } from "../services/sessionHashTracker";
import { ExerciseTracker } from "../services/exerciseTracker";
import { ContentHashTracker } from "../services/contentHashTracker";
import { ImprovedLevelSystem } from '../services/levelProgression';
import { LevelExerciseManager } from '../data/levelExercises';
import { AnalyticsService } from '../services/analytics';

// 📊 HELPER PARA ANALYTICS - DETERMINAR TIPO DE EJERCICIO
const getExerciseType = (exerciseNum: number): 'vocabulary' | 'grammar' | 'translation' | 'comprehension' => {
  const types: ('vocabulary' | 'grammar' | 'translation' | 'comprehension')[] = ['vocabulary', 'grammar', 'translation', 'comprehension'];
  return types[exerciseNum % 4];
};

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
  // Estados para SESIÓN COMPLETA
  const [exerciseNumber, setExerciseNumber] = useState(1);
  const [totalExercises] = useState(8);
  const [currentExercise, setCurrentExercise] = useState<SmartExercise | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [userWeaknesses, setUserWeaknesses] = useState<string[]>([]);
  
  // NUEVOS ESTADOS para sesión completa
  const [sessionExercises, setSessionExercises] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
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

  // NUEVA función: generar sesión completa de una vez
  const generateCompleteSession = async () => {
    setIsGenerating(true);
    
    try {
      console.log("🎯 GENERANDO SESIÓN COMPLETA DE 8 EJERCICIOS");
      
      // Obtener debilidades del usuario
      if (userProgress.userId) {
        try {
          const weaknesses = await IntelligentLearningSystem.analyzeUserWeaknesses(userProgress.userId);
          setUserWeaknesses(weaknesses);
          console.log("📉 DEBILIDADES IDENTIFICADAS:", weaknesses);
        } catch (error: any) {
          console.warn("⚠️ Error obteniendo debilidades:", error);
        }
      }
      
      if (apiKey) {
        // Intentar con IA primero
        try {
          const generator = new PersonalizedLessonGenerator(apiKey);
          const exercises = await generator.generateCompleteSession({
            level: userProgress.level,
            userId: userProgress.userId || 'anonymous',
            userWeaknesses: userWeaknesses,
            userStrengths: userProgress.strengths || [],
            completedLessons: userProgress.completedLessons || 0
          });
          
          // Verificar que no sea sesión repetida
          if (SessionHashTracker.isSessionRepeated(exercises, userProgress.level)) {
            console.warn("⚠️ SESIÓN REPETIDA DETECTADA - regenerando...");
            throw new Error("Sesión repetida");
          }
          
          // Marcar sesión como usada
          SessionHashTracker.markSessionAsUsed(exercises, userProgress.level);
          
          setSessionExercises(exercises);
          setCurrentExercise(exercises[0]);
          setCurrentTopic(exercises[0].topic);
          
          console.log("✅ SESIÓN COMPLETA GENERADA - 8 EJERCICIOS ÚNICOS");
          return;
          
        } catch (error: any) {
          console.warn("⚠️ Error generando sesión con IA:", error);
          
          // DETECTAR error específico de cuota
          if (error?.message?.includes('quota') || error?.message?.includes('429')) {
            console.log("🔋 CUOTA DE IA AGOTADA - Marcando para UX");
            localStorage.setItem('last_quota_error', new Date().toISOString());
          }
        }
      }
      
      // Fallback: generar 8 ejercicios de emergencia únicos
      const emergencyExercises = generateEmergencySession(userProgress.level);
      setSessionExercises(emergencyExercises);
      setCurrentExercise(emergencyExercises[0]);
      setCurrentTopic(emergencyExercises[0].topic);
      
    } finally {
      setIsGenerating(false);
    }
  };

  // INICIALIZAR sesión una sola vez
  useEffect(() => {
    generateCompleteSession();
  }, []); // Solo una vez al montar

  // Completar sesión
  const completeSession = useCallback(() => {
    if (sessionComplete) return;
    
    const finalAccuracy = correctCount / totalExercises;

    const results = {
      exercisesCompleted: totalExercises,
      correctAnswers: correctCount,
      totalAnswers: totalExercises,
      accuracy: finalAccuracy,
      xpEarned: totalXP,
    };

    setSessionComplete(true);

    setTimeout(() => {
      onSessionComplete(results);
    }, 3000);

  }, [sessionComplete, correctCount, totalExercises, totalXP, onSessionComplete]);

  // NUEVA función: avanzar al siguiente ejercicio de la sesión
  const advanceToNextExercise = useCallback(() => {
    const nextIndex = currentExerciseIndex + 1;
    
    if (nextIndex < sessionExercises.length) {
      setCurrentExerciseIndex(nextIndex);
      setCurrentExercise(sessionExercises[nextIndex]);
      setExerciseNumber(nextIndex + 1);
      setCurrentTopic(sessionExercises[nextIndex].topic);
    } else {
      completeSession();
    }
  }, [currentExerciseIndex, sessionExercises, completeSession]);





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
      } catch (error: any) {
        console.error("❌ Error registrando interacción:", error);
      }
    }

    // 📊 ANALYTICS - TRACKEAR CADA EJERCICIO (SIN ROMPER NADA)
    try {
      if (currentExercise) {
        AnalyticsService.logExerciseCompleted({
          exerciseId: currentExercise.id,
          exerciseType: getExerciseType(exerciseNumber),
          level: userProgress.level || 'A1',
          isCorrect: correct,
          responseTime: responseTime || 5,
          source: currentExercise.source === 'emergency' ? 'emergency' : 'ai',
          topic: currentExercise.topic || currentTopic
        });
      }
    } catch (error) {
      console.log("📊 Analytics exercise error (no crítico):", error);
    }

    // MARCAR EJERCICIO COMO USADO CON SISTEMA ROBUSTO
    if (currentExercise) {
      ExerciseTracker.markExerciseAsUsed(userProgress.level, currentExercise.id);
    }

    // AVANZAR AL SIGUIENTE EJERCICIO DE LA SESIÓN
    setTimeout(() => {
      advanceToNextExercise();
    }, 1500); // Pausa para mostrar resultado
  }, [advanceToNextExercise, currentExercise, userProgress.level, userProgress.userId, currentTopic, sessionId]);



  // EJERCICIO DE EMERGENCIA CUANDO LA IA FALLA
  const generateEmergencyExercise = (level: string): SmartExercise => {
    const logicalExercises = [
      {
        question: "I _____ hungry. / Tengo hambre.",
        options: ["am", "is", "are", "be"],
        correctAnswer: 0,
        explanation: "🎯 Con 'I' (yo) siempre usamos 'am'. I am hungry = Tengo hambre.",
        topic: "verb to be"
      },
      {
        question: "What is this? 🍕 / ¿Qué es esto? 🍕",
        options: ["pizza", "hamburger", "sandwich", "salad"],
        correctAnswer: 0,
        explanation: "🎯 🍕 es 'pizza'. Todas las opciones son comidas, por eso tiene sentido.",
        topic: "food vocabulary"
      },
      {
        question: "She _____ coffee every morning. / Ella bebe café cada mañana.",
        options: ["drinks", "drink", "drinking", "drank"],
        correctAnswer: 0,
        explanation: "🎯 Con 'she' usamos 'drinks' (con -s). She drinks coffee = Ella bebe café.",
        topic: "present simple"
      },
      {
        question: "How do you say 'hola' in English? / ¿Cómo se dice 'hola' en inglés?",
        options: ["hello", "goodbye", "thank you", "excuse me"],
        correctAnswer: 0,
        explanation: "🎯 'Hola' en inglés es 'hello'. Es el saludo más común.",
        topic: "greetings"
      },
      {
        question: "What color is this? 🔴 / ¿De qué color es esto? 🔴",
        options: ["red", "blue", "green", "yellow"],
        correctAnswer: 0,
        explanation: "🎯 🔴 es 'red' (rojo). Todas las opciones son colores.",
        topic: "colors"
      },
      {
        question: "I _____ English every day. / Yo estudio inglés todos los días.",
        options: ["study", "studies", "studied", "studying"],
        correctAnswer: 0,
        explanation: "🎯 Con 'I' usamos 'study' (sin -s). I study = Yo estudio.",
        topic: "present simple"
      },
      {
        question: "What do you eat for breakfast? / ¿Qué comes en el desayuno?",
        options: ["cereal", "dinner", "lunch", "sleep"],
        correctAnswer: 0,
        explanation: "🎯 'Cereal' es una comida común para el desayuno. Las otras opciones no son comidas de desayuno.",
        topic: "meals"
      },
      {
        question: "Where _____ you live? / ¿Dónde vives?",
        options: ["do", "does", "are", "is"],
        correctAnswer: 0,
        explanation: "🎯 Con 'you' y verbos normales usamos 'do'. Where do you live? = ¿Dónde vives?",
        topic: "question formation"
      }
    ];
    
    const baseExercise = logicalExercises[Math.floor(Math.random() * logicalExercises.length)];
    
    // ✅ MEZCLAR OPCIONES CON FISHER-YATES
    const correctAnswerText = baseExercise.options[baseExercise.correctAnswer];
    const shuffledOptions = [...baseExercise.options];
    
    // Fisher-Yates shuffle para mejor mezclado
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    
    const newCorrectAnswer = shuffledOptions.findIndex(option => option === correctAnswerText);
    
    console.log("🔀 EMERGENCY EXERCISE SHUFFLE:", {
      original: baseExercise.options,
      shuffled: shuffledOptions,
      oldCorrect: baseExercise.correctAnswer,
      newCorrect: newCorrectAnswer
    });
    
    return {
      id: `logical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: baseExercise.question,
      instruction: "Selecciona la respuesta correcta",
      options: shuffledOptions, // ✅ OPCIONES MEZCLADAS
      correctAnswer: newCorrectAnswer, // ✅ NUEVA POSICIÓN CORRECTA
      explanation: baseExercise.explanation,
      xpReward: 10,
      topic: baseExercise.topic,
      level: level,
      source: 'emergency',
      difficulty: 'easy',
      learningFocus: [baseExercise.topic]
    };
  };

  // NUEVA función: generar 8 ejercicios de emergencia únicos para sesión completa
  const generateEmergencySession = (level: string): any[] => {
    const baseExercises = [
      {
        question: "I _____ hungry. / Tengo hambre.",
        options: ["am", "is", "are", "be"],
        correctAnswer: 0,
        explanation: "🎯 Con 'I' (yo) siempre usamos 'am'. I am hungry = Tengo hambre.",
        topic: "verb to be"
      },
      {
        question: "What is this? 🍕 / ¿Qué es esto? 🍕",
        options: ["pizza", "hamburger", "sandwich", "salad"],
        correctAnswer: 0,
        explanation: "🎯 🍕 es 'pizza'. Todas las opciones son comidas, por eso tiene sentido.",
        topic: "food vocabulary"
      },
      {
        question: "She _____ coffee every morning. / Ella bebe café cada mañana.",
        options: ["drinks", "drink", "drinking", "drank"],
        correctAnswer: 0,
        explanation: "🎯 Con 'she' usamos 'drinks' (con -s). She drinks coffee = Ella bebe café.",
        topic: "present simple"
      },
      {
        question: "How do you say 'hola' in English? / ¿Cómo se dice 'hola' en inglés?",
        options: ["hello", "goodbye", "thank you", "excuse me"],
        correctAnswer: 0,
        explanation: "🎯 'Hola' en inglés es 'hello'. Es el saludo más común.",
        topic: "greetings"
      },
      {
        question: "What color is this? 🔴 / ¿De qué color es esto? 🔴",
        options: ["red", "blue", "green", "yellow"],
        correctAnswer: 0,
        explanation: "🎯 🔴 es 'red' (rojo). Todas las opciones son colores.",
        topic: "colors"
      },
      {
        question: "I _____ English every day. / Yo estudio inglés todos los días.",
        options: ["study", "studies", "studied", "studying"],
        correctAnswer: 0,
        explanation: "🎯 Con 'I' usamos 'study' (sin -s). I study = Yo estudio.",
        topic: "present simple"
      },
      {
        question: "What do you eat for breakfast? / ¿Qué comes en el desayuno?",
        options: ["cereal", "dinner", "lunch", "sleep"],
        correctAnswer: 0,
        explanation: "🎯 'Cereal' es una comida común para el desayuno. Las otras opciones no son comidas de desayuno.",
        topic: "meals"
      },
      {
        question: "Where _____ you live? / ¿Dónde vives?",
        options: ["do", "does", "are", "is"],
        correctAnswer: 0,
        explanation: "🎯 Con 'you' y verbos normales usamos 'do'. Where do you live? = ¿Dónde vives?",
        topic: "question formation"
      }
    ];

    // Generar 8 ejercicios únicos con mezclado
    return baseExercises.map((exercise, index) => {
      // Mezclar opciones para cada ejercicio
      const correctAnswerText = exercise.options[exercise.correctAnswer];
      const shuffledOptions = [...exercise.options];
      
      // Fisher-Yates shuffle
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      
      const newCorrectAnswer = shuffledOptions.findIndex(option => option === correctAnswerText);

      return {
        id: `emergency_session_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        question: exercise.question,
        instruction: "Selecciona la respuesta correcta",
        options: shuffledOptions,
        correctAnswer: newCorrectAnswer,
        explanation: exercise.explanation,
        xpReward: 10,
        topic: exercise.topic,
        level: level,
        source: 'emergency',
        difficulty: 'easy',
        learningFocus: [exercise.topic]
      };
    });
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