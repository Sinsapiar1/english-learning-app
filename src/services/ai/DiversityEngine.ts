/**
 * DIVERSITY ENGINE - SISTEMA AVANZADO ANTI-REPETICIÓN
 * English Master App - Garantiza ejercicios únicos y variados
 */

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  limit,
  orderBy
} from 'firebase/firestore';

export interface ExerciseHistory {
  userId: string;
  level: string;
  questionHash: string;
  questionText: string;
  skillFocus: string;
  difficulty: number;
  timestamp: Date;
  sessionId: string;
}

export interface DiversityRequirements {
  minVariationsPerSkill: number;
  maxRepeatFrequency: number; // días antes de permitir repetir
  skillDistribution: Record<string, number>; // porcentaje por skill
  difficultyProgression: boolean;
}

export class DiversityEngine {
  private db = getFirestore();
  
  // REQUISITOS DE DIVERSIDAD POR NIVEL
  private static DIVERSITY_REQUIREMENTS: Record<string, DiversityRequirements> = {
    A1: {
      minVariationsPerSkill: 5, // Mínimo 5 variaciones diferentes por skill
      maxRepeatFrequency: 7, // No repetir hasta 7 días después
      skillDistribution: {
        'social_greetings': 0.25,
        'basic_needs': 0.25, 
        'courtesy': 0.20,
        'personal_info': 0.15,
        'emergency_help': 0.15
      },
      difficultyProgression: true
    },
    A2: {
      minVariationsPerSkill: 8,
      maxRepeatFrequency: 10,
      skillDistribution: {
        'daily_routines': 0.30,
        'past_experiences': 0.25,
        'future_plans': 0.20,
        'preferences': 0.15,
        'basic_conversation': 0.10
      },
      difficultyProgression: true
    },
    B1: {
      minVariationsPerSkill: 10,
      maxRepeatFrequency: 14,
      skillDistribution: {
        'work_situations': 0.25,
        'problem_solving': 0.25,
        'opinions': 0.20,
        'hypotheticals': 0.15,
        'complex_grammar': 0.15
      },
      difficultyProgression: true
    },
    B2: {
      minVariationsPerSkill: 12,
      maxRepeatFrequency: 21,
      skillDistribution: {
        'professional_communication': 0.30,
        'analysis': 0.25,
        'nuanced_vocabulary': 0.20,
        'advanced_grammar': 0.15,
        'cultural_context': 0.10
      },
      difficultyProgression: true
    }
  };

  /**
   * GENERAR EJERCICIOS CON DIVERSIDAD GARANTIZADA
   */
  async generateDiverseExercises(
    userId: string, 
    level: string, 
    count: number = 8
  ): Promise<any[]> {
    try {
      console.log(`🎯 Generando ${count} ejercicios diversos para ${level}`);
      
      // 1. Obtener historial del usuario
      const history = await this.getUserExerciseHistory(userId, level);
      
      // 2. Analizar patterns y generar requirements
      const diversityPlan = await this.createDiversityPlan(userId, level, count, history);
      
      // 3. Generar ejercicios con constraints específicos
      const exercises = await this.generateWithConstraints(userId, level, diversityPlan);
      
      // 4. Validar diversidad antes de entregar
      const validatedExercises = await this.validateDiversity(exercises, history);
      
      // 5. Guardar en historial
      await this.saveExercisesToHistory(userId, level, validatedExercises);
      
      console.log(`✅ ${validatedExercises.length} ejercicios diversos generados`);
      return validatedExercises;
      
    } catch (error) {
      console.error('❌ Error generating diverse exercises:', error);
      throw error;
    }
  }

