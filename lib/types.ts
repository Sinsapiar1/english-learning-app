/**
 * TIPOS PRINCIPALES - ENGLISH MASTER V3
 * Arquitectura limpia y robusta
 */

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  apiKey?: string
  createdAt: Date
  lastActive: Date
}

export interface Exercise {
  id: string
  level: Level
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  skillFocus: string
  difficulty: number
  situation: string
  createdAt: Date
}

export interface UserProgress {
  userId: string
  currentLevel: Level
  totalXP: number
  totalExercises: number
  correctAnswers: number
  accuracy: number
  currentStreak: number
  longestStreak: number
  
  // Progress por nivel
  levelStats: Record<Level, LevelStats>
  
  // Configuración
  preferences: UserPreferences
  
  // Timestamps
  createdAt: Date
  lastActive: Date
  lastLevelUp?: Date
}

export interface LevelStats {
  exercisesCompleted: number
  correctAnswers: number
  accuracy: number
  xpEarned: number
  timeSpent: number // minutos
  sessionsCompleted: number
  isUnlocked: boolean
  isCompleted: boolean
  completedAt?: Date
  weakAreas: string[]
  strongAreas: string[]
}

export interface UserPreferences {
  dailyGoal: number
  soundEnabled: boolean
  animationsEnabled: boolean
  explanationLanguage: 'es' | 'en'
  reminderTime?: string
}

export interface SessionResult {
  sessionId: string
  userId: string
  level: Level
  exercises: Exercise[]
  correctAnswers: number
  totalAnswers: number
  accuracy: number
  xpEarned: number
  timeSpent: number
  completedAt: Date
}

export interface LevelRequirements {
  minExercises: number
  minAccuracy: number
  minSessions: number
  description: string
  skillsRequired: string[]
}

// Configuración de niveles
export const LEVEL_CONFIG: Record<Level, LevelRequirements> = {
  A1: {
    minExercises: 30,
    minAccuracy: 0.70,
    minSessions: 4,
    description: 'Supervivencia básica en inglés',
    skillsRequired: ['greetings', 'basic_needs', 'courtesy']
  },
  A2: {
    minExercises: 60,
    minAccuracy: 0.75,
    minSessions: 8,
    description: 'Comunicación cotidiana',
    skillsRequired: ['daily_routines', 'past_experiences', 'future_plans']
  },
  B1: {
    minExercises: 90,
    minAccuracy: 0.80,
    minSessions: 12,
    description: 'Independencia comunicativa',
    skillsRequired: ['work_situations', 'problem_solving', 'opinions']
  },
  B2: {
    minExercises: 120,
    minAccuracy: 0.85,
    minSessions: 16,
    description: 'Fluidez profesional',
    skillsRequired: ['professional_communication', 'analysis', 'complex_grammar']
  },
  C1: {
    minExercises: 150,
    minAccuracy: 0.90,
    minSessions: 20,
    description: 'Dominio académico y profesional',
    skillsRequired: ['academic_communication', 'expert_analysis', 'specialized_vocabulary']
  }
}