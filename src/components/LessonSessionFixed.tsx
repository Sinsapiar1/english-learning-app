import React, { useState, useEffect, useCallback } from "react";
import MultipleChoice from "./MultipleChoice";
// ELIMINADA IMPORTACIÓN DE EJERCICIOS ESTÁTICOS - SOLO IA
import { IntelligentLearningSystem } from "../services/intelligentLearning";
import { SmartAISystem, SmartExercise } from "../services/smartAI";
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
        } catch (error: any) {
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
          
        } catch (error: any) {
          if (error?.message === "IA_EXHAUSTED") {
            console.log("⚠️ IA agotada, usando método existente como fallback");
          } else {
            console.warn("⚠️ IA mejorada falló, intentando método original:", error);
            
            // DETECTAR error específico de cuota
            if (error?.message?.includes('quota') || error?.message?.includes('429')) {
              console.log("🔋 CUOTA DE IA AGOTADA - Marcando para UX");
              localStorage.setItem('last_quota_error', new Date().toISOString());
            }
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
        } catch (error: any) {
          console.warn("⚠️ IA falló, usando ejercicio de emergencia:", error);
          
          // DETECTAR error específico de cuota
          if (error?.message?.includes('quota') || error?.message?.includes('429')) {
            console.log("🔋 CUOTA DE IA AGOTADA - Usando ejercicio de emergencia optimizado");
            localStorage.setItem('last_quota_error', new Date().toISOString());
          }
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
  // ✅ FUNCIÓN SIMPLIFICADA - SIN LÓGICA DUPLICADA
  const completeSession = useCallback(() => {
    if (sessionComplete) return;
    
    const finalAccuracy = correctCount / totalExercises;

    const results = {
      exercisesCompleted: totalExercises,
      correctAnswers: correctCount,
      totalAnswers: totalExercises,
      accuracy: finalAccuracy,
      xpEarned: totalXP,
      // ✅ NO calcular levelUp aquí - lo hace Dashboard
    };

    setSessionComplete(true);

    setTimeout(() => {
      onSessionComplete(results);
    }, 3000);

  }, [sessionComplete, correctCount, totalExercises, totalXP, onSessionComplete]);

  // EJERCICIO DE EMERGENCIA CUANDO LA IA FALLA
  const generateEmergencyExercise = (level: string): SmartExercise => {
    const emergencyExercises = [
      {
        question: "What is this? 🍎 / ¿Qué es esto? 🍎",
        options: ["apple", "car", "house", "book"],
        correctAnswer: 0,
        explanation: "🎯 SÚPER BÁSICO: 🍎 es 'apple' (manzana). Esta es una de las primeras palabras en inglés.",
        topic: "basic vocabulary"
      },
      {
        question: "How do you say 'hola'? / ¿Cómo se dice 'hola'?",
        options: ["hello", "goodbye", "please", "thank you"], 
        correctAnswer: 0,
        explanation: "🎯 SÚPER BÁSICO: 'Hola' en inglés es 'hello'. Es el saludo más común.",
        topic: "greetings"
      },
      {
        question: "I ___ a student. / Yo ___ un estudiante.",
        options: ["am", "is", "are", "be"],
        correctAnswer: 0, 
        explanation: "🎯 SÚPER BÁSICO: Con 'I' (yo) SIEMPRE usamos 'am'. I am = yo soy.",
        topic: "verb to be"
      },
      {
        question: "What color is this? ⚪ / ¿De qué color es esto? ⚪",
        options: ["white", "black", "red", "blue"],
        correctAnswer: 0, 
        explanation: "🎯 SÚPER BÁSICO: ⚪ es 'white' (blanco). Los colores son importantes.",
        topic: "colors"
      },
      {
        question: "What do you say when you meet someone? / ¿Qué dices cuando conoces a alguien?",
        options: ["Nice to meet you", "Goodbye", "I'm sorry", "Excuse me"],
        correctAnswer: 0,
        explanation: "🎯 SÚPER BÁSICO: 'Nice to meet you' es lo que dices cuando conoces a alguien.",
        topic: "greetings"
      },
      {
        question: "How do you say 'gracias'? / ¿Cómo se dice 'gracias'?",
        options: ["thank you", "sorry", "hello", "goodbye"],
        correctAnswer: 0,
        explanation: "🎯 SÚPER BÁSICO: 'Gracias' en inglés es 'thank you'. Es muy importante ser educado.",
        topic: "politeness"
      },
      {
        question: "She ___ coffee every morning. / Ella ___ café cada mañana.",
        options: ["drinks", "drink", "drinking", "drank"],
        correctAnswer: 0,
        explanation: "🎯 Con 'She' (tercera persona singular) añadimos -s al verbo en presente simple.",
        topic: "present simple"
      },
      {
        question: "Where ___ you from? / ¿De dónde ___ tú?",
        options: ["are", "is", "am", "be"],
        correctAnswer: 0,
        explanation: "🎯 Con 'you' siempre usamos 'are'. Es una pregunta básica para conocer el origen de alguien.",
        topic: "verb to be"
      }
    ];
    
    const baseExercise = emergencyExercises[Math.floor(Math.random() * emergencyExercises.length)];
    
    // ✅ MEZCLAR OPCIONES OBLIGATORIAMENTE
    const correctAnswerText = baseExercise.options[baseExercise.correctAnswer];
    const shuffledOptions = [...baseExercise.options].sort(() => Math.random() - 0.5);
    const newCorrectAnswer = shuffledOptions.findIndex(option => option === correctAnswerText);
    
    console.log("🔀 EMERGENCY EXERCISE SHUFFLE:", {
      original: baseExercise.options,
      shuffled: shuffledOptions,
      oldCorrect: baseExercise.correctAnswer,
      newCorrect: newCorrectAnswer
    });
    
    return {
      id: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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