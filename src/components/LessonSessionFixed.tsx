import React, { useState, useEffect, useCallback } from "react";
import MultipleChoice from "./MultipleChoice";
// ELIMINADA IMPORTACIÓN DE EJERCICIOS ESTÁTICOS - SOLO IA
import { IntelligentLearningSystem } from "../services/intelligentLearning";
import { SmartAISystem, SmartExercise } from "../services/smartAI";
import { ExerciseTracker } from "../services/exerciseTracker";
import { ContentHashTracker } from "../services/contentHashTracker";

interface LessonSessionProps {
  apiKey: string;
  userProgress: any;
  onSessionComplete: (results: any) => void;
  onExit: () => void;
}

const LessonSessionFixed: React.FC<LessonSessionProps> = ({
  apiKey,
  userProgress,
  onSessionComplete,
  onExit,
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

  // GENERAR EJERCICIO INTELIGENTE CON ANTI-REPETICIÓN ROBUSTO
  const generateIntelligentExercise = async (exerciseNum: number) => {
    setIsGenerating(true);
    
    try {
      console.log(`🤖 GENERANDO EJERCICIO ÚNICO ${exerciseNum}/8`);
      
      // DEBUG: Ver ejercicios ya usados
      ExerciseTracker.debugUsedExercises(userProgress.level);
      
      // Limpiar historial si es necesario
      ExerciseTracker.cleanupIfNeeded(userProgress.level, 40);
      
      let attempts = 0;
      let smartExercise: SmartExercise;
      
      // INTENTAR HASTA 5 VECES GENERAR EJERCICIO ÚNICO
      do {
        attempts++;
        console.log(`🔄 Intento ${attempts} de generar ejercicio único`);
        
        smartExercise = await SmartAISystem.generateSmartExercise({
          userId: userProgress.userId || 'anonymous',
          userLevel: userProgress.level,
          apiKey: apiKey,
          sessionNumber: exerciseNum,
          weakTopics: userWeaknesses,
          strengths: userProgress.strengths || [],
          preferredDifficulty: 'medium'
        });
        
        // VERIFICACIÓN DOBLE: ID + CONTENIDO REAL
        const isIdUsed = ExerciseTracker.isExerciseUsed(userProgress.level, smartExercise.id);
        const isContentRepeated = ContentHashTracker.isContentRepeated(smartExercise, userProgress.level);
        
        if (!isIdUsed && !isContentRepeated) {
          console.log(`✅ EJERCICIO COMPLETAMENTE ÚNICO: ${smartExercise.id}`);
          // Marcar tanto ID como contenido como usados
          ExerciseTracker.markExerciseAsUsed(userProgress.level, smartExercise.id);
          ContentHashTracker.markContentAsUsed(smartExercise, userProgress.level);
          break;
        } else {
          if (isIdUsed) console.log(`⚠️ ID YA USADO: ${smartExercise.id}`);
          if (isContentRepeated) console.log(`⚠️ CONTENIDO YA VISTO: ${smartExercise.question.slice(0, 50)}...`);
          console.log(`🔄 Reintentando... (${attempts}/5)`);
        }
        
        // Si hemos intentado muchas veces, hacer reset
        if (attempts >= 5) {
          console.log("🔄 DEMASIADOS INTENTOS - HACIENDO RESET DE HISTORIAL");
          ExerciseTracker.resetUsedExercises(userProgress.level);
          break;
        }
        
      } while (attempts < 5);
      
      setCurrentExercise(smartExercise);
      setCurrentTopic(smartExercise.topic);
      
      console.log(`✅ EJERCICIO CARGADO:`, {
        id: smartExercise.id,
        source: smartExercise.source,
        topic: smartExercise.topic,
        difficulty: smartExercise.difficulty,
        attempts: attempts
      });
      
    } catch (error) {
      console.error("❌ Error generando ejercicio inteligente:", error);
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

    const results = {
      exercisesCompleted: totalExercises,
      correctAnswers: correctCount,
      totalAnswers: totalExercises,
      accuracy: finalAccuracy,
      xpEarned: totalXP,
      levelUp: finalAccuracy >= 0.8 && userProgress.completedLessons >= 5,
    };

    setSessionComplete(true);

    setTimeout(() => {
      onSessionComplete(results);
    }, 3000);
  }, [sessionComplete, correctCount, totalExercises, totalXP, userProgress.completedLessons, onSessionComplete]);

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
            <div className="animate-bounce text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">IA Generando Ejercicio Personalizado...</h3>
            <p className="text-gray-600 mb-4">
              Analizando tu nivel y debilidades para crear el ejercicio perfecto
            </p>
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
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