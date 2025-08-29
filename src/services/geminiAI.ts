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

    const enhancedPrompt = `Eres un profesor EXPERTO que crea ejercicios REALMENTE ÚTILES para hispanohablantes nivel ${params.level}.

🎯 OBJETIVO: Generar 8 ejercicios que REALMENTE enseñen inglés práctico y útil.

NIVEL DEL ESTUDIANTE: ${params.level}
EJERCICIOS COMPLETADOS: ${params.completedLessons || 0}
DEBILIDADES: ${params.userWeaknesses?.join(', ') || 'ninguna detectada'}

❌ PROHIBIDO ABSOLUTO - EJERCICIOS INÚTILES:
- Vocabulario obvio ("What does 'sister' mean?" → hermana)
- Preguntas donde la respuesta está literal en el texto
- Colores básicos, números, familia (son demasiado básicos)
- Traducción directa palabra por palabra
- Ejercicios que no enseñan inglés REAL

✅ OBLIGATORIO - EJERCICIOS EDUCATIVOS ÚTILES:

**TIPO 1: CONSTRUCCIÓN DE ORACIONES (25% de ejercicios)**
Ejemplo: "Ordena las palabras para formar una oración correcta:"
- Palabras desordenadas: [every, go, I, to, day, work]
- Respuesta: "I go to work every day"
- Opciones: ["I go to work every day", "Every day I work go to", "Work I go every day to", "To work every I go day"]

**TIPO 2: GRAMÁTICA EN CONTEXTO REAL (25% de ejercicios)**
Ejemplo: "Complete the conversation between friends:"
- "Hi! How _____ your weekend?"
- Opciones: ["was", "were", "is", "are"]
- Contexto: Conversación real entre amigos

**TIPO 3: SITUACIONES PRÁCTICAS (25% de ejercicios)**
Ejemplo: "You're at a restaurant. How do you ask for the menu?"
- Opciones: ["Can I have the menu, please?", "Where is food?", "Give me eating", "Menu I want"]
- Enseña inglés que SÍ se usa en la vida real

**TIPO 4: COMPRENSIÓN CON INFERENCIA (25% de ejercicios)**
Ejemplo: "Sarah says 'I'm exhausted!' after running. What does 'exhausted' probably mean?"
- Opciones: ["very tired", "very happy", "very hungry", "very cold"]
- Enseña vocabulario por CONTEXTO, no memorización

REGLAS PEDAGÓGICAS CRÍTICAS:
1. Cada ejercicio debe enseñar algo NUEVO y ÚTIL
2. Enfocar en ESTRUCTURAS que se usan diariamente
3. Crear SITUACIONES REALES (restaurante, trabajo, amigos)
4. Opciones deben ser TODAS plausibles (no obvias)
5. Enseñar por CONTEXTO e INFERENCIA, no memorización

VOCABULARIO ÚTIL PARA NIVEL ${params.level}:
${params.level === 'A1' ? `
- Verbos de acción: want, need, like, have, go, come, see, hear
- Situaciones: ordering food, asking directions, shopping, making friends
- Estructuras: "Can I...?", "I would like...", "How much is...?"
` : ''}

${params.level === 'A2' ? `
- Tiempos verbales: present perfect, past continuous, future plans
- Situaciones: job interviews, making appointments, explaining problems
- Estructuras: "I have been...", "I was doing...", "I'm going to..."
` : ''}

EJEMPLOS ESPECÍFICOS POR NIVEL:

${params.level === 'A1' ? `
NIVEL A1 - INGLÉS PRÁCTICO Y ÚTIL:
1. "At a restaurant, how do you ask for water? / En un restaurante, ¿cómo pides agua?" → opciones: ["Can I have water, please?", "Water me give", "I want water now", "Where water is?"]
2. "Complete the conversation: 'Hi! How _____ you?' / Completa la conversación: '¡Hola! ¿Cómo _____ tú?'" → opciones: ["are", "is", "am", "be"]
3. "You're lost. How do you ask for directions? / Estás perdido. ¿Cómo pides direcciones?" → opciones: ["Excuse me, where is...?", "Tell me place now", "I need go there", "Direction please give"]
4. "Order these words to make a sentence: [want, I, to, home, go] / Ordena estas palabras para hacer una oración:" → opciones: ["I want to go home", "Want I to go home", "Home I want go to", "Go home I want to"]
5. "At a store, the clerk says 'Can I help you?' What does this mean? / En una tienda, el empleado dice 'Can I help you?' ¿Qué significa esto?" → opciones: ["¿Puedo ayudarte?", "¿Tienes dinero?", "¿Qué quieres comprar?", "¿De dónde eres?"]
6. "Complete: 'I _____ coffee every morning.' / Completa: 'Yo _____ café cada mañana.'" → opciones: ["drink", "drinks", "drinking", "drank"]
7. "Someone says 'Nice to meet you!' What do you respond? / Alguien dice '¡Mucho gusto!' ¿Qué respondes?" → opciones: ["Nice to meet you too!", "Thank you very much!", "I am fine, thanks!", "See you later!"]
8. "You want to buy something but don't know the price. What do you ask? / Quieres comprar algo pero no sabes el precio. ¿Qué preguntas?" → opciones: ["How much is this?", "What price this?", "Money how much?", "Cost what is?"]
` : ''}

${params.level === 'A2' ? `
NIVEL A2 - INGLÉS PRÁCTICO AVANZADO:
1. "At a job interview, they ask 'What are your strengths?' How do you respond? / En una entrevista de trabajo, preguntan '¿Cuáles son tus fortalezas?' ¿Cómo respondes?" → opciones: ["I am hardworking and reliable", "I like work very much", "I have many good things", "Work is good for me"]
2. "Complete the conversation: 'I _____ working here since 2020.' / Completa la conversación: 'Yo _____ trabajando aquí desde 2020.'" → opciones: ["have been", "am", "was", "will be"]
3. "You need to reschedule a meeting. What do you say? / Necesitas reprogramar una reunión. ¿Qué dices?" → opciones: ["Can we reschedule for tomorrow?", "Meeting change tomorrow please", "I no can meeting today", "Tomorrow better for meeting"]
4. "Order these words: [going, I'm, to, the, visit, museum] / Ordena estas palabras:" → opciones: ["I'm going to visit the museum", "Going I'm to visit the museum", "The museum I'm going to visit", "Visit the museum I'm going to"]
5. "Someone says 'I'm feeling under the weather.' What do they mean? / Alguien dice 'I'm feeling under the weather.' ¿Qué quieren decir?" → opciones: ["I'm feeling sick", "I'm feeling cold", "I'm feeling happy", "I'm feeling confused"]
6. "Complete: 'If I _____ time, I would travel more.' / Completa: 'Si yo _____ tiempo, viajaría más.'" → opciones: ["had", "have", "has", "having"]
7. "You're explaining a problem at work. How do you start? / Estás explicando un problema en el trabajo. ¿Cómo empiezas?" → opciones: ["I've been having an issue with...", "Problem I have with...", "Bad thing happen with...", "Issue is with..."]
8. "Someone asks 'How long have you been studying English?' You started 2 years ago. What do you answer? / Alguien pregunta '¿Cuánto tiempo has estado estudiando inglés?' Empezaste hace 2 años. ¿Qué respondes?" → opciones: ["I've been studying for 2 years", "I study English 2 years", "2 years I am studying", "Since 2 years I study"]
` : ''}

INSTRUCCIONES DE VALIDACIÓN INTERNA:
1. ¿Cada pregunta enseña inglés ÚTIL para la vida real?
2. ¿Las situaciones son PRÁCTICAS (restaurante, trabajo, tienda)?
3. ¿Las opciones enseñan ESTRUCTURAS que se usan diariamente?
4. ¿Evita vocabulario obvio como colores, números, familia?
5. ¿Enseña por CONTEXTO e INFERENCIA, no memorización?
6. ¿Las opciones son TODAS plausibles pero solo una correcta?
7. ¿Realmente prepara al estudiante para USAR inglés real?

❌ PROHIBIDO ABSOLUTO - OPCIONES SIMILARES:
- "Me gusta las manzanas" y "Me gustan las manzanas" (demasiado similares)
- "I am happy" y "I'm happy" (son lo mismo)
- "big house" y "large house" (sinónimos confusos para principiantes)

✅ OBLIGATORIO - OPCIONES DISTINTIVAS:
- Cada opción debe ser CLARAMENTE diferente en significado
- Para gramática: usar tiempos COMPLETAMENTE diferentes (am/was/will be)
- Para vocabulario: usar palabras de CATEGORÍAS diferentes (apple/car/house/red)
- Para traducción: opciones que NO se parezcan fonéticamente

FORMATO JSON REQUERIDO - 8 ejercicios ÚNICOS y ÚTILES:
{
  "exercises": [
    {
      "question": "[Situación real práctica en inglés / Situación en español]",
      "instruction": "[Instrucción clara de qué hacer]",
      "options": ["[opción útil 1]", "[opción útil 2]", "[opción útil 3]", "[opción útil 4]"],
      "correctAnswer": 0,
      "explanation": "🎯 [Por qué esta estructura es útil en inglés real + cuándo usarla]",
      "topic": "[gramática práctica, conversación real, situaciones útiles]"
    }
  ]
}

🚨 RECORDATORIO CRÍTICO PARA INGLÉS PRÁCTICO:
- TODAS las preguntas deben enseñar inglés que se USA en la vida real
- TODAS las explicaciones deben explicar CUÁNDO y CÓMO usar la estructura
- Situaciones REALES: restaurante, tienda, trabajo, conversaciones
- NO vocabulario obvio: evitar colores, números, familia básica
- Contextos ÚTILES: pedir ayuda, hacer preguntas, expresar necesidades

¡GENERA 8 EJERCICIOS QUE REALMENTE ENSEÑEN INGLÉS ÚTIL PARA LA VIDA REAL!`;

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
