// SISTEMA ROBUSTO CONTRA REPETICIÓN DE SESIONES COMPLETAS
export class SessionHashTracker {
  
  // Generar hash de sesión completa
  static generateSessionHash(exercises: any[]): string {
    const sessionContent = exercises.map(ex => 
      `${ex.question}_${ex.options.join('_')}_${ex.correctAnswer}`
    ).join('|||');
    
    let hash = 0;
    for (let i = 0; i < sessionContent.length; i++) {
      const char = sessionContent.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36).slice(0, 20);
  }
  
  // Verificar si sesión ya se usó con verificación estricta
  static isSessionRepeated(exercises: any[], level: string): boolean {
    const sessionHash = this.generateSessionHash(exercises);
    const usedSessions = this.getUsedSessions(level);
    
    // ✅ TAMBIÉN verificar hashes individuales de ejercicios
    const exerciseHashes = exercises.map(ex => {
      // Importar ContentHashTracker dinámicamente para evitar dependencia circular
      const ContentHashTracker = require('./contentHashTracker').ContentHashTracker;
      return ContentHashTracker.hashExerciseContent(ex);
    });
    const previousExerciseHashes = this.getAllExerciseHashes(level);
    
    // ✅ REPETIDA si la sesión completa O si >50% ejercicios son repetidos
    const isSessionRepeated = usedSessions.includes(sessionHash);
    const repeatedExercises = exerciseHashes.filter(hash => previousExerciseHashes.includes(hash));
    const tooManyRepeated = repeatedExercises.length > exercises.length * 0.5;
    
    const finalResult = isSessionRepeated || tooManyRepeated;
    
    console.log(`🔍 VERIFICACIÓN SESIÓN ESTRICTA:`, {
      sessionHash: sessionHash,
      isSessionRepeated: isSessionRepeated,
      repeatedExercises: repeatedExercises.length,
      totalExercises: exercises.length,
      tooManyRepeated: tooManyRepeated,
      finalResult: finalResult
    });
    
    return finalResult;
  }
  
  // Marcar sesión como usada
  static markSessionAsUsed(exercises: any[], level: string): void {
    const sessionHash = this.generateSessionHash(exercises);
    const usedSessions = this.getUsedSessions(level);
    
    if (!usedSessions.includes(sessionHash)) {
      usedSessions.push(sessionHash);
      const key = `used_sessions_${level}`;
      
      // Mantener solo las últimas 50 sesiones
      const limitedSessions = usedSessions.slice(-50);
      localStorage.setItem(key, JSON.stringify(limitedSessions));
      
      // ✅ TAMBIÉN guardar hashes de ejercicios individuales
      const ContentHashTracker = require('./contentHashTracker').ContentHashTracker;
      const exerciseHashes = exercises.map(ex => ContentHashTracker.hashExerciseContent(ex));
      const allHashes = this.getAllExerciseHashes(level);
      const updatedHashes = [...allHashes, ...exerciseHashes];
      
      // Mantener solo los últimos 200 hashes
      const limitedHashes = Array.from(new Set(updatedHashes)).slice(-200);
      localStorage.setItem(`all_exercise_hashes_${level}`, JSON.stringify(limitedHashes));
      
      console.log(`✅ SESIÓN MARCADA COMO USADA:`, {
        hash: sessionHash,
        level: level,
        totalSessions: limitedSessions.length,
        exerciseHashesAdded: exerciseHashes.length
      });
    }
  }
  
  private static getUsedSessions(level: string): string[] {
    const key = `used_sessions_${level}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  // ✅ NUEVA FUNCIÓN: Obtener todos los hashes de ejercicios individuales
  private static getAllExerciseHashes(level: string): string[] {
    return JSON.parse(localStorage.getItem(`all_exercise_hashes_${level}`) || '[]');
  }
  
  // Limpiar sesiones antiguas
  static cleanOldSessions(): void {
    ['A1', 'A2', 'B1', 'B2'].forEach(level => {
      const key = `used_sessions_${level}`;
      const sessions = JSON.parse(localStorage.getItem(key) || '[]');
      
      if (sessions.length > 100) {
        const cleanedSessions = sessions.slice(-50);
        localStorage.setItem(key, JSON.stringify(cleanedSessions));
        console.log(`🧹 Sesiones limpiadas para nivel ${level}`);
      }
    });
  }
}