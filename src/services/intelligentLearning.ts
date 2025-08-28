// SISTEMA INTELIGENTE DE APRENDIZAJE CON FIREBASE
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserLearningProfile {
  userId: string;
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2';
  detectedLevel?: 'A1' | 'A2' | 'B1' | 'B2';
  
  // Análisis de fortalezas y debilidades
  topicMastery: {
    [topic: string]: {
      accuracy: number;
      exercisesCompleted: number;
      averageTime: number;
      lastPracticed: Date;
      masteryLevel: 'weak' | 'learning' | 'good' | 'mastered';
    };
  };
  
  // Patrones de error
  commonMistakes: {
    [errorType: string]: {
      frequency: number;
      lastOccurrence: Date;
      examples: string[];
    };
  };
  
  // Métricas de aprendizaje
  learningMetrics: {
    totalExercises: number;
    correctAnswers: number;
    overallAccuracy: number;
    studyStreak: number;
    averageSessionTime: number;
    preferredStudyTime: string;
    learningVelocity: number; // ejercicios por día
  };
  
  // Preferencias adaptativas
  adaptiveSettings: {
    difficultyPreference: 'challenging' | 'balanced' | 'comfortable';
    explanationDetail: 'brief' | 'detailed' | 'comprehensive';
    repetitionFrequency: 'low' | 'medium' | 'high';
    focusAreas: string[];
  };
  
  // Historial de sesiones
  sessionHistory: SessionRecord[];
  
  // Objetivos y metas
  goals: {
    targetLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
    dailyGoal: number;
    weeklyGoal: number;
    targetDate?: Date;
  };
  
  lastUpdated: Date;
  createdAt: Date;
}

export interface SessionRecord {
  sessionId: string;
  date: Date;
  duration: number; // minutos
  exercisesCompleted: number;
  correctAnswers: number;
  topicsStudied: string[];
  averageResponseTime: number;
  difficultyLevel: string;
  xpEarned: number;
  mistakePatterns: string[];
  improvementAreas: string[];
}

export interface ExerciseInteraction {
  exerciseId: string;
  userId: string;
  timestamp: Date;
  topic: string;
  level: string;
  isCorrect: boolean;
  responseTime: number; // segundos
  selectedAnswer: number;
  correctAnswer: number;
  hintsUsed: number;
  confidence: 'low' | 'medium' | 'high';
  errorType?: string;
  sessionId: string;
}

export class IntelligentLearningSystem {
  
  // DETECCIÓN AUTOMÁTICA DE NIVEL
  static async detectUserLevel(userId: string): Promise<'A1' | 'A2' | 'B1' | 'B2'> {
    console.log("🧠 DETECTANDO NIVEL DE INGLÉS DEL USUARIO");
    
    try {
      const profile = await this.getUserProfile(userId);
      
      if (!profile || profile.learningMetrics.totalExercises < 10) {
        console.log("📊 Insuficientes datos - Iniciando con nivel A1");
        return 'A1';
      }
      
      const { overallAccuracy, totalExercises } = profile.learningMetrics;
      const topicMasteries = Object.values(profile.topicMastery);
      
      // Análisis de patrones de dominio
      const masteredTopics = topicMasteries.filter(t => t.masteryLevel === 'mastered').length;
      const goodTopics = topicMasteries.filter(t => t.masteryLevel === 'good').length;
      const totalTopics = topicMasteries.length;
      
      // Algoritmo de detección de nivel
      let detectedLevel: 'A1' | 'A2' | 'B1' | 'B2' = 'A1';
      
      if (overallAccuracy >= 0.85 && masteredTopics >= totalTopics * 0.7) {
        if (totalExercises >= 100) detectedLevel = 'B2';
        else if (totalExercises >= 50) detectedLevel = 'B1';
        else detectedLevel = 'A2';
      } else if (overallAccuracy >= 0.75 && (masteredTopics + goodTopics) >= totalTopics * 0.6) {
        if (totalExercises >= 50) detectedLevel = 'A2';
        else detectedLevel = 'A1';
      }
      
      console.log(`🎯 NIVEL DETECTADO: ${detectedLevel} (Precisión: ${(overallAccuracy * 100).toFixed(1)}%)`);
      
      // Actualizar perfil con nivel detectado
      await this.updateUserProfile(userId, { detectedLevel });
      
      return detectedLevel;
      
    } catch (error) {
      console.error("❌ Error detectando nivel:", error);
      return 'A1';
    }
  }
  
