/**
 * EXERCISE GENERATOR - ENGLISH MASTER V3
 * Generador robusto de ejercicios con anti-repetición
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

interface Exercise {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  level: string
  skillFocus: string
}

export class ExerciseGenerator {
  private genAI: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async generateExercisesForLevel(level: string, userId: string): Promise<Exercise[]> {
    try {
      const prompt = this.getPromptForLevel(level)
      
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 4000,
        }
      })

      const result = await model.generateContent(prompt)
      const text = result.response.text()

      // Extraer JSON
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const data = JSON.parse(jsonMatch[1] || jsonMatch[0])
      
      if (!data.exercises || !Array.isArray(data.exercises)) {
        throw new Error('Invalid exercises format')
      }

      return data.exercises.map((ex: any, index: number) => ({
        id: `${level}_${userId}_${Date.now()}_${index}`,
        question: ex.question,
        options: this.shuffleArray(ex.options),
        correctAnswer: ex.options.indexOf(ex.options[ex.correctAnswer]),
        explanation: ex.explanation,
        level,
        skillFocus: ex.skillFocus || 'general'
      }))

    } catch (error) {
      console.error('AI generation failed:', error)
      throw error
    }
  }

  private getPromptForLevel(level: string): string {
    const prompts = {
      A1: `Genera 8 ejercicios únicos para nivel A1 (supervivencia básica).

REGLAS ESTRICTAS:
- Preguntas en ESPAÑOL
- Respuestas en INGLÉS
- Situaciones de supervivencia real
- NUNCA usar: "Good morning", "Hello", "Thank you", "I'm hungry"

SITUACIONES ÚNICAS:
- Banco, farmacia, dentista, trabajo, emergencias
- Pedir ayuda, direcciones, explicar problemas

FORMATO:
\`\`\`json
{
  "exercises": [
    {
      "question": "Estás en el banco y necesitas ayuda",
      "options": ["Excuse me, can you help me?", "Hello friend", "Good day", "Thank you"],
      "correctAnswer": 0,
      "explanation": "Para pedir ayuda formal: Excuse me, can you help me?",
      "skillFocus": "formal_requests"
    }
  ]
}
\`\`\``,

      C1: `Genera 8 ejercicios únicos para nivel C1 (dominio académico).

NIVEL C1 - ACADÉMICO AVANZADO:
- Debates filosóficos y epistemológicos
- Análisis de políticas públicas
- Comunicación científica especializada
- Facilitación de consenso entre expertos

VOCABULARIO OBLIGATORIO:
- epistemological, ontological, paradigmatic
- dialectical, empirical, methodological
- institutional, organizational, strategic

FORMATO:
\`\`\`json
{
  "exercises": [
    {
      "question": "How do you articulate epistemological implications of scientific paradigms?",
      "options": [
        "Scientific paradigms fundamentally reconfigure our epistemological commitments by establishing new criteria for theoretical adequacy and empirical validation",
        "Scientific theories change how we think about knowledge",
        "New science affects our understanding",
        "Paradigms influence knowledge"
      ],
      "correctAnswer": 0,
      "explanation": "C1 academic discourse requires: 'reconfigure epistemological commitments by establishing criteria for theoretical adequacy'",
      "skillFocus": "epistemological_analysis"
    }
  ]
}
\`\`\``
    }

    return prompts[level as keyof typeof prompts] || prompts.A1
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}