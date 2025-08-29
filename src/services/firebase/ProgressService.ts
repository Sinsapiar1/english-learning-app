/**
 * FIREBASE PROGRESS SERVICE - SISTEMA COMPLETO
 * English Master App - Gestión de Progreso del Usuario
 */

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  runTransaction,
  Timestamp 
} from 'firebase/firestore';

import { 
  UserProgress, 
  LevelStats, 
  SessionResults, 
  DailyProgress, 
  ExerciseStats,
  Level,
  LevelRequirements,
  ProgressCalculation 
} from '../../types/progress';

export class ProgressService {
  private db = getFirestore();

  // REQUIREMENTS POR NIVEL - ALCANZABLES PERO DESAFIANTES
  private static LEVEL_REQUIREMENTS: Record<Level, LevelRequirements> = {
    A1: {
      minExercises: 40,
      minAccuracy: 0.70,
      minSessions: 5,
      minTimeSpent: 60, // 1 hora
      skillsRequired: ['social_greetings', 'basic_needs', 'courtesy', 'personal_info'],
      description: 'Supervivencia básica en inglés'
    },
    A2: {
      minExercises: 80,
      minAccuracy: 0.75,
      minSessions: 10,
      minTimeSpent: 120, // 2 horas
      skillsRequired: ['daily_routines', 'past_experiences', 'future_plans', 'preferences'],
      description: 'Comunicación cotidiana'
    },
    B1: {
      minExercises: 120,
      minAccuracy: 0.80,
      minSessions: 15,
      minTimeSpent: 180, // 3 horas
      skillsRequired: ['work_situations', 'problem_solving', 'opinions', 'hypotheticals'],
      description: 'Independencia comunicativa'
    },
    B2: {
      minExercises: 160,
      minAccuracy: 0.85,
      minSessions: 20,
      minTimeSpent: 240, // 4 horas
      skillsRequired: ['professional_communication', 'analysis', 'complex_grammar', 'nuanced_vocabulary'],
      description: 'Fluidez profesional'
    }
  };

  /**
   * INICIALIZAR PROGRESO DE NUEVO USUARIO
   */
  async initializeUserProgress(userId: string, email: string, apiKey: string): Promise<UserProgress> {
    const initialProgress: UserProgress = {
      userId,
      email,
      currentLevel: 'A1',
      totalExercises: 0,
      totalCorrectAnswers: 0,
      overallAccuracy: 0,
      totalXP: 0,
      totalTimeSpent: 0,
      currentStreak: 0,
      longestStreak: 0,
      
      levelProgress: {
        A1: this.createInitialLevelStats(true),
        A2: this.createInitialLevelStats(false),
        B1: this.createInitialLevelStats(false),
        B2: this.createInitialLevelStats(false)
      },
      
      apiKey: this.encryptAPIKey(apiKey),
      preferences: {
        dailyGoal: 20,
        soundEnabled: true,
        animationsEnabled: true,
        explanationLanguage: 'es',
        difficultyPreference: 'adaptive'
      },
      
      unlockedAchievements: [],
      createdAt: new Date(),
      lastActive: new Date()
    };

    await setDoc(doc(this.db, 'userProgress', userId), {
      ...initialProgress,
      createdAt: Timestamp.fromDate(initialProgress.createdAt),
      lastActive: Timestamp.fromDate(initialProgress.lastActive)
    });

    return initialProgress;
  }

