/**
 * TIPOS DE DATOS PARA SISTEMA DE PROGRESO
 * English Master App - Firebase Structure
 */

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface LevelStats {
  exercisesCompleted: number;
  correctAnswers: number;
  accuracy: number;
  xpEarned: number;
  timeSpent: number; // en minutos
  sessionsCompleted: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  weakAreas: string[];
  strongAreas: string[];
  lastSession?: Date;
  averageTime: number; // promedio por ejercicio en segundos
}

export interface UserPreferences {
  dailyGoal: number; // ejercicios por día
  reminderTime?: string; // "19:00"
  soundEnabled: boolean;
  animationsEnabled: boolean;
  explanationLanguage: 'es' | 'en';
  difficultyPreference: 'adaptive' | 'challenging' | 'comfortable';
}

export interface UserProgress {
  userId: string;
  email: string;
  currentLevel: Level;
  
  // Stats globales
  totalExercises: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  totalXP: number;
  totalTimeSpent: number; // en minutos
  currentStreak: number; // días consecutivos
  longestStreak: number;
  
  // Progreso por nivel
  levelProgress: {
    A1: LevelStats;
    A2: LevelStats;
    B1: LevelStats;
    B2: LevelStats;
    C1: LevelStats;
  };
  
  // Configuración personal
  apiKey: string; // encriptada
  preferences: UserPreferences;
  
  // Achievements
  unlockedAchievements: string[];
  
  // Timestamps
  createdAt: Date;
  lastActive: Date;
  lastLevelUp?: Date;
}

export interface ExerciseStats {
  userId: string;
  exerciseId: string;
  level: Level;
  attempts: number;
  correctAttempts: number;
  averageTime: number; // segundos
  lastAttempted: Date;
  difficulty: number; // 0-1 scale
  masteryLevel: number; // 0-1 scale
  skillFocus: string; // 'greetings', 'basic_needs', etc.
}

export interface DailyProgress {
  userId: string;
  date: string; // YYYY-MM-DD
  exercisesCompleted: number;
  correctAnswers: number;
  accuracy: number;
  xpEarned: number;
  timeSpent: number; // minutos
  sessionsCompleted: number;
  goalMet: boolean;
  streak: number;
  level: Level;
}

export interface SessionResults {
  userId: string;
  sessionId: string;
  level: Level;
  exercisesCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
  xpEarned: number;
  timeSpent: number; // minutos
  skillsFocused: string[];
  weakAreasIdentified: string[];
  startTime: Date;
  endTime: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'accuracy' | 'speed' | 'social';
  requirements: {
    metric: string;
    threshold: number;
    timeframe?: string;
  };
  rewards: {
    xp: number;
    badge: string;
    unlocks?: string[];
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LevelRequirements {
  minExercises: number;
  minAccuracy: number;
  minSessions: number;
  minTimeSpent: number; // minutos
  skillsRequired: string[];
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-1
}

export interface ProgressCalculation {
  canLevelUp: boolean;
  progressPercentage: number;
  nextLevel: Level;
  requirements: LevelRequirements;
  currentStats: LevelStats;
  blockedBy: string[];
  estimatedTimeToLevelUp: number; // minutos
}