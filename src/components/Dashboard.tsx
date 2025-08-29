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
import { ContentHashTracker } from '../services/contentHashTracker';
import { RealLevelSystem, RealUserProgress } from '../services/realLevelSystem';
import { AnalyticsService, getDeviceType } from '../services/analytics';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [showLegacyExercise, setShowLegacyExercise] = useState(false);
  const [showLessonSession, setShowLessonSession] = useState(false);
  const [showAPISetup, setShowAPISetup] = useState(false);
  // ✅ UN SOLO ESTADO DE PROGRESO - RealLevelSystem
  const [userProgress, setUserProgress] = useState<RealUserProgress>(
    RealLevelSystem.loadUserProgress(user.uid || 'anonymous')
  );



  const { apiKey, hasApiKey, saveApiKey } = useAPIKey();
  
  // Estados para sistema inteligente
  const [detectedLevel, setDetectedLevel] = useState<string>("");
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<any>(null);
  const [learningAnalytics, setLearningAnalytics] = useState<any>(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);
  const [celebrationLevel, setCelebrationLevel] = useState<string>('');
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);

  // ✅ LIMPIAR SISTEMAS MÚLTIPLES Y CARGAR PROGRESO UNIFICADO
  useEffect(() => {
    // ✅ LIMPIAR datos conflictivos de sistemas múltiples
    const cleanupKeys = [
      'user_progress', // Legacy
      'level_progress_A1',
      'level_progress_A2', 
      'level_progress_B1',
      'recent_sessions_anonymous'
    ];
    
    cleanupKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🧹 Limpiando dato conflictivo: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // LIMPIAR LA PREGUNTA PROBLEMÁTICA ESPECÍFICA
    const cleanProblemQuestion = localStorage.getItem('cleaned_uber_question');
    if (!cleanProblemQuestion) {
      ContentHashTracker.removeSpecificQuestion(
        "Has Sofía ordered food using Uber Eats today?", 
        userProgress.currentLevel
      );
      localStorage.setItem('cleaned_uber_question', 'true');
      console.log('🧹 Pregunta problemática de Uber Eats eliminada del cache');
    }
    
    console.log("✅ Sistema de progreso unificado iniciado");
  
  // 📊 CONFIGURAR ANALYTICS PARA ESTE USUARIO (SIN ROMPER NADA)
  try {
    AnalyticsService.setUser(user.uid || 'anonymous', {
      level: userProgress.currentLevel,
      totalXP: userProgress.totalXP,
      accuracy: userProgress.overallAccuracy,
      device: getDeviceType()
    });
    
    AnalyticsService.logDeviceInfo();
    
    AnalyticsService.logCustomEvent('user_session_start', {
      user_level: userProgress.currentLevel,
      total_xp: userProgress.totalXP,
      device_type: getDeviceType()
    });
  } catch (error) {
    console.log("📊 Analytics setup error (no crítico):", error);
  }
  }, []);

  // El progreso real ya no puede bajar, este efecto ya no es necesario
  useEffect(() => {
    // Migrar a sistema real si es la primera vez
    const migrationDone = localStorage.getItem('migrated_to_real_system');
    if (!migrationDone) {
      console.log('✅ Migrado al sistema de niveles real - el progreso nunca bajará');
      localStorage.setItem('migrated_to_real_system', 'true');
    }
  }, []);

  // Verificar errores de cuota para mostrar advertencia
  useEffect(() => {
    // Verificar si hay errores recientes de cuota
    const lastQuotaError = localStorage.getItem('last_quota_error');
    if (lastQuotaError) {
      const errorTime = new Date(lastQuotaError);
      const now = new Date();
      const hoursSinceError = (now.getTime() - errorTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceError < 24) {
        setShowQuotaWarning(true);
      }
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
  // ✅ FUNCIÓN SIMPLE - UN SOLO SISTEMA
  const saveUserProgress = (newProgress: RealUserProgress) => {
    setUserProgress(newProgress);
    RealLevelSystem.saveUserProgress(newProgress);
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
      totalXP: userProgress.totalXP + xpEarned,
    };
    saveUserProgress(newProgress);

    setTimeout(() => {
      setShowLegacyExercise(false);
    }, 1000);
  };

  const handleSessionComplete = (sessionResults: any) => {
    console.log("📊 SESIÓN COMPLETADA:", sessionResults);
    
    try {
      // ✅ USAR SOLO RealLevelSystem - UN SOLO SISTEMA
      const updatedProgress = RealLevelSystem.updateProgress(userProgress, {
        correctAnswers: sessionResults.correctAnswers || 0,
        totalAnswers: sessionResults.totalAnswers || 8,
        xpEarned: sessionResults.xpEarned || 0,
        level: userProgress.currentLevel
      });
      
      console.log("📈 PROGRESO ACTUALIZADO:", updatedProgress);
      
      // ✅ VERIFICAR SI PUEDE SUBIR DE NIVEL
      const progressCheck = RealLevelSystem.calculateRealProgress(updatedProgress);
      let finalProgress = updatedProgress;
      let leveledUp = false;
      
      if (progressCheck.canLevelUp) {
        finalProgress = RealLevelSystem.levelUp(updatedProgress);
        leveledUp = true;
        console.log(`🎉 LEVEL UP! Nuevo nivel: ${finalProgress.currentLevel}`);
        
        // Mostrar celebración
        setCelebrationLevel(finalProgress.currentLevel);
        setShowLevelUpCelebration(true);
      }
      
      // ✅ GUARDAR UNA SOLA VEZ
      saveUserProgress(finalProgress);
      
      // 📊 TRACKEAR SESIÓN COMPLETADA (SIN ROMPER NADA)
      try {
        AnalyticsService.logSessionCompleted({
          exercisesCompleted: sessionResults.totalAnswers || 8,
          correctAnswers: sessionResults.correctAnswers || 0,
          accuracy: sessionResults.accuracy || 0,
          xpEarned: sessionResults.xpEarned || 0,
          timeSpent: 300, // Estimado 5 minutos
          level: finalProgress.currentLevel
        });
        
        if (leveledUp) {
          AnalyticsService.logLevelUp({
            fromLevel: userProgress.currentLevel,
            toLevel: finalProgress.currentLevel,
            totalXP: finalProgress.totalXP,
            totalExercises: finalProgress.totalExercises,
            daysToComplete: Math.ceil((Date.now() - userProgress.lastActive.getTime()) / (1000 * 60 * 60 * 24))
          });
        }
      } catch (error) {
        console.log("📊 Analytics session error (no crítico):", error);
      }
      
      console.log("✅ PROGRESO GUARDADO EXITOSAMENTE:", {
        currentLevel: finalProgress.currentLevel,
        totalXP: finalProgress.totalXP,
        totalCorrect: finalProgress.totalCorrectAnswers,
        accuracy: finalProgress.overallAccuracy,
        leveledUp: leveledUp
      });
      
    } catch (error) {
      console.error("❌ ERROR ACTUALIZANDO PROGRESO:", error);
    } finally {
      setShowLessonSession(false);
    }
  };

  const handleApiKeySet = (key: string) => {
    saveApiKey(key);
    setShowAPISetup(false);
  };

  const renderLevelProgress = () => {
    const progressInfo = RealLevelSystem.calculateRealProgress(userProgress);
    
    console.log("🔍 DEBUG PROGRESO SIMPLIFICADO:", {
      currentLevel: userProgress.currentLevel,
      totalXP: userProgress.totalXP,
      totalCorrect: userProgress.totalCorrectAnswers,
      totalExercises: userProgress.totalExercises,
      accuracy: userProgress.overallAccuracy,
      progressPercentage: progressInfo.progressPercentage,
      canLevelUp: progressInfo.canLevelUp
    });
    
    return (
      <div className={`rounded-2xl p-6 mb-8 border-2 ${
        progressInfo.canLevelUp 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'
      }`}>
        
        {/* Header con info clara */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold ${
              progressInfo.canLevelUp ? 'text-green-800' : 'text-blue-800'
            }`}>
              📈 Nivel {userProgress.currentLevel} → {progressInfo.nextLevel}
            </h3>
            <p className={`text-sm ${
              progressInfo.canLevelUp ? 'text-green-700' : 'text-blue-700'
            }`}>
              {progressInfo.motivationalMessage}
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="font-bold text-2xl text-gray-800">{progressInfo.progressPercentage}%</span>
            </div>
            <span className="text-xs text-gray-600 mt-1 block">Progreso</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-4 rounded-full transition-all duration-1000 ${
                progressInfo.canLevelUp 
                  ? 'bg-gradient-to-r from-green-400 to-green-500' 
                  : 'bg-gradient-to-r from-blue-400 to-purple-500'
              }`}
              style={{ width: `${progressInfo.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats simples */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="font-bold text-lg text-blue-600">{userProgress.totalCorrectAnswers}</div>
            <div className="text-xs text-gray-600">Correctas</div>
          </div>
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="font-bold text-lg text-green-600">{userProgress.totalXP}</div>
            <div className="text-xs text-gray-600">XP</div>
          </div>
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="font-bold text-lg text-purple-600">
              {Math.round(userProgress.overallAccuracy * 100)}%
            </div>
            <div className="text-xs text-gray-600">Precisión</div>
          </div>
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="font-bold text-lg text-orange-600">{userProgress.totalExercises}</div>
            <div className="text-xs text-gray-600">Ejercicios</div>
          </div>
        </div>

        {/* Acción */}
        {progressInfo.canLevelUp ? (
          <button
            onClick={() => setShowLessonSession(true)}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
          >
            🚀 ¡SUBIR A {progressInfo.nextLevel} AHORA!
          </button>
        ) : (
          <button
            onClick={() => setShowLessonSession(true)}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            📚 Continuar Aprendiendo
          </button>
        )}
      </div>
    );
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const getXPforNextLevel = () => {
    const levelRequirements: { [key: string]: number } = {
      A1: 1000,
      A2: 2500,
      B1: 5000,
      B2: 10000,
    };
    return levelRequirements[userProgress.currentLevel] || 10000;
  };

  const getProgressToNextLevel = () => {
    const required = getXPforNextLevel();
    return (userProgress.totalXP / required) * 100;
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
              <p className="text-gray-600">XP: {userProgress.totalXP}</p>
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
                  Nivel {userProgress.currentLevel} • {userProgress.totalExercises}{" "}
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

          {/* Advertencia de cuota agotada */}
          {showQuotaWarning && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800 mb-1">
                    🔋 Cuota de IA Agotada (Temporal)
                  </h3>
                  <p className="text-orange-700 text-sm mb-2">
                    Has usado tus 50 requests gratuitos diarios de Google AI. La app funciona con ejercicios de respaldo hasta mañana.
                  </p>
                  <div className="text-xs text-orange-600 bg-orange-100 rounded-full px-3 py-1 inline-block">
                    ✅ App funcional • Ejercicios únicos • Se resetea en 24h
                  </div>
                </div>
                <button
                  onClick={() => setShowQuotaWarning(false)}
                  className="text-orange-600 hover:text-orange-800 text-sm underline"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}

          {renderLevelProgress()}

          {/* API Key Status */}
          {hasApiKey ? (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800 mb-1">
                    ✨ IA Personalizada Activa - Ejercicios Únicos Garantizados
                  </h3>
                  <p className="text-green-700 text-sm mb-2">
                    Tu asistente de inglés con IA está generando ejercicios completamente únicos para ti
                  </p>
                  <div className="text-xs text-green-600 bg-green-100 rounded-full px-3 py-1 inline-block">
                    🎯 0% contenido estático • 100% IA personalizada • Explicaciones en español
                  </div>
                </div>
                <button
                  onClick={() => setShowAPISetup(true)}
                  className="text-green-600 hover:text-green-800 text-sm underline"
                >
                  Gestionar IA
                </button>
              </div>
            </div>
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
                        {userProgress.totalXP}
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
                        {Math.round(userProgress.overallAccuracy * 100)}%
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
                        {Math.floor(userProgress.totalExercises / 8)}
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
                {['grammar', 'vocabulary', 'pronunciation'].map((area, index) => (
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
                {userProgress.unlockedSkills.slice(0, 3).map((strength, index) => (
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
