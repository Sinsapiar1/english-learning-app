// SISTEMA ROBUSTO DE TRACKING DE EJERCICIOS
export class ExerciseTracker {
  
  // Obtener ejercicios ya usados
  static getUsedExercises(level: string): string[] {
    try {
      const key = `used_exercises_${level}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error obteniendo ejercicios usados:", error);
      return [];
    }
  }
  
  // Marcar ejercicio como usado
  static markExerciseAsUsed(level: string, exerciseId: string): void {
    try {
      const used = this.getUsedExercises(level);
      if (!used.includes(exerciseId)) {
        used.push(exerciseId);
        const key = `used_exercises_${level}`;
        localStorage.setItem(key, JSON.stringify(used));
        console.log(`✅ EJERCICIO MARCADO COMO USADO: ${exerciseId} (Total: ${used.length})`);
      }
    } catch (error) {
      console.error("Error marcando ejercicio:", error);
    }
  }
  
  // Verificar si ejercicio ya fue usado
  static isExerciseUsed(level: string, exerciseId: string): boolean {
    const used = this.getUsedExercises(level);
    return used.includes(exerciseId);
  }
  
  // Limpiar historial si hay demasiados ejercicios usados
  static cleanupIfNeeded(level: string, maxUsed: number = 50): void {
    const used = this.getUsedExercises(level);
    if (used.length > maxUsed) {
      // Mantener solo los más recientes
      const recent = used.slice(-maxUsed);
      const key = `used_exercises_${level}`;
      localStorage.setItem(key, JSON.stringify(recent));
      console.log(`🧹 LIMPIEZA: Manteniendo ${recent.length} ejercicios más recientes`);
    }
  }
  
  // Obtener estadísticas de uso
  static getUsageStats(level: string): {
    totalUsed: number;
    recentlyUsed: string[];
    canReset: boolean;
  } {
    const used = this.getUsedExercises(level);
    return {
      totalUsed: used.length,
      recentlyUsed: used.slice(-10), // Últimos 10
      canReset: used.length > 30 // Permitir reset si hay muchos usados
    };
  }
  
  // Reset completo (solo en casos extremos)
  static resetUsedExercises(level: string): void {
    const key = `used_exercises_${level}`;
    localStorage.removeItem(key);
    console.log(`🔄 RESET COMPLETO: Ejercicios usados para nivel ${level}`);
  }
  
  // Debug: Ver todos los ejercicios usados
  static debugUsedExercises(level: string): void {
    const used = this.getUsedExercises(level);
    console.log(`🔍 DEBUG EJERCICIOS USADOS (${level}):`, used);
  }
}