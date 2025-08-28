export interface LevelRequirements {
  accuracy: number;
  totalExercises: number;
  consistentSessions: number;
  minXP: number;
}

export class ImprovedLevelSystem {
  
  private static LEVEL_REQUIREMENTS: Record<string, LevelRequirements> = {
    'A1': { 
      accuracy: 0.65,
      totalExercises: 40,
      consistentSessions: 3,
      minXP: 300
    },
    'A2': { 
      accuracy: 0.70,
      totalExercises: 80,
      consistentSessions: 4,
      minXP: 700
    },
    'B1': { 
      accuracy: 0.75,
      totalExercises: 120,
      consistentSessions: 5,
      minXP: 1200
    }
  };

  static calculateLevelProgress(userStats: {
    currentLevel: string;
    accuracy: number;
    totalExercises: number;
    xp: number;
    recentSessions: number[];
  }): {
    canLevelUp: boolean;
    progressPercentage: number;
    missingRequirements: string[];
    nextLevel: string;
    motivationalMessage: string;
  } {
    
    const requirements = this.LEVEL_REQUIREMENTS[userStats.currentLevel];
    if (!requirements) {
      return {
        canLevelUp: false,
        progressPercentage: 100,
        missingRequirements: [],
        nextLevel: userStats.currentLevel,
        motivationalMessage: "¡Has alcanzado el nivel máximo actual!"
      };
    }

    const missing: string[] = [];
    let progressFactors: number[] = [];

    const accuracyProgress = Math.min(userStats.accuracy / requirements.accuracy, 1);
    progressFactors.push(accuracyProgress);
    if (userStats.accuracy < requirements.accuracy) {
      const needed = Math.round((requirements.accuracy - userStats.accuracy) * 100);
      missing.push(`Mejorar precisión en ${needed}%`);
    }

    const exerciseProgress = Math.min(userStats.totalExercises / requirements.totalExercises, 1);
    progressFactors.push(exerciseProgress);
    if (userStats.totalExercises < requirements.totalExercises) {
      const needed = requirements.totalExercises - userStats.totalExercises;
      missing.push(`Completar ${needed} ejercicios más`);
    }

    const xpProgress = Math.min(userStats.xp / requirements.minXP, 1);
    progressFactors.push(xpProgress);
    if (userStats.xp < requirements.minXP) {
      const needed = requirements.minXP - userStats.xp;
      missing.push(`Ganar ${needed} XP más`);
    }

    const recentGoodSessions = userStats.recentSessions.filter(acc => acc >= 0.6).length;
    const consistencyProgress = Math.min(recentGoodSessions / requirements.consistentSessions, 1);
    progressFactors.push(consistencyProgress);
    if (recentGoodSessions < requirements.consistentSessions) {
      const needed = requirements.consistentSessions - recentGoodSessions;
      missing.push(`${needed} sesiones más con 60%+ precisión`);
    }

    const overallProgress = progressFactors.reduce((sum, p) => sum + p, 0) / progressFactors.length;
    const canLevelUp = missing.length === 0;
    const nextLevel = this.getNextLevel(userStats.currentLevel);

    let motivationalMessage = "";
    if (canLevelUp) {
      motivationalMessage = `🎉 ¡LISTO PARA SUBIR A ${nextLevel}! Complete una sesión más para subir oficialmente.`;
    } else if (overallProgress > 0.8) {
      motivationalMessage = `🔥 ¡MUY CERCA! Solo te falta: ${missing[0]}`;
    } else if (overallProgress > 0.5) {
      motivationalMessage = `💪 ¡Buen progreso! Sigue así. Te falta: ${missing.slice(0, 2).join(', ')}`;
    } else {
      motivationalMessage = `🌟 ¡Empezando bien! Enfócate en: ${missing[0]}`;
    }

    return {
      canLevelUp,
      progressPercentage: Math.round(overallProgress * 100),
      missingRequirements: missing,
      nextLevel,
      motivationalMessage
    };
  }

  private static getNextLevel(currentLevel: string): string {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[currentIndex + 1] || currentLevel;
  }

  static createLevelUpCelebration(newLevel: string): {
    title: string;
    message: string;
    rewards: string[];
    nextGoals: string[];
    color: string;
    emoji: string;
  } {
    const celebrations = {
      'A2': {
        title: "🎉 ¡FELICIDADES! Ahora eres nivel A2",
        message: "Ya no eres principiante absoluto. Puedes mantener conversaciones básicas en inglés.",
        rewards: [
          "✅ Ejercicios A2 desbloqueados",
          "🎯 Nuevos temas: Present Perfect, Preposiciones",
          "⭐ +50 XP Bonus por subir de nivel",
          "🏆 Insignia 'Elementary English'"
        ],
        nextGoals: [
          "Aprender Present Perfect",
          "Dominar preposiciones básicas",  
          "Alcanzar 70% precisión",
          "Completar 10 sesiones A2"
        ],
        color: "from-blue-400 to-purple-600",
        emoji: "🌟"
      },
      'B1': {
        title: "🏆 ¡INCREÍBLE! Ahora eres nivel B1",
        message: "¡Nivel intermedio! Ya puedes ver películas en inglés con subtítulos.",
        rewards: [
          "✅ Ejercicios B1 desbloqueados",
          "🎯 Temas avanzados: Condicionales, Voz Pasiva",
          "⭐ +100 XP Bonus",
          "🏆 Insignia 'Intermediate Speaker'"
        ],
        nextGoals: [
          "Dominar condicionales",
          "Aprender voz pasiva",
          "75% precisión consistente",
          "Ver contenido en inglés"
        ],
        color: "from-emerald-400 to-teal-600",
        emoji: "🚀"
      }
    };

    return celebrations[newLevel as keyof typeof celebrations] || {
      title: `🌟 ¡Nivel ${newLevel} Alcanzado!`,
      message: "¡Excelente progreso en tu aprendizaje de inglés!",
      rewards: ["⭐ Bonus XP", "🎯 Nuevos desafíos"],
      nextGoals: ["Continuar mejorando"],
      color: "from-purple-400 to-pink-600",
      emoji: "🎊"
    };
  }
}