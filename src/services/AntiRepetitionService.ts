/**
 * ANTI-REPETITION SERVICE - ENGLISH MASTER V3
 * Sistema simple para evitar repeticiones
 */

import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export class AntiRepetitionService {
  
  async getRecentQuestions(userId: string, level: string): Promise<string[]> {
    try {
      const q = query(
        collection(db, 'questionHistory'),
        where('userId', '==', userId),
        where('level', '==', level)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data().question)

    } catch (error) {
      console.error('Error getting recent questions:', error)
      return []
    }
  }

  async markQuestionsAsUsed(userId: string, level: string, questions: string[]): Promise<void> {
    try {
      for (const question of questions) {
        await addDoc(collection(db, 'questionHistory'), {
          userId,
          level,
          question,
          usedAt: new Date()
        })
      }
    } catch (error) {
      console.error('Error marking questions:', error)
    }
  }

  async clearAllHistory(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'questionHistory'),
        where('userId', '==', userId)
      )

      const snapshot = await getDocs(q)
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      
      await Promise.all(deletePromises)
      console.log(`🧹 Cleared ${snapshot.size} question records`)

    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }
}