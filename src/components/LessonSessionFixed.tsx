import React, { useState, useEffect, useCallback } from "react";
import MultipleChoice from "./MultipleChoice";
import { getUniqueExercises, shuffleExerciseOptions, Exercise } from "../data/exercises";

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
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionExercises, setSessionExercises] = useState<Exercise[]>([]);
  
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

  // Inicializar ejercicios únicos al comenzar
  useEffect(() => {
    const initializeSession = () => {
      console.log("🚀 INICIANDO SESIÓN SIN IA - SISTEMA GARANTIZADO");
      
      // Obtener ejercicios ya usados
      const savedUsedIds = localStorage.getItem(`used_exercises_${userProgress.level}`) || "[]";
      const usedIds = JSON.parse(savedUsedIds);
      
      // Seleccionar tema basado en debilidades
      const availableTopics = getTopicsForLevel(userProgress.level);
      let selectedTopic = availableTopics[0]; // Default
      
      if (userProgress.weakAreas && userProgress.weakAreas.length > 0) {
        const weakTopic = userProgress.weakAreas.find((topic: string) => 
          availableTopics.includes(topic)
        );
        if (weakTopic) selectedTopic = weakTopic;
      }
      
      setCurrentTopic(selectedTopic);
      
      // Obtener ejercicios únicos
      const uniqueExercises = getUniqueExercises(
        userProgress.level,
        selectedTopic,
        usedIds,
        totalExercises
      );
      
      setSessionExercises(uniqueExercises);
      
      console.log("✅ CONFIGURACIÓN COMPLETA:");
      console.log("📊 Nivel:", userProgress.level);
      console.log("📝 Tema:", selectedTopic);
      console.log("🎯 Ejercicios únicos:", uniqueExercises.length);
      console.log("🚫 Ya usados:", usedIds.length);
      
      // Cargar primer ejercicio
      if (uniqueExercises.length > 0) {
        loadExercise(1, uniqueExercises);
      }
    };
    
    initializeSession();
  }, [userProgress.level]);

  // Cargar ejercicio específico
  const loadExercise = (number: number, exercises: Exercise[]) => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const exerciseIndex = number - 1;
      
      if (exerciseIndex < exercises.length) {
        const baseExercise = exercises[exerciseIndex];
        const shuffledExercise = shuffleExerciseOptions(baseExercise);
        
        setCurrentExercise({
          ...shuffledExercise,
          exerciseNumber: number,
        });
        
        console.log(`✅ EJERCICIO ${number} CARGADO:`, baseExercise.id);
      } else {
        console.error("❌ No hay más ejercicios disponibles");
      }
      
      setIsGenerating(false);
    }, 500); // Pequeña pausa para UX
  };

  // Avanzar al siguiente ejercicio
  useEffect(() => {
    if (exerciseNumber <= totalExercises && sessionExercises.length > 0) {
      loadExercise(exerciseNumber, sessionExercises);
    }
  }, [exerciseNumber, sessionExercises]);

  // Manejar respuesta
  const handleAnswer = useCallback((correct: boolean, xpEarned: number) => {
    if (correct) {
      setCorrectCount((prev) => prev + 1);
    }
    setTotalXP((prev) => prev + xpEarned);

    // Marcar ejercicio como usado
    if (currentExercise) {
      const savedUsedIds = localStorage.getItem(`used_exercises_${userProgress.level}`) || "[]";
      const usedIds = JSON.parse(savedUsedIds);
      const newUsedIds = [...usedIds, currentExercise.id];
      localStorage.setItem(`used_exercises_${userProgress.level}`, JSON.stringify(newUsedIds));
    }

    setTimeout(() => {
      if (exerciseNumber >= totalExercises) {
        completeSession();
      } else {
        setExerciseNumber((prev) => prev + 1);
      }
    }, 2000);
  }, [exerciseNumber, totalExercises, currentExercise, userProgress.level]);

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
                ✅ Sesión Garantizada Sin IA
              </h1>
              <p className="text-gray-600">
                {currentTopic} • Nivel {userProgress.level}
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
            <div className="animate-bounce text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">Cargando ejercicio único...</h3>
            <p className="text-gray-600 mb-4">
              Sistema garantizado sin repeticiones
            </p>
          </div>
        ) : currentExercise ? (
          <div className="relative">
            <div className="absolute -top-4 right-4 z-10">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                ✅ Único: {currentExercise.id}
              </div>
            </div>
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