  // ANÁLISIS DE FORTALEZAS Y DEBILIDADES
  static async analyzeUserWeaknesses(userId: string): Promise<string[]> {
    console.log("🔍 ANALIZANDO DEBILIDADES DEL USUARIO");
    
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return [];
      
      const weakTopics = Object.entries(profile.topicMastery)
        .filter(([_, mastery]) => 
          mastery.masteryLevel === 'weak' || 
          (mastery.accuracy < 0.6 && mastery.exercisesCompleted >= 5)
        )
        .map(([topic, _]) => topic)
        .slice(0, 3); // Top 3 debilidades
      
      console.log("📉 ÁREAS DÉBILES IDENTIFICADAS:", weakTopics);
      return weakTopics;
      
    } catch (error) {
      console.error("❌ Error analizando debilidades:", error);
      return [];
    }
  }
  
  // RECOMENDACIONES PERSONALIZADAS
  static async getPersonalizedRecommendations(userId: string): Promise<{
    recommendedTopics: string[];
    suggestedDifficulty: string;
    focusAreas: string[];
    studyPlan: string[];
  }> {
    console.log("🎯 GENERANDO RECOMENDACIONES PERSONALIZADAS");
    
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      return {
        recommendedTopics: ['present simple'],
        suggestedDifficulty: 'A1',
        focusAreas: ['basic grammar'],
        studyPlan: ['Comenzar con conceptos básicos']
      };
    }
    
    const weaknesses = await this.analyzeUserWeaknesses(userId);
    const strengths = Object.entries(profile.topicMastery)
      .filter(([_, mastery]) => mastery.masteryLevel === 'mastered')
      .map(([topic, _]) => topic);
    
    return {
      recommendedTopics: weaknesses.length > 0 ? weaknesses : ['present simple', 'past simple'],
      suggestedDifficulty: profile.detectedLevel || profile.currentLevel,
      focusAreas: weaknesses,
      studyPlan: this.generateStudyPlan(profile, weaknesses, strengths)
    };
  }
  
  // TRACKING DE INTERACCIONES
  static async recordExerciseInteraction(interaction: Omit<ExerciseInteraction, 'timestamp'>): Promise<void> {
    try {
      const fullInteraction: ExerciseInteraction = {
        ...interaction,
        timestamp: new Date()
      };
      
      // Guardar interacción individual
      await addDoc(collection(db, 'exercise_interactions'), fullInteraction);
      
      // Actualizar perfil del usuario
      await this.updateLearningProfile(interaction.userId, fullInteraction);
      
      console.log("✅ Interacción registrada:", fullInteraction.exerciseId);
      
    } catch (error) {
      console.error("❌ Error registrando interacción:", error);
    }
  }
  
  // ACTUALIZAR PERFIL DE APRENDIZAJE
  static async updateLearningProfile(userId: string, interaction: ExerciseInteraction): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId) || this.createEmptyProfile(userId);
      
      // Actualizar métricas del tema
      if (!profile.topicMastery[interaction.topic]) {
        profile.topicMastery[interaction.topic] = {
          accuracy: 0,
          exercisesCompleted: 0,
          averageTime: 0,
          lastPracticed: new Date(),
          masteryLevel: 'learning'
        };
      }
      
      const topicData = profile.topicMastery[interaction.topic];
      const wasCorrect = interaction.isCorrect ? 1 : 0;
      
      // Actualizar estadísticas del tema
      topicData.exercisesCompleted += 1;
      topicData.accuracy = (topicData.accuracy * (topicData.exercisesCompleted - 1) + wasCorrect) / topicData.exercisesCompleted;
      topicData.averageTime = (topicData.averageTime * (topicData.exercisesCompleted - 1) + interaction.responseTime) / topicData.exercisesCompleted;
      topicData.lastPracticed = new Date();
      
      // Determinar nivel de dominio
      if (topicData.accuracy >= 0.9 && topicData.exercisesCompleted >= 10) {
        topicData.masteryLevel = 'mastered';
      } else if (topicData.accuracy >= 0.75 && topicData.exercisesCompleted >= 5) {
        topicData.masteryLevel = 'good';
      } else if (topicData.accuracy < 0.5 && topicData.exercisesCompleted >= 5) {
        topicData.masteryLevel = 'weak';
      } else {
        topicData.masteryLevel = 'learning';
      }
      
      // Actualizar métricas generales
      profile.learningMetrics.totalExercises += 1;
      if (interaction.isCorrect) profile.learningMetrics.correctAnswers += 1;
      profile.learningMetrics.overallAccuracy = profile.learningMetrics.correctAnswers / profile.learningMetrics.totalExercises;
      
      // Registrar errores comunes
      if (!interaction.isCorrect && interaction.errorType) {
        if (!profile.commonMistakes[interaction.errorType]) {
          profile.commonMistakes[interaction.errorType] = {
            frequency: 0,
            lastOccurrence: new Date(),
            examples: []
          };
        }
        profile.commonMistakes[interaction.errorType].frequency += 1;
        profile.commonMistakes[interaction.errorType].lastOccurrence = new Date();
      }
      
      profile.lastUpdated = new Date();
      
      // Guardar perfil actualizado
      await setDoc(doc(db, 'user_learning_profiles', userId), profile);
      
      console.log(`📊 Perfil actualizado - Precisión: ${(profile.learningMetrics.overallAccuracy * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error("❌ Error actualizando perfil:", error);
    }
  }
  
  // OBTENER PERFIL DE USUARIO
  static async getUserProfile(userId: string): Promise<UserLearningProfile | null> {
    try {
      const docRef = doc(db, 'user_learning_profiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        } as UserLearningProfile;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error obteniendo perfil:", error);
      return null;
    }
  }
  
  // ACTUALIZAR PERFIL
  static async updateUserProfile(userId: string, updates: Partial<UserLearningProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'user_learning_profiles', userId);
      await updateDoc(docRef, { ...updates, lastUpdated: new Date() });
    } catch (error) {
      console.error("❌ Error actualizando perfil:", error);
    }
  }
  
  // CREAR PERFIL VACÍO
  static createEmptyProfile(userId: string): UserLearningProfile {
    return {
      userId,
      currentLevel: 'A1',
      topicMastery: {},
      commonMistakes: {},
      learningMetrics: {
        totalExercises: 0,
        correctAnswers: 0,
        overallAccuracy: 0,
        studyStreak: 0,
        averageSessionTime: 0,
        preferredStudyTime: 'evening',
        learningVelocity: 0
      },
      adaptiveSettings: {
        difficultyPreference: 'balanced',
        explanationDetail: 'detailed',
        repetitionFrequency: 'medium',
        focusAreas: []
      },
      sessionHistory: [],
      goals: {
        targetLevel: 'B1',
        dailyGoal: 10,
        weeklyGoal: 50
      },
      lastUpdated: new Date(),
      createdAt: new Date()
    };
  }
  
  // GENERAR PLAN DE ESTUDIO
  static generateStudyPlan(profile: UserLearningProfile, weaknesses: string[], strengths: string[]): string[] {
    const plan = [];
    
    if (weaknesses.length > 0) {
      plan.push(`🎯 Enfocar en áreas débiles: ${weaknesses.join(', ')}`);
      plan.push(`📚 Practicar 15-20 ejercicios diarios de estos temas`);
    }
    
    if (strengths.length > 0) {
      plan.push(`✅ Mantener fortalezas: ${strengths.slice(0, 2).join(', ')}`);
    }
    
    if (profile.learningMetrics.overallAccuracy < 0.7) {
      plan.push(`⚡ Reducir velocidad - enfocarse en precisión antes que velocidad`);
    }
    
    plan.push(`🎯 Meta semanal: ${profile.goals.weeklyGoal} ejercicios`);
    
    return plan;
  }
  
  // ANALYTICS AVANZADOS
  static async getDetailedAnalytics(userId: string): Promise<{
    weeklyProgress: any[];
    topicBreakdown: any[];
    errorPatterns: any[];
    learningVelocity: number;
    recommendations: string[];
  }> {
    console.log("📊 GENERANDO ANALYTICS DETALLADOS");
    
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return this.getEmptyAnalytics();
      
      // Obtener interacciones recientes
      const interactionsQuery = query(
        collection(db, 'exercise_interactions'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const interactionsSnap = await getDocs(interactionsQuery);
      const interactions = interactionsSnap.docs.map(doc => doc.data() as ExerciseInteraction);
      
      return {
        weeklyProgress: this.calculateWeeklyProgress(interactions),
        topicBreakdown: this.analyzeTopicPerformance(profile.topicMastery),
        errorPatterns: this.analyzeErrorPatterns(profile.commonMistakes),
        learningVelocity: this.calculateLearningVelocity(interactions),
        recommendations: await this.getPersonalizedRecommendations(userId).then(r => r.studyPlan)
      };
      
    } catch (error) {
      console.error("❌ Error generando analytics:", error);
      return this.getEmptyAnalytics();
    }
  }
  
  private static calculateWeeklyProgress(interactions: ExerciseInteraction[]) {
    // Implementar cálculo de progreso semanal
    return [];
  }
  
  private static analyzeTopicPerformance(topicMastery: any) {
    return Object.entries(topicMastery).map(([topic, data]: [string, any]) => ({
      topic,
      accuracy: data.accuracy,
      exercisesCompleted: data.exercisesCompleted,
      masteryLevel: data.masteryLevel
    }));
  }
  
  private static analyzeErrorPatterns(commonMistakes: any) {
    return Object.entries(commonMistakes).map(([error, data]: [string, any]) => ({
      errorType: error,
      frequency: data.frequency,
      lastOccurrence: data.lastOccurrence
    }));
  }
  
  private static calculateLearningVelocity(interactions: ExerciseInteraction[]): number {
    if (interactions.length < 2) return 0;
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentInteractions = interactions.filter(i => 
      new Date(i.timestamp) >= weekAgo
    );
    
    return recentInteractions.length / 7; // ejercicios por día
  }
  
  private static getEmptyAnalytics() {
    return {
      weeklyProgress: [],
      topicBreakdown: [],
      errorPatterns: [],
      learningVelocity: 0,
      recommendations: ['Comenzar con ejercicios básicos']
    };
  }
}