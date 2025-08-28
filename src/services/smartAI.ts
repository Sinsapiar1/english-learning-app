// SISTEMA DE IA VERDADERAMENTE INTELIGENTE
import { PersonalizedLessonGenerator } from './geminiAI';
import { IntelligentLearningSystem } from './intelligentLearning';
import { getUniqueExercises, Exercise } from '../data/exercises';

export interface SmartExerciseRequest {
  userId: string;
  userLevel: 'A1' | 'A2' | 'B1' | 'B2';
  apiKey?: string;
  sessionNumber: number;
  previousErrors?: string[];
  weakTopics?: string[];
  strengths?: string[];
  preferredDifficulty?: 'easy' | 'medium' | 'hard';
}

export interface SmartExercise {
  id: string;
  question: string;
  instruction: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  xpReward: number;
  topic: string;
  level: string;
  source: 'ai' | 'curated' | 'emergency';
  difficulty: 'easy' | 'medium' | 'hard';
  learningFocus: string[];
}

// FUNCIÓN PARA MEZCLAR OPCIONES DE SMART EXERCISE
function shuffleSmartExerciseOptions(exercise: SmartExercise): SmartExercise {
  // Limpiar opciones de cualquier letra previa
  const cleanOptions = exercise.options.map(option => 
    option.replace(/^[A-D]\)\s*/, '').trim()
  );
  
  // Identificar respuesta correcta por contenido
  const correctAnswerText = cleanOptions[exercise.correctAnswer];
  
  // Mezclar opciones limpias
  const shuffledOptions = [...cleanOptions].sort(() => Math.random() - 0.5);
  
  // Encontrar nueva posición de la respuesta correcta
  const newCorrectAnswer = shuffledOptions.findIndex(option => option === correctAnswerText);
  
  return {
    ...exercise,
    options: shuffledOptions,
    correctAnswer: newCorrectAnswer
  };
}

export class SmartAISystem {
  
