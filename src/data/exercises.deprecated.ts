/*
 * ⚠️ DEPRECATED: Estos ejercicios estáticos ya no se usan.
 * La app funciona 100% con IA personalizada (Google Gemini).
 * Este archivo se mantiene solo como backup histórico.
 * 
 * Fecha de depreciación: Diciembre 2024
 */

export interface LevelExercise {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  type: 'vocabulary' | 'grammar' | 'translation' | 'comprehension';
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  question: string;
  instruction: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  skills: string[];
}

// BANCO MASIVO DE EJERCICIOS POR NIVEL REAL
export const LEVEL_EXERCISES: Record<string, LevelExercise[]> = {
  
  // ===== A1: PRINCIPIANTE ABSOLUTO =====
  'A1': [
    // Vocabulario básico
    {
      id: 'a1_vocab_001', level: 'A1', type: 'vocabulary', difficulty: 'beginner',
      question: "What does 'hello' mean?",
      instruction: "Selecciona el significado en español",
      options: ["hola", "adiós", "gracias", "perdón"],
      correctAnswer: 0,
      explanation: "🎯 'Hello' es la forma más común de saludar en inglés. Es como decir 'hola' en español.",
      topic: "greetings", skills: ['basic_vocabulary']
    },
    {
      id: 'a1_vocab_002', level: 'A1', type: 'vocabulary', difficulty: 'beginner',
      question: "What does 'water' mean?",
      instruction: "Selecciona el significado",
      options: ["agua", "fuego", "tierra", "aire"],
      correctAnswer: 0,
      explanation: "🎯 'Water' significa 'agua'. Es una palabra básica muy importante.",
      topic: "basic_nouns", skills: ['basic_vocabulary']
    },
    {
      id: 'a1_vocab_003', level: 'A1', type: 'vocabulary', difficulty: 'beginner',
      question: "What does 'cat' mean?",
      instruction: "Selecciona la traducción",
      options: ["gato", "perro", "pájaro", "pez"],
      correctAnswer: 0,
      explanation: "🎯 'Cat' significa 'gato'. Es una de las primeras palabras que aprendemos sobre animales.",
      topic: "animals", skills: ['basic_vocabulary']
    },
    {
      id: 'a1_vocab_004', level: 'A1', type: 'vocabulary', difficulty: 'beginner',
      question: "What does 'book' mean?",
      instruction: "Selecciona el significado",
      options: ["libro", "mesa", "silla", "ventana"],
      correctAnswer: 0,
      explanation: "🎯 'Book' significa 'libro'. Objeto fundamental para aprender.",
      topic: "objects", skills: ['basic_vocabulary']
    },
    {
      id: 'a1_vocab_005', level: 'A1', type: 'vocabulary', difficulty: 'beginner',
      question: "What does 'red' mean?",
      instruction: "Selecciona el color",
      options: ["rojo", "azul", "verde", "amarillo"],
      correctAnswer: 0,
      explanation: "🎯 'Red' significa 'rojo'. Los colores son vocabulario básico esencial.",
      topic: "colors", skills: ['basic_vocabulary']
    },
    
    // Gramática básica
    {
      id: 'a1_gram_001', level: 'A1', type: 'grammar', difficulty: 'beginner',
      question: "I _____ a student.",
      instruction: "Completa con verbo TO BE",
      options: ["am", "is", "are", "be"],
      correctAnswer: 0,
      explanation: "🎯 Con 'I' (yo) usamos 'am'. Es la forma más básica del verbo ser/estar: I am = yo soy/estoy.",
      topic: "verb_to_be", skills: ['verb_to_be']
    },
    {
      id: 'a1_gram_002', level: 'A1', type: 'grammar', difficulty: 'beginner',
      question: "She _____ my friend.",
      instruction: "Completa con TO BE",
      options: ["am", "is", "are", "be"],
      correctAnswer: 1,
      explanation: "🎯 Con 'She' (ella) usamos 'is'. Recuerda: I am, You are, He/She/It is.",
      topic: "verb_to_be", skills: ['verb_to_be']
    },
    {
      id: 'a1_gram_003', level: 'A1', type: 'grammar', difficulty: 'beginner',
      question: "We _____ happy.",
      instruction: "Completa con TO BE",
      options: ["am", "is", "are", "be"],
      correctAnswer: 2,
      explanation: "🎯 Con 'We' (nosotros) usamos 'are'. Plural siempre usa 'are'.",
      topic: "verb_to_be", skills: ['verb_to_be']
    },
    {
      id: 'a1_gram_004', level: 'A1', type: 'grammar', difficulty: 'beginner',
      question: "This _____ a dog.",
      instruction: "Completa con TO BE",
      options: ["am", "is", "are", "be"],
      correctAnswer: 1,
      explanation: "🎯 'This' (esto/este) es singular, por lo tanto usamos 'is'.",
      topic: "verb_to_be", skills: ['verb_to_be']
    },
    
    // Traducción básica
    {
      id: 'a1_trans_001', level: 'A1', type: 'translation', difficulty: 'beginner',
      question: "¿Cómo se dice 'gracias' en inglés?",
      instruction: "Selecciona la traducción",
      options: ["thank you", "please", "excuse me", "sorry"],
      correctAnswer: 0,
      explanation: "🎯 'Thank you' significa 'gracias'. Es una expresión de cortesía básica.",
      topic: "politeness", skills: ['basic_vocabulary']
    },
    {
      id: 'a1_trans_002', level: 'A1', type: 'translation', difficulty: 'beginner',
      question: "¿Cómo se dice 'casa' en inglés?",
      instruction: "Selecciona la traducción",
      options: ["house", "car", "tree", "road"],
      correctAnswer: 0,
      explanation: "🎯 'House' significa 'casa'. Lugar donde vivimos.",
      topic: "places", skills: ['basic_vocabulary']
    },
    
    // Números básicos
    {
      id: 'a1_num_001', level: 'A1', type: 'vocabulary', difficulty: 'beginner',
      question: "What number is 'three'?",
      instruction: "Selecciona el número",
      options: ["3", "13", "30", "33"],
      correctAnswer: 0,
      explanation: "🎯 'Three' es el número 3. Los números básicos son fundamentales.",
      topic: "numbers", skills: ['basic_vocabulary']
    },
    {
      id: 'a1_num_002', level: 'A1', type: 'vocabulary', difficulty: 'beginner',
      question: "What number is 'ten'?",
      instruction: "Selecciona el número",
      options: ["10", "1", "100", "2"],
      correctAnswer: 0,
      explanation: "🎯 'Ten' es el número 10. Base del sistema decimal.",
      topic: "numbers", skills: ['basic_vocabulary']
    }
  ],
  
  // ===== A2: ELEMENTAL =====
  'A2': [
    // Presente perfecto
    {
      id: 'a2_gram_001', level: 'A2', type: 'grammar', difficulty: 'elementary',
      question: "I _____ _____ English for two years.",
      instruction: "Completa con Present Perfect",
      options: ["have studied", "has studied", "am studying", "studied"],
      correctAnswer: 0,
      explanation: "🎯 Present Perfect con 'for + tiempo': have studied. Indica experiencia que continúa hasta ahora.",
      topic: "present_perfect", skills: ['present_perfect']
    },
    {
      id: 'a2_gram_002', level: 'A2', type: 'grammar', difficulty: 'elementary',
      question: "She _____ _____ to Paris three times.",
      instruction: "Completa con Present Perfect",
      options: ["have been", "has been", "is being", "was"],
      correctAnswer: 1,
      explanation: "🎯 Con 'She' usamos 'has been'. Present Perfect para experiencias de vida.",
      topic: "present_perfect", skills: ['present_perfect']
    },
    {
      id: 'a2_gram_003', level: 'A2', type: 'grammar', difficulty: 'elementary',
      question: "We _____ _____ our homework yet.",
      instruction: "Present Perfect con 'yet'",
      options: ["haven't finished", "hasn't finished", "don't finish", "didn't finish"],
      correctAnswer: 0,
      explanation: "🎯 'Yet' se usa con Present Perfect negativo. Haven't finished = no hemos terminado aún.",
      topic: "present_perfect", skills: ['present_perfect']
    },
    
    // Vocabulario intermedio
    {
      id: 'a2_vocab_001', level: 'A2', type: 'vocabulary', difficulty: 'elementary',
      question: "What does 'excited' mean?",
      instruction: "Selecciona el significado",
      options: ["emocionado", "triste", "enojado", "cansado"],
      correctAnswer: 0,
      explanation: "🎯 'Excited' significa 'emocionado'. Se usa para expresar entusiasmo por algo.",
      topic: "emotions", skills: ['intermediate_vocabulary']
    },
    {
      id: 'a2_vocab_002', level: 'A2', type: 'vocabulary', difficulty: 'elementary',
      question: "What does 'disappointed' mean?",
      instruction: "Selecciona la emoción",
      options: ["decepcionado", "feliz", "sorprendido", "confundido"],
      correctAnswer: 0,
      explanation: "🎯 'Disappointed' significa 'decepcionado'. Cuando algo no cumple nuestras expectativas.",
      topic: "emotions", skills: ['intermediate_vocabulary']
    },
    {
      id: 'a2_vocab_003', level: 'A2', type: 'vocabulary', difficulty: 'elementary',
      question: "What does 'exhausted' mean?",
      instruction: "Selecciona el significado",
      options: ["agotado", "energético", "relajado", "nervioso"],
      correctAnswer: 0,
      explanation: "🎯 'Exhausted' significa 'agotado'. Más fuerte que 'tired' (cansado).",
      topic: "emotions", skills: ['intermediate_vocabulary']
    },
    
    // Preposiciones
    {
      id: 'a2_gram_004', level: 'A2', type: 'grammar', difficulty: 'elementary',
      question: "The meeting is _____ Monday _____ 3 PM.",
      instruction: "Preposiciones de tiempo",
      options: ["on / at", "in / on", "at / in", "in / at"],
      correctAnswer: 0,
      explanation: "🎯 'On' para días específicos, 'at' para horas exactas. On Monday at 3 PM es correcto.",
      topic: "prepositions", skills: ['prepositions']
    },
    {
      id: 'a2_gram_005', level: 'A2', type: 'grammar', difficulty: 'elementary',
      question: "I was born _____ 1995 _____ December.",
      instruction: "Preposiciones de tiempo",
      options: ["in / in", "on / in", "at / on", "in / on"],
      correctAnswer: 0,
      explanation: "🎯 'In' para años y meses. In 1995 in December es correcto.",
      topic: "prepositions", skills: ['prepositions']
    },
    {
      id: 'a2_gram_006', level: 'A2', type: 'grammar', difficulty: 'elementary',
      question: "The book is _____ the table.",
      instruction: "Preposición de lugar",
      options: ["on", "in", "at", "by"],
      correctAnswer: 0,
      explanation: "🎯 'On' para superficies. El libro está sobre la mesa.",
      topic: "prepositions", skills: ['prepositions']
    },
    
    // Pasado simple
    {
      id: 'a2_gram_007', level: 'A2', type: 'grammar', difficulty: 'elementary',
      question: "Yesterday I _____ to the movies.",
      instruction: "Pasado simple",
      options: ["went", "go", "have gone", "going"],
      correctAnswer: 0,
      explanation: "🎯 'Went' es el pasado de 'go'. Para acciones terminadas en el pasado.",
      topic: "past_simple", skills: ['past_simple']
    },
    {
      id: 'a2_gram_008', level: 'A2', type: 'grammar', difficulty: 'elementary',
      question: "She _____ her keys last night.",
      instruction: "Pasado simple",
      options: ["lost", "lose", "has lost", "losing"],
      correctAnswer: 0,
      explanation: "🎯 'Lost' es el pasado de 'lose'. Acción específica en el pasado.",
      topic: "past_simple", skills: ['past_simple']
    },
    
    // Conversación básica
    {
      id: 'a2_conv_001', level: 'A2', type: 'vocabulary', difficulty: 'elementary',
      question: "How do you respond to 'How are you?'",
      instruction: "Respuesta apropiada",
      options: ["I'm fine, thank you", "Yes, please", "You're welcome", "Excuse me"],
      correctAnswer: 0,
      explanation: "🎯 'I'm fine, thank you' es la respuesta estándar a '¿Cómo estás?'",
      topic: "basic_conversation", skills: ['basic_conversation']
    },
    {
      id: 'a2_conv_002', level: 'A2', type: 'vocabulary', difficulty: 'elementary',
      question: "What do you say when you meet someone for the first time?",
      instruction: "Saludo formal",
      options: ["Nice to meet you", "See you later", "Take care", "What's up"],
      correctAnswer: 0,
      explanation: "🎯 'Nice to meet you' es el saludo estándar cuando conoces a alguien.",
      topic: "basic_conversation", skills: ['basic_conversation']
    }
  ],
  
  // ===== B1: INTERMEDIO =====
  'B1': [
    // Condicionales
    {
      id: 'b1_gram_001', level: 'B1', type: 'grammar', difficulty: 'intermediate',
      question: "If I _____ time, I _____ help you.",
      instruction: "Completa el condicional",
      options: ["have / will", "had / would", "have / would", "will have / will"],
      correctAnswer: 0,
      explanation: "🎯 First Conditional: If + present, will + infinitive. Para situaciones reales futuras.",
      topic: "conditionals", skills: ['conditionals']
    },
    {
      id: 'b1_gram_002', level: 'B1', type: 'grammar', difficulty: 'intermediate',
      question: "If I _____ rich, I _____ travel around the world.",
      instruction: "Second conditional",
      options: ["was / would", "were / would", "am / will", "were / will"],
      correctAnswer: 1,
      explanation: "🎯 Second Conditional: If + past, would + infinitive. 'Were' se usa con todos los sujetos en condicionales.",
      topic: "conditionals", skills: ['conditionals']
    },
    {
      id: 'b1_gram_003', level: 'B1', type: 'grammar', difficulty: 'intermediate',
      question: "If she _____ harder, she _____ the exam.",
      instruction: "Third conditional",
      options: ["had studied / would have passed", "studied / would pass", "studies / will pass", "has studied / would pass"],
      correctAnswer: 0,
      explanation: "🎯 Third Conditional: If + past perfect, would have + past participle. Para situaciones hipotéticas del pasado.",
      topic: "conditionals", skills: ['conditionals']
    },
    
    // Voz pasiva
    {
      id: 'b1_gram_004', level: 'B1', type: 'grammar', difficulty: 'intermediate',
      question: "The house _____ _____ by my grandfather in 1950.",
      instruction: "Completa con voz pasiva",
      options: ["was built", "is built", "has built", "will build"],
      correctAnswer: 0,
      explanation: "🎯 Voz pasiva en pasado: was/were + participio. 'Was built' = fue construida.",
      topic: "passive_voice", skills: ['passive_voice']
    },
    {
      id: 'b1_gram_005', level: 'B1', type: 'grammar', difficulty: 'intermediate',
      question: "English _____ _____ all over the world.",
      instruction: "Voz pasiva presente",
      options: ["is spoken", "speaks", "has spoken", "was spoken"],
      correctAnswer: 0,
      explanation: "🎯 Voz pasiva presente: is/are + participio. 'Is spoken' = se habla.",
      topic: "passive_voice", skills: ['passive_voice']
    },
    {
      id: 'b1_gram_006', level: 'B1', type: 'grammar', difficulty: 'intermediate',
      question: "The project _____ _____ _____ next month.",
      instruction: "Voz pasiva futuro",
      options: ["will be completed", "will complete", "is completing", "has completed"],
      correctAnswer: 0,
      explanation: "🎯 Voz pasiva futuro: will be + participio. 'Will be completed' = será completado.",
      topic: "passive_voice", skills: ['passive_voice']
    },
    
    // Vocabulario avanzado
    {
      id: 'b1_vocab_001', level: 'B1', type: 'vocabulary', difficulty: 'intermediate',
      question: "What does 'achieve' mean?",
      instruction: "Selecciona el significado más preciso",
      options: ["lograr", "intentar", "comenzar", "terminar"],
      correctAnswer: 0,
      explanation: "🎯 'Achieve' significa 'lograr' o 'conseguir'. Implica completar un objetivo exitosamente.",
      topic: "advanced_vocabulary", skills: ['advanced_vocabulary']
    },
    {
      id: 'b1_vocab_002', level: 'B1', type: 'vocabulary', difficulty: 'intermediate',
      question: "What does 'appreciate' mean?",
      instruction: "Selecciona el significado",
      options: ["apreciar/valorar", "criticar", "ignorar", "rechazar"],
      correctAnswer: 0,
      explanation: "🎯 'Appreciate' significa 'apreciar' o 'valorar'. Reconocer el valor de algo.",
      topic: "advanced_vocabulary", skills: ['advanced_vocabulary']
    },
    {
      id: 'b1_vocab_003', level: 'B1', type: 'vocabulary', difficulty: 'intermediate',
      question: "What does 'significant' mean?",
      instruction: "Selecciona el significado",
      options: ["significativo/importante", "pequeño", "común", "temporal"],
      correctAnswer: 0,
      explanation: "🎯 'Significant' significa 'significativo' o 'importante'. Algo que tiene gran impacto.",
      topic: "advanced_vocabulary", skills: ['advanced_vocabulary']
    },
    
    // Gramática avanzada
    {
      id: 'b1_gram_007', level: 'B1', type: 'grammar', difficulty: 'intermediate',
      question: "I wish I _____ speak French fluently.",
      instruction: "Completa con 'wish'",
      options: ["could", "can", "will", "would"],
      correctAnswer: 0,
      explanation: "🎯 'I wish I could' expresa un deseo sobre una habilidad. Could = pudiera.",
      topic: "advanced_grammar", skills: ['advanced_grammar']
    },
    {
      id: 'b1_gram_008', level: 'B1', type: 'grammar', difficulty: 'intermediate',
      question: "He acts _____ he knows everything.",
      instruction: "Completa la comparación",
      options: ["as if", "like", "such as", "as well as"],
      correctAnswer: 0,
      explanation: "🎯 'As if' se usa para comparaciones hipotéticas. Como si supiera todo.",
      topic: "advanced_grammar", skills: ['advanced_grammar']
    },
    
    // Conversación fluida
    {
      id: 'b1_conv_001', level: 'B1', type: 'comprehension', difficulty: 'intermediate',
      question: "What's the best response to 'I'm having trouble with this project'?",
      instruction: "Respuesta empática",
      options: ["Would you like me to help you with it?", "That's your problem", "I don't care", "Good luck"],
      correctAnswer: 0,
      explanation: "🎯 Ofrecer ayuda es la respuesta más empática y apropiada socialmente.",
      topic: "fluent_conversation", skills: ['fluent_conversation']
    }
  ],
  
  // ===== B2: INTERMEDIO ALTO =====
  'B2': [
    // Subjuntivo
    {
      id: 'b2_gram_001', level: 'B2', type: 'grammar', difficulty: 'advanced',
      question: "I suggest that he _____ the meeting.",
      instruction: "Completa con subjuntivo",
      options: ["attends", "attend", "attended", "attending"],
      correctAnswer: 1,
      explanation: "🎯 Después de 'suggest that' usamos subjuntivo: verbo base sin 'to'. 'Attend' es correcto.",
      topic: "subjunctive", skills: ['advanced_grammar']
    },
    {
      id: 'b2_gram_002', level: 'B2', type: 'grammar', difficulty: 'advanced',
      question: "It's important that she _____ on time.",
      instruction: "Subjuntivo después de 'important that'",
      options: ["is", "be", "was", "being"],
      correctAnswer: 1,
      explanation: "🎯 Después de expresiones de importancia usamos subjuntivo: 'be' sin conjugar.",
      topic: "subjunctive", skills: ['advanced_grammar']
    },
    {
      id: 'b2_gram_003', level: 'B2', type: 'grammar', difficulty: 'advanced',
      question: "I demand that the report _____ finished by Friday.",
      instruction: "Subjuntivo con 'demand'",
      options: ["is", "be", "was", "will be"],
      correctAnswer: 1,
      explanation: "🎯 Después de 'demand that' usamos subjuntivo: 'be' en forma base.",
      topic: "subjunctive", skills: ['advanced_grammar']
    },
    
    // Expresiones idiomáticas
    {
      id: 'b2_vocab_001', level: 'B2', type: 'vocabulary', difficulty: 'advanced',
      question: "'Break the ice' means:",
      instruction: "Selecciona el significado idiomático",
      options: ["romper el hielo socialmente", "romper hielo literalmente", "enojarse mucho", "hacer frío"],
      correctAnswer: 0,
      explanation: "🎯 'Break the ice' es una expresión idiomática que significa iniciar una conversación o romper la tensión social.",
      topic: "idioms", skills: ['native_patterns']
    },
    {
      id: 'b2_vocab_002', level: 'B2', type: 'vocabulary', difficulty: 'advanced',
      question: "'Spill the beans' means:",
      instruction: "Expresión idiomática",
      options: ["revelar un secreto", "cocinar frijoles", "hacer un desastre", "perder dinero"],
      correctAnswer: 0,
      explanation: "🎯 'Spill the beans' significa revelar un secreto o información confidencial.",
      topic: "idioms", skills: ['native_patterns']
    },
    {
      id: 'b2_vocab_003', level: 'B2', type: 'vocabulary', difficulty: 'advanced',
      question: "'Hit the nail on the head' means:",
      instruction: "Significado idiomático",
      options: ["dar en el clavo/acertar exactamente", "construir algo", "lastimarse", "ser violento"],
      correctAnswer: 0,
      explanation: "🎯 'Hit the nail on the head' significa acertar exactamente o dar en el clavo.",
      topic: "idioms", skills: ['native_patterns']
    },
    
    // Comprensión avanzada
    {
      id: 'b2_comp_001', level: 'B2', type: 'comprehension', difficulty: 'advanced',
      question: "Based on the context 'The CEO's decision was unprecedented, given the company's conservative history,' what does 'unprecedented' likely mean?",
      instruction: "Deduce el significado por contexto",
      options: ["sin precedente", "predecible", "conservador", "histórico"],
      correctAnswer: 0,
      explanation: "🎯 'Unprecedented' = sin precedente. El contexto indica algo nunca antes hecho en una empresa conservadora.",
      topic: "context_clues", skills: ['nuanced_expressions']
    },
    {
      id: 'b2_comp_002', level: 'B2', type: 'comprehension', difficulty: 'advanced',
      question: "In 'Her argument was quite compelling,' what does 'compelling' suggest?",
      instruction: "Significado por contexto",
      options: ["convincente/persuasivo", "confuso", "aburrido", "agresivo"],
      correctAnswer: 0,
      explanation: "🎯 'Compelling' significa convincente o persuasivo. Un argumento que te hace creer o actuar.",
      topic: "context_clues", skills: ['nuanced_expressions']
    },
    {
      id: 'b2_comp_003', level: 'B2', type: 'comprehension', difficulty: 'advanced',
      question: "What does 'meticulous' mean in 'She was meticulous in her research'?",
      instruction: "Vocabulario avanzado",
      options: ["meticuloso/muy detallado", "rápido", "descuidado", "creativo"],
      correctAnswer: 0,
      explanation: "🎯 'Meticulous' significa meticuloso, muy cuidadoso y detallado en el trabajo.",
      topic: "advanced_vocabulary", skills: ['advanced_vocabulary']
    },
    
    // Expresiones nativas
    {
      id: 'b2_nat_001', level: 'B2', type: 'vocabulary', difficulty: 'advanced',
      question: "What does 'I'm swamped' mean?",
      instruction: "Expresión coloquial",
      options: ["estoy muy ocupado", "estoy mojado", "estoy perdido", "estoy enfermo"],
      correctAnswer: 0,
      explanation: "🎯 'I'm swamped' es una expresión coloquial que significa 'estoy muy ocupado' o 'tengo demasiado trabajo'.",
      topic: "native_expressions", skills: ['native_patterns']
    },
    {
      id: 'b2_nat_002', level: 'B2', type: 'vocabulary', difficulty: 'advanced',
      question: "What does 'piece of cake' mean?",
      instruction: "Expresión idiomática",
      options: ["muy fácil", "postre", "algo roto", "trabajo duro"],
      correctAnswer: 0,
      explanation: "🎯 'Piece of cake' significa algo muy fácil de hacer. Como decir 'pan comido' en español.",
      topic: "native_expressions", skills: ['native_patterns']
    },
    {
      id: 'b2_nat_003', level: 'B2', type: 'vocabulary', difficulty: 'advanced',
      question: "What does 'under the weather' mean?",
      instruction: "Expresión sobre salud",
      options: ["sentirse enfermo", "estar afuera", "tener frío", "estar triste"],
      correctAnswer: 0,
      explanation: "🎯 'Under the weather' significa sentirse un poco enfermo o indispuesto.",
      topic: "native_expressions", skills: ['native_patterns']
    },
    
    // Matices de expresión
    {
      id: 'b2_nuance_001', level: 'B2', type: 'comprehension', difficulty: 'advanced',
      question: "Which sounds more polite: 'I want coffee' or 'I'd like some coffee'?",
      instruction: "Matices de cortesía",
      options: ["I'd like some coffee", "I want coffee", "Both are equally polite", "Neither is polite"],
      correctAnswer: 0,
      explanation: "🎯 'I'd like' es más cortés que 'I want'. Los matices de cortesía son importantes en inglés.",
      topic: "politeness_levels", skills: ['nuanced_expressions']
    },
    {
      id: 'b2_nuance_002', level: 'B2', type: 'comprehension', difficulty: 'advanced',
      question: "What's the difference between 'slim' and 'skinny'?",
      instruction: "Matices de vocabulario",
      options: ["slim es más positivo que skinny", "son exactamente iguales", "skinny es más positivo", "no hay diferencia"],
      correctAnswer: 0,
      explanation: "🎯 'Slim' es más positivo (delgado de manera atractiva) mientras que 'skinny' puede ser negativo (demasiado delgado).",
      topic: "word_connotations", skills: ['nuanced_expressions']
    }
  ]
};

