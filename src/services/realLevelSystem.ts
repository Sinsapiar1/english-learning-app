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
  
  // REQUISITOS REALISTAS Y ALCANZABLES
  private static LEVEL_REQUIREMENTS = {
    'A1': {
      minCorrectAnswers: 50,      // 50 respuestas correctas
      minSessions: 6,             // 6 sesiones (48 ejercicios)
      minAccuracy: 0.6,           // 60% precisión
      xpRequired: 400,
      skillsUnlocked: ['basic_vocabulary', 'present_simple', 'verb_to_be']
    },
    'A2': {
      minCorrectAnswers: 120,     // 120 respuestas correctas total
      minSessions: 15,            // 15 sesiones (120 ejercicios)
      minAccuracy: 0.65,          // 65% precisión
      xpRequired: 1000,
      skillsUnlocked: ['present_perfect', 'past_simple', 'prepositions', 'basic_conversation']
    },
    'B1': {
      minCorrectAnswers: 250,     // 250 respuestas correctas total
      minSessions: 30,            // 30 sesiones (240 ejercicios)
      minAccuracy: 0.70,          // 70% precisión
      xpRequired: 2200,
      skillsUnlocked: ['conditionals', 'passive_voice', 'advanced_grammar', 'fluent_conversation']
    },
    'B2': {
      minCorrectAnswers: 500,     // 500 respuestas correctas total
      minSessions: 60,            // 60 sesiones (480 ejercicios) 
      minAccuracy: 0.75,          // 75% precisión
      xpRequired: 4500,
      skillsUnlocked: ['advanced_vocabulary', 'nuanced_expressions', 'native_patterns']
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
    
    const currentLevelReqs = this.LEVEL_REQUIREMENTS[progress.currentLevel as keyof typeof this.LEVEL_REQUIREMENTS];
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
    const saved = localStorage.getItem(`real_progress_${userId}`);
    
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        lastActive: new Date(parsed.lastActive)
      };
    }
    
    // Progreso inicial para usuario nuevo
    return {
      userId,
      currentLevel: 'A1',
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
  }
  
  // GUARDAR PROGRESO
  static saveUserProgress(progress: RealUserProgress): void {
    localStorage.setItem(`real_progress_${progress.userId}`, JSON.stringify(progress));
  }
}