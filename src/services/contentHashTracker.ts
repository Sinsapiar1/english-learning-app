export class ContentHashTracker {
  static hashExerciseContent(exercise: any): string {
    // ✅ NORMALIZAR contenido para hash más robusto
    const normalizedQuestion = exercise.question
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remover puntuación
      .replace(/\s+/g, ' ')    // Normalizar espacios
      .trim();
    
    const normalizedOptions = exercise.options
      .map((opt: string) => opt
        .toLowerCase()
        .replace(/^[a-d]\)\s*/i, '') // Remover A) B) C) D)
        .replace(/[^\w\s]/g, '')     // Remover puntuación  
        .trim()
      )
      .sort() // ✅ ORDENAR opciones para detectar mismo contenido mezclado
      .join('|');
    
    const contentToHash = `${normalizedQuestion}__${normalizedOptions}__${exercise.correctAnswer}`;
    
    // ✅ HASH MÁS FUERTE
    let hash = 0;
    for (let i = 0; i < contentToHash.length; i++) {
      const char = contentToHash.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const finalHash = Math.abs(hash).toString(36).padStart(8, '0');
    
    console.log(`🔍 HASH MEJORADO:`, {
      question: normalizedQuestion.substring(0, 50),
      optionsCount: exercise.options.length,
      hash: finalHash,
      contentLength: contentToHash.length
    });
    
    return finalHash;
  }
  
  static isContentRepeated(exercise: any, level: string): boolean {
    const hash = this.hashExerciseContent(exercise);
    const usedHashes = this.getUsedHashes(level);
    const isRepeated = usedHashes.includes(hash);
    
    console.log(`🔍 VERIFICANDO REPETICIÓN:`, {
      hash: hash,
      level: level,
      totalHashesUsados: usedHashes.length,
      isRepeated: isRepeated,
      hashesExistentes: usedHashes
    });
    
    return isRepeated;
  }
  
  static markContentAsUsed(exercise: any, level: string): void {
    const hash = this.hashExerciseContent(exercise);
    const used = this.getUsedHashes(level);
    
    if (!used.includes(hash)) {
      used.push(hash);
      const key = `content_hashes_${level}`;
      localStorage.setItem(key, JSON.stringify(used));
      
      console.log(`✅ CONTENT HASH GUARDADO:`, {
        hash: hash,
        level: level,
        totalHashes: used.length,
        key: key,
        question: exercise.question.substring(0, 50) + "..."
      });
    } else {
      console.log(`⚠️ HASH YA EXISTÍA:`, { hash, level });
    }
  }
  
  private static getUsedHashes(level: string): string[] {
    const key = `content_hashes_${level}`;
    const stored = localStorage.getItem(key);
    const hashes = stored ? JSON.parse(stored) : [];
    
    console.log(`📋 HASHES RECUPERADOS:`, {
      level: level,
      key: key,
      totalHashes: hashes.length,
      hashes: hashes
    });
    
    return hashes;
  }
  
  // MÉTODO DE EMERGENCIA: Limpiar hashes específicos
  static removeSpecificQuestion(questionText: string, level: string): void {
    const dummyExercise = {
      question: questionText,
      options: ["dummy", "dummy", "dummy", "dummy"], 
      correctAnswer: 0
    };
    
    const hashToRemove = this.hashExerciseContent(dummyExercise);
    const used = this.getUsedHashes(level);
    const filtered = used.filter(hash => hash !== hashToRemove);
    
    localStorage.setItem(`content_hashes_${level}`, JSON.stringify(filtered));
    console.log(`🗑️ HASH ESPECÍFICO ELIMINADO:`, { hashToRemove, level });
  }
  
  // LIMPIAR TODO EL CACHÉ (usar solo en emergencia)
  static clearAllHashes(): void {
    ['A1', 'A2', 'B1', 'B2'].forEach(level => {
      localStorage.removeItem(`content_hashes_${level}`);
      localStorage.removeItem(`used_exercises_${level}`);
    });
    console.log(`🧹 TODOS LOS HASHES LIMPIADOS`);
  }
}