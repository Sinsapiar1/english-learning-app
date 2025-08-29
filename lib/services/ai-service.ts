/**
 * AI SERVICE - ENGLISH MASTER V3
 * Servicio robusto y limpio para generación de ejercicios
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { Level, Exercise } from '@/lib/types'
import { z } from 'zod'

// Validación de ejercicios con Zod
const ExerciseSchema = z.object({
  question: z.string().min(10),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3),
  explanation: z.string().min(10),
  skillFocus: z.string(),
  situation: z.string().optional(),
})

const ExercisesResponseSchema = z.object({
  exercises: z.array(ExerciseSchema)
})

export class AIService {
  private genAI: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  /**
   * GENERAR EJERCICIOS POR NIVEL CON ANTI-REPETICIÓN
   */
  async generateExercises(
    level: Level,
    excludeQuestions: string[] = [],
    count: number = 8
  ): Promise<Exercise[]> {
    try {
      const prompt = this.buildPrompt(level, excludeQuestions, count)
      
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.9, // Alta creatividad para diversidad
          topP: 0.95,
          topK: 50,
          maxOutputTokens: 4000,
        }
      })

      const result = await model.generateContent(prompt)
      const response = result.response.text()

      // Extraer y validar JSON
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      const data = JSON.parse(jsonMatch[1] || jsonMatch[0])
      const validated = ExercisesResponseSchema.parse(data)

      // Procesar ejercicios
      const exercises: Exercise[] = validated.exercises.map((ex, index) => ({
        id: `${level}_${Date.now()}_${index}`,
        level,
        question: ex.question,
        options: this.shuffleArray(ex.options),
        correctAnswer: ex.options.indexOf(ex.options[ex.correctAnswer]), // Recalcular después del shuffle
        explanation: ex.explanation,
        skillFocus: ex.skillFocus,
        difficulty: this.calculateDifficulty(level),
        situation: ex.situation || '',
        createdAt: new Date()
      }))

      console.log(`✅ Generated ${exercises.length} exercises for level ${level}`)
      return exercises

    } catch (error) {
      console.error('❌ AI generation failed:', error)
      return this.getEmergencyExercises(level)
    }
  }

  /**
   * CONSTRUIR PROMPT ESPECÍFICO POR NIVEL
   */
  private buildPrompt(level: Level, excludeQuestions: string[], count: number): string {
    const basePrompt = `Eres un experto en pedagogía de inglés para hispanohablantes.

NIVEL: ${level}
EJERCICIOS A GENERAR: ${count}
EVITAR ESTAS PREGUNTAS: ${excludeQuestions.join(', ')}

${this.getLevelSpecificInstructions(level)}

FORMATO JSON OBLIGATORIO:
\`\`\`json
{
  "exercises": [
    {
      "question": "Pregunta específica para nivel ${level}",
      "options": ["opción 1", "opción 2", "opción 3", "opción 4"],
      "correctAnswer": 0,
      "explanation": "Explicación pedagógica detallada",
      "skillFocus": "área específica",
      "situation": "contexto de la situación"
    }
  ]
}
\`\`\`

Genera exactamente ${count} ejercicios únicos y pedagógicamente apropiados para nivel ${level}.`

    return basePrompt
  }

  /**
   * INSTRUCCIONES ESPECÍFICAS POR NIVEL
   */
  private getLevelSpecificInstructions(level: Level): string {
    const instructions = {
      A1: `NIVEL A1 - SUPERVIVENCIA BÁSICA:
- TODAS las preguntas en ESPAÑOL
- TODAS las respuestas en INGLÉS  
- Situaciones de supervivencia real: saludos, necesidades, cortesía
- Lógica social básica: si alguien saluda → saludar de vuelta
- PROHIBIDO: "Good morning", "Hello", "Thank you", "I'm hungry"
- OBLIGATORIO: Situaciones específicas y realistas`,

      A2: `NIVEL A2 - COMUNICACIÓN COTIDIANA:
- 70% preguntas en español, 30% en inglés simple
- Rutinas diarias, experiencias pasadas, planes futuros
- Present simple, past simple, going to future
- Situaciones: trabajo, familia, tiempo libre`,

      B1: `NIVEL B1 - INDEPENDENCIA COMUNICATIVA:
- 30% español, 70% inglés
- Situaciones laborales, resolución de problemas, opiniones
- Conditionals, modal verbs, present perfect
- Contextos: trabajo, viajes, estudios`,

      B2: `NIVEL B2 - FLUIDEZ PROFESIONAL:
- 100% inglés
- Comunicación profesional, análisis, argumentación
- Advanced grammar, discourse markers, nuanced vocabulary
- Contextos: negocios, académico, técnico`,

      C1: `NIVEL C1 - DOMINIO ACADÉMICO:
- 100% inglés académico y profesional avanzado
- Debates filosóficos, análisis crítico, comunicación científica
- Subjunctive, complex passives, academic register
- Vocabulario: epistemological, paradigmatic, dialectical, empirical
- Situaciones: conferencias académicas, investigación, consultoría experta
- OBLIGATORIO: Terminología especializada y registro formal`
    }

    return instructions[level]
  }

  /**
   * EJERCICIOS DE EMERGENCIA POR NIVEL
   */
  private getEmergencyExercises(level: Level): Exercise[] {
    const emergencyBank = {
      A1: [
        {
          id: `emergency_a1_${Date.now()}_1`,
          level: 'A1' as Level,
          question: 'Estás en el banco y necesitas hablar con un empleado',
          options: ['Excuse me, can you help me?', 'Hello friend', 'Good morning sir', 'Thank you very much'],
          correctAnswer: 0,
          explanation: 'Para pedir ayuda formal usamos "Excuse me, can you help me?"',
          skillFocus: 'formal_help_requests',
          difficulty: 0.3,
          situation: 'Banco - solicitar ayuda',
          createdAt: new Date()
        }
      ],
      C1: [
        {
          id: `emergency_c1_${Date.now()}_1`,
          level: 'C1' as Level,
          question: 'In an academic symposium, how do you challenge a theoretical framework while acknowledging its contributions?',
          options: [
            'While this framework offers valuable insights, I contend that its foundational assumptions may inadvertently constrain our understanding of the phenomenon',
            'This theory is good but has some problems',
            'I think there are issues with this approach',
            'The framework needs improvement'
          ],
          correctAnswer: 0,
          explanation: 'Academic discourse requires diplomatic challenge: "While... offers insights, I contend that assumptions may constrain understanding"',
          skillFocus: 'academic_critique',
          difficulty: 0.95,
          situation: 'Academic symposium - theoretical challenge',
          createdAt: new Date()
        },
        {
          id: `emergency_c1_${Date.now()}_2`,
          level: 'C1' as Level,
          question: 'How do you articulate the epistemological implications of quantum mechanics for scientific realism?',
          options: [
            'Quantum mechanics fundamentally challenges naive realism by demonstrating that observation and measurement are constitutive rather than merely revelatory of physical phenomena',
            'Quantum physics shows that reality is strange',
            'Quantum mechanics changes how we see science',
            'Physics proves that reality is complex'
          ],
          correctAnswer: 0,
          explanation: 'Epistemological analysis requires precise terminology: "constitutive rather than merely revelatory of phenomena"',
          skillFocus: 'epistemological_analysis',
          difficulty: 0.98,
          situation: 'Philosophy of science discussion',
          createdAt: new Date()
        }
      ]
    }

    // Retornar ejercicios del nivel o A1 como fallback
    return emergencyBank[level] || emergencyBank.A1
  }

  /**
   * UTILIDADES
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  private calculateDifficulty(level: Level): number {
    const difficulties = { A1: 0.2, A2: 0.4, B1: 0.6, B2: 0.8, C1: 0.95 }
    return difficulties[level]
  }
}