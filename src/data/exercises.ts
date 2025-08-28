// SISTEMA DE EJERCICIOS ÚNICOS - NO MÁS REPETICIONES

export interface Exercise {
  id: string;
  level: "A1" | "A2" | "B1" | "B2";
  topic: string;
  question: string;
  instruction: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  xpReward: number;
}

// BANCO MASIVO DE EJERCICIOS ÚNICOS
export const EXERCISE_BANK: Exercise[] = [
  // PRESENT SIMPLE - A1
  {
    id: "ps_01",
    level: "A1",
    topic: "present simple",
    question: "She _____ coffee every morning.",
    instruction: "Completa con Present Simple",
    options: ["drink", "drinks", "drinking", "drank"],
    correctAnswer: 1,
    explanation: "Con 'she' usamos la tercera persona singular: drinks",
    xpReward: 10
  },
  {
    id: "ps_02", 
    level: "A1",
    topic: "present simple",
    question: "Do you _____ English at school?",
    instruction: "Completa la pregunta",
    options: ["studies", "study", "studying", "studied"],
    correctAnswer: 1,
    explanation: "En preguntas con 'do' usamos el infinitivo: study",
    xpReward: 10
  },
  {
    id: "ps_03",
    level: "A1", 
    topic: "present simple",
    question: "My brother _____ work on Sundays.",
    instruction: "Forma negativa",
    options: ["don't", "doesn't", "isn't", "aren't"],
    correctAnswer: 1,
    explanation: "Con tercera persona singular usamos 'doesn't'",
    xpReward: 10
  },
  {
    id: "ps_04",
    level: "A1",
    topic: "present simple", 
    question: "Where _____ your parents live?",
    instruction: "Completa la pregunta",
    options: ["does", "do", "are", "is"],
    correctAnswer: 1,
    explanation: "Con 'parents' (plural) usamos 'do'",
    xpReward: 10
  },
  
  // PRESENT PERFECT - A2
  {
    id: "pp_01",
    level: "A2",
    topic: "present perfect",
    question: "I _____ never _____ sushi before.",
    instruction: "Completa con Present Perfect",
    options: ["have / eat", "have / eaten", "has / eaten", "had / eaten"],
    correctAnswer: 1,
    explanation: "Present Perfect: have + participio pasado (eaten)",
    xpReward: 10
  },
  {
    id: "pp_02",
    level: "A2",
    topic: "present perfect",
    question: "_____ you ever _____ to Japan?",
    instruction: "Pregunta en Present Perfect",
    options: ["Did / go", "Have / been", "Do / go", "Are / going"],
    correctAnswer: 1,
    explanation: "Para experiencias usamos 'Have you ever been'",
    xpReward: 10
  },
  {
    id: "pp_03",
    level: "A2",
    topic: "present perfect",
    question: "She _____ here since 2020.",
    instruction: "Completa la oración",
    options: ["lives", "is living", "has lived", "lived"],
    correctAnswer: 2,
    explanation: "Con 'since' usamos Present Perfect: has lived",
    xpReward: 10
  },
  {
    id: "pp_04",
    level: "A2",
    topic: "present perfect",
    question: "We _____ just _____ dinner.",
    instruction: "Acción recién completada",
    options: ["are / eating", "have / eaten", "did / eat", "will / eat"],
    correctAnswer: 1,
    explanation: "Para acciones recién completadas: have just eaten",
    xpReward: 10
  },

  // PREPOSITIONS - A2
  {
    id: "prep_01",
    level: "A2",
    topic: "prepositions",
    question: "The meeting is _____ Monday _____ 3 PM.",
    instruction: "Preposiciones de tiempo",
    options: ["in / in", "on / at", "at / on", "in / at"],
    correctAnswer: 1,
    explanation: "'On' para días, 'at' para horas específicas",
    xpReward: 10
  },
  {
    id: "prep_02",
    level: "A2",
    topic: "prepositions",
    question: "She's waiting _____ the bus stop _____ her friend.",
    instruction: "Preposiciones de lugar y compañía",
    options: ["at / with", "in / for", "on / to", "by / from"],
    correctAnswer: 0,
    explanation: "'At' para lugares específicos, 'with' para compañía",
    xpReward: 10
  },
  {
    id: "prep_03",
    level: "A2",
    topic: "prepositions",
    question: "I'm interested _____ learning more _____ this topic.",
    instruction: "Preposiciones con adjetivos",
    options: ["in / about", "on / of", "at / for", "with / to"],
    correctAnswer: 0,
    explanation: "'Interested in' y 'about' para temas",
    xpReward: 10
  },
  {
    id: "prep_04",
    level: "A2",
    topic: "prepositions",
    question: "The book is _____ the table, next _____ the lamp.",
    instruction: "Preposiciones de lugar",
    options: ["in / of", "on / to", "at / with", "under / by"],
    correctAnswer: 1,
    explanation: "'On' para superficies, 'to' para proximidad",
    xpReward: 10
  },

  // ADVERBS - A2
  {
    id: "adv_01",
    level: "A2",
    topic: "adverbs",
    question: "She speaks English _____.",
    instruction: "Adverbio de modo",
    options: ["fluent", "fluently", "fluency", "more fluent"],
    correctAnswer: 1,
    explanation: "Para describir cómo hace algo usamos el adverbio: fluently",
    xpReward: 10
  },
  {
    id: "adv_02",
    level: "A2",
    topic: "adverbs",
    question: "He _____ goes to the gym on weekends.",
    instruction: "Adverbio de frecuencia",
    options: ["usual", "usually", "more usual", "most usual"],
    correctAnswer: 1,
    explanation: "Adverbio de frecuencia: usually (normalmente)",
    xpReward: 10
  },
  {
    id: "adv_03",
    level: "A2",
    topic: "adverbs",
    question: "Drive _____ in the rain.",
    instruction: "Adverbio de modo",
    options: ["careful", "carefully", "more careful", "care"],
    correctAnswer: 1,
    explanation: "Para describir cómo conducir: carefully (cuidadosamente)",
    xpReward: 10
  },
  {
    id: "adv_04",
    level: "A2",
    topic: "adverbs",
    question: "I _____ understand this grammar rule.",
    instruction: "Adverbio de grado",
    options: ["complete", "completely", "completion", "completed"],
    correctAnswer: 1,
    explanation: "Para intensificar 'understand': completely",
    xpReward: 10
  },

  // PAST SIMPLE - A1
  {
    id: "past_01",
    level: "A1",
    topic: "past simple",
    question: "Yesterday I _____ to the cinema with my friends.",
    instruction: "Pasado simple",
    options: ["go", "went", "gone", "going"],
    correctAnswer: 1,
    explanation: "Pasado irregular de 'go' es 'went'",
    xpReward: 10
  },
  {
    id: "past_02",
    level: "A1", 
    topic: "past simple",
    question: "She _____ her homework last night.",
    instruction: "Pasado simple - verbo regular",
    options: ["finish", "finished", "finishing", "finishes"],
    correctAnswer: 1,
    explanation: "Verbos regulares añaden -ed: finished",
    xpReward: 10
  },
  {
    id: "past_03",
    level: "A1",
    topic: "past simple",
    question: "_____ you _____ the movie?",
    instruction: "Pregunta en pasado simple",
    options: ["Do / like", "Did / like", "Did / liked", "Were / like"],
    correctAnswer: 1,
    explanation: "Preguntas en pasado: Did + infinitivo",
    xpReward: 10
  },
  {
    id: "past_04",
    level: "A1",
    topic: "past simple",
    question: "They _____ not _____ the test yesterday.",
    instruction: "Negativo en pasado simple",
    options: ["do / pass", "did / passed", "did / pass", "were / pass"],
    correctAnswer: 2,
    explanation: "Negativo en pasado: did not + infinitivo",
    xpReward: 10
  }
];

