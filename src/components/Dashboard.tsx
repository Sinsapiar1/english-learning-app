import React, { useState, useEffect } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "../firebase";
import MultipleChoice from "./MultipleChoice";
import APIKeySetup from "./APIKeySetup";
import LessonSessionComponent from "./LessonSession";
import { useAPIKey } from "../hooks/useAPIKey";
import { UserProgress } from "../services/adaptiveLearning";

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [showLegacyExercise, setShowLegacyExercise] = useState(false);
  const [showLessonSession, setShowLessonSession] = useState(false);
  const [showAPISetup, setShowAPISetup] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: "A2",
    xp: 850,
    accuracy: 0.75,
    completedLessons: 3,
    weakAreas: ["present perfect", "prepositions"],
    strengths: ["basic vocabulary", "verb to be"],
    streak: 7,
  });

  const { apiKey, hasApiKey, saveApiKey } = useAPIKey();

  // Cargar progreso del usuario desde localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("user_progress");
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Guardar progreso cuando cambie
  const saveUserProgress = (newProgress: UserProgress) => {
    setUserProgress(newProgress);
    localStorage.setItem("user_progress", JSON.stringify(newProgress));
  };

  // Pregunta legacy para compatibilidad
  const sampleQuestion = {
    id: 1,
    question: "What is the correct form of Present Perfect?",
    options: [
      "I have been to London",
      "I have go to London",
      "I has been to London",
      "I have went to London",
    ],
    correctAnswer: 0,
    explanation:
      "Present Perfect uses 'have/has + past participle'. 'Been' is the past participle of 'be'.",
  };

  const handleLegacyAnswer = (correct: boolean, xpEarned: number) => {
    const newProgress = {
      ...userProgress,
      xp: userProgress.xp + xpEarned,
    };
    saveUserProgress(newProgress);

    setTimeout(() => {
      setShowLegacyExercise(false);
    }, 1000);
  };

  const handleSessionComplete = (sessionResults: any) => {
    const newProgress = {
      ...userProgress,
      xp: userProgress.xp + sessionResults.xpEarned,
      accuracy: (userProgress.accuracy + sessionResults.accuracy) / 2,
      completedLessons: userProgress.completedLessons + 1,
      level: sessionResults.levelUp
        ? sessionResults.newLevel
        : userProgress.level,
    };

    saveUserProgress(newProgress);
    setShowLessonSession(false);

    if (sessionResults.levelUp) {
      // Mostrar celebración de nivel up
      setTimeout(() => {
        alert(`🎉 ¡FELICIDADES! Subiste al nivel ${sessionResults.newLevel}!`);
      }, 500);
    }
  };

  const handleApiKeySet = (key: string) => {
    saveApiKey(key);
    setShowAPISetup(false);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const getXPforNextLevel = () => {
    const levelRequirements = {
      A1: 1000,
      A2: 2500,
      B1: 5000,
      B2: 10000,
    };
    return levelRequirements[userProgress.level] || 10000;
  };

  const getProgressToNextLevel = () => {
    const required = getXPforNextLevel();
    return (userProgress.xp / required) * 100;
  };

  // Vista de configuración de API
  if (showAPISetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <button
              onClick={() => setShowAPISetup(false)}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              ← Volver al Dashboard
            </button>
          </div>
          <APIKeySetup onApiKeySet={handleApiKeySet} currentApiKey={apiKey} />
        </div>
      </div>
    );
  }

  // Vista de sesión IA inteligente
  if (showLessonSession) {
    return (
      <LessonSessionComponent
        apiKey={apiKey!}
        userProgress={userProgress}
        onSessionComplete={handleSessionComplete}
        onExit={() => setShowLessonSession(false)}
      />
    );
  }

  // Vista de ejercicio legacy (compatibilidad)
  if (showLegacyExercise) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📚 Lección Básica
              </h1>
              <p className="text-gray-600">XP: {userProgress.xp}</p>
            </div>
            <button
              onClick={() => setShowLegacyExercise(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Volver
            </button>
          </div>
          <MultipleChoice
            question={sampleQuestion}
            onAnswer={handleLegacyAnswer}
          />
        </div>
      </div>
    );
  }

  // Dashboard principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                🚀 English Learning App
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-gray-700 font-medium">
                  {user.email?.split("@")[0]}! 👋
                </p>
                <p className="text-xs text-gray-500">
                  Nivel {userProgress.level} • {userProgress.completedLessons}{" "}
                  lecciones
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            ¡Bienvenido a tu Dashboard! 🎉
          </h2>

          {/* Progreso de Nivel */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Progreso de Nivel {userProgress.level}
                </h3>
                <p className="text-sm text-gray-600">
                  {userProgress.xp} / {getXPforNextLevel()} XP
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(getProgressToNextLevel())}%
                </p>
                <p className="text-xs text-gray-500">al siguiente nivel</p>
              </div>
            </div>
            <div className="bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(getProgressToNextLevel(), 100)}%` }}
              ></div>
            </div>
          </div>

          {/* API Key Status */}
          {hasApiKey ? (
            <APIKeySetup onApiKeySet={handleApiKeySet} currentApiKey={apiKey} />
          ) : (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border-2 border-orange-200 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800 mb-1">
                    ¡Desbloquea tu Superpoder IA! 🤖
                  </h3>
                  <p className="text-orange-700 text-sm mb-3">
                    Conecta tu Google AI Studio para sesiones personalizadas
                    infinitas
                  </p>
                  <button
                    onClick={() => setShowAPISetup(true)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600 transition-colors text-sm"
                  >
                    Configurar IA Personal →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">⭐</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        XP Total
                      </dt>
                      <dd className="text-2xl font-bold text-blue-600">
                        {userProgress.xp}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Precisión
                      </dt>
                      <dd className="text-2xl font-bold text-green-600">
                        {Math.round(userProgress.accuracy * 100)}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🔥</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Racha
                      </dt>
                      <dd className="text-2xl font-bold text-orange-500">
                        {userProgress.streak} días
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📚</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Lecciones
                      </dt>
                      <dd className="text-2xl font-bold text-purple-600">
                        {userProgress.completedLessons}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continúa Aprendiendo */}
          <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  Continúa Aprendiendo 🚀
                </h3>
                <p className="text-blue-100 mb-4">
                  ¿Listo para tu próxima sesión personalizada?
                </p>
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={() => setShowLegacyExercise(true)}
                    className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                  >
                    📚 Lección Rápida
                  </button>
                  {hasApiKey && (
                    <button
                      onClick={() => setShowLessonSession(true)}
                      className="bg-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-600 transition-colors shadow-lg border-2 border-purple-300"
                    >
                      🤖 Sesión IA (8 ejercicios)
                    </button>
                  )}
                </div>
                {hasApiKey && (
                  <p className="text-blue-200 text-xs">
                    ✨ Sesión adaptativa con dificultad inteligente
                  </p>
                )}
              </div>
              <div className="hidden md:block">
                <div className="text-6xl opacity-20">📚</div>
              </div>
            </div>
          </div>

          {/* Análisis de Progreso */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-2xl mr-2">💪</span>
                Áreas a Mejorar
              </h4>
              <div className="space-y-2">
                {userProgress.weakAreas.map((area, index) => (
                  <div
                    key={index}
                    className="bg-orange-50 px-3 py-2 rounded-lg text-sm text-orange-800 capitalize"
                  >
                    {area}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-2xl mr-2">⭐</span>
                Fortalezas
              </h4>
              <div className="space-y-2">
                {userProgress.strengths.map((strength, index) => (
                  <div
                    key={index}
                    className="bg-green-50 px-3 py-2 rounded-lg text-sm text-green-800 capitalize"
                  >
                    {strength}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
