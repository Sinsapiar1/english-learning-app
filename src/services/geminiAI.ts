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
    // TIPOS DE EJERCICIOS EXPANDIDOS para mayor variedad
    const exerciseTypes = [
      "completar la oración con la palabra correcta",
      "elegir la forma gramatical correcta",
      "identificar el tiempo verbal apropiado",
      "seleccionar la preposición correcta",
      "encontrar y corregir el error",
      "elegir la traducción más natural",
      "completar el diálogo de forma natural",
      "ordenar las palabras correctamente",
      "elegir el sinónimo apropiado",
      "seleccionar la respuesta lógica",
      "completar la expresión idiomática",
      "elegir el registro formal/informal correcto"
    ];

    const contexts = [
      "en una conversación entre amigos",
      "en una entrevista de trabajo",
      "en un restaurante pidiendo comida",
      "en el aeropuerto haciendo check-in",
      "en una tienda comprando ropa",
      "en el médico describiendo síntomas",
      "en una reunión de negocios",
      "en una clase universitaria",
      "en casa planificando el fin de semana",
      "en el banco haciendo trámites",
      "llamando por teléfono para hacer una cita",
      "escribiendo un email profesional"
    ];

    const exerciseType =
      exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
    const context = contexts[Math.floor(Math.random() * contexts.length)];

    // PROMPT ULTRA-CREATIVO PARA EJERCICIOS ÚNICOS
    const prompt = `Crea ejercicio COMPLETAMENTE ÚNICO nivel ${params.level} sobre "${params.topic}".

🚨 PROHIBIDO ABSOLUTO:
- "since 2020", "every morning", "lived here", "worked there"
- Frases de libros de texto típicas
- Ejemplos aburridos y repetitivos

✅ OBLIGATORIO:
- Usa marcas modernas: Netflix, Spotify, Instagram, TikTok, Uber, Amazon
- Situaciones reales: trabajo remoto, redes sociales, apps, viajes
- Contextos interesantes y memorables
- Nombres propios y lugares específicos

EJEMPLOS CREATIVOS para ${params.topic}:
- "My Netflix subscription _____ automatically last month"
- "The Uber driver _____ completely lost in downtown"
- "Instagram _____ my story because of copyright"

Responde SOLO JSON (sin explicaciones):
{
  "question": "Situación moderna y única aquí",
  "instruction": "Instrucción específica", 
  "options": ["opción A", "opción B", "opción C", "opción D"],
  "correctAnswer": 0,
  "explanation": "Explicación detallada en español",
  "xpReward": 10
}`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-pro",
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
}
