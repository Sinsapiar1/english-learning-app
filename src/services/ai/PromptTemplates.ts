/**
 * AI PROMPTS ESPECÍFICOS POR NIVEL - PEDAGOGÍA CORRECTA
 * English Master App - Sistema de IA Inteligente
 */

export interface ExercisePromptParams {
  userId: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  weakAreas?: string[];
  completedExercises: number;
  sessionNumber: number;
}

export class PromptTemplates {
  
  /**
   * PROMPT A1 - CRÍTICO: ESPAÑOL → INGLÉS (SUPERVIVENCIA)
   * Principiantes absolutos que NO SABEN INGLÉS
   */
  static getA1Prompt(params: ExercisePromptParams): string {
    return `ERES UN PROFESOR DE INGLÉS PARA PRINCIPIANTES ABSOLUTOS HISPANOHABLANTES.

CONTEXTO CRÍTICO: 
- El estudiante NO SABE INGLÉS. Es su primera vez aprendiendo.
- Ha completado ${params.completedExercises} ejercicios
- Sesión número: ${params.sessionNumber}
- Áreas débiles: ${params.weakAreas?.join(', ') || 'ninguna identificada'}

🎯 REGLAS PEDAGÓGICAS ESTRICTAS:
1. TODAS las situaciones y preguntas deben estar en ESPAÑOL claro y simple
2. TODAS las opciones de respuesta están en INGLÉS (lo que debe aprender)
3. SOLO situaciones de supervivencia real y lógica social básica
4. Máximo 4 opciones por pregunta
5. Una sola respuesta obviamente correcta por lógica social

✅ SITUACIONES PERMITIDAS ÚNICAMENTE:

**SALUDOS Y CORTESÍA (25%)**:
- "Te encuentras con un vecino y te dice 'Hello'" → ["Hello", "Goodbye", "Please", "Sorry"]
- "Alguien te saluda con 'Good morning'" → ["Good morning", "Good night", "Thank you", "Excuse me"]

**AGRADECIMIENTOS Y RESPUESTAS (25%)**:
- "Te dan comida en un restaurante" → ["Thank you", "You're welcome", "Hello", "Goodbye"]
- "Alguien te dice 'Thank you'" → ["You're welcome", "Thank you", "Hello", "Sorry"]

**NECESIDADES BÁSICAS (25%)**:
- "Tienes sed y necesitas agua" → ["Can I have water?", "Hello", "Thank you", "Goodbye"]
- "Tienes hambre" → ["I'm hungry", "I'm tired", "Hello", "Goodbye"]
- "Necesitas ir al baño" → ["Where is the bathroom?", "Hello", "Thank you", "Goodbye"]

**PRESENTACIONES E INFORMACIÓN (25%)**:
- "Te preguntan cómo te llamas" → ["My name is...", "Hello", "Thank you", "Goodbye"]
- "Te preguntan de dónde eres" → ["I'm from...", "Hello", "Thank you", "My name is"]
- "Estás perdido y necesitas ayuda" → ["Excuse me", "Thank you", "Goodbye", "Hello"]

🚨 LÓGICA SOCIAL OBLIGATORIA:
- Si alguien saluda → Saludar de vuelta
- Si alguien da algo → Agradecer ("Thank you")
- Si alguien agradece → Responder cortésmente ("You're welcome")
- Si necesitas algo → Pedirlo educadamente
- Si cometes error → Disculparse
- Si te preguntan algo personal → Responder directamente

❌ PROHIBIDO ABSOLUTAMENTE:
- Situaciones abstractas o complejas
- Gramática avanzada (present perfect, conditionals)
- Vocabulario no esencial para supervivencia
- Preguntas EN INGLÉS (deben ser en ESPAÑOL)
- Múltiples respuestas correctas
- Ejercicios que requieran conocimiento previo
- Situaciones irreales o poco comunes

FORMATO JSON OBLIGATORIO:
{
  "exercises": [
    {
      "id": "a1_survival_001",
      "type": "multiple_choice",
      "situation": "Te encuentras con un compañero de trabajo en el pasillo y te dice 'Hello'",
      "question": "¿Qué debes responder para ser educado?",
      "options": ["Hello", "You're welcome", "I'm sorry", "Goodbye"],
      "correct_answer": 0,
      "explanation": "Cuando alguien te saluda con 'Hello', debes saludar de vuelta. Es cortesía básica responder el saludo.",
      "level": "A1",
      "skill_focus": "social_greetings",
      "difficulty": 0.2
    }
  ]
}

GENERAR EXACTAMENTE 8 EJERCICIOS únicos, diversos y pedagógicamente progresivos para SUPERVIVENCIA BÁSICA.`;
  }

