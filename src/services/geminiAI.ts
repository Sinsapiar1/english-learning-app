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

    // 🚨 PROMPTS COMPLETAMENTE DIFERENTES POR NIVEL
    const enhancedPrompt = this.getLevelSpecificPrompt(params.level, params);

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

      // Validar cada ejercicio con fallback más permisivo
      const validatedExercises = sessionData.exercises.map((exercise: any, index: number) => {
        
        // ✅ INTENTAR VALIDACIÓN ESTRICTA PRIMERO
        let isValid = true;
        try {
          isValid = this.validateExerciseLogic(exercise, index + 1);
        } catch (error) {
          console.warn(`⚠️ Error en validación ejercicio ${index + 1}:`, error);
          isValid = false;
        }
        
        // ✅ SI FALLA VALIDACIÓN, USAR VALIDACIÓN BÁSICA
        if (!isValid) {
          console.warn(`⚠️ Ejercicio ${index + 1} falló validación estricta, aplicando validación básica`);
          
          // Validación básica mínima
          const hasValidStructure = exercise.question && 
                                   exercise.options && 
                                   exercise.options.length === 4 &&
                                   exercise.correctAnswer >= 0 && 
                                   exercise.correctAnswer < 4;
          
          if (!hasValidStructure) {
            // Solo aquí rechazar completamente
            throw new Error(`Ejercicio ${index + 1} tiene estructura inválida básica`);
          }
          
          console.log(`✅ Ejercicio ${index + 1} aprobado con validación básica`);
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
          topic: exercise.topic || 'general',
          level: params.level,
          source: 'ai' as const,
          difficulty: 'medium' as const,
          learningFocus: [exercise.topic || 'general']
        };
      });

      console.log("✅ SESIÓN COMPLETA GENERADA Y VALIDADA");
      return validatedExercises;

    } catch (error) {
      console.error("🚨 ERROR GENERANDO SESIÓN COMPLETA:", error);
      throw error;
    }
  }

  // VALIDACIÓN MEJORADA - MENOS ESTRICTA, MÁS INTELIGENTE
  private validateExerciseLogic(exercise: any, exerciseNumber: number): boolean {
    console.log(`🔍 VALIDANDO EJERCICIO ${exerciseNumber}:`, {
      question: exercise.question,
      options: exercise.options,
      correctAnswer: exercise.correctAnswer,
      correctOption: exercise.options[exercise.correctAnswer]
    });
    
    const question = exercise.question.toLowerCase();
    const options = exercise.options;
    
    // ✅ VALIDACIONES BÁSICAS (menos estrictas)
    if (!exercise.question || !exercise.options || exercise.options.length !== 4) {
      console.warn(`❌ Ejercicio ${exerciseNumber}: Estructura inválida`);
      return false;
    }
    
    if (exercise.correctAnswer < 0 || exercise.correctAnswer >= 4) {
      console.warn(`❌ Ejercicio ${exerciseNumber}: Índice de respuesta correcta inválido`);
      return false;
    }
    
    const correctOption = options[exercise.correctAnswer]?.toLowerCase() || '';
    
    // ✅ VALIDACIONES ESPECÍFICAS MÁS INTELIGENTES
    
    // Solo rechazar casos OBVIAMENTE problemáticos
    const obviouslyProblematic = [
      // Respuesta exacta en pregunta
      question.includes(correctOption) && correctOption.length > 5,
      // Emojis incorrectos específicos
      (question.includes('cat') || question.includes('gato')) && question.includes('🐶'),
      (question.includes('dog') || question.includes('perro')) && question.includes('🐱'),
      // Preguntas completamente redundantes
      question.includes('what did i see') && question.includes('sunset') && correctOption.includes('sunset')
    ];
    
    if (obviouslyProblematic.some(problem => problem)) {
      console.warn(`❌ Ejercicio ${exerciseNumber}: Problema obvio detectado`);
      return false;
    }
    
    // ✅ VALIDAR QUE LAS OPCIONES SEAN DIFERENTES
    const uniqueOptions = new Set(options.map((opt: string) => opt.toLowerCase()));
    if (uniqueOptions.size < 4) {
      console.warn(`❌ Ejercicio ${exerciseNumber}: Opciones duplicadas`);
      return false;
    }
    
    // ✅ NUEVA VALIDACIÓN: Detectar opciones muy similares
    const optionsLower = options.map((opt: string) => opt.toLowerCase().trim());
    
    for (let i = 0; i < optionsLower.length; i++) {
      for (let j = i + 1; j < optionsLower.length; j++) {
        const similarity = this.calculateTextSimilarity(optionsLower[i], optionsLower[j]);
        if (similarity > 0.85) { // Si son 85% similares
          console.warn(`❌ Ejercicio ${exerciseNumber}: Opciones muy similares detectadas`);
          console.warn(`Opción ${i}: "${optionsLower[i]}"`);
          console.warn(`Opción ${j}: "${optionsLower[j]}"`);
          console.warn(`Similitud: ${(similarity * 100).toFixed(1)}%`);
          return false;
        }
      }
    }
    
    console.log(`✅ Ejercicio ${exerciseNumber}: Validación APROBADA`);
    return true;
  }

  // 🚨 PROMPTS ESPECÍFICOS POR NIVEL - COMPLETAMENTE DIFERENTES
  private getLevelSpecificPrompt(level: string, params: any): string {
    const baseInfo = `
NIVEL DEL ESTUDIANTE: ${params.level}
EJERCICIOS COMPLETADOS: ${params.completedLessons || 0}
DEBILIDADES: ${params.userWeaknesses?.join(', ') || 'ninguna detectada'}
`;

    switch(level) {
      case 'A1':
        return `Eres un profesor de inglés para PRINCIPIANTES ABSOLUTOS hispanohablantes.

${baseInfo}

🎯 NIVEL A1 - SUPERVIVENCIA EN INGLÉS BÁSICO:
Estudiante que NO SABE NADA de inglés. Necesita inglés para SOBREVIVIR en situaciones básicas.

✅ OBLIGATORIO - SOLO ESTAS SITUACIONES A1:
1. **SALUDOS Y CORTESÍA BÁSICA** (25%)
   - "How do you respond to 'Good morning'?" → ["Good morning", "Good night", "Goodbye", "See you later"]
   - "Someone says 'Thank you'. What do you say?" → ["You're welcome", "Good morning", "How are you", "My name is"]

2. **NECESIDADES BÁSICAS** (25%)
   - "You're hungry. What do you say?" → ["I'm hungry", "I'm happy", "I'm tired", "I'm cold"]
   - "You need the bathroom. How do you ask?" → ["Where is the bathroom?", "What is your name?", "How are you?", "I like coffee"]

3. **INFORMACIÓN PERSONAL MUY BÁSICA** (25%)
   - "Someone asks 'What's your name?' You respond:" → ["My name is...", "I'm fine", "Nice to meet you", "How are you?"]
   - "How do you ask someone's age?" → ["How old are you?", "What's your name?", "Where are you from?", "Do you like coffee?"]

4. **NÚMEROS Y TIEMPO BÁSICO** (25%)
   - "It's 3:00 PM. How do you say this time?" → ["It's three o'clock", "It's three thirty", "It's four o'clock", "It's two o'clock"]
   - "You want to buy something for $5. How do you ask the price?" → ["How much is this?", "What time is it?", "Where is the store?", "I don't understand"]

❌ PROHIBIDO PARA A1:
- Tiempos verbales complejos (present perfect, past continuous)
- Vocabulario avanzado (business, technology, abstract concepts)
- Oraciones largas o complejas
- Situaciones profesionales o académicas

FORMATO JSON REQUERIDO - 8 ejercicios A1 básicos:
{
  "exercises": [
    {
      "question": "[Situación básica en inglés / Situación en español]",
      "instruction": "Selecciona la respuesta correcta",
      "options": ["[opción correcta]", "[opción incorrecta]", "[opción incorrecta]", "[opción incorrecta]"],
      "correctAnswer": 0,
      "explanation": "🎯 [Explicación en español de por qué es importante para supervivencia]",
      "topic": "[saludos, necesidades básicas, información personal, tiempo básico]"
    }
  ]
}

🎯 GENERAR EXACTAMENTE 8 EJERCICIOS A1 BÁSICOS Y ÚTILES PARA SUPERVIVENCIA.`;

      case 'A2':
        return `Eres un profesor de inglés para estudiantes ELEMENTALES hispanohablantes.

${baseInfo}

🎯 NIVEL A2 - INGLÉS ELEMENTAL PARA COMUNICACIÓN BÁSICA:
Estudiante que sabe lo básico y necesita comunicarse en situaciones cotidianas simples.

✅ OBLIGATORIO - SOLO ESTAS SITUACIONES A2:
1. **CONVERSACIONES SIMPLES** (25%)
   - "Your friend asks 'What did you do yesterday?' You respond:" → ["I went to work", "I go to work", "I will go to work", "I am going to work"]
   - "How do you ask about someone's weekend?" → ["How was your weekend?", "What is your weekend?", "Where is your weekend?", "When is your weekend?"]

2. **RUTINAS Y ACTIVIDADES PASADAS** (25%)
   - "Complete: 'I _____ TV last night.'" → ["watched", "watch", "watching", "will watch"]
   - "How do you say you exercise every day?" → ["I exercise every day", "I exercised yesterday", "I will exercise tomorrow", "I am exercising now"]

3. **PLANES Y FUTURO SIMPLE** (25%)
   - "You have plans for tomorrow. How do you express this?" → ["I'm going to visit my family", "I visit my family", "I visited my family", "I have visited my family"]
   - "Complete: 'Next week I _____ to the doctor.'" → ["will go", "go", "went", "have gone"]

4. **EXPERIENCIAS Y PRESENT PERFECT BÁSICO** (25%)
   - "How do you say you've been to Mexico?" → ["I have been to Mexico", "I go to Mexico", "I went to Mexico", "I will go to Mexico"]
   - "Complete: 'I _____ this movie before.'" → ["have seen", "see", "saw", "will see"]

❌ PROHIBIDO PARA A2:
- Gramática muy avanzada (subjunctive, complex conditionals)
- Vocabulario técnico o profesional avanzado
- Situaciones de negocios complejas
- Literatura o temas abstractos

FORMATO JSON REQUERIDO - 8 ejercicios A2 elementales:
{
  "exercises": [
    {
      "question": "[Situación cotidiana en inglés / Situación en español]",
      "instruction": "Selecciona la respuesta correcta",
      "options": ["[opción correcta]", "[opción incorrecta]", "[opción incorrecta]", "[opción incorrecta]"],
      "correctAnswer": 0,
      "explanation": "🎯 [Explicación en español de la gramática y cuándo usarla]",
      "topic": "[conversaciones simples, rutinas pasadas, planes futuros, experiencias básicas]"
    }
  ]
}

🎯 GENERAR EXACTAMENTE 8 EJERCICIOS A2 ELEMENTALES PARA COMUNICACIÓN COTIDIANA.`;

      case 'B1':
        return `Eres un profesor de inglés para estudiantes INTERMEDIOS hispanohablantes.

${baseInfo}

🎯 NIVEL B1 - INGLÉS INTERMEDIO PARA INDEPENDENCIA:
Estudiante que puede comunicarse pero necesita fluidez en situaciones más complejas.

✅ OBLIGATORIO - SOLO ESTAS SITUACIONES B1:
1. **TRABAJO Y PROFESIÓN** (25%)
   - "In a job interview, they ask 'Why do you want this job?' Best response:" → ["I believe I can contribute to the team", "I need money", "I like jobs", "This is a good company"]
   - "How do you ask for a day off?" → ["Could I take tomorrow off?", "I no work tomorrow", "Tomorrow I don't go", "I want day free"]

2. **PROBLEMAS Y SOLUCIONES** (25%)
   - "Your internet isn't working. How do you explain this to tech support?" → ["I'm having trouble with my internet connection", "My internet no work", "Internet is bad", "I don't like internet"]
   - "Complete: 'If I _____ more time, I would travel more.'" → ["had", "have", "will have", "am having"]

3. **OPINIONES Y ARGUMENTOS** (25%)
   - "How do you politely disagree with someone?" → ["I see your point, but I think...", "You are wrong", "That's stupid", "No, no, no"]
   - "Express your opinion about online shopping:" → ["I think online shopping is convenient because...", "Online shopping good", "I like buy things", "Internet shopping OK"]

4. **SITUACIONES HIPOTÉTICAS** (25%)
   - "Complete: 'What would you do if you _____ the lottery?'" → ["won", "win", "will win", "have won"]
   - "How do you express a hypothetical situation?" → ["If I were you, I would...", "You should do...", "I think you...", "Maybe you..."]

❌ PROHIBIDO PARA B1:
- Temas demasiado académicos o técnicos
- Vocabulario extremadamente avanzado
- Situaciones que requieren C1/C2

FORMATO JSON REQUERIDO - 8 ejercicios B1 intermedios:
{
  "exercises": [
    {
      "question": "[Situación profesional/compleja en inglés / Situación en español]",
      "instruction": "Selecciona la respuesta correcta",
      "options": ["[opción correcta]", "[opción incorrecta]", "[opción incorrecta]", "[opción incorrecta]"],
      "correctAnswer": 0,
      "explanation": "🎯 [Explicación en español de estructuras intermedias y uso profesional]",
      "topic": "[trabajo y profesión, problemas y soluciones, opiniones y argumentos, situaciones hipotéticas]"
    }
  ]
}

🎯 GENERAR EXACTAMENTE 8 EJERCICIOS B1 INTERMEDIOS PARA INDEPENDENCIA COMUNICATIVA.`;

      case 'B2':
        return `Eres un profesor de inglés para estudiantes AVANZADOS hispanohablantes.

${baseInfo}

🎯 NIVEL B2 - INGLÉS AVANZADO PARA FLUIDEZ:
Estudiante que necesita refinamiento y fluidez en situaciones complejas y profesionales.

✅ OBLIGATORIO - SOLO ESTAS SITUACIONES B2:
1. **COMUNICACIÓN PROFESIONAL AVANZADA** (25%)
   - "In a business meeting, how do you present a counterargument?" → ["While I understand your perspective, I'd like to propose an alternative approach", "I think you're wrong", "That's not good", "I don't agree with you"]
   - "How do you diplomatically suggest changes to a colleague's proposal?" → ["Have you considered incorporating...", "Your idea is bad", "Change this please", "I don't like this"]

2. **VOCABULARIO SOFISTICADO Y MATICES** (25%)
   - "Which word best describes someone who adapts easily to change?" → ["versatile", "good", "nice", "happy"]
   - "Complete: 'The new policy has had _____ consequences for our department.'" → ["far-reaching", "big", "many", "some"]

3. **ESTRUCTURAS GRAMATICALES COMPLEJAS** (25%)
   - "Complete: 'Had I known about the traffic, I _____ earlier.'" → ["would have left", "will leave", "leave", "left"]
   - "Which sentence uses the subjunctive correctly?" → ["I suggest that he be more careful", "I suggest that he is more careful", "I suggest he careful", "I suggest he be careful"]

4. **ANÁLISIS Y CRÍTICA** (25%)
   - "How do you analyze the pros and cons of remote work?" → ["While remote work offers flexibility, it may impact collaboration", "Remote work good and bad", "I like work from home", "Office better than home"]
   - "Express a nuanced opinion about social media:" → ["Social media serves as a double-edged sword in modern communication", "Social media good and bad", "I like Facebook", "Internet is useful"]

❌ PROHIBIDO PARA B2:
- Ejercicios demasiado básicos (A1/A2 level)
- Situaciones que no requieren fluidez avanzada

FORMATO JSON REQUERIDO - 8 ejercicios B2 avanzados:
{
  "exercises": [
    {
      "question": "[Situación profesional avanzada en inglés / Situación en español]",
      "instruction": "Selecciona la respuesta correcta",
      "options": ["[opción correcta sofisticada]", "[opción incorrecta]", "[opción incorrecta]", "[opción incorrecta]"],
      "correctAnswer": 0,
      "explanation": "🎯 [Explicación en español de matices avanzados y uso profesional]",
      "topic": "[comunicación profesional avanzada, vocabulario sofisticado, gramática compleja, análisis y crítica]"
    }
  ]
}

🎯 GENERAR EXACTAMENTE 8 EJERCICIOS B2 AVANZADOS PARA FLUIDEZ PROFESIONAL.`;

      default:
        return this.getLevelSpecificPrompt('A1', params);
    }
  }

  // ✅ NUEVA FUNCIÓN: Generar ejercicios prácticos específicos
  private generatePracticalExercise(level: string, exerciseNumber: number): string {
    const practicalExercises = {
      'A1': [
        {
          type: "ordering",
          question: "Ordena las palabras para pedir comida en un restaurante: / Order the words to ask for food at a restaurant:",
          words: ["I", "would", "like", "pizza", "please"],
          correct: "I would like pizza, please",
          options: ["I would like pizza, please", "Pizza I would please like", "Please pizza I would like", "Like I would pizza please"]
        },
        {
          type: "conversation",
          question: "You want to know the time. What do you ask? / Quieres saber la hora. ¿Qué preguntas?",
          options: ["What time is it?", "How much time?", "Time please give", "Where is time?"]
        },
        {
          type: "situation",
          question: "At a store, you can't find something. How do you ask for help? / En una tienda, no encuentras algo. ¿Cómo pides ayuda?",
          options: ["Excuse me, where is the bathroom?", "Help me find something", "I need assistance, please", "Where are things?"]
        },
        {
          type: "practical_response",
          question: "Someone says 'How are you?' What's the most common response? / Alguien dice '¿Cómo estás?' ¿Cuál es la respuesta más común?",
          options: ["I'm fine, thank you", "I am very good person", "My life is okay", "I feel many things"]
        }
      ],
      'A2': [
        {
          type: "workplace",
          question: "Your boss asks 'Can you finish this by tomorrow?' How do you respond positively? / Tu jefe pregunta '¿Puedes terminar esto para mañana?' ¿Cómo respondes positivamente?",
          options: ["Yes, I can do that", "Tomorrow I will finish", "I think maybe yes", "Work tomorrow is possible"]
        },
        {
          type: "appointment",
          question: "You need to reschedule a meeting. What do you say? / Necesitas reprogramar una reunión. ¿Qué dices?",
          options: ["Can we reschedule for tomorrow?", "Meeting change tomorrow please", "I no can meeting today", "Tomorrow better for meeting"]
        },
        {
          type: "problem_solving",
          question: "You're explaining a problem at work. How do you start? / Estás explicando un problema en el trabajo. ¿Cómo empiezas?",
          options: ["I've been having an issue with...", "Problem I have with...", "Bad thing happen with...", "Issue is with..."]
        }
      ]
    };
    
    const levelExercises = practicalExercises[level as keyof typeof practicalExercises] || practicalExercises['A1'];
    const selected = levelExercises[exerciseNumber % levelExercises.length];
    
    return `
**SITUACIÓN PRÁCTICA:**
Pregunta: "${selected.question}"
Opciones educativas que enseñan inglés REAL:
${selected.options.map((opt, i) => `${i === 0 ? '✓' : ''} ${opt}`).join('\n')}
`;
  }

  // ✅ NUEVA FUNCIÓN: Calcular similitud entre textos
  private calculateTextSimilarity(text1: string, text2: string): number {
    // Algoritmo simple de similitud de texto
    const words1 = text1.split(' ').filter(w => w.length > 1); // Filtrar palabras muy cortas
    const words2 = text2.split(' ').filter(w => w.length > 1);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    let commonWords = 0;
    words1.forEach(word1 => {
      if (words2.some(word2 => 
        word2.includes(word1) || word1.includes(word2) || 
        Math.abs(word1.length - word2.length) <= 1 && this.levenshteinDistance(word1, word2) <= 1
      )) {
        commonWords++;
      }
    });
    
    const maxWords = Math.max(words1.length, words2.length);
    return commonWords / maxWords;
  }

  // ✅ NUEVA FUNCIÓN: Distancia de Levenshtein para detectar palabras muy similares
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
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
