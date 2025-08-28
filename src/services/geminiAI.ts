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
    // 🎯 FORZAR ROTACIÓN DE 4 TIPOS ESPECÍFICOS DE EJERCICIOS
    const exerciseTypes = [
      {
        type: "VOCABULARY",
        template: "What does '[ENGLISH_WORD]' mean in '[CONTEXT]'?",
        instruction: "Elige el significado correcto en español",
        format: "English question → Spanish options"
      },
      {
        type: "GRAMMAR", 
        template: "Complete: '[ENGLISH_SENTENCE_WITH_BLANK]'",
        instruction: "Completa con la forma gramatical correcta",
        format: "English sentence → English grammar options"
      },
      {
        type: "TRANSLATION",
        template: "¿Cómo se dice '[SPANISH_PHRASE]' en inglés?",
        instruction: "Selecciona la traducción correcta",
        format: "Spanish question → English options"
      },
      {
        type: "COMPREHENSION",
        template: "Text: '[SHORT_ENGLISH_TEXT]' Question: '[COMPREHENSION_QUESTION]'",
        instruction: "Lee y responde en inglés",
        format: "English text → English comprehension question"
      }
    ];

    // CONTEXTOS MODERNOS ULTRA-ESPECÍFICOS
    const modernContexts = [
      "ordering food on DoorDash app",
      "commenting on Instagram stories", 
      "working remotely on Zoom calls",
      "streaming shows on Netflix",
      "posting TikTok videos",
      "shopping online on Amazon",
      "texting friends on WhatsApp",
      "uploading photos to social media",
      "booking Uber rides",
      "leaving Google reviews",
      "using dating apps like Tinder",
      "playing online games",
      "doing video calls with family",
      "ordering groceries online"
    ];

    // SELECCIONAR TIPO ESPECÍFICO PARA ESTA SESIÓN (ROTACIÓN FORZADA)
    const selectedType = exerciseTypes[params.exerciseNumber % 4]; // Garantiza rotación
    const selectedContext = modernContexts[Math.floor(Math.random() * modernContexts.length)];

    // PROMPT ULTRA-ESPECÍFICO CON TIPO FORZADO
    const prompt = `Generate a ${selectedType.type} exercise for level ${params.level} about "${params.topic}" in context: "${selectedContext}".

MANDATORY EXERCISE TYPE: ${selectedType.type}
FORMAT REQUIRED: ${selectedType.format}
TEMPLATE: ${selectedType.template}
INSTRUCTION: ${selectedType.instruction}

🚨 ULTRA-SPECIFIC REQUIREMENTS:
✅ Question must use vocabulary/phrases people actually use in "${selectedContext}"
✅ Options must include common mistakes Spanish speakers make  
✅ Explanation must be detailed for absolute beginners
✅ Use modern slang and expressions (not formal textbook English)
✅ Context must be realistic and relatable

FORBIDDEN:
❌ Generic/textbook examples
❌ Outdated expressions  
❌ Overly formal language
❌ Boring contexts

EXAMPLES FOR ${selectedType.type}:
${this.getExampleForType(selectedType.type, selectedContext)}

Return ONLY valid JSON - no extra text:
{
  "type": "${selectedType.type}",
  "context": "${selectedContext}",
  "question": "Ultra-specific question here",
  "instruction": "${selectedType.instruction}",
  "options": ["option A", "option B", "option C", "option D"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation with examples and tips for beginners",
  "xpReward": 10
}`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash", // ✅ NUEVO MODELO - gemini-pro DEPRECADO
        generationConfig: {
          temperature: 0.9, // Alta creatividad para evitar repetición
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      });

      console.log("🤖 INICIANDO GENERACIÓN IA - Ejercicio #" + params.exerciseNumber);
      console.log("📝 Tema:", params.topic, "| Nivel:", params.level);
      console.log("🔑 API Key configurada:", !!this.genAI);
      console.log("📝 Prompt enviado:", prompt);
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Limpiar y extraer JSON
      console.log("✅ IA Response COMPLETA:", text);
      console.log("📊 Longitud respuesta:", text.length, "caracteres");

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

      // Validar estructura
      if (
        !exerciseData.question ||
        !exerciseData.options ||
        !Array.isArray(exerciseData.options) ||
        exerciseData.options.length !== 4
      ) {
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
        instruction:
          exerciseData.instruction || "Selecciona la respuesta correcta",
        options: shuffledOptions,
        correctAnswer: newCorrectAnswer,
        explanation: exerciseData.explanation || "Explicación no disponible",
        xpReward: exerciseData.xpReward || 10,
      };
    } catch (error) {
      console.error("🚨🚨🚨 IA COMPLETAMENTE FALLIDA 🚨🚨🚨");
      console.error("❌ Error completo:", error);
      console.error("📊 Parámetros enviados:", params);
      console.error("🔑 API Key existe?", !!this.genAI);
      console.error("📝 Prompt length:", prompt.length);
      
      // Log del error específico
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("API key")) {
        console.error("🔑 PROBLEMA DE API KEY");
      } else if (errorMessage.includes("JSON")) {
        console.error("📋 PROBLEMA DE FORMATO JSON");
      } else if (errorMessage.includes("quota")) {
        console.error("💳 PROBLEMA DE CUOTA/LÍMITES");
      } else {
        console.error("❓ ERROR DESCONOCIDO:", errorMessage);
      }

      // NO MÁS EJERCICIOS DE RESPALDO - SOLO IA
      console.error("🚨 IA COMPLETAMENTE FALLIDA - NO HAY RESPALDO ESTÁTICO");
      throw new Error(`🤖 La IA no pudo generar ejercicio después de múltiples intentos. Verifica tu API Key y conexión a internet. Error: ${errorMessage}`);
    }
  }

  // MÉTODO ELIMINADO - NO MÁS EJERCICIOS ESTÁTICOS

  /**
   * Genera ejemplos específicos para cada tipo de ejercicio
   */
  private getExampleForType(type: string, context: string): string {
    const examples = {
      "VOCABULARY": `"What does 'swipe' mean in '${context}'?" → A) deslizar ✓ B) tocar C) presionar D) escribir`,
      "GRAMMAR": `"I ____ ${context} every day." → A) have been doing ✓ B) am doing C) did D) will do`,
      "TRANSLATION": `"¿Cómo se dice 'me encanta esto' when ${context}?" → A) I love this ✓ B) I like this C) I want this D) I need this`,
      "COMPREHENSION": `"Sarah was ${context} when her phone died. What happened?" → A) Her phone died ✓ B) She was happy C) She was working D) She was sleeping`
    };

    return examples[type] || `Example for ${type} in context of ${context}`;
  }
}
