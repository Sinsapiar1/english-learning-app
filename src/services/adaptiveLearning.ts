// src/services/adaptiveLearning.ts
export interface LessonSession {
  id: string;
  currentExercise: number;
  totalExercises: number;
  exercises: any[];
  accuracy: number;
  currentLevel: "A1" | "A2" | "B1" | "B2";
  currentTopic: string;
  userWeaknesses: string[];
  sessionXP: number;
  isComplete: boolean;
}

export interface UserProgress {
  level: "A1" | "A2" | "B1" | "B2";
  xp: number;
  accuracy: number;
  completedLessons: number;
  weakAreas: string[];
  strengths: string[];
  streak: number;
}

export class AdaptiveLearningSystem {
  private static TOPICS = {
    A1: [
      "verb to be",
      "present simple",
      "basic vocabulary",
      "numbers",
      "colors",
    ],
    A2: [
      "present perfect",
      "past simple",
      "future tense",
      "prepositions",
      "adjectives",
    ],
    B1: [
      "present perfect continuous",
      "conditionals",
      "passive voice",
      "modal verbs",
    ],
    B2: [
      "advanced tenses",
      "subjunctive",
      "complex grammar",
      "idioms",
      "phrasal verbs",
    ],
  };

  static createLessonSession(
    userProgress: UserProgress,
    apiKey: string
  ): LessonSession {
    const topics = this.TOPICS[userProgress.level];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    return {
      id: `lesson_${Date.now()}`,
      currentExercise: 0,
      totalExercises: 8, // 8 ejercicios por sesión
      exercises: [],
      accuracy: 0,
      currentLevel: userProgress.level,
      currentTopic: randomTopic,
      userWeaknesses: userProgress.weakAreas,
      sessionXP: 0,
      isComplete: false,
    };
  }

  static shouldLevelUp(
    accuracy: number,
    completedLessons: number,
    currentLevel: string
  ): boolean {
    const requirements = {
      A1: { accuracy: 0.8, lessons: 5 },
      A2: { accuracy: 0.85, lessons: 8 },
      B1: { accuracy: 0.9, lessons: 12 },
    };

    const req = requirements[currentLevel as keyof typeof requirements];
    if (!req) return false;

    return accuracy >= req.accuracy && completedLessons >= req.lessons;
  }

  static getNextLevel(currentLevel: string): "A1" | "A2" | "B1" | "B2" {
    const levels = ["A1", "A2", "B1", "B2"];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[Math.min(currentIndex + 1, levels.length - 1)] as
      | "A1"
      | "A2"
      | "B1"
      | "B2";
  }

  static updateDifficulty(
    session: LessonSession,
    lastAnswerCorrect: boolean
  ): "A1" | "A2" | "B1" | "B2" {
    // Si el usuario está respondiendo muy bien, subir dificultad temporalmente
    if (session.accuracy > 0.9 && lastAnswerCorrect) {
      const levels = ["A1", "A2", "B1", "B2"];
      const currentIndex = levels.indexOf(session.currentLevel);
      return levels[Math.min(currentIndex + 1, levels.length - 1)] as
        | "A1"
        | "A2"
        | "B1"
        | "B2";
    }

    // Si está fallando mucho, bajar dificultad temporalmente
    if (session.accuracy < 0.6 && !lastAnswerCorrect) {
      const levels = ["A1", "A2", "B1", "B2"];
      const currentIndex = levels.indexOf(session.currentLevel);
      return levels[Math.max(currentIndex - 1, 0)] as "A1" | "A2" | "B1" | "B2";
    }

    return session.currentLevel;
  }
}
