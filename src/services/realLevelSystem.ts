// AGREGAR estas importaciones al inicio del archivo:
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface RealUserProgress {
  userId: string;
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  
  // Progreso acumulativo (solo sube, nunca baja)
  totalCorrectAnswers: number;
  totalExercises: number;
  overallAccuracy: number;
  
  // XP acumulativo
  totalXP: number;
  
  // Sesiones completadas por nivel
  sessionsA1: number;
  sessionsA2: number; 
  sessionsB1: number;
  sessionsB2: number;
  
  // Habilidades desbloqueadas por nivel
  unlockedSkills: string[];
  
  // Progreso hacia siguiente nivel (0-100%)
  progressToNext: number;
  
  // Fecha de última actividad
  lastActive: Date;
  
  // Racha de días consecutivos
  streak: number;
}

export class RealLevelSystem {
  
  // REQUISITOS INTELIGENTES Y REALISTAS
  private static LEVEL_REQUIREMENTS = {
    'A1': {
      minCorrectAnswers: 40,      // 5 sesiones perfectas
      minSessions: 8,             // 8 sesiones mínimo
      minAccuracy: 0.75,          // 75% precisión
      xpRequired: 500,
      description: "Palabras básicas, presente simple, verbo to be",
      skillsUnlocked: ['basic_vocabulary', 'present_simple', 'verb_to_be']
    },
    'A2': {
      minCorrectAnswers: 100,     // Más exigente
      minSessions: 15,
      minAccuracy: 0.80,          // 80% precisión
      xpRequired: 1200,
      description: "Present perfect, pasado simple, preposiciones",
      skillsUnlocked: ['present_perfect', 'past_simple', 'prepositions', 'basic_conversation']
    },
    'B1': {
      minCorrectAnswers: 200,
      minSessions: 25,
      minAccuracy: 0.85,          // 85% precisión
      xpRequired: 2500,
      description: "Condicionales, voz pasiva, gramática avanzada",
      skillsUnlocked: ['conditionals', 'passive_voice', 'advanced_grammar', 'fluent_conversation']
    },
    'B2': {
      minCorrectAnswers: 350,
      minSessions: 40,
      minAccuracy: 0.90,          // 90% precisión para nivel alto
      xpRequired: 4000,
      description: "Vocabulario avanzado, expresiones nativas, fluidez",
      skillsUnlocked: ['advanced_vocabulary', 'nuanced_expressions', 'native_patterns', 'business_english']
    }
  };
  
