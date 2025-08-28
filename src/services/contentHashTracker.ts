export class ContentHashTracker {
  static hashExerciseContent(exercise: any): string {
    // Limpiar opciones de cualquier formato previo
    const cleanOptions = exercise.options.map((opt: string) => 
      opt.replace(/^[A-D]\)\s*/, '').trim()
    );
    
    const content = `${exercise.question.trim()}_${cleanOptions.join('_')}_${exercise.correctAnswer}`;
    
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const finalHash = Math.abs(hash).toString(36).slice(0, 16);
    
    console.log(`🔢 HASH GENERADO:`, {
      question: exercise.question.trim(),
      cleanOptions: cleanOptions,
      content: content.substring(0, 100) + "...",
      hash: finalHash
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