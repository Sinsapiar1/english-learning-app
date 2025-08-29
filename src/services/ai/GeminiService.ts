/**
 * GEMINI AI SERVICE - GENERACIÓN INTELIGENTE DE EJERCICIOS
 * English Master App - Sistema de IA con Validación Pedagógica
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PromptTemplates, ExercisePromptParams } from './PromptTemplates';
import { Level } from '../../types/progress';

export interface Exercise {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'conversation' | 'listening';
  situation: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  level: Level;
  skill_focus: string;
  difficulty: number; // 0-1 scale
}

export interface ExerciseValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  pedagogicalScore: number; // 0-1
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * GENERAR EJERCICIOS ESPECÍFICOS POR NIVEL
   */
  async generateExercises(params: ExercisePromptParams): Promise<Exercise[]> {
    try {
      console.log(`🤖 Generando ejercicios ${params.level} para usuario ${params.userId}`);
      
      const prompt = PromptTemplates.getPromptForLevel(params.level, params);
      
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parsear respuesta JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se pudo extraer JSON de la respuesta de IA');
      }

      const exerciseData = JSON.parse(jsonMatch[0]);
      
      if (!exerciseData.exercises || !Array.isArray(exerciseData.exercises)) {
        throw new Error('Formato de ejercicios inválido');
      }

      // Validar y procesar ejercicios
      const validatedExercises: Exercise[] = [];
      
      for (let i = 0; i < exerciseData.exercises.length; i++) {
        const exercise = exerciseData.exercises[i];
        
        // Validación pedagógica
        const validation = this.validateExercise(exercise, params.level);
        
        if (validation.isValid) {
          // Generar ID único y procesar ejercicio
          const processedExercise: Exercise = {
            ...exercise,
            id: `${params.level.toLowerCase()}_${Date.now()}_${i}`,
            correct_answer: typeof exercise.correct_answer === 'string' ? 
              exercise.options.indexOf(exercise.correct_answer) : exercise.correct_answer,
            difficulty: this.calculateDifficulty(exercise, params.level)
          };

          // Mezclar opciones manteniendo respuesta correcta
          const shuffledExercise = this.shuffleOptions(processedExercise);
          validatedExercises.push(shuffledExercise);
          
          console.log(`✅ Ejercicio ${i + 1} validado: ${exercise.skill_focus}`);
        } else {
          console.warn(`❌ Ejercicio ${i + 1} rechazado:`, validation.errors);
        }
      }

      if (validatedExercises.length === 0) {
        throw new Error('No se generaron ejercicios válidos');
      }

      console.log(`🎯 ${validatedExercises.length} ejercicios ${params.level} generados exitosamente`);
      return validatedExercises;

    } catch (error) {
      console.error('❌ Error generando ejercicios:', error);
      
      // Fallback a ejercicios de emergencia
      return this.generateEmergencyExercises(params.level);
    }
  }

  /**
   * VALIDACIÓN PEDAGÓGICA ESTRICTA
   */
  private validateExercise(exercise: any, level: Level): ExerciseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let pedagogicalScore = 1.0;

    // Validaciones básicas de estructura
    if (!exercise.question || typeof exercise.question !== 'string') {
      errors.push('Pregunta faltante o inválida');
    }

    if (!exercise.options || !Array.isArray(exercise.options) || exercise.options.length !== 4) {
      errors.push('Debe tener exactamente 4 opciones');
    }

    if (typeof exercise.correct_answer !== 'number' && typeof exercise.correct_answer !== 'string') {
      errors.push('Respuesta correcta inválida');
    }

    if (!exercise.explanation || typeof exercise.explanation !== 'string') {
      errors.push('Explicación faltante');
    }

    // Validaciones específicas por nivel
    if (level === 'A1') {
      const validation = this.validateA1Exercise(exercise);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
      pedagogicalScore *= validation.score;
    } else if (level === 'A2') {
      const validation = this.validateA2Exercise(exercise);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
      pedagogicalScore *= validation.score;
    }

    // Validar lógica social básica
    const socialValidation = this.validateSocialLogic(exercise);
    if (!socialValidation.isValid) {
      errors.push(...socialValidation.errors);
      pedagogicalScore *= 0.5;
    }

    // Validar diversidad de opciones
    const diversityValidation = this.validateOptionDiversity(exercise.options);
    if (!diversityValidation.isValid) {
      warnings.push(...diversityValidation.warnings);
      pedagogicalScore *= 0.9;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      pedagogicalScore
    };
  }

  /**
   * VALIDACIÓN ESPECÍFICA A1 - CRÍTICA
   */
  private validateA1Exercise(exercise: any): { errors: string[], warnings: string[], score: number } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 1.0;

    // Verificar que la pregunta esté en español
    const questionLanguage = this.detectLanguage(exercise.question);
    if (questionLanguage !== 'spanish') {
      errors.push('A1: La pregunta debe estar en ESPAÑOL');
      score *= 0.1;
    }

    // Verificar que las opciones estén en inglés
    const optionsInEnglish = exercise.options.every((option: string) => {
      const lang = this.detectLanguage(option);
      return lang === 'english';
    });

    if (!optionsInEnglish) {
      errors.push('A1: Todas las opciones deben estar en INGLÉS');
      score *= 0.3;
    }

    // Verificar situaciones de supervivencia
    const isSurvivalSituation = this.isSurvivalSituation(exercise.situation || exercise.question);
    if (!isSurvivalSituation) {
      errors.push('A1: Debe ser una situación de supervivencia básica');
      score *= 0.5;
    }

    // Verificar vocabulario básico
    const hasAdvancedVocabulary = this.hasAdvancedVocabulary(exercise.options.join(' '));
    if (hasAdvancedVocabulary) {
      warnings.push('A1: Contiene vocabulario avanzado');
      score *= 0.8;
    }

    return { errors, warnings, score };
  }

  /**
   * VALIDACIÓN ESPECÍFICA A2
   */
  private validateA2Exercise(exercise: any): { errors: string[], warnings: string[], score: number } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 1.0;

    // A2 puede tener 70% español, 30% inglés
    const questionLanguage = this.detectLanguage(exercise.question);
    if (questionLanguage === 'unknown') {
      warnings.push('A2: Idioma de pregunta no detectado claramente');
      score *= 0.9;
    }

    // Verificar gramática apropiada para A2
    const hasA2Grammar = this.hasA2Grammar(exercise.question + ' ' + exercise.options.join(' '));
    if (!hasA2Grammar) {
      warnings.push('A2: Debería incluir gramática de nivel A2');
      score *= 0.8;
    }

    return { errors, warnings, score };
  }

  /**
   * VALIDAR LÓGICA SOCIAL
   */
  private validateSocialLogic(exercise: any): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];
    
    const situation = (exercise.situation || exercise.question).toLowerCase();
    const correctOption = exercise.options[
      typeof exercise.correct_answer === 'number' ? 
      exercise.correct_answer : 
      exercise.options.indexOf(exercise.correct_answer)
    ]?.toLowerCase() || '';

    // Reglas de lógica social
    const socialRules = [
      {
        condition: situation.includes('dice hello') || situation.includes('saluda'),
        expectedResponses: ['hello', 'hi', 'good morning'],
        name: 'Responder saludo'
      },
      {
        condition: situation.includes('te da') || situation.includes('gives you'),
        expectedResponses: ['thank you', 'thanks', 'gracias'],
        name: 'Agradecer cuando reciben algo'
      },
      {
        condition: situation.includes('dice thank you') || situation.includes('te agradece'),
        expectedResponses: ['you\'re welcome', 'no problem', 'de nada'],
        name: 'Responder a agradecimiento'
      }
    ];

    for (const rule of socialRules) {
      if (rule.condition) {
        const isLogical = rule.expectedResponses.some(expected => 
          correctOption.includes(expected.toLowerCase())
        );
        
        if (!isLogical) {
          errors.push(`Lógica social incorrecta: ${rule.name}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * UTILIDADES DE VALIDACIÓN
   */
  private detectLanguage(text: string): 'spanish' | 'english' | 'unknown' {
    const spanishWords = ['qué', 'cómo', 'dónde', 'cuándo', 'por', 'para', 'con', 'sin', 'te', 'le', 'se', 'es', 'está'];
    const englishWords = ['what', 'how', 'where', 'when', 'the', 'and', 'you', 'are', 'is', 'can', 'do', 'have'];
    
    const lowerText = text.toLowerCase();
    const spanishCount = spanishWords.filter(word => lowerText.includes(word)).length;
    const englishCount = englishWords.filter(word => lowerText.includes(word)).length;
    
    if (spanishCount > englishCount) return 'spanish';
    if (englishCount > spanishCount) return 'english';
    return 'unknown';
  }

  private isSurvivalSituation(text: string): boolean {
    const survivalKeywords = [
      'saluda', 'hello', 'hola', 'dice',
      'da', 'gives', 'comida', 'food',
      'thank you', 'gracias', 'agradece',
      'nombre', 'name', 'llamas',
      'hambre', 'hungry', 'sed', 'thirsty',
      'baño', 'bathroom', 'perdido', 'lost',
      'ayuda', 'help', 'excuse me'
    ];
    
    const lowerText = text.toLowerCase();
    return survivalKeywords.some(keyword => lowerText.includes(keyword));
  }

  private hasAdvancedVocabulary(text: string): boolean {
    const advancedWords = [
      'sophisticated', 'comprehensive', 'substantial', 'significant',
      'consequently', 'nevertheless', 'furthermore', 'moreover',
      'perspective', 'analyze', 'evaluate', 'implement'
    ];
    
    const lowerText = text.toLowerCase();
    return advancedWords.some(word => lowerText.includes(word));
  }

  private hasA2Grammar(text: string): boolean {
    const a2Patterns = [
      'went', 'did', 'was', 'were', // Past simple
      'going to', 'will', // Future
      'have been', 'has been', // Present perfect
      'would like', 'prefer' // Preferences
    ];
    
    const lowerText = text.toLowerCase();
    return a2Patterns.some(pattern => lowerText.includes(pattern));
  }

  private validateOptionDiversity(options: string[]): { isValid: boolean, warnings: string[] } {
    const warnings: string[] = [];
    
    // Verificar longitud similar
    const lengths = options.map(opt => opt.length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const hasVariedLengths = lengths.some(len => Math.abs(len - avgLength) > avgLength * 0.5);
    
    if (!hasVariedLengths) {
      warnings.push('Opciones tienen longitud muy similar');
    }

    // Verificar diversidad semántica
    const uniqueWords = new Set();
    options.forEach(option => {
      option.toLowerCase().split(' ').forEach(word => uniqueWords.add(word));
    });
    
    if (uniqueWords.size < options.length * 2) {
      warnings.push('Opciones semánticamente muy similares');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * MEZCLAR OPCIONES MANTENIENDO RESPUESTA CORRECTA
   */
  private shuffleOptions(exercise: Exercise): Exercise {
    const correctAnswerText = exercise.options[exercise.correct_answer];
    
    // Fisher-Yates shuffle
    const shuffledOptions = [...exercise.options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    
    // Encontrar nueva posición de la respuesta correcta
    const newCorrectAnswer = shuffledOptions.findIndex(option => option === correctAnswerText);
    
    return {
      ...exercise,
      options: shuffledOptions,
      correct_answer: newCorrectAnswer
    };
  }

  /**
   * CALCULAR DIFICULTAD DEL EJERCICIO
   */
  private calculateDifficulty(exercise: any, level: Level): number {
    let difficulty = 0.5; // Base

    // Ajustar por nivel
    const levelDifficulties = { A1: 0.2, A2: 0.4, B1: 0.6, B2: 0.8 };
    difficulty = levelDifficulties[level];

    // Ajustar por longitud de pregunta
    const questionLength = exercise.question.length;
    if (questionLength > 100) difficulty += 0.1;
    if (questionLength > 150) difficulty += 0.1;

    // Ajustar por vocabulario
    const hasAdvancedVocab = this.hasAdvancedVocabulary(exercise.options.join(' '));
    if (hasAdvancedVocab) difficulty += 0.2;

    return Math.min(1, Math.max(0, difficulty));
  }

  /**
   * EJERCICIOS DE EMERGENCIA POR NIVEL
   */
  private generateEmergencyExercises(level: Level): Exercise[] {
    const emergencyExercises = {
      A1: [
        {
          id: 'emergency_a1_001',
          type: 'multiple_choice' as const,
          situation: 'Te encuentras con un compañero y te dice Hello',
          question: '¿Qué debes responder para ser educado?',
          options: ['Hello', 'You\'re welcome', 'I\'m sorry', 'Goodbye'],
          correct_answer: 0,
          explanation: 'Cuando alguien te saluda con "Hello", debes saludar de vuelta. Es cortesía básica.',
          level: 'A1' as Level,
          skill_focus: 'social_greetings',
          difficulty: 0.2
        },
        {
          id: 'emergency_a1_002',
          type: 'multiple_choice' as const,
          situation: 'Te dan comida en un restaurante',
          question: '¿Qué dices para agradecer?',
          options: ['Thank you', 'Hello', 'Goodbye', 'You\'re welcome'],
          correct_answer: 0,
          explanation: 'Cuando alguien te da algo, debes agradecer diciendo "Thank you".',
          level: 'A1' as Level,
          skill_focus: 'courtesy',
          difficulty: 0.2
        }
      ],
      A2: [
        {
          id: 'emergency_a2_001',
          type: 'multiple_choice' as const,
          situation: 'Tu amigo pregunta sobre tu fin de semana',
          question: '¿Cómo dices que fuiste al cine ayer?',
          options: ['I went to the movies yesterday', 'I go to movies', 'I will go to movies', 'I am going to movies'],
          correct_answer: 0,
          explanation: 'Para hablar del pasado usamos "went" (pasado de "go").',
          level: 'A2' as Level,
          skill_focus: 'past_experiences',
          difficulty: 0.4
        }
      ],
      B1: [
        {
          id: 'emergency_b1_001',
          type: 'multiple_choice' as const,
          situation: 'In a job interview context',
          question: 'How would you express your motivation for the position?',
          options: ['I believe I can contribute to the team', 'I need money', 'I like jobs', 'This is a company'],
          correct_answer: 0,
          explanation: 'Professional responses should focus on contribution and value.',
          level: 'B1' as Level,
          skill_focus: 'work_situations',
          difficulty: 0.6
        }
      ],
      B2: [
        {
          id: 'emergency_b2_001',
          type: 'multiple_choice' as const,
          situation: 'Business meeting discussion',
          question: 'How do you diplomatically present a counterargument?',
          options: ['While I understand your perspective, I\'d like to propose...', 'You are wrong', 'That\'s not good', 'I disagree'],
          correct_answer: 0,
          explanation: 'Professional communication requires diplomatic language and respect.',
          level: 'B2' as Level,
          skill_focus: 'professional_communication',
          difficulty: 0.8
        }
      ]
    };

    console.log(`🚨 Usando ejercicios de emergencia para nivel ${level}`);
    return emergencyExercises[level] || emergencyExercises.A1;
  }
}