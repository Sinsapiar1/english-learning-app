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
    previousErrors?: string[];
    timestamp?: number;
  }): Promise<GeneratedExercise> {
    // Crear variabilidad en el prompt para evitar repetición
    const exerciseTypes = [
      "completar la oración",
      "elegir la forma correcta",
      "identificar el tiempo verbal",
      "seleccionar la preposición correcta",
      "encontrar el error",
      "traducir correctamente",
    ];

    const contexts = [
      "en una conversación cotidiana",
      "en un texto formal",
      "en una situación de viaje",
      "en el trabajo",
      "en la escuela",
      "en casa con familia",
    ];

    const exerciseType =
      exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
    const context = contexts[Math.floor(Math.random() * contexts.length)];

    // Prompt con alta variabilidad
    const prompt = `Eres un profesor experto de inglés para hispanohablantes. Crea UN ejercicio de opción múltiple ÚNICO.

CONTEXTO DEL ESTUDIANTE:
- Nivel: ${params.level}
- Tema específico: ${params.topic}
- Ejercicio número: ${params.exerciseNumber} de 8
- Tipo de ejercicio: ${exerciseType}
- Contexto: ${context}
- Debilidades: ${params.userWeaknesses?.join(", ") || "ninguna"}
- Timestamp único: ${params.timestamp || Date.now()}

INSTRUCCIONES CRÍTICAS:
- Crea una pregunta COMPLETAMENTE DIFERENTE de ejercicios anteriores
- NUNCA repitas estructuras como "Have you ___" o "I have ___"
- Usa vocabulario y estructuras MUY variadas del nivel ${params.level}
- El ejercicio debe ser sobre "${params.topic}" con enfoque ÚNICO cada vez
- 4 opciones de respuesta (A, B, C, D) - MEZCLA el orden de la correcta
- Una respuesta claramente correcta (NO siempre en posición A)
- Las incorrectas deben ser errores típicos de hispanohablantes
- Explicación detallada en español
- VARÍA COMPLETAMENTE la estructura (evita patrones repetitivos)
- Usa diferentes personas (I, you, he, she, we, they)
- Cambia contextos (casa, trabajo, escuela, viajes, etc.)

EJEMPLOS DE VARIACIÓN OBLIGATORIA:
- Preguntas afirmativas: "She walks to school every day."
- Preguntas negativas: "They haven't finished yet." 
- Preguntas interrogativas: "Where do you work?"
- Frases con contexto: "In the restaurant, the waiter brought us menus."
- Diálogos cortos: "A: What time is it? B: It's 3 o'clock."
- Comparaciones: "This book is more interesting than that one."
- Condicionales: "If it rains, we will stay home."
- Pasado simple: "Yesterday, I visited my grandmother."
- Futuro: "Next week, we are going to travel."
- Presente continuo: "Right now, she is studying for her exam."

TEMAS ESPECÍFICOS PARA ${params.topic}:
- Crea ejercicios que realmente usen ${params.topic} de forma natural
- NO uses siempre la misma estructura gramatical
- Ejercicio #${params.exerciseNumber}: debe ser único y diferente

FORMATO JSON (responde SOLO el JSON, sin texto adicional):
{
  "question": "Pregunta única aquí variando estructura",
  "instruction": "Instrucción específica para este ejercicio",
  "options": ["opción A", "opción B", "opción C", "opción D"],
  "correctAnswer": 0,
  "explanation": "Explicación detallada en español específica para este caso",
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

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Limpiar y extraer JSON
      console.log("IA Response:", text); // Para debug

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
      console.error("Error generating exercise:", error);

      // Fallbacks únicos por ejercicio y tema
      const uniqueFallbacks = this.getUniqueFallback(
        params.exerciseNumber,
        params.topic,
        params.level
      );
      return uniqueFallbacks;
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
