// SISTEMA AVANZADO DE DETECCIÓN DE CONTENIDO REPETIDO
// Soluciona el problema fundamental: IDs diferentes pero contenido idéntico

export interface ExerciseContent {
  question: string;
  options: string[];
  correctAnswer: number;
  type?: string;
}

export class ContentHashTracker {
  
  /**
   * Genera hash único basado en el CONTENIDO real del ejercicio
   * No solo el ID, sino pregunta + opciones + respuesta correcta
   */
  static hashExerciseContent(exercise: ExerciseContent): string {
    const content = `${exercise.question}_${exercise.options.join('_')}_${exercise.correctAnswer}`;
    
    // Hash simple pero efectivo usando btoa (base64)
    try {
      return btoa(content).slice(0, 16); // 16 caracteres únicos
    } catch (error) {
      // Fallback si hay caracteres especiales
      return content.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    }
  }
  
  /**
   * Verifica si el CONTENIDO (no ID) ya fue usado
   * ESTA ES LA CLAVE: detecta preguntas idénticas con IDs diferentes
   */
  static isContentRepeated(exercise: ExerciseContent, level: string): boolean {
    const hash = this.hashExerciseContent(exercise);
    const usedHashes = this.getUsedHashes(level);
    
    const isRepeated = usedHashes.includes(hash);
    
    if (isRepeated) {
      console.log("🚨 CONTENIDO REPETIDO DETECTADO:");
      console.log("📝 Pregunta:", exercise.question.slice(0, 50) + "...");
      console.log("🔍 Hash:", hash);
      console.log("📊 Total hashes usados:", usedHashes.length);
    }
    
    return isRepeated;
  }
  
  /**
   * Marca el CONTENIDO como usado (no solo el ID)
   */
  static markContentAsUsed(exercise: ExerciseContent, level: string): void {
    const hash = this.hashExerciseContent(exercise);
    const used = this.getUsedHashes(level);
    
    if (!used.includes(hash)) {
      used.push(hash);
      
      // Mantener solo los últimos 100 hashes para no llenar localStorage
      const trimmed = used.slice(-100);
      
      localStorage.setItem(`content_hashes_${level}`, JSON.stringify(trimmed));
      
      console.log("✅ CONTENIDO MARCADO COMO USADO:");
      console.log("🔍 Hash:", hash);
      console.log("📊 Total únicos:", trimmed.length);
    }
  }
  
  /**
   * Obtiene lista de hashes de contenido ya usados
   */
  private static getUsedHashes(level: string): string[] {
    const stored = localStorage.getItem(`content_hashes_${level}`);
    return stored ? JSON.parse(stored) : [];
  }
  
  /**
   * Limpia hashes antiguos para nivel específico
   */
  static clearUsedHashes(level: string): void {
    localStorage.removeItem(`content_hashes_${level}`);
    console.log(`🗑️ HASHES LIMPIADOS para nivel ${level}`);
  }
  
  /**
   * Debug: Muestra estadísticas de contenido usado
   */
  static debugContentStats(level: string): void {
    const hashes = this.getUsedHashes(level);
    console.log("📊 ESTADÍSTICAS DE CONTENIDO ÚNICO:");
    console.log(`📈 Nivel: ${level}`);
    console.log(`🔢 Total ejercicios únicos vistos: ${hashes.length}`);
    console.log(`💾 Espacio localStorage: ~${JSON.stringify(hashes).length} bytes`);
    
    if (hashes.length > 0) {
      console.log(`🔍 Últimos 5 hashes:`, hashes.slice(-5));
    }
  }
  
  /**
   * Verifica diversidad semántica - detecta ejercicios muy similares
   */
  static checkSemanticSimilarity(exercise: ExerciseContent, level: string, threshold: number = 0.7): boolean {
    const recentContent = this.getRecentExerciseContent(level, 10);
    const exerciseWords = exercise.question.toLowerCase().split(' ');
    
    for (const recent of recentContent) {
      const recentWords = recent.toLowerCase().split(' ');
      const similarity = this.calculateWordSimilarity(exerciseWords, recentWords);
      
      if (similarity > threshold) {
        console.log("⚠️ EJERCICIO MUY SIMILAR DETECTADO:");
        console.log("📝 Actual:", exercise.question.slice(0, 40) + "...");
        console.log("📝 Similar:", recent.slice(0, 40) + "...");
        console.log("📊 Similitud:", Math.round(similarity * 100) + "%");
        return true; // Es muy similar
      }
    }
    
    // Guardar contenido para futuras comparaciones
    this.saveExerciseContent(level, exercise.question);
    return false; // Es suficientemente diferente
  }
  
  /**
   * Calcula similitud entre dos sets de palabras
   */
  private static calculateWordSimilarity(words1: string[], words2: string[]): number {
    const set1 = new Set(words1.filter(word => word.length > 2)); // Ignorar palabras muy cortas
    const set2 = new Set(words2.filter(word => word.length > 2));
    
    const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
    const union = new Set([...Array.from(set1), ...Array.from(set2)]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  /**
   * Obtiene contenido reciente de ejercicios para comparación semántica
   */
  private static getRecentExerciseContent(level: string, count: number): string[] {
    const stored = localStorage.getItem(`recent_content_${level}`);
    const recent = stored ? JSON.parse(stored) : [];
    return recent.slice(-count);
  }
  
  /**
   * Guarda contenido de ejercicio para comparación semántica
   */
  private static saveExerciseContent(level: string, content: string): void {
    const stored = localStorage.getItem(`recent_content_${level}`);
    const recent = stored ? JSON.parse(stored) : [];
    
    recent.push(content);
    const trimmed = recent.slice(-20); // Mantener últimos 20
    
    localStorage.setItem(`recent_content_${level}`, JSON.stringify(trimmed));
  }
}