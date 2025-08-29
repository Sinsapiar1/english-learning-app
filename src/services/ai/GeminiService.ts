/**
 * GEMINI AI SERVICE - GENERACIÓN INTELIGENTE DE EJERCICIOS
 * English Master App - Sistema de IA con Validación Pedagógica
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PromptTemplates, ExercisePromptParams } from './PromptTemplates';
import { DiversityEngine } from './DiversityEngine';
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
  private diversityEngine: DiversityEngine;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.diversityEngine = new DiversityEngine();
  }

  /**
   * GENERAR EJERCICIOS ESPECÍFICOS POR NIVEL CON DIVERSIDAD GARANTIZADA
   */
  async generateExercises(params: ExercisePromptParams): Promise<Exercise[]> {
    try {
      console.log(`🎯 Generando ejercicios DIVERSOS ${params.level} para usuario ${params.userId}`);
      
      // 🚀 USAR DIVERSITY ENGINE PARA GARANTIZAR VARIEDAD
      const diverseExercises = await this.diversityEngine.generateDiverseExercises(
        params.userId,
        params.level,
        8 // Siempre 8 ejercicios
      );

      // Procesar con IA real si hay ejercicios diversos
      if (diverseExercises.length > 0) {
        const processedExercises = await this.enhanceWithAI(diverseExercises, params);
        
        if (processedExercises.length >= 4) { // Mínimo 4 ejercicios válidos
          console.log(`✅ ${processedExercises.length} ejercicios DIVERSOS generados exitosamente`);
          return processedExercises;
        }
      }

      // Fallback: generar con constraints estrictos
      console.warn('⚠️ Diversity engine falló, usando método alternativo');
      return await this.generateWithStrictConstraints(params);

    } catch (error) {
      console.error('❌ Error generando ejercicios diversos:', error);
      
      // Último recurso: ejercicios de emergencia ÚNICOS
      return this.generateEmergencyExercisesUnique(params.level, params.userId);
    }
  }

  /**
   * MEJORAR EJERCICIOS DIVERSOS CON IA
   */
  private async enhanceWithAI(diverseExercises: any[], params: ExercisePromptParams): Promise<Exercise[]> {
    const enhancedExercises: Exercise[] = [];

    for (const baseExercise of diverseExercises) {
      try {
        const enhancedPrompt = `MEJORA ESTE EJERCICIO BASE MANTENIENDO SU UNIQUENESS:

EJERCICIO BASE:
${JSON.stringify(baseExercise, null, 2)}

REGLAS ESTRICTAS:
1. MANTENER la situación exacta: "${baseExercise.situation}"
2. MANTENER el skill focus: "${baseExercise.skill_focus}"
3. MEJORAR la pregunta para ser más natural y pedagógica
4. GENERAR opciones completamente diferentes pero lógicas
5. NUNCA usar estas frases prohibidas: "Good morning", "Hello", "Thank you", "I'm hungry"

FORMATO JSON EXACTO:
{
  "id": "${baseExercise.id}",
  "type": "multiple_choice",
  "situation": "${baseExercise.situation}",
  "question": "[PREGUNTA MEJORADA EN ESPAÑOL]",
  "options": ["[opción única 1]", "[opción única 2]", "[opción única 3]", "[opción única 4]"],
  "correct_answer": 0,
  "explanation": "[Explicación pedagógica detallada]",
  "level": "${params.level}",
  "skill_focus": "${baseExercise.skill_focus}",
  "difficulty": ${baseExercise.difficulty}
}`;

        const model = this.genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.9, // Más creatividad para diversidad
            topP: 0.9,
            topK: 50,
            maxOutputTokens: 1024,
          }
        });

        const result = await model.generateContent(enhancedPrompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const enhancedExercise = JSON.parse(jsonMatch[0]);
          
          // Validar que es realmente diferente
          if (this.validateUniqueness(enhancedExercise, enhancedExercises)) {
            const processedExercise = this.shuffleOptions(enhancedExercise as Exercise);
            enhancedExercises.push(processedExercise);
            console.log(`✅ Ejercicio mejorado: ${enhancedExercise.skill_focus}`);
          }
        }
      } catch (error) {
        console.warn('⚠️ Error mejorando ejercicio:', error);
      }
    }

    return enhancedExercises;
  }

  /**
   * GENERAR CON CONSTRAINTS ESTRICTOS (FALLBACK)
   */
  private async generateWithStrictConstraints(params: ExercisePromptParams): Promise<Exercise[]> {
    const uniquePrompt = `GENERA 8 EJERCICIOS COMPLETAMENTE ÚNICOS PARA NIVEL ${params.level}

🚨 CONSTRAINTS ESTRICTOS:
1. CADA EJERCICIO debe tener una situación COMPLETAMENTE DIFERENTE
2. NUNCA repetir estas frases: "Good morning", "Hello", "Thank you", "I'm hungry", "What time is it", "My name is"
3. Usar situaciones ESPECÍFICAS y REALISTAS
4. Variar entre diferentes skills: social_greetings, basic_needs, courtesy, personal_info, emergency_help

EJEMPLOS DE SITUACIONES ÚNICAS:
- "Estás en el dentista y necesitas explicar que te duele"
- "Un compañero de trabajo te invita a almorzar"
- "Necesitas pedir direcciones para llegar al aeropuerto"
- "Tu vecino te pregunta si puedes cuidar su gato"
- "Estás en una farmacia y necesitas medicina"

FORMATO JSON - 8 EJERCICIOS ÚNICOS:
{
  "exercises": [
    {
      "id": "unique_${Date.now()}_1",
      "situation": "[SITUACIÓN COMPLETAMENTE ÚNICA]",
      "question": "[PREGUNTA ÚNICA EN ESPAÑOL]",
      "options": ["[opción 1]", "[opción 2]", "[opción 3]", "[opción 4]"],
      "correct_answer": 0,
      "explanation": "[Explicación pedagógica]",
      "level": "${params.level}",
      "skill_focus": "[skill específico]"
    }
  ]
}`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 1.0, // Máxima creatividad
          topP: 0.95,
          topK: 60,
          maxOutputTokens: 3000,
        }
      });

      const result = await model.generateContent(uniquePrompt);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.exercises.map((ex: any, i: number) => this.shuffleOptions({
          ...ex,
          id: `unique_${params.userId}_${Date.now()}_${i}`,
          difficulty: this.calculateDifficulty(ex, params.level)
        }));
      }
    } catch (error) {
      console.error('❌ Error con constraints estrictos:', error);
    }

    return this.generateEmergencyExercisesUnique(params.level, params.userId);
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
   * VALIDAR UNIQUENESS DE EJERCICIOS
   */
  private validateUniqueness(exercise: any, existingExercises: Exercise[]): boolean {
    // Verificar que no sea similar a ejercicios existentes
    const questionWords = exercise.question.toLowerCase().split(' ');
    
    for (const existing of existingExercises) {
      const existingWords = existing.question.toLowerCase().split(' ');
      const commonWords = questionWords.filter((word: string) => existingWords.includes(word));
      
      // Si más del 50% de palabras son comunes, rechazar
      if (commonWords.length > questionWords.length * 0.5) {
        console.warn(`❌ Ejercicio muy similar rechazado: ${exercise.question}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * GENERAR EJERCICIOS DE EMERGENCIA POR NIVEL REAL
   */
  private generateEmergencyExercisesUnique(level: Level, userId: string): Exercise[] {
    const timestamp = Date.now();
    
    // 🚨 CRÍTICO: Ejercicios específicos por nivel real
    const emergencyBank: Record<Level, any[]> = {
      A1: [
        {
          id: `emergency_${userId}_${timestamp}_1`,
          situation: "Estás en el dentista y necesitas explicar que te duele una muela",
          question: "¿Cómo expresas que tienes dolor de muelas?",
          options: ["My tooth hurts", "I'm happy", "I'm cold", "I'm tired"],
          correct_answer: 0,
          explanation: "Para expresar dolor usamos 'hurts'. 'My tooth hurts' = Me duele la muela.",
          skill_focus: "health_emergencies"
        },
        {
          id: `emergency_${userId}_${timestamp}_2`,
          situation: "Un compañero de trabajo te invita a almorzar",
          question: "¿Cómo aceptas la invitación educadamente?",
          options: ["Yes, I'd like that", "No, never", "Maybe tomorrow", "I don't know"],
          correct_answer: 0,
          explanation: "'Yes, I'd like that' es una forma educada de aceptar una invitación.",
          skill_focus: "workplace_social"
        },
        {
          id: `emergency_${userId}_${timestamp}_3`,
          situation: "Necesitas pedir direcciones para llegar al aeropuerto",
          question: "¿Cómo pides direcciones al aeropuerto?",
          options: ["How do I get to the airport?", "Where is food?", "What time is it?", "I like planes"],
          correct_answer: 0,
          explanation: "'How do I get to...' es la forma correcta de pedir direcciones.",
          skill_focus: "navigation"
        },
        {
          id: `emergency_${userId}_${timestamp}_4`,
          situation: "Tu vecino te pregunta si puedes cuidar su gato mientras viaja",
          question: "¿Cómo respondes que sí puedes ayudar?",
          options: ["Sure, I can help", "I hate cats", "Maybe not", "I don't understand"],
          correct_answer: 0,
          explanation: "'Sure, I can help' es una respuesta positiva y útil para ofrecer ayuda.",
          skill_focus: "neighborly_help"
        },
        {
          id: `emergency_${userId}_${timestamp}_5`,
          situation: "Estás en una farmacia y necesitas medicina para el dolor de cabeza",
          question: "¿Cómo pides medicina para el dolor de cabeza?",
          options: ["I need something for headache", "I want candy", "Where is water?", "I'm very happy"],
          correct_answer: 0,
          explanation: "'I need something for...' es la forma correcta de pedir medicina específica.",
          skill_focus: "pharmacy_needs"
        },
        {
          id: `emergency_${userId}_${timestamp}_6`,
          situation: "Llegas tarde al trabajo y necesitas disculparte con tu jefe",
          question: "¿Cómo te disculpas por llegar tarde?",
          options: ["Sorry I'm late", "Hello boss", "Good morning", "I'm here now"],
          correct_answer: 0,
          explanation: "'Sorry I'm late' es la disculpa apropiada cuando llegas tarde.",
          skill_focus: "workplace_apology"
        },
        {
          id: `emergency_${userId}_${timestamp}_7`,
          situation: "Estás en un restaurante y la comida está fría",
          question: "¿Cómo reportas que la comida está fría?",
          options: ["This food is cold", "I'm very cold", "The weather is cold", "Cold is good"],
          correct_answer: 0,
          explanation: "'This food is cold' identifica específicamente el problema con la comida.",
          skill_focus: "restaurant_complaints"
        },
        {
          id: `emergency_${userId}_${timestamp}_8`,
          situation: "Un turista te pregunta dónde está la estación de tren",
          question: "¿Cómo direccionas a alguien hacia la estación de tren?",
          options: ["The train station is over there", "I don't like trains", "Trains are fast", "What is a train?"],
          correct_answer: 0,
          explanation: "Para dar direcciones usamos 'The [lugar] is over there' (está por allá).",
          skill_focus: "giving_directions"
        }
      ],
      A2: [
        {
          id: `emergency_${userId}_${timestamp}_1`,
          situation: "En una reunión de trabajo, tu jefe pregunta tu opinión sobre el nuevo proyecto",
          question: "¿Cómo expresas una opinión profesional pero con reservas?",
          options: ["While I see the potential, I have some concerns about the timeline", "I don't like it", "Maybe it's good", "I think it's okay"],
          correct_answer: 0,
          explanation: "Para expresar reservas profesionalmente, usamos 'While I see... I have concerns about...'",
          skill_focus: "professional_opinions"
        },
        {
          id: `emergency_${userId}_${timestamp}_2`,
          situation: "Estás describiendo un problema técnico complejo a un colega",
          question: "¿Cómo explicas que el sistema ha estado fallando intermitentemente?",
          options: ["The system has been experiencing intermittent failures", "The computer is broken sometimes", "It doesn't work good", "There are problems"],
          correct_answer: 0,
          explanation: "'Intermittent failures' es el término técnico correcto para fallas esporádicas.",
          skill_focus: "technical_communication"
        }
      ],
      B1: [
        {
          id: `emergency_${userId}_${timestamp}_1`,
          situation: "En una negociación comercial, necesitas proponer una alternativa",
          question: "¿Cómo sugieres una alternativa manteniendo la flexibilidad?",
          options: ["Perhaps we could explore alternative approaches that might better serve both parties", "Maybe we can do something else", "I have another idea", "What about this option?"],
          correct_answer: 0,
          explanation: "En negociaciones, 'explore alternative approaches that serve both parties' es diplomático y profesional.",
          skill_focus: "business_negotiation"
        },
        {
          id: `emergency_${userId}_${timestamp}_2`,
          situation: "Estás presentando datos contradictorios en una investigación",
          question: "¿Cómo presentas hallazgos que contradicen la hipótesis inicial?",
          options: ["Contrary to our initial hypothesis, the data suggests a different pattern", "The results are wrong", "We were mistaken", "The numbers don't match"],
          correct_answer: 0,
          explanation: "'Contrary to our initial hypothesis, the data suggests...' es la forma académica correcta.",
          skill_focus: "academic_presentation"
        }
      ],
      B2: [
        {
          id: `emergency_${userId}_${timestamp}_1`,
          situation: "En un debate académico sobre políticas públicas",
          question: "¿Cómo articulas una crítica constructiva a una propuesta gubernamental?",
          options: ["While the policy addresses legitimate concerns, its implementation framework may inadvertently exacerbate existing inequalities", "The government policy is bad", "I disagree with this law", "This won't work"],
          correct_answer: 0,
          explanation: "Crítica académica requiere 'While... addresses legitimate concerns, its implementation may inadvertently...'",
          skill_focus: "policy_analysis"
        },
        {
          id: `emergency_${userId}_${timestamp}_2`,
          situation: "Moderando una discusión entre expertos con opiniones divergentes",
          question: "¿Cómo facilitas consenso entre perspectivas aparentemente irreconciliables?",
          options: ["Perhaps we can synthesize these seemingly divergent viewpoints by identifying underlying commonalities", "Let's agree to disagree", "Both sides have points", "We need to find middle ground"],
          correct_answer: 0,
          explanation: "'Synthesize divergent viewpoints by identifying underlying commonalities' es facilitación experta.",
          skill_focus: "expert_moderation"
        },
        {
          id: `emergency_${userId}_${timestamp}_3`,
          situation: "Analizando las implicaciones éticas de una innovación tecnológica",
          question: "¿Cómo evalúas los dilemas éticos de la IA en medicina?",
          options: ["The ethical implications of AI in healthcare necessitate a nuanced examination of autonomy, beneficence, and distributive justice", "AI in medicine has ethical problems", "We need to be careful with medical AI", "There are moral issues to consider"],
          correct_answer: 0,
          explanation: "Análisis ético académico requiere terminología específica: 'autonomy, beneficence, distributive justice'.",
          skill_focus: "ethical_analysis"
        },
        {
          id: `emergency_${userId}_${timestamp}_4`,
          situation: "Presentando una propuesta de investigación interdisciplinaria",
          question: "¿Cómo justificas la metodología mixta en tu estudio?",
          options: ["This mixed-methods approach leverages quantitative rigor while capturing qualitative nuances that purely statistical analyses might overlook", "We use both numbers and interviews", "Mixed methods work better", "We combine different research types"],
          correct_answer: 0,
          explanation: "Justificación metodológica académica: 'leverages quantitative rigor while capturing qualitative nuances'.",
          skill_focus: "research_methodology"
        },
        {
          id: `emergency_${userId}_${timestamp}_5`,
          situation: "Debatiendo sobre sostenibilidad corporativa en un foro internacional",
          question: "¿Cómo criticas el 'greenwashing' corporativo de manera académicamente rigurosa?",
          options: ["Corporate sustainability initiatives often constitute performative environmentalism that obscures rather than addresses systemic ecological challenges", "Companies pretend to be green", "Greenwashing is bad", "Corporations lie about environment"],
          correct_answer: 0,
          explanation: "'Performative environmentalism that obscures systemic ecological challenges' es crítica académica rigurosa.",
          skill_focus: "corporate_sustainability_analysis"
        },
        {
          id: `emergency_${userId}_${timestamp}_6`,
          situation: "Facilitando un workshop sobre innovación disruptiva",
          question: "¿Cómo explicas por qué las empresas establecidas fallan ante la disrupción?",
          options: ["Incumbent organizations often suffer from competency traps and institutional inertia that impede adaptive responses to paradigmatic shifts", "Big companies are slow to change", "Old businesses resist innovation", "Established firms don't adapt well"],
          correct_answer: 0,
          explanation: "'Competency traps and institutional inertia impeding adaptive responses to paradigmatic shifts' es terminología de management strategy.",
          skill_focus: "strategic_innovation"
        },
        {
          id: `emergency_${userId}_${timestamp}_7`,
          situation: "Analizando tendencias geopolíticas en una conferencia internacional",
          question: "¿Cómo describes el impacto de la multipolaridad en las relaciones internacionales?",
          options: ["The emergence of multipolarity fundamentally reconfigures traditional alliance structures and necessitates more nuanced diplomatic strategies", "Many countries are becoming powerful", "The world is changing politically", "International relations are complex now"],
          correct_answer: 0,
          explanation: "'Multipolarity reconfigures alliance structures and necessitates nuanced diplomatic strategies' es análisis geopolítico experto.",
          skill_focus: "geopolitical_analysis"
        },
        {
          id: `emergency_${userId}_${timestamp}_8`,
          situation: "Discutiendo neuroplasticidad en un simposio científico",
          question: "¿Cómo explicas las implicaciones terapéuticas de la neuroplasticidad?",
          options: ["Neuroplasticity research suggests that targeted cognitive interventions can facilitate synaptic reorganization and functional recovery", "Brain plasticity helps therapy", "The brain can change with treatment", "Neural connections can improve"],
          correct_answer: 0,
          explanation: "'Targeted cognitive interventions facilitate synaptic reorganization and functional recovery' es terminología neurocientífica precisa.",
          skill_focus: "scientific_communication"
        }
      ],
      C1: [
        {
          id: `emergency_${userId}_${timestamp}_1`,
          situation: "Liderando una mesa redonda sobre el futuro de la inteligencia artificial en la sociedad",
          question: "¿Cómo articulas los riesgos existenciales de la superinteligencia artificial?",
          options: ["The trajectory toward artificial general intelligence raises profound questions about existential risk mitigation and the alignment problem in advanced AI systems", "AI might be dangerous in the future", "Super smart AI could be risky", "Advanced AI systems need safety measures"],
          correct_answer: 0,
          explanation: "Discusión sobre riesgos existenciales requiere terminología específica: 'existential risk mitigation' y 'alignment problem'.",
          skill_focus: "existential_risk_analysis"
        },
        {
          id: `emergency_${userId}_${timestamp}_2`,
          situation: "Presentando una teoría revolucionaria en un congreso académico internacional",
          question: "¿Cómo introduces un paradigma que desafía los fundamentos teóricos establecidos?",
          options: ["This framework fundamentally reconceptualizes our understanding by challenging the ontological assumptions that underpin conventional theoretical paradigms", "This theory changes how we think", "Our new model is different", "This approach questions existing ideas"],
          correct_answer: 0,
          explanation: "'Reconceptualizes understanding by challenging ontological assumptions that underpin paradigms' es discurso académico de alto nivel.",
          skill_focus: "paradigm_innovation"
        },
        {
          id: `emergency_${userId}_${timestamp}_3`,
          situation: "Debatiendo sobre la epistemología de la ciencia en un simposio filosófico",
          question: "¿Cómo defiendes el realismo científico ante críticas postmodernas?",
          options: ["While acknowledging the social construction of scientific knowledge, the convergence of independent methodologies toward consistent empirical findings suggests an objective reality constraining theoretical possibilities", "Science finds real truths despite social influences", "Scientific methods reveal objective facts", "Research shows what's really true"],
          correct_answer: 0,
          explanation: "Defensa epistemológica sofisticada: 'convergence of methodologies toward empirical findings suggests objective reality constraining theoretical possibilities'.",
          skill_focus: "epistemological_argumentation"
        },
        {
          id: `emergency_${userId}_${timestamp}_4`,
          situation: "Moderando un debate sobre bioética y edición genética en humanos",
          question: "¿Cómo navegas las tensiones entre autonomía reproductiva y justicia distributiva?",
          options: ["The intersection of reproductive autonomy and distributive justice in genetic enhancement technologies necessitates a nuanced framework that balances individual liberty with societal equity concerns", "Genetic editing raises questions about fairness and choice", "Gene therapy involves personal freedom and social justice", "Genetic enhancement affects individual rights and equality"],
          correct_answer: 0,
          explanation: "Bioética avanzada: 'intersection of reproductive autonomy and distributive justice necessitates nuanced framework balancing liberty with equity'.",
          skill_focus: "advanced_bioethics"
        },
        {
          id: `emergency_${userId}_${timestamp}_5`,
          situation: "Analizando la fenomenología de la conciencia en un seminario de filosofía de la mente",
          question: "¿Cómo abordas el problema difícil de la conciencia desde una perspectiva fenomenológica?",
          options: ["The phenomenological approach to consciousness illuminates the irreducible qualitative dimension of subjective experience that resists reduction to purely computational or neurophysiological explanations", "Consciousness is hard to explain with just brain science", "Subjective experience can't be fully explained by neurons", "Personal awareness involves more than brain activity"],
          correct_answer: 0,
          explanation: "Filosofía de la mente: 'phenomenological approach illuminates irreducible qualitative dimension resisting reduction to computational explanations'.",
          skill_focus: "consciousness_studies"
        },
        {
          id: `emergency_${userId}_${timestamp}_6`,
          situation: "Discutiendo teoría de sistemas complejos en un instituto de investigación avanzada",
          question: "¿Cómo explicas la emergencia de propiedades sistémicas en redes complejas?",
          options: ["Emergent properties in complex networks arise from nonlinear interactions among heterogeneous agents, generating system-level behaviors that transcend the sum of individual component capabilities", "Complex systems create new behaviors from simple parts", "Network effects produce unexpected outcomes", "System properties emerge from component interactions"],
          correct_answer: 0,
          explanation: "Teoría de sistemas: 'nonlinear interactions among heterogeneous agents generating behaviors that transcend sum of component capabilities'.",
          skill_focus: "complex_systems_theory"
        },
        {
          id: `emergency_${userId}_${timestamp}_7`,
          situation: "Presentando investigación sobre metacognición y aprendizaje autorregulado",
          question: "¿Cómo describes los mecanismos metacognitivos en el aprendizaje experto?",
          options: ["Expert learning involves sophisticated metacognitive orchestration of cognitive resources, including strategic knowledge deployment, error monitoring, and adaptive strategy selection based on task demands", "Experts think about their thinking while learning", "Advanced learners monitor their knowledge", "Skilled people use good learning strategies"],
          correct_answer: 0,
          explanation: "Metacognición experta: 'metacognitive orchestration of resources including strategic deployment, error monitoring, adaptive selection based on task demands'.",
          skill_focus: "metacognitive_expertise"
        },
        {
          id: `emergency_${userId}_${timestamp}_8`,
          situation: "Facilitando un seminario sobre hermenéutica y interpretación textual",
          question: "¿Cómo explicas la circularidad hermenéutica en la interpretación de textos complejos?",
          options: ["The hermeneutic circle reveals how understanding emerges through the dialectical interplay between preunderstanding and textual encounter, where each interpretive iteration refines both comprehension and contextual horizon", "Understanding texts involves going back and forth between parts and whole", "Interpretation requires multiple readings to understand meaning", "Reading comprehension improves through repeated analysis"],
          correct_answer: 0,
          explanation: "Hermenéutica: 'dialectical interplay between preunderstanding and textual encounter, where interpretive iteration refines comprehension and contextual horizon'.",
          skill_focus: "hermeneutic_interpretation"
        }
      ]
    };

    const exercises = emergencyBank[level] || emergencyBank.A1;
    
    return exercises.map((ex: any) => this.shuffleOptions({
      ...ex,
      type: 'multiple_choice' as const,
      level,
      difficulty: 0.3
    } as Exercise));
  }

  /**
   * EJERCICIOS DE EMERGENCIA POR NIVEL (MÉTODO ORIGINAL MANTENIDO)
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