// FUNCIÓN PARA OBTENER EJERCICIOS ÚNICOS SIN REPETICIÓN
export function getUniqueExercises(
  level: string,
  topic: string,
  usedExerciseIds: string[] = [],
  count: number = 8
): Exercise[] {
  // Filtrar por nivel y tema
  const availableExercises = EXERCISE_BANK.filter(
    exercise => 
      exercise.level === level && 
      exercise.topic === topic &&
      !usedExerciseIds.includes(exercise.id)
  );

  // Si no hay suficientes ejercicios únicos, mezclar con otros temas del mismo nivel
  if (availableExercises.length < count) {
    const sameLevel = EXERCISE_BANK.filter(
      exercise => 
        exercise.level === level &&
        !usedExerciseIds.includes(exercise.id)
    );
    availableExercises.push(...sameLevel.slice(0, count - availableExercises.length));
  }

  // Mezclar y devolver
  const shuffled = [...availableExercises].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// FUNCIÓN PARA MEZCLAR OPCIONES
export function shuffleExerciseOptions(exercise: Exercise): Exercise {
  const correctAnswerText = exercise.options[exercise.correctAnswer];
  const shuffledOptions = [...exercise.options].sort(() => Math.random() - 0.5);
  const newCorrectAnswer = shuffledOptions.findIndex(option => option === correctAnswerText);
  
  return {
    ...exercise,
    options: shuffledOptions,
    correctAnswer: newCorrectAnswer
  };
}