  // CALCULAR PROGRESO REAL (solo sube, nunca baja)
  static calculateRealProgress(progress: RealUserProgress): {
    canLevelUp: boolean;
    progressPercentage: number;
    nextLevel: string;
    requirements: {
      correctAnswers: { current: number; needed: number; completed: boolean };
      sessions: { current: number; needed: number; completed: boolean };
      accuracy: { current: number; needed: number; completed: boolean };
      xp: { current: number; needed: number; completed: boolean };
    };
    motivationalMessage: string;
  } {
    
    // ✅ AÑADIR DEBUGGING DETALLADO AL INICIO
    console.log("🔍 DEBUGGING PROGRESO DETALLADO:", {
      userId: progress.userId,
      currentLevel: progress.currentLevel,
      actual: {
        correctAnswers: progress.totalCorrectAnswers,
        totalExercises: progress.totalExercises,
        accuracy: progress.overallAccuracy,
        totalXP: progress.totalXP,
        sessions: progress.sessionsA1 + progress.sessionsA2 + progress.sessionsB1 + progress.sessionsB2
      }
    });
    
    const currentLevelReqs = this.LEVEL_REQUIREMENTS[progress.currentLevel as keyof typeof this.LEVEL_REQUIREMENTS];
    
    // Log de requisitos actuales
    if (currentLevelReqs) {
      console.log("📋 REQUISITOS PARA SUBIR DE NIVEL:", {
        level: progress.currentLevel,
        requirements: currentLevelReqs
      });
    }
    if (!currentLevelReqs) {
      return {
        canLevelUp: true,
        progressPercentage: 100,
        nextLevel: 'C1',
        requirements: {
          correctAnswers: { current: 999, needed: 999, completed: true },
          sessions: { current: 999, needed: 999, completed: true },
          accuracy: { current: 1, needed: 1, completed: true },
          xp: { current: 9999, needed: 9999, completed: true }
        },
        motivationalMessage: "🏆 ¡Eres un experto! Has completado todos los niveles disponibles."
      };
    }
    
    // Evaluar cada requisito
    const correctAnswersReq = {
      current: progress.totalCorrectAnswers,
      needed: currentLevelReqs.minCorrectAnswers,
      completed: progress.totalCorrectAnswers >= currentLevelReqs.minCorrectAnswers
    };
    
    const sessionsReq = {
      current: progress.sessionsA1 + progress.sessionsA2 + progress.sessionsB1 + progress.sessionsB2,
      needed: currentLevelReqs.minSessions,
      completed: (progress.sessionsA1 + progress.sessionsA2 + progress.sessionsB1 + progress.sessionsB2) >= currentLevelReqs.minSessions
    };
    
    const accuracyReq = {
      current: progress.overallAccuracy,
      needed: currentLevelReqs.minAccuracy,
      completed: progress.overallAccuracy >= currentLevelReqs.minAccuracy
    };
    
    const xpReq = {
      current: progress.totalXP,
      needed: currentLevelReqs.xpRequired,
      completed: progress.totalXP >= currentLevelReqs.xpRequired
    };
    
    // Verificar si puede subir de nivel
    const canLevelUp = correctAnswersReq.completed && sessionsReq.completed && 
                      accuracyReq.completed && xpReq.completed;
    
    // Calcular progreso general (promedio de todos los requisitos)
    const progressFactors = [
      Math.min(correctAnswersReq.current / correctAnswersReq.needed, 1),
      Math.min(sessionsReq.current / sessionsReq.needed, 1),
      Math.min(accuracyReq.current / accuracyReq.needed, 1),
      Math.min(xpReq.current / xpReq.needed, 1)
    ];
    
    const averageProgress = progressFactors.reduce((sum, p) => sum + p, 0) / progressFactors.length;
    const progressPercentage = Math.round(averageProgress * 100);
    
    // Siguiente nivel
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const currentIndex = levels.indexOf(progress.currentLevel);
    const nextLevel = levels[currentIndex + 1] || 'C1';
    
    // Mensaje motivacional
    let motivationalMessage = "";
    if (canLevelUp) {
      motivationalMessage = `🎉 ¡LISTO PARA ${nextLevel}! Completa una sesión más para subir de nivel oficialmente.`;
    } else if (progressPercentage >= 90) {
      motivationalMessage = "🔥 ¡Súper cerca! Solo un poquito más y subirás de nivel.";
    } else if (progressPercentage >= 75) {
      motivationalMessage = "💪 ¡Excelente progreso! Estás en el camino correcto.";
    } else if (progressPercentage >= 50) {
      motivationalMessage = "🌟 ¡Vas muy bien! Sigue practicando consistentemente.";
    } else {
      motivationalMessage = "🚀 ¡Cada ejercicio te acerca más a tu objetivo!";
    }
    
    // ✅ AÑADIR LOG FINAL ANTES DEL RETURN
    console.log("📊 RESULTADO FINAL PROGRESO:", {
      canLevelUp,
      progressPercentage,
      nextLevel,
      blockedBy: {
        correctAnswers: !correctAnswersReq.completed ? `${correctAnswersReq.current}/${correctAnswersReq.needed}` : '✅',
        sessions: !sessionsReq.completed ? `${sessionsReq.current}/${sessionsReq.needed}` : '✅',
        accuracy: !accuracyReq.completed ? `${(accuracyReq.current * 100).toFixed(1)}%/${(accuracyReq.needed * 100).toFixed(1)}%` : '✅',
        xp: !xpReq.completed ? `${xpReq.current}/${xpReq.needed}` : '✅'
      },
      meets: {
        correctAnswers: correctAnswersReq.completed,
        sessions: sessionsReq.completed,
        accuracy: accuracyReq.completed,
        xp: xpReq.completed
      }
    });

    return {
      canLevelUp,
      progressPercentage,
      nextLevel,
      requirements: {
        correctAnswers: correctAnswersReq,
        sessions: sessionsReq,
        accuracy: accuracyReq,
        xp: xpReq
      },
      motivationalMessage
    };
  }
  
  // SUBIR DE NIVEL OFICIALMENTE
  static levelUp(progress: RealUserProgress): RealUserProgress {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const currentIndex = levels.indexOf(progress.currentLevel);
    const newLevel = levels[Math.min(currentIndex + 1, levels.length - 1)] as 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
    
    const requirements = this.LEVEL_REQUIREMENTS[newLevel as keyof typeof this.LEVEL_REQUIREMENTS];
    
    return {
      ...progress,
      currentLevel: newLevel,
      unlockedSkills: [...progress.unlockedSkills, ...(requirements?.skillsUnlocked || [])],
      progressToNext: 0 // Resetear progreso para el siguiente nivel
    };
  }
  