  /**
   * ACTUALIZAR PROGRESO DESPUÉS DE SESIÓN - SOLO PROGRESO POSITIVO
   */
  async updateProgress(userId: string, sessionResults: SessionResults): Promise<UserProgress> {
    return await runTransaction(this.db, async (transaction) => {
      const progressRef = doc(this.db, 'userProgress', userId);
      const progressDoc = await transaction.get(progressRef);
      
      if (!progressDoc.exists()) {
        throw new Error('User progress not found');
      }

      const currentProgress = this.convertFirestoreToProgress(progressDoc.data());
      
      // 1. ACTUALIZAR ESTADÍSTICAS GLOBALES
      const globalTotalExercises = currentProgress.totalExercises + sessionResults.totalAnswers;
      const globalTotalCorrect = currentProgress.totalCorrectAnswers + sessionResults.correctAnswers;
      const newOverallAccuracy = globalTotalCorrect / globalTotalExercises;
      
      // 2. ACTUALIZAR PROGRESO DEL NIVEL ACTUAL - SOLO POSITIVO
      const currentLevel = currentProgress.currentLevel;
      const levelStats = currentProgress.levelProgress[currentLevel];
      
      // Calcular nueva precisión, pero nunca menor a la actual
      const levelTotalExercises = levelStats.exercisesCompleted + sessionResults.totalAnswers;
      const levelTotalCorrect = levelStats.correctAnswers + sessionResults.correctAnswers;
      const newAccuracy = levelTotalCorrect / levelTotalExercises;
      
      // 🚀 REGLA CRÍTICA: La precisión nunca baja, solo sube o se mantiene
      const finalAccuracy = Math.max(levelStats.accuracy, newAccuracy);
      
      const updatedLevelStats: LevelStats = {
        ...levelStats,
        exercisesCompleted: levelTotalExercises,
        correctAnswers: levelTotalCorrect,
        accuracy: finalAccuracy, // 🚀 NUNCA RETROCEDE
        xpEarned: levelStats.xpEarned + sessionResults.xpEarned,
        timeSpent: levelStats.timeSpent + sessionResults.timeSpent,
        sessionsCompleted: levelStats.sessionsCompleted + 1,
        lastSession: new Date(),
        averageTime: Math.min( // Mejorar tiempo promedio
          levelStats.averageTime || 60,
          (levelStats.averageTime * levelStats.exercisesCompleted + 
           sessionResults.timeSpent * 60 / sessionResults.totalAnswers) / 
          levelTotalExercises
        ),
        weakAreas: this.updateWeakAreas(levelStats.weakAreas, sessionResults.weakAreasIdentified),
        strongAreas: this.updateStrongAreas(levelStats.strongAreas, sessionResults.skillsFocused, sessionResults.accuracy)
      };

      console.log(`📊 PROGRESO ACTUALIZADO:`, {
        level: currentLevel,
        oldAccuracy: levelStats.accuracy,
        newAccuracy: newAccuracy,
        finalAccuracy: finalAccuracy,
        exercisesCompleted: updatedLevelStats.exercisesCompleted,
        onlyPositiveProgress: finalAccuracy >= levelStats.accuracy
      });

      // 3. VERIFICAR LEVEL UP
      const progressCalc = this.calculateProgress(currentLevel, updatedLevelStats);
      let newLevel = currentLevel;
      let updatedLevelProgress = { ...currentProgress.levelProgress };
      
      if (progressCalc.canLevelUp && currentLevel !== 'B2') {
        newLevel = this.getNextLevel(currentLevel);
        updatedLevelStats.isCompleted = true;
        updatedLevelStats.completedAt = new Date();
        
        // Desbloquear siguiente nivel
        updatedLevelProgress[newLevel].isUnlocked = true;
        
        console.log(`🎉 LEVEL UP: ${currentLevel} → ${newLevel}`);
      }
      
      updatedLevelProgress[currentLevel] = updatedLevelStats;

      // 4. CALCULAR STREAK
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const lastActiveDate = currentProgress.lastActive.toISOString().split('T')[0];
      
      let newStreak = currentProgress.currentStreak;
      if (lastActiveDate === yesterday) {
        newStreak += 1;
      } else if (lastActiveDate !== today) {
        newStreak = 1;
      }

      // 5. PROGRESO ACTUALIZADO
      const updatedProgress: UserProgress = {
        ...currentProgress,
        currentLevel: newLevel,
        totalExercises: globalTotalExercises,
        totalCorrectAnswers: globalTotalCorrect,
        overallAccuracy: newOverallAccuracy,
        totalXP: currentProgress.totalXP + sessionResults.xpEarned,
        totalTimeSpent: currentProgress.totalTimeSpent + sessionResults.timeSpent,
        currentStreak: newStreak,
        longestStreak: Math.max(currentProgress.longestStreak, newStreak),
        levelProgress: updatedLevelProgress,
        lastActive: new Date(),
        ...(progressCalc.canLevelUp && { lastLevelUp: new Date() })
      };

      // 6. GUARDAR EN FIREBASE
      transaction.update(progressRef, {
        ...updatedProgress,
        lastActive: Timestamp.fromDate(updatedProgress.lastActive),
        ...(updatedProgress.lastLevelUp && { 
          lastLevelUp: Timestamp.fromDate(updatedProgress.lastLevelUp) 
        }),
        'levelProgress.A1.lastSession': updatedProgress.levelProgress.A1.lastSession ? 
          Timestamp.fromDate(updatedProgress.levelProgress.A1.lastSession) : null,
        'levelProgress.A2.lastSession': updatedProgress.levelProgress.A2.lastSession ? 
          Timestamp.fromDate(updatedProgress.levelProgress.A2.lastSession) : null,
        'levelProgress.B1.lastSession': updatedProgress.levelProgress.B1.lastSession ? 
          Timestamp.fromDate(updatedProgress.levelProgress.B1.lastSession) : null,
        'levelProgress.B2.lastSession': updatedProgress.levelProgress.B2.lastSession ? 
          Timestamp.fromDate(updatedProgress.levelProgress.B2.lastSession) : null,
      });

      // 7. GUARDAR PROGRESO DIARIO
      await this.saveDailyProgress(userId, sessionResults, updatedProgress);

      return updatedProgress;
    });
  }

