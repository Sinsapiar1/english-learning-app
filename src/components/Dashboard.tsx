import React, { useState, useEffect } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "../firebase";
import MultipleChoice from "./MultipleChoice";
import APIKeySetup from "./APIKeySetup";
import LessonSessionComponent from "./LessonSessionFixed";
import { useAPIKey } from "../hooks/useAPIKey";
import { UserProgress } from "../services/adaptiveLearning";
import { IntelligentLearningSystem } from "../services/intelligentLearning";
import LevelUpCelebration from './LevelUpCelebration';
import { ImprovedLevelSystem } from '../services/levelProgression';

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
  
  // Estados para sistema inteligente
  const [detectedLevel, setDetectedLevel] = useState<string>("");
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<any>(null);
  const [learningAnalytics, setLearningAnalytics] = useState<any>(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);
  const [celebrationLevel, setCelebrationLevel] = useState<string>('');

  // Cargar progreso del usuario desde localStorage
  useEffect(() => {
    // LIMPIAR datos corruptos una vez
    const cleanupDone = localStorage.getItem('cleanup_done');
    if (!cleanupDone) {
      // Limpiar hashes de ejercicios corruptos
      ['A1', 'A2', 'B1', 'B2'].forEach(level => {
        localStorage.removeItem(`content_hashes_${level}`);
        localStorage.removeItem(`used_exercises_${level}`);
      });
      localStorage.setItem('cleanup_done', 'true');
      console.log('✅ Datos de ejercicios corruptos limpiados');
    }
    
    const savedProgress = localStorage.getItem("user_progress");
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);
  
  // Inicializar sistema inteligente
  useEffect(() => {
    const initializeIntelligentSystem = async () => {
      if (!user?.uid) return;
      
      setIsLoadingIntelligence(true);
      
      try {
        console.log("🧠 INICIALIZANDO SISTEMA INTELIGENTE");
        
        // Detectar nivel automáticamente
        const level = await IntelligentLearningSystem.detectUserLevel(user.uid);
        setDetectedLevel(level);
        
        // Obtener recomendaciones personalizadas
        const recommendations = await IntelligentLearningSystem.getPersonalizedRecommendations(user.uid);
        setPersonalizedRecommendations(recommendations);
        
        // Obtener analytics detallados
        const analytics = await IntelligentLearningSystem.getDetailedAnalytics(user.uid);
        setLearningAnalytics(analytics);
        
        console.log("✅ Sistema inteligente inicializado");
        
      } catch (error) {
        console.error("❌ Error inicializando sistema inteligente:", error);
      } finally {
        setIsLoadingIntelligence(false);
      }
    };
    
    initializeIntelligentSystem();
  }, [user?.uid]);

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
    console.log("📊 SESSION RESULTS:", sessionResults);
    
    const newProgress = {
      ...userProgress,
      xp: userProgress.xp + sessionResults.xpEarned,
      accuracy: (userProgress.accuracy + sessionResults.accuracy) / 2,
      completedLessons: userProgress.completedLessons + 1,
      level: sessionResults.levelUp ? sessionResults.newLevel : userProgress.level,
    };

    saveUserProgress(newProgress);
    setShowLessonSession(false);

    if (sessionResults.levelUp) {
      console.log("🎉 LEVEL UP DETECTED:", sessionResults.newLevel);
      setCelebrationLevel(sessionResults.newLevel);
      setShowLevelUpCelebration(true);
    }
  };

  const handleApiKeySet = (key: string) => {
    saveApiKey(key);
    setShowAPISetup(false);
  };

  const renderLevelProgress = () => {
    const recentSessionsKey = `recent_sessions_${user.uid}`;
    const recentSessions = JSON.parse(localStorage.getItem(recentSessionsKey) || "[0.5, 0.6, 0.7]");
    
    const levelProgress = ImprovedLevelSystem.calculateLevelProgress({
      currentLevel: userProgress.level,
      accuracy: userProgress.accuracy,
      totalExercises: userProgress.completedLessons * 8,
      xp: userProgress.xp,
      recentSessions: recentSessions
    });

    return (
      <div className={`rounded-2xl p-6 mb-8 border-2 ${
        levelProgress.canLevelUp 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'
      }`}>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold ${
              levelProgress.canLevelUp ? 'text-green-800' : 'text-blue-800'
            }`}>
              📈 Progreso hacia {levelProgress.nextLevel}
            </h3>
            <p className={`text-sm ${
              levelProgress.canLevelUp ? 'text-green-700' : 'text-blue-700'
            }`}>
              {levelProgress.motivationalMessage}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
                <span className="font-bold text-lg text-gray-800">{userProgress.level}</span>
              </div>
              <span className="text-xs text-gray-600 mt-1 block">Actual</span>
            </div>
            <div className="text-2xl">→</div>
            <div className="text-center">
              <div className={`px-4 py-2 rounded-full shadow-sm border-2 ${
                levelProgress.canLevelUp 
                  ? 'bg-green-500 text-white border-green-600' 
                  : 'bg-gray-100 text-gray-600 border-gray-300'
              }`}>
                <span className="font-bold text-lg">{levelProgress.nextLevel}</span>
              </div>
              <span className="text-xs text-gray-600 mt-1 block">Siguiente</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progreso General</span>
            <span className="text-sm font-bold text-gray-800">{levelProgress.progressPercentage}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-4 rounded-full transition-all duration-1000 ${
                levelProgress.canLevelUp 
                  ? 'bg-gradient-to-r from-green-400 to-green-500' 
                  : levelProgress.progressPercentage > 70
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                  : 'bg-gradient-to-r from-blue-400 to-purple-500'
              }`}
              style={{ width: `${levelProgress.progressPercentage}%` }}
            >
              {levelProgress.progressPercentage > 10 && (
                <div className="h-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {levelProgress.progressPercentage > 90 ? '¡Casi!' : `${levelProgress.progressPercentage}%`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {levelProgress.canLevelUp ? (
          <div className="bg-green-100 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
              🎉 ¡Listo para subir de nivel!
            </h4>
            <p className="text-green-700 text-sm mb-3">
              Has cumplido todos los requisitos. Completa una sesión más para subir oficialmente a {levelProgress.nextLevel}.
            </p>
            <button
              onClick={() => setShowLessonSession(true)}
              className="bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg"
            >
              🚀 ¡SUBIR DE NIVEL AHORA!
            </button>
          </div>
        ) : (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              📋 Para subir a {levelProgress.nextLevel} necesitas:
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {levelProgress.missingRequirements.slice(0, 3).map((req, index) => (
                <div key={index} className="flex items-center text-sm text-blue-700">
                  <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-800 mr-2">
                    {index + 1}
                  </span>
                  {req}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
                    userProgress={{...userProgress, userId: user.uid}}
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              ¡Bienvenido a tu Dashboard! 🎉
            </h2>
            {detectedLevel && (
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                  🧠 Nivel IA: {detectedLevel}
                </div>
                {personalizedRecommendations && (
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                    🎯 Sistema Inteligente Activo
                  </div>
                )}
              </div>
            )}
          </div>

          {renderLevelProgress()}

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

          {/* Panel de Recomendaciones IA */}
          {personalizedRecommendations && !isLoadingIntelligence && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                🤖 Recomendaciones Personalizadas
                <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                  IA
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-4">
                  <h4 className="font-semibold text-gray-700 mb-2">🎯 Temas Recomendados</h4>
                  <div className="flex flex-wrap gap-2">
                    {personalizedRecommendations.recommendedTopics.map((topic: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4">
                  <h4 className="font-semibold text-gray-700 mb-2">📚 Plan de Estudio</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {personalizedRecommendations.studyPlan.slice(0, 3).map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
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
      
      {showLevelUpCelebration && (
        <LevelUpCelebration
          newLevel={celebrationLevel}
          onClose={() => {
            setShowLevelUpCelebration(false);
            setCelebrationLevel('');
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