// FUNCIÓN PARA OBTENER EJERCICIOS POR NIVEL SIN REPETIR
export class LevelExerciseManager {
  
  // Obtener ejercicios únicos para un nivel específico
  static getUniqueExercisesForLevel(
    level: 'A1' | 'A2' | 'B1' | 'B2',
    usedIds: string[] = [],
    count: number = 8
  ): LevelExercise[] {
    
    const levelExercises = LEVEL_EXERCISES[level] || [];
    const available = levelExercises.filter(exercise => !usedIds.includes(exercise.id));
    
    // Si no hay suficientes disponibles, resetear algunos
    if (available.length < count) {
      console.log(`🔄 RESETEAR EJERCICIOS PARA NIVEL ${level} - Disponibles: ${available.length}`);
      const allExercises = [...levelExercises];
      const shuffled = allExercises.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }
    
    // Mezclar y tomar los solicitados
    const shuffled = available.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  
  // Marcar ejercicios como usados
  static markExercisesAsUsed(level: string, exerciseIds: string[]): void {
    const key = `used_level_exercises_${level}`;
    const currentUsed = JSON.parse(localStorage.getItem(key) || '[]');
    const combined = currentUsed.concat(exerciseIds);
    const updated = Array.from(new Set(combined));
    
    // Mantener solo los últimos 50 para no llenar el storage
    const limited = updated.slice(-50);
    localStorage.setItem(key, JSON.stringify(limited));
    
    console.log(`✅ EJERCICIOS MARCADOS COMO USADOS (${level}): ${exerciseIds.length}`);
  }
  
  // Obtener ejercicios usados
  static getUsedExerciseIds(level: string): string[] {
    const key = `used_level_exercises_${level}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  
  // Limpiar ejercicios usados para un nivel
  static resetUsedExercises(level: string): void {
    const key = `used_level_exercises_${level}`;
    localStorage.removeItem(key);
    console.log(`🧹 EJERCICIOS USADOS LIMPIADOS PARA NIVEL ${level}`);
  }
}