  // ACTUALIZAR PROGRESO DESPUÉS DE CADA SESIÓN
  static updateProgress(
    progress: RealUserProgress, 
    sessionResults: {
      correctAnswers: number;
      totalAnswers: number;
      xpEarned: number;
      level: string;
    }
  ): RealUserProgress {
    
    // Actualizar estadísticas acumulativas (SOLO SUBE)
    const newTotalCorrect = progress.totalCorrectAnswers + sessionResults.correctAnswers;
    const newTotalExercises = progress.totalExercises + sessionResults.totalAnswers;
    const newOverallAccuracy = newTotalCorrect / newTotalExercises;
    
    // Actualizar sesiones por nivel
    const levelSessionKey = `sessions${sessionResults.level}` as keyof RealUserProgress;
    const updatedProgress = {
      ...progress,
      totalCorrectAnswers: newTotalCorrect,
      totalExercises: newTotalExercises,
      overallAccuracy: newOverallAccuracy,
      totalXP: progress.totalXP + sessionResults.xpEarned,
      [levelSessionKey]: (progress[levelSessionKey] as number) + 1,
      lastActive: new Date()
    };
    
    // Calcular nuevo progreso hacia siguiente nivel
    const progressCalculation = this.calculateRealProgress(updatedProgress);
    updatedProgress.progressToNext = progressCalculation.progressPercentage;
    
    return updatedProgress;
  }
  
  // CARGAR PROGRESO DEL USUARIO
  static loadUserProgress(userId: string): RealUserProgress {
    console.log("📊 CARGANDO PROGRESO DEL USUARIO:", userId);
    
    // ✅ INTENTAR CARGAR DESDE FIREBASE PRIMERO
    this.loadFromFirebase(userId).then(firebaseProgress => {
      if (firebaseProgress) {
        console.log("☁️ PROGRESO CARGADO DESDE FIREBASE");
        this.saveUserProgress(firebaseProgress); // Sincronizar local
      }
    }).catch(error => {
      console.warn("⚠️ Firebase no disponible, usando datos locales");
    });
    
    // Cargar desde localStorage mientras tanto
    const saved = localStorage.getItem(`real_progress_${userId}`);
    
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        lastActive: new Date(parsed.lastActive)
      };
    }
    
    // Progreso inicial para usuario nuevo
    const newProgress = {
      userId,
      currentLevel: 'A1' as const,
      totalCorrectAnswers: 0,
      totalExercises: 0,
      overallAccuracy: 0,
      totalXP: 0,
      sessionsA1: 0,
      sessionsA2: 0,
      sessionsB1: 0,
      sessionsB2: 0,
      unlockedSkills: ['basic_vocabulary'],
      progressToNext: 0,
      lastActive: new Date(),
      streak: 1
    };
    
    // Guardar inicial en ambos lados
    this.saveUserProgress(newProgress);
    return newProgress;
  }
  
  // GUARDAR PROGRESO
  static saveUserProgress(progress: RealUserProgress): void {
    console.log("💾 GUARDANDO PROGRESO:", progress.userId);
    
    // ✅ GUARDAR LOCAL
    localStorage.setItem(`real_progress_${progress.userId}`, JSON.stringify(progress));
    
    // ✅ GUARDAR EN FIREBASE (con retry)
    this.saveToFirebase(progress).catch(error => {
      console.warn("⚠️ Error guardando en Firebase, datos guardados localmente");
    });
  }

  // AGREGAR estas funciones nuevas:
  private static async loadFromFirebase(userId: string): Promise<RealUserProgress | null> {
    try {
      const docRef = doc(db, 'user_real_progress', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          lastActive: data.lastActive?.toDate() || new Date()
        } as RealUserProgress;
      }
      
      return null;
    } catch (error) {
      console.warn("⚠️ Error cargando desde Firebase:", error);
      return null;
    }
  }

  private static async saveToFirebase(progress: RealUserProgress): Promise<void> {
    try {
      const docRef = doc(db, 'user_real_progress', progress.userId);
      await setDoc(docRef, {
        ...progress,
        lastUpdated: new Date()
      }, { merge: true });
      
      console.log("☁️ Progreso sincronizado con Firebase");
    } catch (error) {
      console.warn("⚠️ Error guardando en Firebase:", error);
      throw error;
    }
  }

  // ✅ FUNCIÓN TEMPORAL PARA DESBLOQUEAR USUARIO
  static debugUnblockUser(userId: string): RealUserProgress {
    const progress = this.loadUserProgress(userId);
    
    console.log("🚨 DESBLOQUEANDO USUARIO - SITUACIÓN DE EMERGENCIA");
    console.log("Estado actual:", progress);
    
    // Si está muy cerca del level up, forzarlo
    const progressCheck = this.calculateRealProgress(progress);
    if (progressCheck.progressPercentage >= 95 && !progressCheck.canLevelUp) {
      console.log("🆘 FORZANDO LEVEL UP - Usuario bloqueado al 95%+");
      
      // Ajustar ligeramente los valores para permitir level up
      const adjustedProgress = {
        ...progress,
        totalCorrectAnswers: Math.max(progress.totalCorrectAnswers, 50),
        overallAccuracy: Math.max(progress.overallAccuracy, 0.80),
        totalXP: Math.max(progress.totalXP, 600),
        sessionsA1: Math.max(progress.sessionsA1, 10) // Asegurar sesiones suficientes
      };
      
      this.saveUserProgress(adjustedProgress);
      console.log("✅ Usuario desbloqueado con valores ajustados:", adjustedProgress);
      return adjustedProgress;
    }
    
    return progress;
  }
}