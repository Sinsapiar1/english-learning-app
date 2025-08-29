/**
 * LEVEL DETECTOR - DETECCIÓN AUTOMÁTICA DE NIVEL REAL
 * English Master App - Detecta el nivel real del usuario
 */

import { Level, UserProgress } from '../../types/progress';

export class LevelDetector {
  
  /**
   * DETECTAR NIVEL REAL DEL USUARIO BASADO EN SU PROGRESO
   */
  static detectRealLevel(userProgress: UserProgress): Level {
    console.log('🔍 Detectando nivel real del usuario:', userProgress.userId);
    
    // Si el usuario tiene progreso significativo, mantener su nivel actual
    const currentLevelStats = userProgress.levelProgress[userProgress.currentLevel];
    
    // Si tiene más de 50 ejercicios en su nivel actual, probablemente es correcto
    if (currentLevelStats.exercisesCompleted > 50) {
      console.log(`✅ Nivel ${userProgress.currentLevel} confirmado por progreso (${currentLevelStats.exercisesCompleted} ejercicios)`);
      return userProgress.currentLevel;
    }

    // Analizar precisión general para detectar nivel
    const overallAccuracy = userProgress.overallAccuracy;
    const totalExercises = userProgress.totalExercises;
    
    // Si tiene alta precisión y muchos ejercicios, puede estar en un nivel bajo para su capacidad real
    if (overallAccuracy >= 0.95 && totalExercises >= 100) {
      console.log('🚀 Usuario con alta precisión detectado, puede necesitar nivel más alto');
      return this.suggestHigherLevel(userProgress.currentLevel);
    }
    
    // Si tiene baja precisión pero está en nivel alto, puede necesitar refuerzo
    if (overallAccuracy <= 0.60 && (userProgress.currentLevel === 'B2' || userProgress.currentLevel === 'C1')) {
      console.log('⚠️ Usuario con baja precisión en nivel alto, manteniendo nivel actual');
      return userProgress.currentLevel;
    }

    return userProgress.currentLevel;
  }

  /**
   * SUGERIR NIVEL MÁS ALTO SI EL USUARIO ES MUY BUENO
   */
  private static suggestHigherLevel(currentLevel: Level): Level {
    const levelProgression: Record<Level, Level> = {
      A1: 'A2',
      A2: 'B1', 
      B1: 'B2',
      B2: 'C1',
      C1: 'C1' // Ya está en el máximo
    };
    
    return levelProgression[currentLevel];
  }

  /**
   * FORZAR NIVEL ESPECÍFICO (PARA TESTING O CORRECCIÓN MANUAL)
   */
  static forceLevel(userProgress: UserProgress, newLevel: Level): UserProgress {
    console.log(`🔧 Forzando nivel: ${userProgress.currentLevel} → ${newLevel}`);
    
    const updatedProgress = {
      ...userProgress,
      currentLevel: newLevel
    };

    // Desbloquear todos los niveles hasta el nuevo nivel
    const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const newLevelIndex = levels.indexOf(newLevel);
    
    for (let i = 0; i <= newLevelIndex; i++) {
      const level = levels[i];
      updatedProgress.levelProgress[level].isUnlocked = true;
      
      // Marcar niveles anteriores como completados
      if (i < newLevelIndex) {
        updatedProgress.levelProgress[level].isCompleted = true;
      }
    }

    return updatedProgress;
  }

  /**
   * CREAR USUARIO C1 DESDE CERO
   */
  static createC1User(userId: string, email: string): Partial<UserProgress> {
    return {
      userId,
      email,
      currentLevel: 'C1',
      totalExercises: 500, // Usuario experimentado
      totalCorrectAnswers: 450, // Alta precisión histórica
      overallAccuracy: 0.90,
      totalXP: 5000,
      totalTimeSpent: 300,
      currentStreak: 10,
      longestStreak: 25,
      
      levelProgress: {
        A1: {
          exercisesCompleted: 100,
          correctAnswers: 95,
          accuracy: 0.95,
          xpEarned: 1000,
          timeSpent: 60,
          sessionsCompleted: 12,
          isUnlocked: true,
          isCompleted: true,
          completedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 días atrás
          weakAreas: [],
          strongAreas: ['social_greetings', 'basic_needs', 'courtesy'],
          averageTime: 30
        },
        A2: {
          exercisesCompleted: 120,
          correctAnswers: 108,
          accuracy: 0.90,
          xpEarned: 1200,
          timeSpent: 80,
          sessionsCompleted: 15,
          isUnlocked: true,
          isCompleted: true,
          completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 días atrás
          weakAreas: [],
          strongAreas: ['daily_routines', 'past_experiences'],
          averageTime: 35
        },
        B1: {
          exercisesCompleted: 140,
          correctAnswers: 119,
          accuracy: 0.85,
          xpEarned: 1400,
          timeSpent: 100,
          sessionsCompleted: 18,
          isUnlocked: true,
          isCompleted: true,
          completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
          weakAreas: [],
          strongAreas: ['work_situations', 'problem_solving'],
          averageTime: 40
        },
        B2: {
          exercisesCompleted: 140,
          correctAnswers: 126,
          accuracy: 0.90,
          xpEarned: 1400,
          timeSpent: 120,
          sessionsCompleted: 18,
          isUnlocked: true,
          isCompleted: true,
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
          weakAreas: [],
          strongAreas: ['professional_communication', 'analysis'],
          averageTime: 45
        },
        C1: {
          exercisesCompleted: 0,
          correctAnswers: 0,
          accuracy: 0,
          xpEarned: 0,
          timeSpent: 0,
          sessionsCompleted: 0,
          isUnlocked: true,
          isCompleted: false,
          weakAreas: [],
          strongAreas: [],
          averageTime: 0
        }
      }
    };
  }
}