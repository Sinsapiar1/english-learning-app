// VERSIÓN SIMPLE Y COMPATIBLE - SEGÚN RECOMENDACIÓN DE CLAUDE
// Solo lo esencial para eliminar repeticiones de contenido

export interface ExerciseContent {
  question: string;
  options: string[];
  correctAnswer: number;
}

export class ContentHashTracker {
  
  /**
   * Genera hash único basado en el CONTENIDO real del ejercicio
   * Versión compatible sin Set spread operators
   */
  static hashExerciseContent(exercise: any): string {
    // Limpiar opciones antes de hacer hash
    const cleanOptions = exercise.options.map((opt: string) => 
      opt.replace(/^[A-D]\)\s*/, '').trim()
    );
    
    const content = `${exercise.question}_${cleanOptions.join('_')}_${exercise.correctAnswer}`;
    
    // Usar función hash simple compatible (sin btoa para evitar errores)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).slice(0, 16);
  }
  
  /**
   * Verifica si el CONTENIDO ya fue usado
   */
  static isContentRepeated(exercise: ExerciseContent, level: string): boolean {
    const hash = this.hashExerciseContent(exercise);
    const usedHashes = this.getUsedHashes(level);
    
    const isRepeated = usedHashes.includes(hash);
    
    if (isRepeated) {
      console.log("🚨 CONTENIDO REPETIDO DETECTADO:");
      console.log("📝 Pregunta:", exercise.question.slice(0, 50) + "...");
      console.log("🔍 Hash:", hash);
    }
    
    return isRepeated;
  }
  
  /**
   * Marca el CONTENIDO como usado
   */
  static markContentAsUsed(exercise: ExerciseContent, level: string): void {
    const hash = this.hashExerciseContent(exercise);
    const used = this.getUsedHashes(level);
    
    if (!used.includes(hash)) {
      used.push(hash);
      localStorage.setItem(`content_hashes_${level}`, JSON.stringify(used));
      console.log(`✅ CONTENT HASH SAVED: ${hash} for level ${level}`);
    }
  }
  
  /**
   * Obtiene lista de hashes ya usados
   */
  private static getUsedHashes(level: string): string[] {
    const stored = localStorage.getItem(`content_hashes_${level}`);
    return stored ? JSON.parse(stored) : [];
  }
  
  /**
   * Limpia hashes para nivel específico
   */
  static clearUsedHashes(level: string): void {
    localStorage.removeItem(`content_hashes_${level}`);
    console.log(`🗑️ HASHES LIMPIADOS para nivel ${level}`);
  }
  
  /**
   * Debug: Muestra estadísticas
   */
  static debugContentStats(level: string): void {
    const hashes = this.getUsedHashes(level);
    console.log("📊 ESTADÍSTICAS DE CONTENIDO ÚNICO:");
    console.log(`📈 Nivel: ${level}`);
    console.log(`🔢 Total ejercicios únicos: ${hashes.length}`);
    
    if (hashes.length > 0) {
      console.log(`🔍 Últimos 5 hashes:`, hashes.slice(-5));
    }
  }
}