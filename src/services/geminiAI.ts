import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeneratedExercise {
  question: string;
  instruction: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  xpReward: number;
}

export class PersonalizedLessonGenerator {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

    async generateMultipleChoiceExercise(params: {
    level: "A1" | "A2" | "B1" | "B2";
    topic: string;
    exerciseNumber: number;
    userWeaknesses?: string[];
    userStrengths?: string[];
    completedLessons?: number;
    currentAccuracy?: number;
    currentStreak?: number;
    usedTopics?: string[];
    previousErrors?: string[];
    timestamp?: number;
  }): Promise<GeneratedExercise> {
    // PROMPT MEJORADO para ejercicios más únicos
    const enhancedPrompt = `Eres un profesor experto de inglés. Crea un ejercicio COMPLETAMENTE ÚNICO para hispanohablantes nivel ${params.level}.

CONTEXTO ÚNICO: Timestamp ${Date.now()} - Ejercicio #${params.exerciseNumber}
TEMA: ${params.topic}
DEBILIDADES DEL USUARIO: ${params.userWeaknesses?.join(', ') || 'ninguna'}

TIPOS DE EJERCICIO (rotar según número):
${params.exerciseNumber % 4 === 0 ? 'VOCABULARIO: Palabra inglesa → opciones en español' : ''}
${params.exerciseNumber % 4 === 1 ? 'GRAMÁTICA: Oración con espacio → opciones gramática inglesa' : ''}
${params.exerciseNumber % 4 === 2 ? 'TRADUCCIÓN: Frase español → opciones traducción inglesa' : ''}
${params.exerciseNumber % 4 === 3 ? 'COMPRENSIÓN: Texto inglés corto + pregunta → opciones respuesta' : ''}

CONTEXTOS MODERNOS OBLIGATORIOS (usar uno):
- Usando apps como Uber Eats, Instagram, TikTok
- Trabajando remotamente en Zoom calls
- Viendo Netflix/streaming
- Comprando en Amazon online
- Chateando por WhatsApp
- Dejando reviews en Google

REGLAS CRÍTICAS:
🇬🇧 PREGUNTA: Siempre en INGLÉS
🇪🇸 EXPLICACIÓN: Siempre en ESPAÑOL PERFECTO para principiantes
📱 CONTEXTO: Usar vocabulario moderno 2024
❌ OPCIONES: Sin letras A) B) C) D) (se agregan automáticamente)

JSON REQUERIDO:
{
  "question": "[Pregunta en inglés con contexto moderno]",
  "instruction": "Selecciona la respuesta correcta",
  "options": ["opción1", "opción2", "opción3", "opción4"],
  "correctAnswer": 0,
  "explanation": "🎯 [Explicación detallada en español perfecto para principiantes, explicando por qué es correcta y por qué las otras están mal]"
}`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.95, // Más creatividad
          topP: 0.9,
          maxOutputTokens: 1024,
        },
      });

      console.log("🤖 GENERANDO CON PROMPT MEJORADO");
      const result = await model.generateContent(enhancedPrompt);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const exerciseData = JSON.parse(jsonMatch[0]);
      
      // VALIDACIÓN MEJORADA
      if (!exerciseData.question || !exerciseData.options || exerciseData.options.length !== 4) {
        throw new Error("Invalid exercise structure");
      }

      // MEJORAR explicación si está en inglés
      if (exerciseData.explanation && !exerciseData.explanation.includes('🎯')) {
        exerciseData.explanation = `🎯 NIVEL ${params.level}: ${exerciseData.explanation}. Esta estructura es muy común en inglés moderno.`;
      }

      // Mezclar opciones (MANTENER lógica existente)
      const correctAnswerText = exerciseData.options[exerciseData.correctAnswer];
      const shuffledOptions = [...exerciseData.options].sort(() => Math.random() - 0.5);
      const newCorrectAnswer = shuffledOptions.findIndex(option => option === correctAnswerText);

      return {
        question: exerciseData.question,
        instruction: exerciseData.instruction || "Selecciona la respuesta correcta",
        options: shuffledOptions,
        correctAnswer: newCorrectAnswer,
        explanation: exerciseData.explanation,
        xpReward: 10,
      };

    } catch (error: any) {
      console.error("🚨 ERROR IA MEJORADA:", error);
      throw error; // Dejar que el sistema existente maneje el error
    }
  }

  // MÉTODO ELIMINADO - NO MÁS EJERCICIOS ESTÁTICOS

  /**
   * Genera ejemplos específicos para cada tipo de ejercicio
   */
  private getExampleForType(type: string, context: string): string {
    const examples: Record<string, string> = {
      "VOCABULARY": `"What does 'swipe' mean in '${context}'?" → A) deslizar ✓ B) tocar C) presionar D) escribir`,
      "GRAMMAR": `"I ____ ${context} every day." → A) have been doing ✓ B) am doing C) did D) will do`,
      "TRANSLATION": `"¿Cómo se dice 'me encanta esto' when ${context}?" → A) I love this ✓ B) I like this C) I want this D) I need this`,
      "COMPREHENSION": `"Sarah was ${context} when her phone died. What happened?" → A) Her phone died ✓ B) She was happy C) She was working D) She was sleeping`
    };

    return examples[type] || `Example for ${type} in context of ${context}`;
  }
}