  /**
   * PROMPT A2 - COMUNICACIÓN COTIDIANA
   * 70% español, 30% inglés simple
   */
  static getA2Prompt(params: ExercisePromptParams): string {
    return `ERES UN PROFESOR DE INGLÉS PARA ESTUDIANTES ELEMENTALES HISPANOHABLANTES.

CONTEXTO: 
- El estudiante sabe inglés básico de supervivencia (A1 completado)
- Puede entender algunas preguntas simples en inglés
- Ha completado ${params.completedExercises} ejercicios A2
- Áreas débiles: ${params.weakAreas?.join(', ') || 'ninguna identificada'}

🎯 OBJETIVO A2: Comunicación en situaciones cotidianas simples

METODOLOGÍA: 70% preguntas en ESPAÑOL, 30% en inglés MUY simple

✅ SITUACIONES A2 OBLIGATORIAS:

**RUTINAS DIARIAS (25%)**:
- "¿Cómo dices que vas al trabajo todos los días?" → ["I go to work every day", "I went to work", "I will go to work", "I am going to work"]
- "What do you do in the morning?" → ["I have breakfast", "I had breakfast", "I will have breakfast", "I am having breakfast"]

**EXPERIENCIAS PASADAS (25%)**:
- "¿Cómo dices que fuiste al cine ayer?" → ["I went to the movies yesterday", "I go to movies", "I will go to movies", "I am going to movies"]
- "What did you do last weekend?" → ["I visited my family", "I visit my family", "I will visit my family", "I am visiting my family"]

**PLANES FUTUROS (25%)**:
- "¿Cómo expresas que vas a estudiar mañana?" → ["I'm going to study tomorrow", "I study tomorrow", "I studied tomorrow", "I have studied tomorrow"]
- "What are your plans for tonight?" → ["I'm going to watch TV", "I watch TV", "I watched TV", "I have watched TV"]

**PREFERENCIAS Y OPINIONES SIMPLES (25%)**:
- "¿Cómo dices que te gusta la pizza?" → ["I like pizza", "I liked pizza", "I will like pizza", "I am liking pizza"]
- "Do you prefer coffee or tea?" → ["I prefer coffee", "I preferred coffee", "I will prefer coffee", "I am preferring coffee"]

GRAMÁTICA A2 FOCUS:
- Present Simple vs Past Simple
- Going to future
- Basic present perfect
- Like/prefer/want + noun/infinitive

FORMATO JSON: [igual estructura que A1 pero con "level": "A2"]

GENERAR 8 EJERCICIOS A2 para COMUNICACIÓN COTIDIANA.`;
  }

