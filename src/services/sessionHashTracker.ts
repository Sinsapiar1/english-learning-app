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
  
  // Verificar si sesión ya se usó
  static isSessionRepeated(exercises: any[], level: string): boolean {
    const sessionHash = this.generateSessionHash(exercises);
    const usedSessions = this.getUsedSessions(level);
    
    const isRepeated = usedSessions.includes(sessionHash);
    
    console.log(`🔍 VERIFICANDO SESIÓN:`, {
      hash: sessionHash,
      level: level,
      isRepeated: isRepeated,
      totalUsedSessions: usedSessions.length
    });
    
    return isRepeated;
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
      
      console.log(`✅ SESIÓN MARCADA COMO USADA:`, {
        hash: sessionHash,
        level: level,
        totalSessions: limitedSessions.length
      });
    }
  }
  
  private static getUsedSessions(level: string): string[] {
    const key = `used_sessions_${level}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
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