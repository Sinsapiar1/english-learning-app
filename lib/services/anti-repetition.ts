/**
 * ANTI-REPETITION SERVICE - ENGLISH MASTER V3
 * Sistema robusto para evitar ejercicios repetidos
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Level } from '@/lib/types'

export interface QuestionHistory {
  userId: string
  level: Level
  questionText: string
  questionHash: string
  skillFocus: string
  usedAt: Date
  sessionId: string
}

export class AntiRepetitionService {
  
  /**
   * OBTENER PREGUNTAS USADAS RECIENTEMENTE
   */
  async getRecentQuestions(userId: string, level: Level, days: number = 7): Promise<string[]> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const q = query(
        collection(db, 'questionHistory'),
        where('userId', '==', userId),
        where('level', '==', level),
        where('usedAt', '>=', cutoffDate),
        orderBy('usedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data().questionText)

    } catch (error) {
      console.error('❌ Error getting recent questions:', error)
      return []
    }
  }

  /**
   * MARCAR PREGUNTAS COMO USADAS
   */
  async markQuestionsAsUsed(
    userId: string, 
    level: Level, 
    questions: string[], 
    sessionId: string
  ): Promise<void> {
    try {
      const batch = []
      
      for (const questionText of questions) {
        const historyEntry: Omit<QuestionHistory, 'id'> = {
          userId,
          level,
          questionText,
          questionHash: this.hashQuestion(questionText),
          skillFocus: this.extractSkillFocus(questionText),
          usedAt: new Date(),
          sessionId
        }

        batch.push(
          addDoc(collection(db, 'questionHistory'), {
            ...historyEntry,
            usedAt: serverTimestamp()
          })
        )
      }

      await Promise.all(batch)
      console.log(`💾 Marked ${questions.length} questions as used`)

    } catch (error) {
      console.error('❌ Error marking questions as used:', error)
    }
  }

  /**
   * LIMPIAR HISTORIAL ANTIGUO
   */
  async cleanOldHistory(userId: string, daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const q = query(
        collection(db, 'questionHistory'),
        where('userId', '==', userId),
        where('usedAt', '<', cutoffDate)
      )

      const snapshot = await getDocs(q)
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      
      await Promise.all(deletePromises)
      console.log(`🗑️ Cleaned ${snapshot.size} old question records`)

    } catch (error) {
      console.error('❌ Error cleaning old history:', error)
    }
  }

  /**
   * LIMPIAR TODO EL HISTORIAL (EMERGENCY RESET)
   */
  async clearAllHistory(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'questionHistory'),
        where('userId', '==', userId)
      )

      const snapshot = await getDocs(q)
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      
      await Promise.all(deletePromises)
      console.log(`🧹 Cleared ALL question history for user ${userId}`)

    } catch (error) {
      console.error('❌ Error clearing all history:', error)
    }
  }

  /**
   * OBTENER ESTADÍSTICAS DE REPETICIÓN
   */
  async getRepetitionStats(userId: string): Promise<{
    totalQuestions: number
    uniqueQuestions: number
    repetitionRate: number
    mostUsedSkills: Array<{ skill: string; count: number }>
  }> {
    try {
      const q = query(
        collection(db, 'questionHistory'),
        where('userId', '==', userId),
        orderBy('usedAt', 'desc'),
        limit(200)
      )

      const snapshot = await getDocs(q)
      const questions = snapshot.docs.map(doc => doc.data())
      
      const uniqueQuestions = new Set(questions.map(q => q.questionHash)).size
      const skillCounts = questions.reduce((acc, q) => {
        acc[q.skillFocus] = (acc[q.skillFocus] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const mostUsedSkills = Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return {
        totalQuestions: questions.length,
        uniqueQuestions,
        repetitionRate: 1 - (uniqueQuestions / questions.length),
        mostUsedSkills
      }

    } catch (error) {
      console.error('❌ Error getting repetition stats:', error)
      return {
        totalQuestions: 0,
        uniqueQuestions: 0,
        repetitionRate: 0,
        mostUsedSkills: []
      }
    }
  }

  /**
   * UTILIDADES PRIVADAS
   */
  private hashQuestion(questionText: string): string {
    // Simple hash para identificar preguntas únicas
    let hash = 0
    const normalized = questionText.toLowerCase().replace(/[^\w\s]/g, '')
    
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36)
  }

  private extractSkillFocus(questionText: string): string {
    // Lógica simple para extraer skill focus basada en contenido
    const skillKeywords = {
      'greetings': ['hello', 'good morning', 'hi'],
      'courtesy': ['thank you', 'please', 'excuse me'],
      'basic_needs': ['hungry', 'thirsty', 'bathroom'],
      'academic': ['epistemological', 'paradigm', 'theoretical'],
      'professional': ['business', 'meeting', 'strategy']
    }

    const lowerText = questionText.toLowerCase()
    
    for (const [skill, keywords] of Object.entries(skillKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return skill
      }
    }
    
    return 'general'
  }
}