  // FORZAR GENERACIÓN DE IA - NO MÁS EJERCICIOS ESTÁTICOS
  static async generateSmartExercise(request: SmartExerciseRequest): Promise<SmartExercise> {
    console.log("🤖 FORZANDO GENERACIÓN DE IA - NO MÁS ESTÁTICOS");
    
    // FORZAR IA SIEMPRE - NO PERMITIR FALLBACK A ESTÁTICOS
    if (!request.apiKey) {
      throw new Error("🚨 API KEY REQUERIDA - No se permiten ejercicios estáticos");
    }
    
    let attempts = 0;
    const maxAttempts = 10; // Más intentos para forzar IA
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 INTENTO ${attempts}/${maxAttempts} - FORZANDO IA`);
      
      try {
        const aiExercise = await this.generateAIExercise(request);
        if (aiExercise) {
          console.log("✅ EJERCICIO GENERADO POR IA - ÉXITO!");
          return aiExercise;
        }
      } catch (error: any) {
        console.warn(`⚠️ IA falló intento ${attempts}:`, error);
      }
      
      // Esperar un poco antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Si llegamos aquí, la IA falló completamente
    throw new Error("🚨 IA COMPLETAMENTE FALLIDA después de " + maxAttempts + " intentos");
  }
  
  // GENERAR EJERCICIO CON IA
  static async generateAIExercise(request: SmartExerciseRequest): Promise<SmartExercise | null> {
    try {
      const generator = new PersonalizedLessonGenerator(request.apiKey!);
      
      // Obtener perfil de usuario para contexto
      const userProfile = await IntelligentLearningSystem.getUserProfile(request.userId);
      
      // Determinar tema inteligente
      const targetTopic = this.selectIntelligentTopic(request, userProfile);
      
      // Contexto completo para IA
      const aiContext = {
        level: request.userLevel,
        topic: targetTopic,
        exerciseNumber: request.sessionNumber,
        userWeaknesses: request.weakTopics || [],
        userStrengths: request.strengths || [],
        previousErrors: request.previousErrors || [],
        completedLessons: userProfile?.learningMetrics.totalExercises || 0,
        currentAccuracy: userProfile?.learningMetrics.overallAccuracy || 0,
        preferredDifficulty: request.preferredDifficulty || 'medium',
        focusAreas: this.identifyFocusAreas(request, userProfile)
      };
      
      console.log("🎯 CONTEXTO IA:", aiContext);
      
      const rawExercise = await generator.generateMultipleChoiceExercise(aiContext);
      
      // Convertir a SmartExercise
      const smartExercise: SmartExercise = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        question: rawExercise.question,
        instruction: rawExercise.instruction || "Selecciona la respuesta correcta",
        options: rawExercise.options,
        correctAnswer: rawExercise.correctAnswer,
        explanation: this.enhanceExplanation(rawExercise.explanation, request.userLevel),
        xpReward: this.calculateXPReward(request.userLevel, 'medium'),
        topic: targetTopic,
        level: request.userLevel,
        source: 'ai',
        difficulty: request.preferredDifficulty || 'medium',
        learningFocus: aiContext.focusAreas
      };
      
      // Mezclar opciones
      return shuffleSmartExerciseOptions(smartExercise);
      
    } catch (error: any) {
      console.error("❌ Error generando ejercicio IA:", error);
      return null;
    }
  }
  
  // GENERAR EJERCICIO CURADO INTELIGENTE
  static async generateCuratedExercise(request: SmartExerciseRequest): Promise<SmartExercise> {
    // Obtener perfil para selección inteligente
    const userProfile = await IntelligentLearningSystem.getUserProfile(request.userId);
    
    // Seleccionar tema inteligentemente
    const targetTopic = this.selectIntelligentTopic(request, userProfile);
    
    // Obtener ejercicios usados
    const usedIds = JSON.parse(localStorage.getItem(`used_exercises_${request.userLevel}`) || "[]");
    
    // Obtener ejercicios curados únicos
    const availableExercises = getUniqueExercises(request.userLevel, targetTopic, usedIds, 1);
    
    if (availableExercises.length === 0) {
      // NO MÁS EJERCICIOS BÁSICOS - SOLO IA
      throw new Error("🚨 No hay ejercicios disponibles y no se permiten ejercicios estáticos");
    }
    
    const baseExercise = availableExercises[0];
    
    // Convertir a SmartExercise con explicación mejorada
    const smartExercise: SmartExercise = {
      id: baseExercise.id,
      question: baseExercise.question,
      instruction: baseExercise.instruction,
      options: baseExercise.options,
      correctAnswer: baseExercise.correctAnswer,
      explanation: this.enhanceExplanation(baseExercise.explanation, request.userLevel),
      xpReward: baseExercise.xpReward,
      topic: baseExercise.topic,
      level: baseExercise.level,
      source: 'curated',
      difficulty: this.determineDifficulty(baseExercise, request.userLevel),
      learningFocus: [baseExercise.topic]
    };
    
    // Mezclar opciones del SmartExercise
    const shuffledSmartExercise = shuffleSmartExerciseOptions(smartExercise);
    
    console.log("📚 EJERCICIO CURADO SELECCIONADO:", shuffledSmartExercise.id);
    return shuffledSmartExercise;
  }
  
  // SELECCIONAR TEMA INTELIGENTEMENTE
  static selectIntelligentTopic(request: SmartExerciseRequest, userProfile: any): string {
    // Si hay temas débiles específicos, priorizarlos
    if (request.weakTopics && request.weakTopics.length > 0) {
      return request.weakTopics[Math.floor(Math.random() * request.weakTopics.length)];
    }
    
    // Si hay perfil de usuario, usar análisis de debilidades
    if (userProfile?.topicMastery) {
      const weakTopics = Object.entries(userProfile.topicMastery)
        .filter(([_, mastery]: [string, any]) => mastery.masteryLevel === 'weak' || mastery.accuracy < 0.6)
        .map(([topic, _]) => topic);
      
      if (weakTopics.length > 0) {
        return weakTopics[Math.floor(Math.random() * weakTopics.length)];
      }
    }
    
    // Temas por defecto según nivel
    const defaultTopics = {
      'A1': ['present simple', 'past simple', 'basic vocabulary'],
      'A2': ['present perfect', 'prepositions', 'adverbs'],
      'B1': ['conditionals', 'passive voice', 'modal verbs'],
      'B2': ['subjunctive', 'advanced grammar', 'idioms']
    };
    
    const levelTopics = defaultTopics[request.userLevel] || defaultTopics['A2'];
    return levelTopics[Math.floor(Math.random() * levelTopics.length)];
  }
  
  // IDENTIFICAR ÁREAS DE ENFOQUE
  static identifyFocusAreas(request: SmartExerciseRequest, userProfile: any): string[] {
    const focusAreas = [];
    
    // Áreas débiles del usuario
    if (request.weakTopics) {
      focusAreas.push(...request.weakTopics);
    }
    
    // Errores comunes del perfil
    if (userProfile?.commonMistakes) {
      const commonErrors = Object.keys(userProfile.commonMistakes)
        .sort((a, b) => userProfile.commonMistakes[b].frequency - userProfile.commonMistakes[a].frequency)
        .slice(0, 2);
      focusAreas.push(...commonErrors);
    }
    
    // Enfoque por nivel
    const levelFocus = {
      'A1': ['basic grammar', 'simple tenses', 'vocabulary'],
      'A2': ['intermediate grammar', 'prepositions', 'perfect tenses'],
      'B1': ['complex structures', 'conditionals', 'passive voice'],
      'B2': ['advanced grammar', 'nuanced meanings', 'idiomatic expressions']
    };
    
    focusAreas.push(...(levelFocus[request.userLevel] || levelFocus['A2']));
    
    return Array.from(new Set(focusAreas)); // Eliminar duplicados
  }
  
  // MEJORAR EXPLICACIÓN PARA PRINCIPIANTES
  static enhanceExplanation(originalExplanation: string, userLevel: string): string {
    // Si ya está mejorada, devolverla
    if (originalExplanation.includes('🎯') || originalExplanation.includes('✅')) {
      return originalExplanation;
    }
    
    // Explicaciones básicas para principiantes absolutos
    const levelEnhancements = {
      'A1': {
        prefix: "👶 NIVEL BÁSICO - ",
        suffix: "\n\n💡 CONSEJO: Practica esta estructura varias veces para memorizarla."
      },
      'A2': {
        prefix: "📚 NIVEL ELEMENTAL - ",
        suffix: "\n\n🎯 RECUERDA: Este tipo de ejercicio es común en exámenes básicos."
      },
      'B1': {
        prefix: "🎓 NIVEL INTERMEDIO - ",
        suffix: "\n\n⚡ AVANZADO: Intenta crear tus propias oraciones con esta estructura."
      },
      'B2': {
        prefix: "🏆 NIVEL AVANZADO - ",
        suffix: "\n\n🌟 EXPERTO: Esta estructura es clave para la fluidez natural."
      }
    };
    
    const enhancement = levelEnhancements[userLevel as keyof typeof levelEnhancements] || levelEnhancements['A2'];
    
    return `${enhancement.prefix}${originalExplanation}${enhancement.suffix}`;
  }
  
  // CALCULAR XP SEGÚN DIFICULTAD
  static calculateXPReward(level: string, difficulty: string): number {
    const baseXP = {
      'A1': 8,
      'A2': 10,
      'B1': 12,
      'B2': 15
    };
    
    const difficultyMultiplier = {
      'easy': 0.8,
      'medium': 1.0,
      'hard': 1.3
    };
    
    const base = baseXP[level as keyof typeof baseXP] || 10;
    const multiplier = difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier] || 1.0;
    
    return Math.round(base * multiplier);
  }
  
  // DETERMINAR DIFICULTAD DE EJERCICIO
  static determineDifficulty(exercise: Exercise, userLevel: string): 'easy' | 'medium' | 'hard' {
    // Lógica simple basada en el nivel
    if (exercise.level === userLevel) return 'medium';
    if (exercise.level < userLevel) return 'easy';
    return 'hard';
  }
  
  // NUEVA FUNCIÓN: Mejorar robustez de IA
  static async generateSmartExerciseEnhanced(request: SmartExerciseRequest): Promise<SmartExercise> {
    console.log("🤖 GENERACIÓN MEJORADA CON IA");
    
    if (!request.apiKey) {
      throw new Error("🚨 API KEY REQUERIDA - Configura Google AI Studio");
    }
    
    let attempts = 0;
    const maxAttempts = 3; // Conservador para no sobrecargar
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 INTENTO IA ${attempts}/${maxAttempts}`);
      
      try {
        const aiExercise = await this.generateAIExercise(request);
        if (aiExercise) {
          console.log("✅ IA EXITOSA - Ejercicio único generado");
          return aiExercise;
        }
      } catch (error: any) {
        console.warn(`⚠️ IA intento ${attempts} falló:`, error);
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Backoff
        }
      }
    }
    
    // MANTENER el fallback existente para no romper la app
    console.warn("⚠️ IA agotada, usando sistema de emergencia existente");
    throw new Error("IA_EXHAUSTED"); // El código existente manejará esto
  }
  
  // MÉTODO ELIMINADO - NO MÁS EJERCICIOS ESTÁTICOS DE EMERGENCIA
}