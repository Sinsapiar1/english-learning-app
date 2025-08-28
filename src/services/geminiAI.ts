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
    // TIPOS DE EJERCICIOS ESPECÍFICOS - Rotación forzada
    const exerciseTypes = [
      {
        type: "VOCABULARIO",
        instruction: "¿Qué significa esta palabra en inglés?",
        format: "English word → Spanish options",
        example: "What does 'stream' mean in 'I stream Netflix'? → A) transmitir B) río C) correr D) gritar"
      },
      {
        type: "GRAMÁTICA", 
        instruction: "Completa la oración con la opción correcta",
        format: "English sentence with blank → English grammar options",
        example: "I _____ working from home since 2020. → A) have been B) am C) was D) will be"
      },
      {
        type: "TRADUCCIÓN",
        instruction: "Selecciona la traducción correcta al inglés",
        format: "Spanish phrase → English translation options",
        example: "¿Cómo se dice 'me gusta tu post'? → A) I like your post B) I love your post C) I want your post D) I see your post"
      },
      {
        type: "COMPRENSIÓN",
        instruction: "Lee el texto y responde la pregunta",
        format: "Short English text → English comprehension question",
        example: "Text: 'Maria works for Netflix creating content.' Question: What does Maria do? → A) creates content B) watches shows C) sells subscriptions D) fixes bugs"
      }
    ];

    // SELECCIONAR TIPO BASADO EN NÚMERO DE EJERCICIO (rotación garantizada)
    const selectedType = exerciseTypes[params.exerciseNumber % 4];

    // CONTEXTOS MODERNOS ULTRA-ESPECÍFICOS
    const modernContexts = [
      "usando apps de delivery como Uber Eats",
      "subiendo stories a Instagram", 
      "trabajando remotamente en videollamadas",
      "viendo series en Netflix y plataformas streaming",
      "haciendo videos para TikTok",
      "comprando online en Amazon",
      "chateando por WhatsApp con amigos",
      "dejando reviews en Google Maps",
      "pidiendo taxi por apps como Uber",
      "haciendo posts en redes sociales"
    ];

    const selectedContext = modernContexts[Math.floor(Math.random() * modernContexts.length)];

    // PROMPT ULTRA-ESPECÍFICO EN ESPAÑOL
    const prompt = `Eres un profesor de inglés experto. Crea un ejercicio de tipo ${selectedType.type} para estudiantes hispanohablantes de nivel ${params.level}.

CONTEXTO OBLIGATORIO: ${selectedContext}
TEMA: ${params.topic}

INSTRUCCIONES CRÍTICAS:
🇪🇸 TODA la explicación debe estar en ESPAÑOL PERFECTO
🎯 Tipo de ejercicio: ${selectedType.type}
📱 Usar vocabulario moderno del contexto: ${selectedContext}
👶 Explicación para principiantes absolutos en español
❌ PROHIBIDO usar inglés en la explicación

FORMATO REQUERIDO:
${selectedType.format}

EJEMPLO ESPECÍFICO:
${selectedType.example}

ESTRUCTURA DE RESPUESTA (JSON válido):
{
  "question": "[Pregunta aquí - puede estar en inglés o español según el tipo]",
  "instruction": "${selectedType.instruction}",
  "options": ["A) opción 1", "B) opción 2", "C) opción 3", "D) opción 4"],
  "correctAnswer": 0,
  "explanation": "🎯 EXPLICACIÓN COMPLETA EN ESPAÑOL: [Explicación detallada de por qué es correcta, con ejemplos adicionales, todo en español perfecto para principiantes]"
}

IMPORTANTE: 
- La explicación DEBE empezar con un emoji y estar completamente en español
- Incluir ejemplos adicionales en español
- Explicar por qué las otras opciones están mal
- Usar un tono amigable y pedagógico

Responde SOLO el JSON, sin texto adicional:`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash", // ✅ NUEVO MODELO - gemini-pro DEPRECADO
        generationConfig: {
          temperature: 0.9, // Alta creatividad para evitar repetición
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      });

      console.log("🤖 GENERANDO EJERCICIO CON EXPLICACIÓN EN ESPAÑOL");
      console.log("📝 Tipo:", selectedType.type, "| Contexto:", selectedContext);
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      console.log("✅ RESPUESTA IA COMPLETA:", text);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      let exerciseData;
      try {
        exerciseData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("Invalid JSON from AI");
      }

      // VALIDACIÓN CRÍTICA: Verificar que explicación esté en español
      if (exerciseData.explanation && exerciseData.explanation.length > 20) {
        // Contar palabras en español vs inglés (heurística simple)
        const spanishWords = ['es', 'la', 'el', 'un', 'una', 'con', 'por', 'para', 'que', 'de', 'del', 'en', 'se', 'y', 'o', 'pero', 'cuando', 'como', 'donde', 'porque', 'usamos', 'correcto', 'incorrecto', 'significa', 'ejemplo'];
        const explanationLower = exerciseData.explanation.toLowerCase();
        const spanishWordCount = spanishWords.filter(word => explanationLower.includes(' ' + word + ' ') || explanationLower.startsWith(word + ' ')).length;
        
        if (spanishWordCount < 3) {
          console.warn("⚠️ EXPLICACIÓN POSIBLEMENTE EN INGLÉS - FORZANDO ESPAÑOL");
          // Forzar explicación en español simple
          exerciseData.explanation = `🎯 NIVEL ${params.level}: La respuesta correcta es la opción ${String.fromCharCode(65 + exerciseData.correctAnswer)}. Esta estructura es muy común en inglés moderno, especialmente cuando ${selectedContext.toLowerCase()}. Recuerda practicar este tipo de expresiones para sonar más natural en inglés.`;
        }
      }

      // Validar estructura básica
      if (!exerciseData.question || !exerciseData.options || !Array.isArray(exerciseData.options) || exerciseData.options.length !== 4) {
        throw new Error("Invalid exercise structure from AI");
      }

      // Mezclar opciones para que la respuesta correcta no siempre sea la primera
      const correctAnswerIndex = exerciseData.correctAnswer || 0;
      const correctAnswerText = exerciseData.options[correctAnswerIndex];
      
      // Crear array de opciones mezcladas
      const shuffledOptions = [...exerciseData.options];
      
      // Algoritmo Fisher-Yates para mezclar
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      
      // Encontrar nueva posición de la respuesta correcta
      const newCorrectAnswer = shuffledOptions.findIndex(option => option === correctAnswerText);

      return {
        question: exerciseData.question,
        instruction: exerciseData.instruction || selectedType.instruction,
        options: shuffledOptions,
        correctAnswer: newCorrectAnswer,
        explanation: exerciseData.explanation || `Respuesta correcta: ${correctAnswerText}`,
        xpReward: 10,
      };
    } catch (error) {
      console.error("🚨 ERROR GENERANDO EJERCICIO:", error);
      throw new Error(`La IA no pudo generar ejercicio. Error: ${error instanceof Error ? error.message : String(error)}`);
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
