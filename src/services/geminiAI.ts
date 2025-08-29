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
    // Contextos modernos específicos
    const modernContexts = [
      "using Uber Eats to order food",
      "posting on Instagram stories", 
      "watching Netflix shows",
      "working from home on Zoom",
      "shopping on Amazon online",
      "chatting on WhatsApp",
      "leaving Google reviews"
    ];
    const selectedContext = modernContexts[params.exerciseNumber % modernContexts.length];

    const enhancedPrompt = `Eres un profesor experto de inglés. Crea un ejercicio LÓGICO y EDUCATIVO para hispanohablantes nivel ${params.level}.

CONTEXTO: ${selectedContext}
TEMA: ${params.topic}
EJERCICIO #: ${params.exerciseNumber}

REGLAS CRÍTICAS - EJERCICIOS DEBEN SER LÓGICOS:
❌ PROHIBIDO: Preguntas donde la respuesta obvia no esté entre las opciones
❌ PROHIBIDO: "Ordené pizza, ¿qué ordené?" con opciones irrelevantes
❌ PROHIBIDO: Preguntas confusas o que no enseñen inglés real
✅ OBLIGATORIO: Todas las opciones deben ser relevantes a la pregunta
✅ OBLIGATORIO: La respuesta correcta debe ser obvia y educativa
✅ OBLIGATORIO: Enseñar inglés real y útil

TIPOS DE EJERCICIO VÁLIDOS:

VOCABULARIO (nivel ${params.level}):
- "What does 'order' mean in 'I order food on Uber Eats'? / ¿Qué significa 'order' en 'I order food on Uber Eats'?" 
- Opciones: ["pedir/ordenar", "comer", "cocinar", "pagar"]

GRAMÁTICA:
- "I _____ pizza last night. / Yo _____ pizza anoche."
- Opciones: ["ordered", "order", "ordering", "orders"]

TRADUCCIÓN:
- "¿Cómo se dice 'pedí comida' en inglés? / How do you say 'pedí comida' in English?"
- Opciones: ["I ordered food", "I eat food", "I cook food", "I like food"]

COMPRENSIÓN:
- "Text: 'Maria ordered sushi on Uber Eats. She loves Japanese food.' Question: What kind of food does Maria like? / ¿Qué tipo de comida le gusta a María?"
- Opciones: ["Japanese food", "Italian food", "Mexican food", "Chinese food"]

INSTRUCCIONES ESPECÍFICAS PARA NIVEL ${params.level}:
${params.level === 'A1' ? `
- Usar vocabulario SÚPER básico: eat, drink, like, want, have, go, come, etc.
- Preguntas sobre: comida básica, colores, números 1-10, familia, casa
- Ejemplo: "What is this? 🍕 / ¿Qué es esto? 🍕" → opciones: ["pizza", "hamburger", "sandwich", "salad"] (CORRECTO - todas son comidas)
` : ''}

${params.level === 'A2' ? `
- Vocabulario intermedio: order, deliver, prefer, usually, sometimes, etc.
- Preguntas sobre: rutinas diarias, presente perfecto básico, preposiciones simples
- Contextos: apps de comida, trabajo, familia
` : ''}

VALIDACIÓN OBLIGATORIA:
1. ¿La pregunta tiene sentido lógico?
2. ¿Todas las opciones son relevantes?
3. ¿La respuesta correcta es obvia?
4. ¿Realmente enseña inglés útil?
5. ¿Un principiante lo entendería?

JSON REQUERIDO:
{
  "question": "[Pregunta lógica y educativa en inglés Y español separada por ' / ']",
  "instruction": "Selecciona la respuesta correcta",
  "options": ["opción relevante 1", "opción relevante 2", "opción relevante 3", "opción relevante 4"],
  "correctAnswer": 0,
  "explanation": "🎯 EXPLICACIÓN CLARA: [Por qué es correcta y qué enseña este ejercicio]"
}

EJEMPLOS DE PREGUNTAS BUENAS:
- "I _____ sushi from Uber Eats yesterday. / Yo _____ sushi de Uber Eats ayer." → ["ordered", "eat", "cook", "deliver"]
- "What does 'delivery' mean? / ¿Qué significa 'delivery'?" → ["entrega a domicilio", "cocinar", "comer", "pagar"]
- "How do you say 'me gusta la pizza'? / ¿Cómo se dice 'me gusta la pizza'?" → ["I like pizza", "I eat pizza", "I want pizza", "I cook pizza"]

¡GENERA SOLO EJERCICIOS LÓGICOS QUE REALMENTE ENSEÑEN INGLÉS!`;

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

      // MEZCLAR OPCIONES FORZADAMENTE
      const correctAnswerText = exerciseData.options[exerciseData.correctAnswer || 0];
      const shuffledOptions = [...exerciseData.options];

      // ✅ ALGORITMO FISHER-YATES PARA MEJOR MEZCLADO
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }

      const newCorrectAnswer = shuffledOptions.findIndex(option => option === correctAnswerText);

      console.log("🔀 AI SHUFFLE RESULT:", {
        original: exerciseData.options,
        correctWas: correctAnswerText,
        shuffled: shuffledOptions,
        newCorrectIndex: newCorrectAnswer,
        newCorrectText: shuffledOptions[newCorrectAnswer]
      });

      // ✅ VERIFICAR QUE EL MEZCLADO FUNCIONÓ
      if (newCorrectAnswer === -1) {
        console.error("❌ SHUFFLE ERROR - usando original");
        return {
          question: exerciseData.question,
          instruction: exerciseData.instruction || "Selecciona la respuesta correcta",
          options: exerciseData.options,
          correctAnswer: exerciseData.correctAnswer || 0,
          explanation: exerciseData.explanation,
          xpReward: 10,
        };
      }

      // ✅ VALIDAR QUE EL EJERCICIO SEA LÓGICO
      const isLogical = this.validateExerciseLogic(exerciseData);
      if (!isLogical) {
        console.warn("❌ Ejercicio ilógico detectado, regenerando...");
        throw new Error("Ejercicio ilógico generado por IA");
      }

      return {
        question: exerciseData.question,
        instruction: exerciseData.instruction || "Selecciona la respuesta correcta",
        options: shuffledOptions,
        correctAnswer: newCorrectAnswer,
        explanation: exerciseData.explanation,
        xpReward: 10,
      };

    } catch (error: any) {
      console.error("🚨 ERROR IA GEMINI:", error);
      
      // Guardar si es error de cuota para mostrar notificación
      if (error?.message?.includes('quota') || error?.message?.includes('429')) {
        localStorage.setItem('last_quota_error', new Date().toISOString());
        console.log("🔋 Error de cuota guardado para UX");
      }
      
      throw error;
    }
  }

  // MÉTODO ELIMINADO - NO MÁS EJERCICIOS ESTÁTICOS

  /**
   * Valida que el ejercicio sea lógico y educativo
   */
  private validateExerciseLogic(exercise: any): boolean {
    // Verificar que no sea absurdo
    const question = exercise.question.toLowerCase();
    const options = exercise.options.map((opt: string) => opt.toLowerCase());
    const correctOption = options[exercise.correctAnswer];
    
    // Casos absurdos comunes
    if (question.includes('sushi') && !correctOption.includes('sushi') && !options.some((opt: string) => opt.includes('japanese') || opt.includes('fish'))) {
      console.warn("❌ Pregunta sobre sushi sin opciones relevantes");
      return false;
    }
    
    if (question.includes('pizza') && !correctOption.includes('pizza') && !options.some((opt: string) => opt.includes('italian') || opt.includes('food'))) {
      console.warn("❌ Pregunta sobre pizza sin opciones relevantes");
      return false;
    }
    
    // Verificar que las opciones tengan sentido
    const irrelevantOptions = ['car', 'house', 'book'];
    if (question.includes('food') || question.includes('eat') || question.includes('order')) {
      const hasIrrelevant = options.some((opt: string) => irrelevantOptions.includes(opt));
      if (hasIrrelevant) {
        console.warn("❌ Pregunta de comida con opciones irrelevantes");
        return false;
      }
    }
    
    return true;
  }

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
