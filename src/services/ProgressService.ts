/**
 * PROGRESS SERVICE - ENGLISH MASTER V3
 * Servicio simple y robusto para progreso
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface UserProgress {
  userId: string
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  totalXP: number
  totalExercises: number
  accuracy: number
  currentStreak: number
  createdAt: Date
  lastActive: Date
}

export class ProgressService {
  
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
      } as UserProgress

    } catch (error) {
      console.error('Error loading progress:', error)
      return null
    }
  }

  async createUserProgress(
    userId: string, 
    email: string, 
    initialLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' = 'A1'
  ): Promise<UserProgress> {
    const progress: UserProgress = {
      userId,
      currentLevel: initialLevel,
      totalXP: 0,
      totalExercises: 0,
      accuracy: 0,
      currentStreak: 0,
      createdAt: new Date(),
      lastActive: new Date()
    }

    await setDoc(doc(db, 'userProgress', userId), progress)
    return progress
  }

  async updateProgress(userId: string, sessionResult: any): Promise<UserProgress> {
    try {
      const docRef = doc(db, 'userProgress', userId)
      const current = await this.getUserProgress(userId)
      
      if (!current) {
        throw new Error('User progress not found')
      }

      const newTotalExercises = current.totalExercises + sessionResult.totalAnswers
      const newCorrectAnswers = (current.accuracy * current.totalExercises) + sessionResult.correctAnswers
      const newAccuracy = Math.max(current.accuracy, newCorrectAnswers / newTotalExercises) // Solo sube

      const updated: UserProgress = {
        ...current,
        totalXP: current.totalXP + sessionResult.xpEarned,
        totalExercises: newTotalExercises,
        accuracy: newAccuracy,
        currentStreak: current.currentStreak + 1,
        lastActive: new Date()
      }

      await updateDoc(docRef, updated)
      return updated

    } catch (error) {
      console.error('Error updating progress:', error)
      throw error
    }
  }
}