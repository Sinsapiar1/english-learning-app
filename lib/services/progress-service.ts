/**
 * PROGRESS SERVICE - ENGLISH MASTER V3
 * Servicio limpio para manejo de progreso
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { UserProgress, Level, LevelStats, SessionResult, LEVEL_CONFIG } from '@/lib/types'

export class ProgressService {
  
  /**
   * OBTENER PROGRESO DEL USUARIO
   */
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const docRef = doc(db, 'userProgress', userId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        return null
      }

      const data = docSnap.data()
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        lastActive: data.lastActive.toDate(),
        lastLevelUp: data.lastLevelUp?.toDate(),
      } as UserProgress

    } catch (error) {
      console.error('❌ Error loading user progress:', error)
      return null
    }
  }

  /**
   * CREAR PROGRESO INICIAL
   */
  async createUserProgress(
    userId: string, 
    email: string, 
    initialLevel: Level = 'A1'
  ): Promise<UserProgress> {
    const initialProgress: UserProgress = {
      userId,
      currentLevel: initialLevel,
      totalXP: 0,
      totalExercises: 0,
      correctAnswers: 0,
      accuracy: 0,
      currentStreak: 0,
      longestStreak: 0,
      
      levelStats: this.createInitialLevelStats(initialLevel),
      
      preferences: {
        dailyGoal: 20,
        soundEnabled: true,
        animationsEnabled: true,
        explanationLanguage: 'es'
      },
      
      createdAt: new Date(),
      lastActive: new Date()
    }

    await setDoc(doc(db, 'userProgress', userId), {
      ...initialProgress,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    })

    return initialProgress
  }

  /**
   * ACTUALIZAR PROGRESO DESPUÉS DE SESIÓN
   */
  async updateProgress(userId: string, sessionResult: SessionResult): Promise<UserProgress> {
    return await runTransaction(db, async (transaction) => {
      const progressRef = doc(db, 'userProgress', userId)
      const progressDoc = await transaction.get(progressRef)
      
      if (!progressDoc.exists()) {
        throw new Error('User progress not found')
      }

      const currentProgress = {
        ...progressDoc.data(),
        createdAt: progressDoc.data()!.createdAt.toDate(),
        lastActive: progressDoc.data()!.lastActive.toDate(),
        lastLevelUp: progressDoc.data()!.lastLevelUp?.toDate(),
      } as UserProgress

      // Actualizar stats globales
      const newTotalExercises = currentProgress.totalExercises + sessionResult.totalAnswers
      const newCorrectAnswers = currentProgress.correctAnswers + sessionResult.correctAnswers
      const newAccuracy = newCorrectAnswers / newTotalExercises

      // Actualizar stats del nivel actual
      const currentLevel = currentProgress.currentLevel
      const levelStats = currentProgress.levelStats[currentLevel]
      
      const updatedLevelStats: LevelStats = {
        ...levelStats,
        exercisesCompleted: levelStats.exercisesCompleted + sessionResult.totalAnswers,
        correctAnswers: levelStats.correctAnswers + sessionResult.correctAnswers,
        accuracy: Math.max(
          levelStats.accuracy, 
          (levelStats.correctAnswers + sessionResult.correctAnswers) / 
          (levelStats.exercisesCompleted + sessionResult.totalAnswers)
        ), // 🚀 NUNCA RETROCEDE
        xpEarned: levelStats.xpEarned + sessionResult.xpEarned,
        timeSpent: levelStats.timeSpent + sessionResult.timeSpent,
        sessionsCompleted: levelStats.sessionsCompleted + 1,
        weakAreas: this.updateWeakAreas(levelStats.weakAreas, sessionResult),
        strongAreas: this.updateStrongAreas(levelStats.strongAreas, sessionResult)
      }

      // Verificar level up
      const canLevelUp = this.checkLevelUp(currentLevel, updatedLevelStats)
      let newLevel = currentLevel
      
      if (canLevelUp && currentLevel !== 'C1') {
        newLevel = this.getNextLevel(currentLevel)
        updatedLevelStats.isCompleted = true
        updatedLevelStats.completedAt = new Date()
        
        // Desbloquear siguiente nivel
        currentProgress.levelStats[newLevel].isUnlocked = true
      }

      const updatedProgress: UserProgress = {
        ...currentProgress,
        currentLevel: newLevel,
        totalXP: currentProgress.totalXP + sessionResult.xpEarned,
        totalExercises: newTotalExercises,
        correctAnswers: newCorrectAnswers,
        accuracy: newAccuracy,
        levelStats: {
          ...currentProgress.levelStats,
          [currentLevel]: updatedLevelStats
        },
        lastActive: new Date(),
        ...(canLevelUp && { lastLevelUp: new Date() })
      }

      // Guardar en Firebase
      transaction.update(progressRef, {
        ...updatedProgress,
        lastActive: serverTimestamp(),
        ...(updatedProgress.lastLevelUp && { lastLevelUp: serverTimestamp() })
      })

      return updatedProgress
    })
  }

  /**
   * UTILIDADES PRIVADAS
   */
  private createInitialLevelStats(startLevel: Level): Record<Level, LevelStats> {
    const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1']
    const startIndex = levels.indexOf(startLevel)
    
    return levels.reduce((acc, level, index) => {
      acc[level] = {
        exercisesCompleted: 0,
        correctAnswers: 0,
        accuracy: 0,
        xpEarned: 0,
        timeSpent: 0,
        sessionsCompleted: 0,
        isUnlocked: index <= startIndex,
        isCompleted: index < startIndex,
        weakAreas: [],
        strongAreas: [],
        ...(index < startIndex && { completedAt: new Date() })
      }
      return acc
    }, {} as Record<Level, LevelStats>)
  }

  private checkLevelUp(level: Level, stats: LevelStats): boolean {
    const requirements = LEVEL_CONFIG[level]
    return (
      stats.exercisesCompleted >= requirements.minExercises &&
      stats.accuracy >= requirements.minAccuracy &&
      stats.sessionsCompleted >= requirements.minSessions
    )
  }

  private getNextLevel(currentLevel: Level): Level {
    const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1']
    const currentIndex = levels.indexOf(currentLevel)
    return levels[Math.min(currentIndex + 1, levels.length - 1)]
  }

  private updateWeakAreas(current: string[], session: SessionResult): string[] {
    // Lógica para identificar áreas débiles basada en errores
    const newWeak = session.exercises
      .filter((_, index) => session.exercises[index].correctAnswer !== /* user answer */ 0)
      .map(ex => ex.skillFocus)
    
    return Array.from(new Set([...current, ...newWeak])).slice(0, 5)
  }

  private updateStrongAreas(current: string[], session: SessionResult): string[] {
    if (session.accuracy >= 0.85) {
      const newStrong = session.exercises.map(ex => ex.skillFocus)
      return Array.from(new Set([...current, ...newStrong])).slice(0, 5)
    }
    return current
  }
}