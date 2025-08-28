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

    // Prompt SIMPLIFICADO para evitar fallos
    const prompt = `Crea UN ejercicio de inglés nivel ${params.level} sobre "${params.topic}".

INSTRUCCIONES:
1. Crea pregunta ÚNICA sobre "${params.topic}" nivel ${params.level}
2. 4 opciones: A, B, C, D
3. 1 correcta, 3 incorrectas
4. Explicación en español

Responde SOLO este JSON:
{
  "question": "Tu pregunta aquí",
  "instruction": "Instrucción para el estudiante", 
  "options": ["opción A", "opción B", "opción C", "opción D"],
  "correctAnswer": 0,
  "explanation": "Por qué es correcta esta respuesta",
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

      // Fallbacks únicos por ejercicio y tema
      const uniqueFallbacks = this.getUniqueFallback(
        params.exerciseNumber,
        params.topic,
        params.level
      );
      
      // APLICAR MEZCLA TAMBIÉN A FALLBACKS
      const correctAnswerText = uniqueFallbacks.options[uniqueFallbacks.correctAnswer];
      const shuffledOptions = [...uniqueFallbacks.options];
      
      // Mezclar fallbacks también
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      
      const newCorrectAnswer = shuffledOptions.findIndex(option => option === correctAnswerText);
      
      return {
        ...uniqueFallbacks,
        options: shuffledOptions,
        correctAnswer: newCorrectAnswer
      };
    }
  }

  private getUniqueFallback(
    exerciseNumber: number,
    topic: string,
    level: string
  ): GeneratedExercise {
    // Fallbacks únicos organizados por tema y nivel
    const fallbacks = {
      "present perfect": [
        {
          question: "I ____ never eaten sushi before.",
          instruction: "Completa con Present Perfect",
          options: ["have", "has", "am", "was"],
          correctAnswer: 0,
          explanation:
            "Con 'I' usamos 'have' + participio pasado para Present Perfect.",
          xpReward: 10,
        },
        {
          question: "She ____ lived here since 2020.",
          instruction: "Completa la oración",
          options: ["has", "have", "is", "was"],
          correctAnswer: 0,
          explanation:
            "Con 'She' usamos 'has' + participio pasado en Present Perfect.",
          xpReward: 10,
        },
        {
          question: "Have you ____ finished your homework?",
          instruction: "Completa la pregunta",
          options: ["ever", "never", "always", "sometimes"],
          correctAnswer: 0,
          explanation:
            "'Ever' se usa en preguntas de Present Perfect para experiencias.",
          xpReward: 10,
        },
      ],
      "adverbs": [
        {
          question: "She speaks English ____.",
          instruction: "Elige el adverbio correcto",
          options: ["good", "fluently", "perfect", "nice"],
          correctAnswer: 1,
          explanation: "'Fluently' es el adverbio correcto para describir cómo habla.",
          xpReward: 10,
        },
        {
          question: "He drives ____.",
          instruction: "Completa con un adverbio",
          options: ["careful", "carefully", "care", "caring"],
          correctAnswer: 1,
          explanation: "'Carefully' es el adverbio que describe cómo conduce.",
          xpReward: 10,
        },
        {
          question: "They arrived ____.",
          instruction: "Elige el adverbio de tiempo",
          options: ["quick", "yesterday", "fast", "soon"],
          correctAnswer: 1,
          explanation: "'Yesterday' es un adverbio de tiempo que indica cuándo llegaron.",
          xpReward: 10,
        },
      ],
      "prepositions": [
        {
          question: "The book is ____ the table.",
          instruction: "Elige la preposición correcta",
          options: ["in", "on", "at", "by"],
          correctAnswer: 1,
          explanation: "'On' se usa para superficies como mesas.",
          xpReward: 10,
        },
        {
          question: "We meet ____ 3 o'clock.",
          instruction: "Preposición de tiempo",
          options: ["in", "on", "at", "by"],
          correctAnswer: 2,
          explanation: "'At' se usa con horas específicas.",
          xpReward: 10,
        },
        {
          question: "She lives ____ London.",
          instruction: "Preposición de lugar",
          options: ["at", "on", "in", "by"],
          correctAnswer: 2,
          explanation: "'In' se usa con ciudades y países.",
          xpReward: 10,
        },
      ],
      "past simple": [
        {
          question: "Yesterday I ____ to the cinema.",
          instruction: "Completa con Past Simple",
          options: ["went", "go", "gone", "going"],
          correctAnswer: 0,
          explanation: "'Went' es la forma pasada irregular del verbo 'go'.",
          xpReward: 10,
        },
        {
          question: "They ____ not study last night.",
          instruction: "Forma negativa de Past Simple",
          options: ["did", "do", "does", "were"],
          correctAnswer: 0,
          explanation:
            "Para negativas en Past Simple usamos 'did not' + infinitivo.",
          xpReward: 10,
        },
      ],
      "verb to be": [
        {
          question: "My sister ____ a teacher.",
          instruction: "Completa con el verbo 'to be'",
          options: ["is", "are", "am", "be"],
          correctAnswer: 0,
          explanation: "Con 'sister' (tercera persona singular) usamos 'is'.",
          xpReward: 10,
        },
        {
          question: "We ____ students at the university.",
          instruction: "Completa la oración",
          options: ["are", "is", "am", "be"],
          correctAnswer: 0,
          explanation: "Con 'we' (primera persona plural) usamos 'are'.",
          xpReward: 10,
        },
      ],
      "future tense": [
        {
          question: "Tomorrow I ____ visit my grandmother.",
          instruction: "Completa con futuro",
          options: ["will", "going", "go", "went"],
          correctAnswer: 0,
          explanation:
            "'Will' + infinitivo es una forma común de expresar futuro.",
          xpReward: 10,
        },
        {
          question: "She is ____ to travel next week.",
          instruction: "Completa con 'going to'",
          options: ["going", "go", "went", "will"],
          correctAnswer: 0,
          explanation: "'Going to' + infinitivo expresa planes futuros.",
          xpReward: 10,
        },
      ],
    };

    const topicFallbacks =
      fallbacks[topic as keyof typeof fallbacks] ||
      fallbacks["present perfect"];
    const fallbackIndex = (exerciseNumber - 1) % topicFallbacks.length;

    return {
      ...topicFallbacks[fallbackIndex],
      question: `${topicFallbacks[fallbackIndex].question} (Ex. ${exerciseNumber})`,
    };
  }
}
