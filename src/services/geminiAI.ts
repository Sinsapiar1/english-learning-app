import { GoogleGenerativeAI } from "@google/generative-ai";
import { SmartExercise } from "./smartAI";

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
      const isLogical = this.validateExerciseLogic(exerciseData, 1);
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

  // NUEVA FUNCIÓN: Generar 8 ejercicios únicos de una vez
  async generateCompleteSession(params: {
    level: "A1" | "A2" | "B1" | "B2";
    userId: string;
    userWeaknesses?: string[];
    userStrengths?: string[];
    completedLessons?: number;
  }): Promise<SmartExercise[]> {

    const enhancedPrompt = `Eres un profesor EXPERTO de inglés para hispanohablantes nivel ${params.level}.

TAREA CRÍTICA: Generar exactamente 8 ejercicios ÚNICOS, LÓGICOS y EDUCATIVOS para una sesión completa.

NIVEL DEL ESTUDIANTE: ${params.level}
EJERCICIOS COMPLETADOS: ${params.completedLessons || 0}
DEBILIDADES: ${params.userWeaknesses?.join(', ') || 'ninguna detectada'}

REGLAS CRÍTICAS - VALIDACIÓN PEDAGÓGICA:

❌ PROHIBIDO ABSOLUTO:
- Preguntas donde la respuesta esté en la pregunta misma
- "I saw sunset yesterday" → "What did I see yesterday?" (ABSURDO)
- Emojis incorrectos (🐶 para gato)
- Preguntas obvias o redundantes
- Ejercicios repetidos o muy similares entre sí

✅ OBLIGATORIO:
- 8 ejercicios COMPLETAMENTE diferentes
- Cada ejercicio debe enseñar algo específico y único
- Progresión lógica de dificultad dentro de la sesión
- Contextos modernos variados (apps, trabajo remoto, redes sociales)
- Emojis correctos si se usan

TIPOS DE EJERCICIO (2 de cada tipo en orden):
1-2. VOCABULARIO: "What does '[word]' mean in this context?"
3-4. GRAMÁTICA: Completar oraciones con formas correctas
5-6. TRADUCCIÓN: Español → Inglés (frases útiles)
7-8. COMPRENSIÓN: Texto corto + pregunta específica

EJEMPLOS ESPECÍFICOS POR NIVEL:

${params.level === 'A1' ? `
NIVEL A1 - SÚPER BÁSICO:
1. "What does 'hello' mean?" → opciones: ["hola", "adiós", "gracias", "perdón"]
2. "I _____ hungry." → opciones: ["am", "is", "are", "be"] 
3. "¿Cómo se dice 'me gusta'?" → opciones: ["I like", "I love", "I want", "I need"]
4. "She _____ pizza." → opciones: ["likes", "like", "liking", "liked"]
5. "¿Cómo se dice 'mi familia'?" → opciones: ["my family", "my house", "my friend", "my work"]
6. "We _____ students." → opciones: ["are", "is", "am", "be"]
7. "Text: 'Hi, I am Maria. I like pizza.' Question: What does Maria like?" → opciones: ["pizza", "hamburgers", "salad", "soup"]
8. "What color is this? 🔴" → opciones: ["red", "blue", "green", "yellow"]
` : ''}

${params.level === 'A2' ? `
NIVEL A2 - ELEMENTAL:
1. "What does 'stream' mean in 'I stream movies on Netflix'?" → opciones: ["transmitir/ver", "descargar", "comprar", "grabar"]
2. "I _____ working from home since 2020." → opciones: ["have been", "am", "was", "will be"]
3. "¿Cómo se dice 'hacer un pedido'?" → opciones: ["place an order", "make a call", "send a message", "write a text"]
4. "She _____ never _____ sushi before." → opciones: ["has / eaten", "have / eaten", "is / eating", "was / eating"]
5. "¿Cómo se dice 'estoy de acuerdo'?" → opciones: ["I agree", "I understand", "I know", "I think"]
6. "They _____ to the gym every Monday." → opciones: ["go", "goes", "going", "went"]
7. "Text: 'Maria orders food on Uber Eats every Friday. She loves Italian food.' Question: How often does Maria order food?" → opciones: ["every Friday", "every day", "every Monday", "never"]
8. "What does 'upload' mean in 'upload a photo to Instagram'?" → opciones: ["subir", "bajar", "ver", "compartir"]
` : ''}

INSTRUCCIONES DE VALIDACIÓN INTERNA:
1. ¿Cada pregunta enseña algo diferente?
2. ¿Las 8 preguntas son completamente únicas?
3. ¿La respuesta no está obvia en la pregunta?
4. ¿Los emojis coinciden con el contenido?
5. ¿Realmente enseñan inglés práctico?

FORMATO JSON REQUERIDO (array de 8 ejercicios):
{
  "exercises": [
    {
      "question": "[Pregunta lógica única #1]",
      "instruction": "Selecciona la respuesta correcta",
      "options": ["opción1", "opción2", "opción3", "opción4"],
      "correctAnswer": 0,
      "explanation": "🎯 [Explicación pedagógica específica]",
      "topic": "[tema específico]"
    }
  ]
}

¡GENERA 8 EJERCICIOS ÚNICOS, LÓGICOS Y EDUCATIVOS QUE REALMENTE ENSEÑEN INGLÉS!`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.8, // Menos creatividad para más lógica
          topP: 0.8,
          maxOutputTokens: 4000, // Más tokens para 8 ejercicios
        },
      });

      console.log("🤖 GENERANDO SESIÓN COMPLETA DE 8 EJERCICIOS");
      const result = await model.generateContent(enhancedPrompt);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const sessionData = JSON.parse(jsonMatch[0]);
      
      // Validar que tenemos 8 ejercicios
      if (!sessionData.exercises || sessionData.exercises.length !== 8) {
        throw new Error("IA no generó exactamente 8 ejercicios");
      }

      // Validar cada ejercicio
      const validatedExercises = sessionData.exercises.map((exercise: any, index: number) => {
        // Validación pedagógica
        if (!this.validateExerciseLogic(exercise, index + 1)) {
          throw new Error(`Ejercicio ${index + 1} falló validación lógica`);
        }

        // Mezclar opciones para cada ejercicio
        const correctAnswerText = exercise.options[exercise.correctAnswer];
        const shuffledOptions = [...exercise.options];
        
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        
        const newCorrectAnswer = shuffledOptions.findIndex((option: string) => option === correctAnswerText);

        return {
          id: `ai_session_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          question: exercise.question,
          instruction: exercise.instruction || "Selecciona la respuesta correcta",
          options: shuffledOptions,
          correctAnswer: newCorrectAnswer,
          explanation: exercise.explanation,
          xpReward: 10,
          topic: exercise.topic,
          level: params.level,
          source: 'ai' as const,
          difficulty: 'medium' as const,
          learningFocus: [exercise.topic]
        };
      });

      console.log("✅ SESIÓN COMPLETA GENERADA Y VALIDADA");
      return validatedExercises;

    } catch (error) {
      console.error("🚨 ERROR GENERANDO SESIÓN COMPLETA:", error);
      throw error;
    }
  }

  // VALIDACIÓN MEJORADA
  private validateExerciseLogic(exercise: any, exerciseNumber: number): boolean {
    const question = exercise.question.toLowerCase();
    const options = exercise.options;
    const correctOption = options[exercise.correctAnswer].toLowerCase();
    
    // ❌ Validar redundancia: respuesta no debe estar en pregunta
    const questionWords = question.split(' ');
    const correctWords = correctOption.split(' ');
    const overlap = questionWords.filter((word: string) => correctWords.includes(word));
    
    if (overlap.length > 2) { // Más de 2 palabras iguales = redundante
      console.warn(`❌ Ejercicio ${exerciseNumber}: Respuesta redundante con pregunta`);
      return false;
    }
    
    // ❌ Validar emojis coherentes
    if (question.includes('cat') && question.includes('🐶')) {
      console.warn(`❌ Ejercicio ${exerciseNumber}: Emoji incorrecto para gato`);
      return false;
    }
    
    if (question.includes('dog') && question.includes('🐱')) {
      console.warn(`❌ Ejercicio ${exerciseNumber}: Emoji incorrecto para perro`);
      return false;
    }
    
    // ❌ Validar preguntas obvias
    const obviousPatterns = [
      'where did i post it',
      'what did i see',
      'what did i do'
    ];
    
    if (obviousPatterns.some((pattern: string) => question.includes(pattern))) {
      console.warn(`❌ Ejercicio ${exerciseNumber}: Pregunta obvia detectada`);
      return false;
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
