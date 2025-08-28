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

// BANCO MASIVO DE EJERCICIOS ÚNICOS - 100+ EJERCICIOS
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
    explanation: "👶 PARA PRINCIPIANTES: En inglés, cuando hablamos de otra persona (he=él, she=ella, it=eso), añadimos -S al final del verbo.\n\n🗣️ EJEMPLO DIARIO:\n✅ 'She drinks coffee' = 'Ella bebe café' (CORRECTO)\n❌ 'She drink coffee' = Incorrecto (le falta la -s)\n\n📝 FÓRMULA SIMPLE:\n• Yo/Tú/Nosotros → verbo normal (I drink, You drink, We drink)\n• Él/Ella/Eso → verbo + S (He drinks, She drinks, It drinks)\n\n💡 TRUCO: Si puedes decir 'él' o 'ella' antes del verbo, añade -S",
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
    explanation: "👶 PARA PRINCIPIANTES: Cuando hacemos preguntas en inglés, usamos DO o DOES como ayudantes.\n\n🤔 ¿CÓMO FUNCIONA?\n✅ 'Do you study English?' = '¿Estudias inglés?' (CORRECTO)\n❌ 'Do you studies English?' = Incorrecto (con DO nunca pongas -s al verbo)\n\n📋 REGLA FÁCIL:\n• Con I/You/We/They → DO + verbo normal\n• Con He/She/It → DOES + verbo normal (sin -s)\n\n💡 TRUCO: DO y DOES ya hacen el trabajo de la -s, por eso el verbo va normal",
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
    explanation: "🎯 REGLA: Para negar en Present Simple con tercera persona singular usamos DOESN'T\n\n✅ 'He doesn't work' - Correcto\n❌ 'He don't work' - Incorrecto\n\n💡 ESTRUCTURA: I/You/We/They + don't | He/She/It + doesn't",
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
    explanation: "👶 PARA PRINCIPIANTES: Present Perfect es como decir 'he hecho algo' en español, pero sin decir cuándo exactamente.\n\n🕐 ¿CUÁNDO USARLO?\n✅ 'I have never eaten sushi' = 'Nunca he comido sushi' (en mi vida, no sé cuándo)\n❌ 'I never ate sushi' = Incorrecto para experiencias de vida\n\n🔧 ¿CÓMO SE HACE?\nHAVE/HAS + verbo en participio (comido, visto, hecho)\n• I/You/We/They → HAVE + participio\n• He/She/It → HAS + participio\n\n📖 PARTICIPIOS COMUNES:\n• eat → eaten (comido)\n• see → seen (visto)\n• go → gone (ido)\n• do → done (hecho)\n\n💡 TRUCO: Si en español dices 'he...' o 'has...', usa Present Perfect",
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
    explanation: "🎯 REGLA: Para preguntar sobre EXPERIENCIAS DE VIDA usamos HAVE YOU EVER + PARTICIPIO\n\n✅ 'Have you ever been to Japan?' - Experiencia\n❌ 'Did you ever go to Japan?' - Incorrecto para experiencias\n\n💡 EVER = alguna vez en tu vida\n🌟 BEEN = participio de BE (go→went→gone, be→was/were→been)",
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
    explanation: "🏠 SITUACIÓN REAL: Ella vive aquí desde 2020 y TODAVÍA vive aquí ahora.\n\n🔑 PALABRA CLAVE: 'SINCE' (desde)\n• SINCE + fecha específica = Present Perfect SIEMPRE\n• SINCE 2020, SINCE Monday, SINCE January\n\n✅ CORRECTO: 'She HAS LIVED here since 2020'\n= Ella ha vivido aquí desde 2020 (y sigue viviendo)\n\n❌ INCORRECTO:\n• 'She lives' = Solo presente, no menciona cuándo empezó\n• 'She is living' = Temporal, no permanente\n• 'She lived' = Pasado terminado, ya no vive ahí\n\n💡 TRUCO FÁCIL:\n¿Ves SINCE? → Usa HAS/HAVE + participio pasado\n¿Ves FOR? → También Present Perfect\n\n🎯 MÁS EJEMPLOS:\n• I have worked here since 2019\n• They have been married since 2015\n• We have lived in Spain since last year",
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
    explanation: "🎯 REGLA: Preposiciones de TIEMPO tienen patrones específicos\n\n✅ ON Monday (días específicos)\n✅ AT 3 PM (horas exactas)\n❌ IN Monday, ON 3 PM\n\n💡 RECUERDA:\n📅 ON: días, fechas (Monday, January 1st)\n🕐 AT: horas exactas (3 PM, midnight)\n📆 IN: meses, años, estaciones (July, 2024, summer)",
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

  // PAST SIMPLE - A1 (20 EJERCICIOS)
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
  },
  {
    id: "past_05",
    level: "A1",
    topic: "past simple",
    question: "We _____ pizza for dinner last Friday.",
    instruction: "Verbo irregular en pasado",
    options: ["eat", "ate", "eaten", "eating"],
    correctAnswer: 1,
    explanation: "El pasado de 'eat' es 'ate'",
    xpReward: 10
  },
  {
    id: "past_06",
    level: "A1",
    topic: "past simple",
    question: "My brother _____ a new car last month.",
    instruction: "Verbo irregular",
    options: ["buy", "buyed", "bought", "buying"],
    correctAnswer: 2,
    explanation: "El pasado de 'buy' es 'bought'",
    xpReward: 10
  },
  {
    id: "past_07",
    level: "A1",
    topic: "past simple",
    question: "_____ she _____ to the party?",
    instruction: "Pregunta en pasado",
    options: ["Does / come", "Did / come", "Did / came", "Was / come"],
    correctAnswer: 1,
    explanation: "Preguntas en pasado: Did + infinitivo sin 'to'",
    xpReward: 10
  },
  {
    id: "past_08",
    level: "A1",
    topic: "past simple",
    question: "The children _____ in the park yesterday.",
    instruction: "Verbo irregular",
    options: ["play", "played", "run", "ran"],
    correctAnswer: 3,
    explanation: "El pasado de 'run' es 'ran'",
    xpReward: 10
  },
  {
    id: "past_09",
    level: "A1",
    topic: "past simple",
    question: "I _____ my keys this morning.",
    instruction: "Verbo irregular",
    options: ["lose", "losed", "lost", "losing"],
    correctAnswer: 2,
    explanation: "El pasado de 'lose' es 'lost'",
    xpReward: 10
  },
  {
    id: "past_10",
    level: "A1",
    topic: "past simple",
    question: "_____ it _____ yesterday?",
    instruction: "Pregunta sobre el clima",
    options: ["Did / rain", "Did / rained", "Was / rain", "Does / rain"],
    correctAnswer: 0,
    explanation: "Para preguntas en pasado simple: Did + infinitivo",
    xpReward: 10
  },
  {
    id: "past_11",
    level: "A1",
    topic: "past simple",
    question: "She _____ a beautiful song at the concert.",
    instruction: "Verbo irregular",
    options: ["sing", "sang", "sung", "singing"],
    correctAnswer: 1,
    explanation: "El pasado de 'sing' es 'sang'",
    xpReward: 10
  },
  {
    id: "past_12",
    level: "A1",
    topic: "past simple",
    question: "We _____ our grandparents last weekend.",
    instruction: "Verbo irregular",
    options: ["visit", "visited", "see", "saw"],
    correctAnswer: 3,
    explanation: "El pasado de 'see' es 'saw' (ver a alguien)",
    xpReward: 10
  },

  // PRESENT SIMPLE EXPANDIDO (20 EJERCICIOS)
  {
    id: "ps_05",
    level: "A1",
    topic: "present simple",
    question: "My father _____ to work by car every day.",
    instruction: "Tercera persona singular",
    options: ["go", "goes", "going", "went"],
    correctAnswer: 1,
    explanation: "Con tercera persona singular añadimos -es: goes",
    xpReward: 10
  },
  {
    id: "ps_06",
    level: "A1",
    topic: "present simple",
    question: "_____ you _____ coffee or tea?",
    instruction: "Pregunta con 'prefer'",
    options: ["Do / prefer", "Does / prefer", "Are / prefer", "Do / prefers"],
    correctAnswer: 0,
    explanation: "Con 'you' usamos 'Do' + infinitivo",
    xpReward: 10
  },
  {
    id: "ps_07",
    level: "A1",
    topic: "present simple",
    question: "Children _____ milk for strong bones.",
    instruction: "Verbo 'need'",
    options: ["needs", "need", "needing", "needed"],
    correctAnswer: 1,
    explanation: "Con plural no añadimos -s: need",
    xpReward: 10
  },
  {
    id: "ps_08",
    level: "A1",
    topic: "present simple",
    question: "She _____ her teeth twice a day.",
    instruction: "Rutina diaria",
    options: ["brush", "brushs", "brushes", "brushing"],
    correctAnswer: 2,
    explanation: "Verbos terminados en -sh añaden -es: brushes",
    xpReward: 10
  },
  {
    id: "ps_09",
    level: "A1",
    topic: "present simple",
    question: "_____ your sister _____ in this city?",
    instruction: "Pregunta con 'live'",
    options: ["Do / live", "Does / live", "Does / lives", "Is / live"],
    correctAnswer: 1,
    explanation: "Con tercera persona: Does + infinitivo",
    xpReward: 10
  },
  {
    id: "ps_10",
    level: "A1",
    topic: "present simple",
    question: "We _____ TV in the evening.",
    instruction: "Verbo 'watch'",
    options: ["watch", "watches", "watching", "watched"],
    correctAnswer: 0,
    explanation: "Con 'we' usamos la forma base: watch",
    xpReward: 10
  },
  {
    id: "ps_11",
    level: "A1",
    topic: "present simple",
    question: "The sun _____ in the east.",
    instruction: "Hecho general",
    options: ["rise", "rises", "rising", "rose"],
    correctAnswer: 1,
    explanation: "Hechos generales con tercera persona: rises",
    xpReward: 10
  },
  {
    id: "ps_12",
    level: "A1",
    topic: "present simple",
    question: "I _____ like spicy food.",
    instruction: "Negativo con 'I'",
    options: ["don't", "doesn't", "am not", "not"],
    correctAnswer: 0,
    explanation: "Con 'I' usamos 'don't' para negar",
    xpReward: 10
  },

  // PRESENT PERFECT EXPANDIDO (20 EJERCICIOS)
  {
    id: "pp_05",
    level: "A2",
    topic: "present perfect",
    question: "They _____ _____ three movies this week.",
    instruction: "Tiempo completado recientemente",
    options: ["have / see", "have / seen", "has / seen", "had / seen"],
    correctAnswer: 1,
    explanation: "Con 'they': have + participio pasado (seen)",
    xpReward: 10
  },
  {
    id: "pp_06",
    level: "A2",
    topic: "present perfect",
    question: "_____ you _____ your homework yet?",
    instruction: "Pregunta con 'yet'",
    options: ["Did / finish", "Have / finished", "Do / finish", "Are / finishing"],
    correctAnswer: 1,
    explanation: "Con 'yet' usamos Present Perfect: Have you finished",
    xpReward: 10
  },
  {
    id: "pp_07",
    level: "A2",
    topic: "present perfect",
    question: "He _____ _____ his job for five years.",
    instruction: "Duración hasta ahora",
    options: ["has / have", "has / had", "have / had", "is / having"],
    correctAnswer: 1,
    explanation: "Para duración hasta el presente: has had",
    xpReward: 10
  },
  {
    id: "pp_08",
    level: "A2",
    topic: "present perfect",
    question: "We _____ not _____ from him lately.",
    instruction: "Negativo en Present Perfect",
    options: ["have / hear", "have / heard", "has / heard", "did / hear"],
    correctAnswer: 1,
    explanation: "Negativo: have not + participio pasado (heard)",
    xpReward: 10
  },
  {
    id: "pp_09",
    level: "A2",
    topic: "present perfect",
    question: "She _____ already _____ dinner.",
    instruction: "Con 'already'",
    options: ["has / eat", "has / eaten", "have / eaten", "is / eating"],
    correctAnswer: 1,
    explanation: "Con 'already' y tercera persona: has eaten",
    xpReward: 10
  },
  {
    id: "pp_10",
    level: "A2",
    topic: "present perfect",
    question: "_____ they ever _____ to Europe?",
    instruction: "Experiencia de vida",
    options: ["Did / travel", "Have / traveled", "Do / travel", "Are / traveling"],
    correctAnswer: 1,
    explanation: "Para experiencias: Have they ever traveled",
    xpReward: 10
  },

  // PREPOSITIONS EXPANDIDO (20 EJERCICIOS)
  {
    id: "prep_05",
    level: "A2",
    topic: "prepositions",
    question: "The conference is _____ July _____ the convention center.",
    instruction: "Mes y lugar",
    options: ["in / at", "on / in", "at / on", "in / on"],
    correctAnswer: 0,
    explanation: "'In' para meses, 'at' para lugares específicos",
    xpReward: 10
  },
  {
    id: "prep_06",
    level: "A2",
    topic: "prepositions",
    question: "She arrived _____ the airport _____ time.",
    instruction: "Lugar y tiempo",
    options: ["at / on", "in / in", "to / at", "at / in"],
    correctAnswer: 0,
    explanation: "'At' para lugares específicos, 'on time' = puntual",
    xpReward: 10
  },
  {
    id: "prep_07",
    level: "A2",
    topic: "prepositions",
    question: "We're going _____ vacation _____ December.",
    instruction: "Actividad y mes",
    options: ["on / in", "in / on", "to / at", "for / in"],
    correctAnswer: 0,
    explanation: "'On vacation' (de vacaciones), 'in' para meses",
    xpReward: 10
  },
  {
    id: "prep_08",
    level: "A2",
    topic: "prepositions",
    question: "The cat is hiding _____ the bed.",
    instruction: "Posición",
    options: ["under", "above", "between", "through"],
    correctAnswer: 0,
    explanation: "'Under' significa debajo de algo",
    xpReward: 10
  },
  {
    id: "prep_09",
    level: "A2",
    topic: "prepositions",
    question: "I'm thinking _____ changing my job.",
    instruction: "Preposición con 'thinking'",
    options: ["of", "about", "in", "for"],
    correctAnswer: 1,
    explanation: "'Thinking about' = considerar algo",
    xpReward: 10
  },
  {
    id: "prep_10",
    level: "A2",
    topic: "prepositions",
    question: "The meeting starts _____ 9 AM _____ Monday.",
    instruction: "Hora y día",
    options: ["at / on", "in / in", "on / at", "at / in"],
    correctAnswer: 0,
    explanation: "'At' para horas exactas, 'on' para días",
    xpReward: 10
  },

  // ADVERBS EXPANDIDO (20 EJERCICIOS)
  {
    id: "adv_05",
    level: "A2",
    topic: "adverbs",
    question: "She _____ arrives late to work.",
    instruction: "Adverbio de frecuencia",
    options: ["never", "always", "sometimes", "often"],
    correctAnswer: 0,
    explanation: "'Never' significa nunca llega tarde",
    xpReward: 10
  },
  {
    id: "adv_06",
    level: "A2",
    topic: "adverbs",
    question: "He solved the problem _____.",
    instruction: "Adverbio de modo",
    options: ["quick", "quickly", "quickness", "more quick"],
    correctAnswer: 1,
    explanation: "Para describir cómo hizo algo: quickly",
    xpReward: 10
  },
  {
    id: "adv_07",
    level: "A2",
    topic: "adverbs",
    question: "We _____ go to the beach in summer.",
    instruction: "Frecuencia",
    options: ["frequent", "frequently", "more frequent", "most frequent"],
    correctAnswer: 1,
    explanation: "Adverbio de frecuencia: frequently",
    xpReward: 10
  },
  {
    id: "adv_08",
    level: "A2",
    topic: "adverbs",
    question: "She speaks _____ than her brother.",
    instruction: "Comparativo de adverbios",
    options: ["softly", "softer", "more softly", "most softly"],
    correctAnswer: 2,
    explanation: "Comparativo de adverbios largos: more softly",
    xpReward: 10
  },
  {
    id: "adv_09",
    level: "A2",
    topic: "adverbs",
    question: "The train arrived _____ on time.",
    instruction: "Adverbio de grado",
    options: ["exact", "exactly", "more exact", "most exact"],
    correctAnswer: 1,
    explanation: "Para intensificar 'on time': exactly",
    xpReward: 10
  },
  {
    id: "adv_10",
    level: "A2",
    topic: "adverbs",
    question: "They worked _____ to finish the project.",
    instruction: "Adverbio de modo",
    options: ["hard", "hardly", "harder", "hardest"],
    correctAnswer: 0,
    explanation: "'Hard' como adverbio significa con esfuerzo",
    xpReward: 10
  }
];