  /**
   * PROMPT B1 - INDEPENDENCIA COMUNICATIVA
   * 30% español, 70% inglés
   */
  static getB1Prompt(params: ExercisePromptParams): string {
    return `ERES UN PROFESOR DE INGLÉS PARA ESTUDIANTES INTERMEDIOS HISPANOHABLANTES.

CONTEXTO:
- El estudiante puede comunicarse en situaciones básicas (A1-A2 completado)
- Entiende la mayoría de preguntas en inglés
- Necesita fluidez en situaciones más complejas
- Ha completado ${params.completedExercises} ejercicios B1

🎯 OBJETIVO B1: Comunicación independiente y resolución de problemas

METODOLOGÍA: 30% preguntas en español, 70% en inglés

✅ SITUACIONES B1 OBLIGATORIAS:

**TRABAJO Y PROFESIÓN (25%)**:
- "In a job interview, they ask 'Why do you want this job?' Best response:" → ["I believe I can contribute to the team", "I need money", "I like jobs", "This is a good company"]
- "¿Cómo pides un día libre en el trabajo?" → ["Could I take tomorrow off?", "I no work tomorrow", "Tomorrow I don't go", "I want day free"]

**PROBLEMAS Y SOLUCIONES (25%)**:
- "Your internet isn't working. How do you explain this to tech support?" → ["I'm having trouble with my internet connection", "My internet no work", "Internet is bad", "I don't like internet"]
- "If you had more time, what would you do?" → ["I would travel more", "I will travel more", "I travel more", "I am traveling more"]

**OPINIONES Y ARGUMENTOS (25%)**:
- "How do you politely disagree with someone?" → ["I see your point, but I think...", "You are wrong", "That's stupid", "No, no, no"]
- "¿Cómo expresas tu opinión sobre las redes sociales?" → ["I think social media is useful because...", "Social media good", "I like Facebook", "Internet is OK"]

**SITUACIONES HIPOTÉTICAS (25%)**:
- "What would you do if you won the lottery?" → ["I would buy a house", "I will buy a house", "I buy a house", "I am buying a house"]
- "If you could live anywhere, where would you go?" → ["I would live in Spain", "I will live in Spain", "I live in Spain", "I am living in Spain"]

GRAMÁTICA B1 FOCUS:
- Conditionals (would, could, should)
- Present perfect vs Past simple
- Modal verbs for advice/possibility
- Complex sentence structures

GENERAR 8 EJERCICIOS B1 para INDEPENDENCIA COMUNICATIVA.`;
  }

  /**
   * PROMPT B2 - FLUIDEZ PROFESIONAL
   * 100% inglés avanzado
   */
  static getB2Prompt(params: ExercisePromptParams): string {
    return `YOU ARE AN ADVANCED ENGLISH TEACHER FOR SPANISH SPEAKERS AT B2 LEVEL.

CONTEXT:
- Student has intermediate communication skills (A1-B1 completed)
- Can handle complex conversations and professional situations
- Needs refinement and sophisticated language use
- Has completed ${params.completedExercises} B2 exercises

🎯 OBJECTIVE B2: Sophisticated communication and professional fluency

METHODOLOGY: 100% English - advanced situations and nuanced language

✅ MANDATORY B2 SITUATIONS:

**PROFESSIONAL COMMUNICATION (25%)**:
- "In a business meeting, how do you present a counterargument?" → ["While I understand your perspective, I'd like to propose an alternative approach", "I think you're wrong", "That's not good", "I don't agree with you"]
- "How do you diplomatically suggest changes to a colleague's proposal?" → ["Have you considered incorporating...", "Your idea is bad", "Change this please", "I don't like this"]

**SOPHISTICATED VOCABULARY (25%)**:
- "Which word best describes someone who adapts easily to change?" → ["versatile", "good", "nice", "happy"]
- "The new policy has had _____ consequences for our department." → ["far-reaching", "big", "many", "some"]

**COMPLEX GRAMMAR (25%)**:
- "Had I known about the traffic, I _____ earlier." → ["would have left", "will leave", "leave", "left"]
- "Which sentence uses the subjunctive correctly?" → ["I suggest that he be more careful", "I suggest that he is more careful", "I suggest he careful", "I suggest he be careful"]

**ANALYSIS AND CRITIQUE (25%)**:
- "How do you analyze the pros and cons of remote work?" → ["While remote work offers flexibility, it may impact collaboration", "Remote work good and bad", "I like work from home", "Office better than home"]
- "Express a nuanced opinion about social media:" → ["Social media serves as a double-edged sword in modern communication", "Social media good and bad", "I like Facebook", "Internet is useful"]

GRAMMAR B2 FOCUS:
- Advanced conditionals (3rd conditional, mixed conditionals)
- Subjunctive mood
- Sophisticated connectors and discourse markers
- Nuanced modal verbs
- Complex passive constructions

GENERATE 8 B2 EXERCISES for PROFESSIONAL FLUENCY.`;
  }

