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
      minCorrectAnswers: 12,      // 🚀 ULTRA RÁPIDO: 2 sesiones buenas
      minSessions: 2,             // 🚀 SOLO 2 SESIONES  
      minAccuracy: 0.60,          // 🚀 MÁS PERMISIVO
      xpRequired: 120,            // 🚀 SÚPER BAJO
      description: "Inglés básico supervivencia",
      skillsUnlocked: ['basic_vocabulary', 'present_simple']
    },
    'A2': {
      minCorrectAnswers: 24,      // 🚀 ULTRA RÁPIDO: 3-4 sesiones
      minSessions: 3,             
      minAccuracy: 0.65,          
      xpRequired: 240,            
      description: "Conversaciones básicas",
      skillsUnlocked: ['present_perfect', 'past_simple', 'basic_conversation']
    },
    'B1': {
      minCorrectAnswers: 40,      // 🚀 ULTRA RÁPIDO: 5-6 sesiones
      minSessions: 5,            
      minAccuracy: 0.70,          
      xpRequired: 400,           
      description: "Inglés intermedio funcional",
      skillsUnlocked: ['conditionals', 'passive_voice', 'advanced_grammar']
    },
    'B2': {
      minCorrectAnswers: 60,      // 🚀 ULTRA RÁPIDO: 7-8 sesiones
      minSessions: 7,            
      minAccuracy: 0.75,          
      xpRequired: 600,           
      description: "Inglés avanzado y fluido",
      skillsUnlocked: ['advanced_vocabulary', 'native_patterns', 'business_english']
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
    
    // ✅ VERIFICAR que realmente puede subir
    if (currentIndex === -1 || currentIndex >= levels.length - 1) {
      console.warn("❌ No se puede subir más de nivel");
      return progress;
    }
    
    const newLevel = levels[currentIndex + 1] as 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
    const requirements = this.LEVEL_REQUIREMENTS[newLevel as keyof typeof this.LEVEL_REQUIREMENTS];
    
    console.log(`🎉 LEVEL UP REAL: ${progress.currentLevel} → ${newLevel}`);
    
    const leveledUpProgress = {
      ...progress,
      currentLevel: newLevel,
      progressToNext: 0, // ✅ RESETEAR PARA NUEVO NIVEL
      unlockedSkills: [...progress.unlockedSkills, ...(requirements?.skillsUnlocked || [])],
      totalXP: progress.totalXP + 100, // ✅ BONUS XP por subir de nivel
      lastActive: new Date()
    };
    
    // ✅ GUARDAR INMEDIATAMENTE
    this.saveUserProgress(leveledUpProgress);
    
    // 🚨 LIMPIAR TODO EL SISTEMA ANTI-REPETICIÓN AL SUBIR DE NIVEL
    console.log("🧹 LIMPIANDO SISTEMA ANTI-REPETICIÓN PARA NIVEL:", newLevel);
    
    // Limpiar hashes de contenido del nivel anterior Y nuevo
    localStorage.removeItem(`content_hashes_${progress.currentLevel}`);
    localStorage.removeItem(`content_hashes_${newLevel}`);
    
    // Limpiar sesiones usadas del nivel anterior Y nuevo
    localStorage.removeItem(`used_sessions_${progress.currentLevel}`);
    localStorage.removeItem(`used_sessions_${newLevel}`);
    
    // Limpiar hashes de ejercicios individuales
    localStorage.removeItem(`all_exercise_hashes_${progress.currentLevel}`);
    localStorage.removeItem(`all_exercise_hashes_${newLevel}`);
    
    // Limpiar progreso anterior
    const oldProgressKey = `level_progress_${progress.currentLevel}`;
    localStorage.removeItem(oldProgressKey);
    
    console.log("✅ LEVEL UP COMPLETADO - SISTEMA ANTI-REPETICIÓN LIMPIADO");
    return leveledUpProgress;
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
    
    // ✅ DEBUGGING DETALLADO - ANTES
    console.log("🔍 DEBUG UPDATEPROGRESS - ANTES:", {
      currentLevel: progress.currentLevel,
      totalCorrectBefore: progress.totalCorrectAnswers,
      totalExercisesBefore: progress.totalExercises,
      totalXPBefore: progress.totalXP,
      accuracyBefore: progress.overallAccuracy,
      sessionResults: sessionResults
    });
    
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
    
    // ✅ VERIFICAR SI DEBE SUBIR DE NIVEL AUTOMÁTICAMENTE
    const progressCheck = this.calculateRealProgress(updatedProgress);
    
    if (progressCheck.canLevelUp) {
      console.log("🚀 LEVEL UP AUTOMÁTICO DETECTADO");
      return this.levelUp(updatedProgress); // ✅ SUBIR REALMENTE
    }
    
    // ✅ SI NO SUBE, SOLO ACTUALIZAR PROGRESO NORMAL
    updatedProgress.progressToNext = progressCheck.progressPercentage;
    
    // ✅ DEBUGGING DETALLADO - DESPUÉS
    console.log("✅ DEBUG UPDATEPROGRESS - DESPUÉS:", {
      currentLevel: updatedProgress.currentLevel,
      totalCorrectAfter: updatedProgress.totalCorrectAnswers,
      totalExercisesAfter: updatedProgress.totalExercises,
      totalXPAfter: updatedProgress.totalXP,
      accuracyAfter: updatedProgress.overallAccuracy,
      progressToNext: updatedProgress.progressToNext,
      canLevelUp: progressCheck.canLevelUp
    });
    
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

  // 🚨 FUNCIÓN PARA LIMPIAR TODO EL SISTEMA ANTI-REPETICIÓN
  static forceCleanAllRepetition(userId: string): void {
    console.log("🧹 LIMPIEZA FORZADA DE TODO EL SISTEMA ANTI-REPETICIÓN");
    
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    levels.forEach(level => {
      // Limpiar hashes de contenido
      localStorage.removeItem(`content_hashes_${level}`);
      console.log(`✅ Limpiado content_hashes_${level}`);
      
      // Limpiar sesiones usadas
      localStorage.removeItem(`used_sessions_${level}`);
      console.log(`✅ Limpiado used_sessions_${level}`);
      
      // Limpiar hashes de ejercicios individuales
      localStorage.removeItem(`all_exercise_hashes_${level}`);
      console.log(`✅ Limpiado all_exercise_hashes_${level}`);
    });
    
    console.log("🎉 LIMPIEZA COMPLETA - TODAS LAS PREGUNTAS SERÁN NUEVAS");
  }

  // ✅ FUNCIÓN PARA FORZAR LEVEL UP DEFINITIVO
  static debugUnblockUser(userId: string): RealUserProgress {
    const progress = this.loadUserProgress(userId);
    
    console.log("🆘 FORZANDO LEVEL UP DEFINITIVO");
    console.log("Estado actual:", progress);
    
    // FORZAR level up inmediatamente sin condiciones
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const currentIndex = levels.indexOf(progress.currentLevel);
    const newLevel = levels[Math.min(currentIndex + 1, levels.length - 1)] as 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
    
    const forcedProgress = {
      ...progress,
      currentLevel: newLevel,
      progressToNext: 0, // Resetear para nuevo nivel
      totalXP: progress.totalXP + 200, // Bonus XP por desbloqueo
      unlockedSkills: [...progress.unlockedSkills, 'level_up_forced'],
      // Asegurar que cumple requisitos mínimos del nuevo nivel
      totalCorrectAnswers: Math.max(progress.totalCorrectAnswers, 35),
      overallAccuracy: Math.max(progress.overallAccuracy, 0.72),
      sessionsA1: currentIndex === 0 ? Math.max(progress.sessionsA1, 6) : progress.sessionsA1,
      sessionsA2: currentIndex === 1 ? Math.max(progress.sessionsA2, 11) : progress.sessionsA2
    };
    
    // Guardar inmediatamente
    this.saveUserProgress(forcedProgress);
    
    console.log(`🎉 LEVEL UP FORZADO EXITOSO: ${progress.currentLevel} → ${newLevel}`);
    console.log("Nuevo progreso:", forcedProgress);
    
    return forcedProgress;
  }
}