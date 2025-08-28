/*
 * ⚠️ DEPRECATED - Ejercicios Estáticos Eliminados
 * 
 * Esta app ahora funciona 100% con IA personalizada.
 * Todos los ejercicios son generados dinámicamente por Google Gemini 1.5 Flash.
 * 
 * Si necesitas los ejercicios estáticos originales, están en exercises.deprecated.ts
 */

export interface LevelExercise {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  type: 'vocabulary' | 'grammar' | 'translation' | 'comprehension';
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  question: string;
  instruction: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  skills: string[];
}

// Función deprecada - solo para compatibilidad
export function getUniqueExercises(): LevelExercise[] {
  console.warn("⚠️ getUniqueExercises() está deprecada. La app usa 100% IA ahora.");
  return [];
}

export function shuffleExerciseOptions(exercise: LevelExercise): LevelExercise {
  console.warn("⚠️ shuffleExerciseOptions() está deprecada.");
  return exercise;
}

// CLASE DEPRECADA - MANTENER SOLO PARA COMPATIBILIDAD
export class LevelExerciseManager {
  
  // Obtener ejercicios únicos para un nivel específico
  static getUniqueExercisesForLevel(
    level: 'A1' | 'A2' | 'B1' | 'B2',
    usedIds: string[] = [],
    count: number = 8
  ): LevelExercise[] {
    console.warn("⚠️ LevelExerciseManager está deprecado. La app usa 100% IA ahora.");
    return [];
  }
  
  // Marcar ejercicios como usados
  static markExercisesAsUsed(level: string, exerciseIds: string[]): void {
    console.warn("⚠️ markExercisesAsUsed está deprecado.");
  }
  
  // Obtener ejercicios usados
  static getUsedExerciseIds(level: string): string[] {
    console.warn("⚠️ getUsedExerciseIds está deprecado.");
    return [];
  }
  
  // Limpiar ejercicios usados para un nivel
  static resetUsedExercises(level: string): void {
    console.warn("⚠️ resetUsedExercises está deprecado.");
  }
}