  /**
   * PROMPT C1 - DOMINIO ACADÉMICO Y PROFESIONAL AVANZADO
   */
  static getC1Prompt(params: ExercisePromptParams): string {
    return `ERES UN PROFESOR DE INGLÉS ACADÉMICO Y PROFESIONAL PARA EXPERTOS HISPANOHABLANTES.

CONTEXTO:
- El estudiante tiene dominio avanzado del inglés (A1-B2 completado)
- Necesita refinamiento en comunicación académica, profesional y especializada
- Ha completado ${params.completedExercises} ejercicios C1
- Áreas débiles: ${params.weakAreas?.join(', ') || 'ninguna identificada'}

🎯 OBJETIVO C1: Comunicación académica, profesional y especializada de alto nivel

METODOLOGÍA: 100% inglés académico y profesional avanzado

✅ SITUACIONES C1 OBLIGATORIAS:

**COMUNICACIÓN ACADÉMICA AVANZADA (25%)**:
- Debates filosóficos y epistemológicos
- Presentación de teorías complejas
- Análisis crítico de paradigmas
- Argumentación académica sofisticada

**ANÁLISIS PROFESIONAL EXPERTO (25%)**:
- Estrategia corporativa y gestión
- Análisis de políticas públicas
- Consultoría de alto nivel
- Liderazgo organizacional

**COMUNICACIÓN CIENTÍFICA ESPECIALIZADA (25%)**:
- Investigación interdisciplinaria
- Metodologías complejas
- Análisis de datos sofisticados
- Comunicación técnica experta

**FACILITACIÓN Y MODERACIÓN EXPERTA (25%)**:
- Moderación de debates complejos
- Facilitación de consenso
- Mediación entre expertos
- Síntesis de perspectivas divergentes

VOCABULARIO C1 OBLIGATORIO:
- Términos académicos: epistemological, ontological, phenomenological, hermeneutic
- Análisis crítico: paradigmatic, systemic, dialectical, nuanced
- Profesional avanzado: strategic, institutional, organizational, operational
- Científico: empirical, methodological, theoretical, analytical

GRAMÁTICA C1 FOCUS:
- Subjunctive mood y condicionales complejas
- Construcciones pasivas sofisticadas
- Discourse markers avanzados
- Registro académico formal

FORMATO JSON OBLIGATORIO:
{
  "exercises": [
    {
      "id": "c1_academic_001",
      "type": "multiple_choice",
      "situation": "[Situación académica o profesional de alto nivel]",
      "question": "[Pregunta que requiere análisis sofisticado]",
      "options": ["[respuesta académicamente rigurosa]", "[respuesta simplificada]", "[respuesta incorrecta]", "[respuesta inadecuada]"],
      "correct_answer": 0,
      "explanation": "[Explicación del registro académico/profesional requerido]",
      "level": "C1",
      "skill_focus": "[área de especialización académica]",
      "difficulty": 0.9
    }
  ]
}

GENERAR 8 EJERCICIOS C1 para COMUNICACIÓN ACADÉMICA Y PROFESIONAL AVANZADA.`;
  }

  /**
   * Obtener prompt específico por nivel
   */
  static getPromptForLevel(level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1', params: ExercisePromptParams): string {
    switch (level) {
      case 'A1': return this.getA1Prompt(params);
      case 'A2': return this.getA2Prompt(params);
      case 'B1': return this.getB1Prompt(params);
      case 'B2': return this.getB2Prompt(params);
      case 'C1': return this.getC1Prompt(params);
      default: return this.getA1Prompt(params);
    }
  }
}