  /**
   * OBTENER PROGRESO DEL USUARIO
   */
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    const progressDoc = await getDoc(doc(this.db, 'userProgress', userId));
    
    if (!progressDoc.exists()) {
      return null;
    }

    return this.convertFirestoreToProgress(progressDoc.data());
  }

  /**
   * CALCULAR PROGRESO HACIA SIGUIENTE NIVEL
   */
  calculateProgress(level: Level, stats: LevelStats): ProgressCalculation {
    const requirements = ProgressService.LEVEL_REQUIREMENTS[level];
    
    const exerciseProgress = Math.min(1, stats.exercisesCompleted / requirements.minExercises);
    const accuracyProgress = Math.min(1, stats.accuracy / requirements.minAccuracy);
    const sessionProgress = Math.min(1, stats.sessionsCompleted / requirements.minSessions);
    const timeProgress = Math.min(1, stats.timeSpent / requirements.minTimeSpent);
    
    // Progreso general (promedio ponderado)
    const progressPercentage = Math.round(
      (exerciseProgress * 0.4 + accuracyProgress * 0.3 + sessionProgress * 0.2 + timeProgress * 0.1) * 100
    );
    
    // Verificar si puede subir de nivel
    const canLevelUp = 
      stats.exercisesCompleted >= requirements.minExercises &&
      stats.accuracy >= requirements.minAccuracy &&
      stats.sessionsCompleted >= requirements.minSessions &&
      stats.timeSpent >= requirements.minTimeSpent;

    // Identificar qué lo bloquea
    const blockedBy: string[] = [];
    if (stats.exercisesCompleted < requirements.minExercises) {
      blockedBy.push(`Ejercicios: ${stats.exercisesCompleted}/${requirements.minExercises}`);
    }
    if (stats.accuracy < requirements.minAccuracy) {
      blockedBy.push(`Precisión: ${Math.round(stats.accuracy * 100)}%/${Math.round(requirements.minAccuracy * 100)}%`);
    }
    if (stats.sessionsCompleted < requirements.minSessions) {
      blockedBy.push(`Sesiones: ${stats.sessionsCompleted}/${requirements.minSessions}`);
    }
    if (stats.timeSpent < requirements.minTimeSpent) {
      blockedBy.push(`Tiempo: ${stats.timeSpent}/${requirements.minTimeSpent} min`);
    }

    return {
      canLevelUp,
      progressPercentage,
      nextLevel: this.getNextLevel(level),
      requirements,
      currentStats: stats,
      blockedBy,
      estimatedTimeToLevelUp: this.calculateEstimatedTime(stats, requirements)
    };
  }

  /**
   * GUARDAR PROGRESO DIARIO
   */
  private async saveDailyProgress(userId: string, sessionResults: SessionResults, userProgress: UserProgress): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const dailyRef = doc(this.db, 'dailyProgress', `${userId}_${today}`);
    
    const dailyDoc = await getDoc(dailyRef);
    
    const dailyProgress: DailyProgress = {
      userId,
      date: today,
      exercisesCompleted: (dailyDoc.exists() ? dailyDoc.data().exercisesCompleted : 0) + sessionResults.totalAnswers,
      correctAnswers: (dailyDoc.exists() ? dailyDoc.data().correctAnswers : 0) + sessionResults.correctAnswers,
      accuracy: 0, // Se calculará después
      xpEarned: (dailyDoc.exists() ? dailyDoc.data().xpEarned : 0) + sessionResults.xpEarned,
      timeSpent: (dailyDoc.exists() ? dailyDoc.data().timeSpent : 0) + sessionResults.timeSpent,
      sessionsCompleted: (dailyDoc.exists() ? dailyDoc.data().sessionsCompleted : 0) + 1,
      goalMet: false, // Se calculará después
      streak: userProgress.currentStreak,
      level: userProgress.currentLevel
    };

    dailyProgress.accuracy = dailyProgress.correctAnswers / dailyProgress.exercisesCompleted;
    dailyProgress.goalMet = dailyProgress.exercisesCompleted >= userProgress.preferences.dailyGoal;

    await setDoc(dailyRef, dailyProgress, { merge: true });
  }

  /**
   * UTILIDADES PRIVADAS
   */
  private createInitialLevelStats(isUnlocked: boolean): LevelStats {
    return {
      exercisesCompleted: 0,
      correctAnswers: 0,
      accuracy: 0,
      xpEarned: 0,
      timeSpent: 0,
      sessionsCompleted: 0,
      isUnlocked,
      isCompleted: false,
      weakAreas: [],
      strongAreas: [],
      averageTime: 0
    };
  }

  private getNextLevel(currentLevel: Level): Level {
    const levels: Level[] = ['A1', 'A2', 'B1', 'B2'];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }

  private updateWeakAreas(current: string[], newWeak: string[]): string[] {
    const combined = [...current, ...newWeak];
    const counts = combined.reduce((acc, area) => {
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .filter(([_, count]) => count >= 2)
      .map(([area, _]) => area)
      .slice(0, 5); // Máximo 5 áreas débiles
  }

  private updateStrongAreas(current: string[], focused: string[], accuracy: number): string[] {
    if (accuracy >= 0.85) {
      const combined = [...current, ...focused];
      return Array.from(new Set(combined)).slice(0, 5);
    }
    return current;
  }

  private calculateEstimatedTime(stats: LevelStats, requirements: LevelRequirements): number {
    const exercisesNeeded = Math.max(0, requirements.minExercises - stats.exercisesCompleted);
    const averageTimePerExercise = stats.averageTime || 60; // 1 minuto default
    return exercisesNeeded * averageTimePerExercise / 60; // convertir a minutos
  }

  private encryptAPIKey(apiKey: string): string {
    return btoa(apiKey); // Base64 básico - usar crypto más robusto en producción
  }

  private decryptAPIKey(encryptedKey: string): string {
    return atob(encryptedKey);
  }

  private convertFirestoreToProgress(data: any): UserProgress {
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      lastActive: data.lastActive.toDate(),
      lastLevelUp: data.lastLevelUp?.toDate(),
      levelProgress: {
        A1: {
          ...data.levelProgress.A1,
          completedAt: data.levelProgress.A1.completedAt?.toDate(),
          lastSession: data.levelProgress.A1.lastSession?.toDate()
        },
        A2: {
          ...data.levelProgress.A2,
          completedAt: data.levelProgress.A2.completedAt?.toDate(),
          lastSession: data.levelProgress.A2.lastSession?.toDate()
        },
        B1: {
          ...data.levelProgress.B1,
          completedAt: data.levelProgress.B1.completedAt?.toDate(),
          lastSession: data.levelProgress.B1.lastSession?.toDate()
        },
        B2: {
          ...data.levelProgress.B2,
          completedAt: data.levelProgress.B2.completedAt?.toDate(),
          lastSession: data.levelProgress.B2.lastSession?.toDate()
        }
      }
    };
  }
}