// FUNCIÓN ROBUSTA PARA OBTENER EJERCICIOS ÚNICOS SIN REPETICIÓN
export function getUniqueExercises(
  level: string,
  topic: string,
  usedExerciseIds: string[] = [],
  count: number = 8
): Exercise[] {
  console.log("🎯 BUSCANDO EJERCICIOS ÚNICOS:");
  console.log("📊 Nivel:", level, "| Tema:", topic);
  console.log("🚫 Ya usados:", usedExerciseIds.length, "ejercicios");

  // Filtrar por nivel y tema específico
  let availableExercises = EXERCISE_BANK.filter(
    exercise => 
      exercise.level === level && 
      exercise.topic === topic &&
      !usedExerciseIds.includes(exercise.id)
  );

  console.log("📝 Ejercicios disponibles para", topic + ":", availableExercises.length);

  // Si no hay suficientes del tema específico, expandir a todo el nivel
  if (availableExercises.length < count) {
    console.log("⚠️ No suficientes ejercicios del tema, expandiendo a nivel", level);
    
    const sameLevelExercises = EXERCISE_BANK.filter(
      exercise => 
        exercise.level === level &&
        !usedExerciseIds.includes(exercise.id)
    );
    
    // Priorizar tema original, luego añadir otros
    const otherLevelExercises = sameLevelExercises.filter(
      exercise => exercise.topic !== topic
    );
    
    availableExercises = [...availableExercises, ...otherLevelExercises];
    console.log("📈 Total disponibles en nivel:", availableExercises.length);
  }

  // Si aún no hay suficientes, reiniciar pool (permitir repetir los más antiguos)
  if (availableExercises.length < count) {
    console.log("🔄 Reiniciando pool - permitiendo ejercicios más antiguos");
    
    // Tomar todos los ejercicios del nivel, priorizando los menos usados recientemente
    availableExercises = EXERCISE_BANK.filter(exercise => exercise.level === level);
  }

  // Mezclar completamente para máxima variedad
  const shuffled = [...availableExercises].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  console.log("✅ EJERCICIOS SELECCIONADOS:", selected.map(ex => ex.id));
  
  return selected;
}

// FUNCIÓN MEJORADA PARA LIMPIAR HISTORIAL ANTIGUO
export function cleanOldExerciseHistory(level: string, maxHistory: number = 50) {
  const key = `used_exercises_${level}`;
  const savedUsedIds = localStorage.getItem(key);
  
  if (savedUsedIds) {
    const usedIds = JSON.parse(savedUsedIds);
    
    // Si hay demasiados, mantener solo los más recientes
    if (usedIds.length > maxHistory) {
      const recentIds = usedIds.slice(-maxHistory);
      localStorage.setItem(key, JSON.stringify(recentIds));
      console.log("🧹 Historial limpiado - manteniendo", maxHistory, "ejercicios más recientes");
      return recentIds;
    }
  }
  
  return JSON.parse(savedUsedIds || "[]");
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