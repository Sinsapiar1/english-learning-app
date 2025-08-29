/**
 * REPETITION CLEANER - SISTEMA DE LIMPIEZA ANTI-REPETICIÓN
 * English Master App - Limpia historial para garantizar variedad
 */

import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  doc,
  writeBatch
} from 'firebase/firestore';

export class RepetitionCleaner {
  private db = getFirestore();

  /**
   * LIMPIAR TODO EL HISTORIAL DE UN USUARIO
   */
  async cleanAllUserHistory(userId: string): Promise<void> {
    try {
      console.log(`🧹 Limpiando historial completo para usuario: ${userId}`);

      // Limpiar Firebase
      await this.cleanFirebaseHistory(userId);
      
      // Limpiar localStorage
      this.cleanLocalStorageHistory(userId);
      
      console.log(`✅ Historial limpiado completamente para ${userId}`);
      
    } catch (error) {
      console.error('❌ Error limpiando historial:', error);
    }
  }

  /**
   * LIMPIAR HISTORIAL DE FIREBASE
   */
  private async cleanFirebaseHistory(userId: string): Promise<void> {
    try {
      const batch = writeBatch(this.db);
      
      // Limpiar exerciseHistory
      const historyQuery = query(
        collection(this.db, 'exerciseHistory'),
        where('userId', '==', userId)
      );
      
      const historySnapshot = await getDocs(historyQuery);
      historySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Ejecutar batch
      await batch.commit();
      
      console.log(`🔥 ${historySnapshot.size} registros eliminados de Firebase`);
      
    } catch (error) {
      console.error('❌ Error limpiando Firebase:', error);
    }
  }

  /**
   * LIMPIAR LOCALSTORAGE
   */
  private cleanLocalStorageHistory(userId: string): void {
    try {
      const keysToClean = [
        'content_hashes_A1',
        'content_hashes_A2', 
        'content_hashes_B1',
        'content_hashes_B2',
        'used_sessions_A1',
        'used_sessions_A2',
        'used_sessions_B1', 
        'used_sessions_B2',
        'all_exercise_hashes_A1',
        'all_exercise_hashes_A2',
        'all_exercise_hashes_B1',
        'all_exercise_hashes_B2',
        `user_exercise_history_${userId}`,
        `last_questions_${userId}`,
        `question_bank_${userId}`
      ];

      keysToClean.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log(`🧹 ${keysToClean.length} claves limpiadas del localStorage`);
      
    } catch (error) {
      console.error('❌ Error limpiando localStorage:', error);
    }
  }

  /**
   * LIMPIAR HISTORIAL ANTIGUO (MÁS DE 30 DÍAS)
   */
  async cleanOldHistory(userId: string): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const batch = writeBatch(this.db);
      
      const oldHistoryQuery = query(
        collection(this.db, 'exerciseHistory'),
        where('userId', '==', userId),
        where('timestamp', '<', thirtyDaysAgo)
      );
      
      const oldSnapshot = await getDocs(oldHistoryQuery);
      oldSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      console.log(`🗑️ ${oldSnapshot.size} registros antiguos eliminados`);
      
    } catch (error) {
      console.error('❌ Error limpiando historial antiguo:', error);
    }
  }

  /**
   * OBTENER ESTADÍSTICAS DE REPETICIÓN
   */
  async getRepetitionStats(userId: string): Promise<any> {
    try {
      const historyQuery = query(
        collection(this.db, 'exerciseHistory'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(historyQuery);
      const exercises = snapshot.docs.map(doc => doc.data());
      
      // Contar repeticiones por pregunta
      const questionCounts: Record<string, number> = {};
      exercises.forEach(ex => {
        questionCounts[ex.questionText] = (questionCounts[ex.questionText] || 0) + 1;
      });

      // Identificar preguntas más repetidas
      const mostRepeated = Object.entries(questionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

      return {
        totalExercises: exercises.length,
        uniqueQuestions: Object.keys(questionCounts).length,
        repetitionRate: 1 - (Object.keys(questionCounts).length / exercises.length),
        mostRepeated: mostRepeated.map(([question, count]) => ({ question, count }))
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo stats:', error);
      return null;
    }
  }
}