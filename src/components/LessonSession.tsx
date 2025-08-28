import React, { useState, useEffect, useCallback } from "react";
import MultipleChoice from "./MultipleChoice";
import { PersonalizedLessonGenerator } from "../services/geminiAI";

interface LessonSessionProps {
  apiKey: string;
  userProgress: any;
  onSessionComplete: (results: any) => void;
  onExit: () => void;
}

const LessonSessionComponent: React.FC<LessonSessionProps> = ({
  apiKey,
  userProgress,
  onSessionComplete,
  onExit,
}) => {
  // Estados SIMPLES - un solo source of truth
  const [exerciseNumber, setExerciseNumber] = useState(1); // Empieza en 1
  const [totalExercises] = useState(8);
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Estadísticas SIMPLES
  const [correctCount, setCorrectCount] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Topics variados para evitar repetición
  const [usedTopics, setUsedTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState("");

  // Temas por nivel
  const getTopicsForLevel = (level: string) => {
    const allTopics = {
      A1: [
        "verb to be",
        "present simple",
        "basic vocabulary",
        "numbers",
        "colors",
        "family",
        "food",
        "clothes",
      ],
      A2: [
        "present perfect",
        "past simple",
        "future tense",
        "prepositions",
        "adjectives",
        "adverbs",
        "comparatives",
        "superlatives",
      ],
      B1: [
        "present perfect continuous",
        "conditionals",
        "passive voice",
        "modal verbs",
        "reported speech",
        "relative clauses",
      ],
      B2: [
        "advanced tenses",
        "subjunctive",
        "complex grammar",
        "idioms",
        "phrasal verbs",
        "formal writing",
      ],
    };
    return allTopics[level as keyof typeof allTopics] || allTopics.A2;
  };

  // Generar ejercicio ÚNICO
  const generateUniqueExercise = async () => {
    setIsGenerating(true);

    try {
      const availableTopics = getTopicsForLevel(userProgress.level);
      const unusedTopics = availableTopics.filter(
        (topic) => usedTopics.indexOf(topic) === -1
      );

      // Si ya usamos todos los temas, reiniciar
      const topicsToUse =
        unusedTopics.length > 0 ? unusedTopics : availableTopics;
      const selectedTopic =
        topicsToUse[Math.floor(Math.random() * topicsToUse.length)];

      setCurrentTopic(selectedTopic);
      setUsedTopics((prev) => [...prev, selectedTopic]);

      const generator = new PersonalizedLessonGenerator(apiKey);

      // Prompt con VARIABILIDAD para evitar repetición
      const exerciseContext = {
        level: userProgress.level,
        topic: selectedTopic,
        exerciseNumber: exerciseNumber,
        userWeaknesses: userProgress.weakAreas || [],
        timestamp: Date.now(), // Para asegurar unicidad
      };

      const exercise = await generator.generateMultipleChoiceExercise(
        exerciseContext
      );

      // Añadir contexto único al ejercicio
      const uniqueExercise = {
        ...exercise,
        id: `ex_${exerciseNumber}_${Date.now()}`,
        topic: selectedTopic,
        exerciseNumber: exerciseNumber,
      };

      setCurrentExercise(uniqueExercise);
    } catch (error) {
      console.error("Error generating exercise:", error);
      
      // Mostrar error temporal al usuario
      setCurrentExercise({
        question: "Error al generar ejercicio. Usando ejercicio de respaldo...",
        instruction: "Cargando...",
        options: [],
        correctAnswer: 0,
        explanation: "",
        xpReward: 0,
        isError: true
      });

      // Esperar 1 segundo antes de mostrar fallback
      setTimeout(() => {
        const fallbackExercises = [
        {
          question: "I ____ never been to Spain.",
          instruction: "Completa con Present Perfect",
          options: ["have", "has", "am", "was"],
          correctAnswer: 0,
          explanation: "Usamos 'have' con 'I' en Present Perfect.",
          xpReward: 10,
        },
        {
          question: "She ____ to work every day.",
          instruction: "Completa con Present Simple",
          options: ["go", "goes", "going", "went"],
          correctAnswer: 1,
          explanation: "Con 'She' en Present Simple añadimos -s al verbo.",
          xpReward: 10,
        },
        {
          question: "They ____ playing football yesterday.",
          instruction: "Completa con Past Continuous",
          options: ["was", "were", "are", "is"],
          correctAnswer: 1,
          explanation: "Con 'They' usamos 'were' en Past Continuous.",
          xpReward: 10,
        },
        {
          question: "I will ____ you tomorrow.",
          instruction: "Completa la oración",
          options: ["call", "calling", "called", "calls"],
          correctAnswer: 0,
          explanation: "Después de 'will' usamos el infinitivo sin 'to'.",
          xpReward: 10,
        },
        {
          question: "This is ____ book than that one.",
          instruction: "Completa con comparativo",
          options: ["good", "better", "best", "gooder"],
          correctAnswer: 1,
          explanation: "'Better' es el comparativo irregular de 'good'.",
          xpReward: 10,
        },
        {
          question: "She can ____ English very well.",
          instruction: "Completa con modal verb",
          options: ["speak", "speaking", "spoke", "speaks"],
          correctAnswer: 0,
          explanation: "Después de 'can' usamos el infinitivo sin 'to'.",
          xpReward: 10,
        },
        {
          question: "There ____ many people in the park.",
          instruction: "Completa con There is/are",
          options: ["is", "are", "was", "am"],
          correctAnswer: 1,
          explanation: "Con 'many people' (plural) usamos 'are'.",
          xpReward: 10,
        },
        {
          question: "I have lived here ____ 2010.",
          instruction: "Completa con preposición",
          options: ["for", "since", "in", "on"],
          correctAnswer: 1,
          explanation: "Usamos 'since' con un punto específico en el tiempo.",
          xpReward: 10,
        },
      ];

      const fallback =
        fallbackExercises[exerciseNumber - 1] || fallbackExercises[0];
      setCurrentExercise({
        ...fallback,
        id: `fallback_${exerciseNumber}`,
        exerciseNumber: exerciseNumber,
      });
      }, 1000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Inicializar primer ejercicio
  useEffect(() => {
    if (exerciseNumber <= totalExercises) {
      generateUniqueExercise();
    }
  }, [exerciseNumber]);

  // Manejar respuesta y avanzar
  const handleAnswer = useCallback((correct: boolean, xpEarned: number) => {
    // Actualizar stats inmediatamente
    if (correct) {
      setCorrectCount((prev) => prev + 1);
    }
    setTotalXP((prev) => prev + xpEarned);

    // Mostrar resultado por 2 segundos, luego continuar
    setTimeout(() => {
      if (exerciseNumber >= totalExercises) {
        // Completar sesión - no pasamos 'correct' ya que ya se contó arriba
        completeSession();
      } else {
        // Siguiente ejercicio
        setExerciseNumber((prev) => prev + 1);
      }
    }, 2000);
  }, [exerciseNumber, totalExercises]);

  const completeSession = useCallback(() => {
    // Prevenir ejecución múltiple
    if (sessionComplete) return;
    
    // Los contadores ya están actualizados en handleAnswer
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

    // Mostrar resultados por 3 segundos
    setTimeout(() => {
      onSessionComplete(results);
    }, 3000);
  }, [sessionComplete, correctCount, totalExercises, totalXP, userProgress.completedLessons, onSessionComplete]);

  // Pantalla de resultados
  if (sessionComplete) {
    const finalCorrect = correctCount;
    const finalAccuracy = (finalCorrect / totalExercises) * 100;

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

  // Cargando inicial
  if (exerciseNumber === 1 && isGenerating && !currentExercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🚀</div>
          <p className="text-xl text-gray-600">Preparando tu sesión...</p>
        </div>
      </div>
    );
  }

  // Sesión activa
  const progress = (exerciseNumber / totalExercises) * 100;
  const accuracy =
    exerciseNumber > 1 ? (correctCount / (exerciseNumber - 1)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header SIMPLE */}
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
                🤖 Sesión IA Personalizada
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

          {/* Progreso SIMPLE */}
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
            <h3 className="text-xl font-semibold mb-2">Generando ejercicio...</h3>
            <p className="text-gray-600 mb-4">
              Creando ejercicio {exerciseNumber} de {totalExercises} personalizado para ti
            </p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        ) : currentExercise ? (
          <div className="relative">
            <div className="absolute -top-4 right-4 z-10">
              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                ✨ Tema: {currentTopic}
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
            <p className="text-gray-600 mb-4">Error cargando ejercicio</p>
            <button 
              onClick={() => generateUniqueExercise()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Stats SIMPLES */}
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

export default LessonSessionComponent;