  /**
   * OBTENER HISTORIAL COMPLETO DEL USUARIO
   */
  private async getUserExerciseHistory(userId: string, level: string): Promise<ExerciseHistory[]> {
    try {
      const historyRef = collection(this.db, 'exerciseHistory');
      const q = query(
        historyRef,
        where('userId', '==', userId),
        where('level', '==', level),
        orderBy('timestamp', 'desc'),
        limit(200) // Últimos 200 ejercicios
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      } as ExerciseHistory));
      
    } catch (error) {
      console.warn('⚠️ Error loading history, using empty:', error);
      return [];
    }
  }

  /**
   * CREAR PLAN DE DIVERSIDAD INTELIGENTE
   */
  private async createDiversityPlan(
    userId: string, 
    level: string, 
    count: number, 
    history: ExerciseHistory[]
  ): Promise<any> {
    const requirements = DiversityEngine.DIVERSITY_REQUIREMENTS[level];
    
    // Analizar qué skills están sobre-representados
    const skillCounts = history.reduce((acc, ex) => {
      acc[ex.skillFocus] = (acc[ex.skillFocus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Determinar skills que necesitan más variación
    const underRepresentedSkills = Object.keys(requirements.skillDistribution)
      .filter(skill => (skillCounts[skill] || 0) < requirements.minVariationsPerSkill)
      .sort((a, b) => (skillCounts[a] || 0) - (skillCounts[b] || 0));

    // Crear distribución objetivo
    const targetDistribution: Record<string, number> = {};
    const prioritySkills = underRepresentedSkills.slice(0, Math.ceil(count * 0.6));
    
    prioritySkills.forEach((skill, index) => {
      targetDistribution[skill] = Math.ceil(count / prioritySkills.length);
    });

    // Completar con skills balanceados
    const remainingCount = count - Object.values(targetDistribution).reduce((sum, val) => sum + val, 0);
    const balancedSkills = Object.keys(requirements.skillDistribution)
      .filter(skill => !prioritySkills.includes(skill));

    balancedSkills.forEach(skill => {
      targetDistribution[skill] = Math.floor(remainingCount / balancedSkills.length);
    });

    return {
      targetDistribution,
      avoidQuestions: history.slice(0, 50).map(h => h.questionHash), // Evitar últimas 50
      difficultyRange: this.calculateDifficultyRange(level, history),
      situationVariety: this.getSituationVariety(level),
      grammarFocus: this.getGrammarFocus(level, history)
    };
  }

  /**
   * GENERAR EJERCICIOS CON CONSTRAINTS ESPECÍFICOS
   */
  private async generateWithConstraints(
    userId: string, 
    level: string, 
    diversityPlan: any
  ): Promise<any[]> {
    const exercises: any[] = [];
    
    for (const [skill, targetCount] of Object.entries(diversityPlan.targetDistribution)) {
      if (typeof targetCount !== 'number' || targetCount <= 0) continue;
      
      for (let i = 0; i < targetCount; i++) {
        const constrainedPrompt = this.buildConstrainedPrompt(
          level, 
          skill, 
          diversityPlan,
          exercises.length + 1
        );
        
        try {
          const exercise = await this.generateSingleExercise(constrainedPrompt, level, skill);
          if (exercise && this.validateExerciseUniqueness(exercise, exercises)) {
            exercises.push(exercise);
          }
        } catch (error) {
          console.warn(`⚠️ Error generating exercise for ${skill}:`, error);
        }
      }
    }

    return exercises;
  }

  /**
   * CONSTRUIR PROMPT CON CONSTRAINTS ESPECÍFICOS
   */
  private buildConstrainedPrompt(
    level: string, 
    skill: string, 
    diversityPlan: any, 
    exerciseNumber: number
  ): string {
    const situationVariations = diversityPlan.situationVariety[skill] || [];
    const selectedSituation = situationVariations[exerciseNumber % situationVariations.length];
    
    return `GENERA UN EJERCICIO ÚNICO Y ESPECÍFICO PARA NIVEL ${level}

🎯 SKILL OBLIGATORIO: ${skill}
🎭 SITUACIÓN ESPECÍFICA: ${selectedSituation}
🚫 EVITAR COMPLETAMENTE: ${diversityPlan.avoidQuestions.join(', ')}

REGLAS ESTRICTAS DE DIVERSIDAD:
1. La situación debe ser EXACTAMENTE: ${selectedSituation}
2. NUNCA usar estas frases prohibidas: ${this.getProhibitedPhrases(level)}
3. Dificultad: ${diversityPlan.difficultyRange.min} - ${diversityPlan.difficultyRange.max}
4. Gramática focus: ${diversityPlan.grammarFocus}

FORMATO JSON REQUERIDO:
{
  "id": "${level}_${skill}_unique_${Date.now()}_${exerciseNumber}",
  "type": "multiple_choice",
  "situation": "${selectedSituation}",
  "question": "[PREGUNTA ÚNICA EN ESPAÑOL PARA A1]",
  "options": ["[opción 1]", "[opción 2]", "[opción 3]", "[opción 4]"],
  "correct_answer": 0,
  "explanation": "[Explicación pedagógica detallada]",
  "level": "${level}",
  "skill_focus": "${skill}",
  "difficulty": ${diversityPlan.difficultyRange.min + Math.random() * (diversityPlan.difficultyRange.max - diversityPlan.difficultyRange.min)},
  "uniqueness_hash": "${this.generateUniqueHash(selectedSituation, skill)}"
}

GENERA 1 EJERCICIO COMPLETAMENTE ÚNICO Y ÚTIL.`;
  }

  /**
   * OBTENER FRASES PROHIBIDAS POR NIVEL
   */
  private getProhibitedPhrases(level: string): string[] {
    const commonProhibited = [
      'Good morning', 'Hello', 'Thank you', 'I\'m hungry', 'What time is it',
      'My name is', 'How are you', 'Nice to meet you', 'Goodbye', 'See you later'
    ];

    const levelSpecific = {
      A1: [...commonProhibited],
      A2: [...commonProhibited, 'I went to', 'I like', 'I have'],
      B1: [...commonProhibited, 'I think', 'I believe', 'In my opinion'],
      B2: [...commonProhibited, 'However', 'Nevertheless', 'Furthermore']
    };

    return levelSpecific[level as keyof typeof levelSpecific] || commonProhibited;
  }

  /**
   * OBTENER VARIEDAD DE SITUACIONES POR SKILL
   */
  private getSituationVariety(level: string): Record<string, string[]> {
    const situationBank = {
      A1: {
        social_greetings: [
          'Te encuentras con tu jefe en el ascensor por la mañana',
          'Un cliente entra a la tienda donde trabajas',
          'Te cruzas con tu vecino en el supermercado',
          'Llegas tarde a una reunión y necesitas saludar',
          'Un turista te pregunta algo en la calle'
        ],
        basic_needs: [
          'Estás en un restaurante y tienes mucha sed',
          'Necesitas encontrar un baño urgentemente en un centro comercial',
          'Tienes hambre en el trabajo y no hay comida',
          'Hace frío y necesitas cerrar la ventana',
          'Necesitas ayuda para cargar algo pesado'
        ],
        courtesy: [
          'Alguien te sostiene la puerta abierta',
          'Un compañero te presta su bolígrafo',
          'Te traen la comida que pediste',
          'Alguien te felicita por tu trabajo',
          'Un extraño te devuelve algo que se te cayó'
        ]
      },
      A2: {
        daily_routines: [
          'Describes tu rutina matutina a un compañero nuevo',
          'Explicas qué haces los fines de semana',
          'Hablas sobre tu horario de trabajo',
          'Describes cómo llegas al trabajo cada día',
          'Explicas tus hábitos de ejercicio'
        ]
      }
    };

    return situationBank[level as keyof typeof situationBank] || {};
  }

  /**
   * GENERAR HASH ÚNICO PARA EVITAR REPETICIONES
   */
  private generateUniqueHash(situation: string, skill: string): string {
    const content = `${situation}_${skill}_${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * GUARDAR EJERCICIOS EN HISTORIAL DE FIREBASE
   */
  private async saveExercisesToHistory(
    userId: string, 
    level: string, 
    exercises: any[]
  ): Promise<void> {
    try {
      const sessionId = `session_${Date.now()}`;
      
      for (const exercise of exercises) {
        const historyEntry: ExerciseHistory = {
          userId,
          level,
          questionHash: exercise.uniqueness_hash || exercise.id,
          questionText: exercise.question,
          skillFocus: exercise.skill_focus,
          difficulty: exercise.difficulty,
          timestamp: new Date(),
          sessionId
        };

        await setDoc(
          doc(this.db, 'exerciseHistory', `${userId}_${exercise.id}`),
          {
            ...historyEntry,
            timestamp: serverTimestamp()
          }
        );
      }

      console.log(`💾 ${exercises.length} ejercicios guardados en historial Firebase`);
      
    } catch (error) {
      console.error('❌ Error saving to history:', error);
    }
  }

  /**
   * UTILIDADES PRIVADAS
   */
  private calculateDifficultyRange(level: string, history: ExerciseHistory[]): { min: number, max: number } {
    const ranges = {
      A1: { min: 0.1, max: 0.3 },
      A2: { min: 0.3, max: 0.5 },
      B1: { min: 0.5, max: 0.7 },
      B2: { min: 0.7, max: 0.9 }
    };
    return ranges[level as keyof typeof ranges] || ranges.A1;
  }

  private getGrammarFocus(level: string, history: ExerciseHistory[]): string {
    const grammarFocus = {
      A1: 'present simple, verb to be, basic questions',
      A2: 'past simple, present perfect, future with going to',
      B1: 'conditionals, passive voice, modal verbs',
      B2: 'advanced tenses, subjunctive, complex structures'
    };
    return grammarFocus[level as keyof typeof grammarFocus] || grammarFocus.A1;
  }

  private async generateSingleExercise(prompt: string, level: string, skill: string): Promise<any> {
    // Aquí se conectaría con el GeminiService existente
    // Por ahora retorno un ejercicio mock para testing
    return {
      id: `${level}_${skill}_${Date.now()}`,
      type: 'multiple_choice',
      situation: 'Situación única generada',
      question: 'Pregunta única generada',
      options: ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'],
      correct_answer: 0,
      explanation: 'Explicación única',
      level,
      skill_focus: skill,
      difficulty: 0.5,
      uniqueness_hash: this.generateUniqueHash(`${level}_${skill}`, Date.now().toString())
    };
  }

  private validateExerciseUniqueness(exercise: any, existingExercises: any[]): boolean {
    return !existingExercises.some(existing => 
      existing.question === exercise.question ||
      existing.uniqueness_hash === exercise.uniqueness_hash
    );
  }

  private async validateDiversity(exercises: any[], history: ExerciseHistory[]): Promise<any[]> {
    // Validar que no hay repeticiones con el historial
    return exercises.filter(exercise => 
      !history.some(h => h.questionText === exercise.question)
    );
  }
}