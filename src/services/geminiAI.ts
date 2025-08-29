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
- OPCIONES MUY SIMILARES que confunden al usuario

✅ OBLIGATORIO PARA PRINCIPIANTES:
- 8 ejercicios COMPLETAMENTE diferentes
- Cada ejercicio debe enseñar algo específico y único
- TODAS las preguntas DEBEN ser bilingües (inglés/español)
- TODAS las explicaciones DEBEN estar en español
- Vocabulario BÁSICO y COTIDIANO (familia, comida, casa, colores)
- NO usar palabras avanzadas como "seamless", "bandwidth", "workload"
- Contextos FAMILIARES para principiantes (casa, familia, comida básica)
- Emojis correctos si se usan

TIPOS DE EJERCICIO BILINGÜES (2 de cada tipo en orden):
1-2. VOCABULARIO: "What does '[word]' mean? / ¿Qué significa '[word]'?" (PALABRAS BÁSICAS)
3-4. GRAMÁTICA: "I _____ happy. / Yo estoy feliz." (ESTRUCTURAS SIMPLES)
5-6. TRADUCCIÓN: "¿Cómo se dice '[frase básica]'? / How do you say '[frase básica]'?"
7-8. COMPRENSIÓN: "Texto bilingüe corto + pregunta en español e inglés"

EJEMPLOS ESPECÍFICOS POR NIVEL:

${params.level === 'A1' ? `
NIVEL A1 - SÚPER BÁSICO Y BILINGÜE:
1. "What does 'cat' mean? / ¿Qué significa 'cat'?" → opciones: ["gato", "perro", "casa", "mesa"]
2. "I _____ hungry. / Yo tengo hambre." → opciones: ["am", "is", "are", "be"] 
3. "¿Cómo se dice 'hola'? / How do you say 'hola'?" → opciones: ["hello", "goodbye", "thanks", "sorry"]
4. "She _____ pizza. / Ella come pizza." → opciones: ["eats", "eat", "eating", "ate"]
5. "¿Cómo se dice 'mi casa'? / How do you say 'mi casa'?" → opciones: ["my house", "my family", "my friend", "my work"]
6. "We _____ happy. / Nosotros estamos felices." → opciones: ["are", "is", "am", "be"]
7. "Texto: 'Hi, I am Ana. I like apples.' / Hola, soy Ana. Me gustan las manzanas. ¿Qué le gusta a Ana? / What does Ana like?" → opciones: ["apples", "oranges", "bananas", "grapes"]
8. "What color is this? / ¿De qué color es esto? 🔴" → opciones: ["red", "blue", "green", "yellow"]
` : ''}

${params.level === 'A2' ? `
NIVEL A2 - ELEMENTAL Y BILINGÜE:
1. "What does 'breakfast' mean? / ¿Qué significa 'breakfast'?" → opciones: ["desayuno", "almuerzo", "cena", "merienda"]
2. "She _____ to work every day. / Ella va al trabajo todos los días." → opciones: ["goes", "go", "going", "went"]
3. "¿Cómo se dice 'me gusta leer'? / How do you say 'me gusta leer'?" → opciones: ["I like reading", "I love books", "I read always", "I want read"]
4. "They _____ at home yesterday. / Ellos estuvieron en casa ayer." → opciones: ["were", "was", "are", "is"]
5. "¿Cómo se dice 'tengo que trabajar'? / How do you say 'tengo que trabajar'?" → opciones: ["I have to work", "I want to work", "I like to work", "I can work"]
6. "He _____ his homework every night. / Él hace su tarea todas las noches." → opciones: ["does", "do", "doing", "did"]
7. "Texto: 'Tom works at a school. He teaches math.' / Tom trabaja en una escuela. Enseña matemáticas. ¿Qué enseña Tom? / What does Tom teach?" → opciones: ["math", "English", "science", "history"]
8. "What does 'tired' mean? / ¿Qué significa 'tired'?" → opciones: ["cansado", "feliz", "triste", "enojado"]
` : ''}

INSTRUCCIONES DE VALIDACIÓN INTERNA:
1. ¿Cada pregunta enseña algo diferente?
2. ¿Las 8 preguntas son completamente únicas?
3. ¿La respuesta no está obvia en la pregunta?
4. ¿Los emojis coinciden con el contenido?
5. ¿Realmente enseñan inglés práctico?
6. ¿Las opciones son SUFICIENTEMENTE DIFERENTES entre sí?
7. ¿No hay dos opciones que significan casi lo mismo?

❌ PROHIBIDO ABSOLUTO - OPCIONES SIMILARES:
- "Me gusta las manzanas" y "Me gustan las manzanas" (demasiado similares)
- "I am happy" y "I'm happy" (son lo mismo)
- "big house" y "large house" (sinónimos confusos para principiantes)

✅ OBLIGATORIO - OPCIONES DISTINTIVAS:
- Cada opción debe ser CLARAMENTE diferente en significado
- Para gramática: usar tiempos COMPLETAMENTE diferentes (am/was/will be)
- Para vocabulario: usar palabras de CATEGORÍAS diferentes (apple/car/house/red)
- Para traducción: opciones que NO se parezcan fonéticamente

FORMATO JSON REQUERIDO (array de 8 ejercicios):
{
  "exercises": [
    {
      "question": "[Pregunta bilingüe: English question / Pregunta en español]",
      "instruction": "Selecciona la respuesta correcta",
      "options": ["opción1", "opción2", "opción3", "opción4"],
      "correctAnswer": 0,
      "explanation": "🎯 [Explicación COMPLETA en español para principiantes]",
      "topic": "[tema básico]"
    }
  ]
}

🚨 RECORDATORIO CRÍTICO PARA PRINCIPIANTES:
- TODAS las preguntas deben tener formato: "English question / Pregunta en español"
- TODAS las explicaciones deben estar en español claro
- Vocabulario debe ser BÁSICO (casa, familia, comida, colores, números)
- NO usar palabras técnicas como "seamless", "bandwidth", "workload"
- Contextos familiares: hogar, familia, comida, trabajo básico

¡GENERA 8 EJERCICIOS ÚNICOS, BILINGÜES Y EDUCATIVOS PARA PRINCIPIANTES!`;

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
