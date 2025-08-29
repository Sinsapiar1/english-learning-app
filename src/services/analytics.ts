import { analytics } from './firebase';
import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';

// 📊 SERVICIO DE ANALYTICS - SIN ROMPER NADA EXISTENTE
export class AnalyticsService {
  
  // 🔐 CONFIGURAR USUARIO
  static setUser(userId: string, properties: {
    level: string;
    totalXP: number;
    accuracy: number;
    device: string;
  }) {
    try {
      if (!analytics) {
        console.log("📊 Analytics no disponible - funcionando offline");
        return;
      }

      setUserId(analytics, userId);
      setUserProperties(analytics, {
        user_level: properties.level,
        total_xp: properties.totalXP.toString(),
        accuracy_percentage: Math.round(properties.accuracy * 100).toString(),
        device_type: properties.device
      });

      console.log("📊 Usuario configurado en Analytics:", userId);
    } catch (error) {
      console.log("📊 Analytics error (no crítico):", error);
    }
  }

  // 🎯 EVENTOS DE EJERCICIOS
  static logExerciseCompleted(data: {
    exerciseId: string;
    exerciseType: 'vocabulary' | 'grammar' | 'translation' | 'comprehension';
    level: string;
    isCorrect: boolean;
    responseTime: number;
    source: 'ai' | 'emergency';
    topic: string;
  }) {
    try {
      if (!analytics) return;

      logEvent(analytics, 'exercise_completed', {
        exercise_id: data.exerciseId,
        exercise_type: data.exerciseType,
        user_level: data.level,
        is_correct: data.isCorrect,
        response_time_seconds: data.responseTime,
        exercise_source: data.source,
        topic: data.topic,
        timestamp: Date.now()
      });

      console.log("📊 Ejercicio trackeado:", data.exerciseType, data.isCorrect ? "✅" : "❌");
    } catch (error) {
      console.log("📊 Analytics error (no crítico):", error);
    }
  }

  // 🏆 EVENTOS DE PROGRESO
  static logSessionCompleted(data: {
    exercisesCompleted: number;
    correctAnswers: number;
    accuracy: number;
    xpEarned: number;
    timeSpent: number;
    level: string;
  }) {
    try {
      if (!analytics) return;

      logEvent(analytics, 'session_completed', {
        exercises_completed: data.exercisesCompleted,
        correct_answers: data.correctAnswers,
        session_accuracy: Math.round(data.accuracy * 100),
        xp_earned: data.xpEarned,
        time_spent_minutes: Math.round(data.timeSpent / 60),
        user_level: data.level,
        timestamp: Date.now()
      });

      console.log("📊 Sesión trackeada:", data.exercisesCompleted, "ejercicios,", Math.round(data.accuracy * 100) + "%");
    } catch (error) {
      console.log("📊 Analytics error (no crítico):", error);
    }
  }

  // 🎉 EVENTOS DE NIVEL
  static logLevelUp(data: {
    fromLevel: string;
    toLevel: string;
    totalXP: number;
    totalExercises: number;
    daysToComplete: number;
  }) {
    try {
      if (!analytics) return;

      logEvent(analytics, 'level_up', {
        from_level: data.fromLevel,
        to_level: data.toLevel,
        total_xp_at_levelup: data.totalXP,
        total_exercises_completed: data.totalExercises,
        days_to_complete: data.daysToComplete,
        timestamp: Date.now()
      });

      console.log("📊 Level Up trackeado:", data.fromLevel, "→", data.toLevel);
    } catch (error) {
      console.log("📊 Analytics error (no crítico):", error);
    }
  }

  // 🤖 EVENTOS DE IA
  static logAIUsage(data: {
    aiProvider: 'gemini' | 'emergency';
    exerciseType: string;
    level: string;
    success: boolean;
    responseTime?: number;
    errorType?: string;
  }) {
    try {
      if (!analytics) return;

      logEvent(analytics, 'ai_exercise_generated', {
        ai_provider: data.aiProvider,
        exercise_type: data.exerciseType,
        user_level: data.level,
        generation_success: data.success,
        response_time_ms: data.responseTime || 0,
        error_type: data.errorType || 'none',
        timestamp: Date.now()
      });

      console.log("📊 IA trackeada:", data.aiProvider, data.success ? "✅" : "❌");
    } catch (error) {
      console.log("📊 Analytics error (no crítico):", error);
    }
  }

  // 📱 EVENTOS DE DISPOSITIVO
  static logDeviceInfo() {
    try {
      if (!analytics) return;

      const deviceInfo = {
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        user_agent: navigator.userAgent,
        language: navigator.language,
        is_mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        timestamp: Date.now()
      };

      logEvent(analytics, 'device_info', deviceInfo);

      console.log("📊 Device info trackeado:", deviceInfo.is_mobile ? "📱 Mobile" : "💻 Desktop");
    } catch (error) {
      console.log("📊 Analytics error (no crítico):", error);
    }
  }

  // 🎯 EVENTOS PERSONALIZADOS
  static logCustomEvent(eventName: string, parameters: Record<string, any>) {
    try {
      if (!analytics) return;

      logEvent(analytics, eventName, {
        ...parameters,
        timestamp: Date.now()
      });

      console.log("📊 Evento personalizado:", eventName, parameters);
    } catch (error) {
      console.log("📊 Analytics error (no crítico):", error);
    }
  }

  // ⚡ EVENTOS DE PERFORMANCE
  static logPerformance(data: {
    action: string;
    duration: number;
    success: boolean;
    details?: string;
  }) {
    try {
      if (!analytics) return;

      logEvent(analytics, 'performance_metric', {
        action: data.action,
        duration_ms: data.duration,
        success: data.success,
        details: data.details || '',
        timestamp: Date.now()
      });

      console.log("📊 Performance trackeado:", data.action, data.duration + "ms");
    } catch (error) {
      console.log("📊 Analytics error (no crítico):", error);
    }
  }
}

// 🎯 HELPER PARA DETECTAR DISPOSITIVO
export const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  if (/Android/i.test(userAgent)) return 'android';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Windows/i.test(userAgent)) return 'windows';
  if (/Mac/i.test(userAgent)) return 'mac';
  if (/Linux/i.test(userAgent)) return 'linux';
  return 'unknown';
};