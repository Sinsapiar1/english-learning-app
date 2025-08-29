/**
 * DASHBOARD PRINCIPAL - UI MODERNA CON ANIMACIONES
 * English Master App - Experiencia de Usuario Optimizada
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Trophy, 
  Target, 
  Clock, 
  Zap, 
  TrendingUp, 
  Award,
  Play,
  BarChart3,
  Settings,
  Star
} from 'lucide-react';

import { UserProgress, Level, ProgressCalculation } from '../../types/progress';
import { ProgressService } from '../../services/firebase/ProgressService';
import { RepetitionCleaner } from '../../services/firebase/RepetitionCleaner';

interface DashboardProps {
  userProgress: UserProgress;
  onStartSession: () => void;
  onViewProgress: () => void;
  onSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProgress,
  onStartSession,
  onViewProgress,
  onSettings
}) => {
  const [progressCalc, setProgressCalc] = useState<ProgressCalculation | null>(null);
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);

  const progressService = new ProgressService();
  const repetitionCleaner = new RepetitionCleaner();

  useEffect(() => {
    const currentLevelStats = userProgress.levelProgress[userProgress.currentLevel];
    const calc = progressService.calculateProgress(userProgress.currentLevel, currentLevelStats);
    setProgressCalc(calc);
  }, [userProgress]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EM</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  English Master
                </h1>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="text-right"
              >
                <p className="text-sm font-medium text-gray-900">
                  {userProgress.email.split('@')[0]} 👋
                </p>
                <p className="text-xs text-gray-500">
                  Nivel {userProgress.currentLevel} • {userProgress.currentStreak} días seguidos
                </p>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSettings}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Level Progress Card */}
          <motion.div
            variants={itemVariants}
            className={`
              relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-500
              ${progressCalc?.canLevelUp 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-green-100' 
                : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-blue-100'
              } shadow-xl
            `}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <motion.h2
                  className={`text-3xl font-bold mb-2 ${
                    progressCalc?.canLevelUp ? 'text-green-800' : 'text-blue-800'
                  }`}
                >
                  📈 Nivel {userProgress.currentLevel} → {progressCalc?.nextLevel}
                </motion.h2>
                <p className={`text-sm ${
                  progressCalc?.canLevelUp ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {progressCalc?.canLevelUp 
                    ? '🎉 ¡Listo para subir de nivel!' 
                    : progressCalc?.requirements.description
                  }
                </p>
              </div>

              <motion.div
                animate={{ 
                  scale: progressCalc?.canLevelUp ? [1, 1.1, 1] : 1,
                  rotate: progressCalc?.canLevelUp ? [0, 5, -5, 0] : 0
                }}
                transition={{ 
                  duration: 2, 
                  repeat: progressCalc?.canLevelUp ? Infinity : 0 
                }}
                className="text-center"
              >
                <div className={`
                  inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold
                  ${progressCalc?.canLevelUp 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                    : 'bg-white text-blue-600 shadow-lg'
                  }
                `}>
                  {progressCalc?.progressPercentage || 0}%
                </div>
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressCalc?.progressPercentage || 0}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    progressCalc?.canLevelUp 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                      : 'bg-gradient-to-r from-blue-400 to-purple-500'
                  }`}
                />
              </div>
            </div>

            {/* Requirements */}
            {progressCalc && !progressCalc.canLevelUp && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {progressCalc.blockedBy.map((requirement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/50 rounded-lg p-2 text-center"
                  >
                    <span className="text-gray-600">{requirement}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Level Up Button */}
            {progressCalc?.canLevelUp && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
                onClick={() => setShowLevelUpCelebration(true)}
              >
                🎉 ¡SUBIR DE NIVEL!
              </motion.button>
            )}
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <StatsCard
              title="XP Total"
              value={userProgress.totalXP.toLocaleString()}
              icon={<Star className="w-6 h-6" />}
              color="yellow"
              subtitle="+50 hoy"
            />
            <StatsCard
              title="Precisión"
              value={`${Math.round(userProgress.overallAccuracy * 100)}%`}
              icon={<Target className="w-6 h-6" />}
              color="blue"
              subtitle="Meta: 85%"
            />
            <StatsCard
              title="Racha"
              value={`${userProgress.currentStreak} días`}
              icon={<Zap className="w-6 h-6" />}
              color="orange"
              subtitle={`Récord: ${userProgress.longestStreak}`}
            />
            <StatsCard
              title="Tiempo Total"
              value={`${Math.round(userProgress.totalTimeSpent / 60)}h`}
              icon={<Clock className="w-6 h-6" />}
              color="green"
              subtitle="Esta semana"
            />
          </motion.div>

          {/* Level Map */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200/50"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Tu Camino de Aprendizaje</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(['A1', 'A2', 'B1', 'B2', 'C1'] as Level[]).map((level, index) => {
                const stats = userProgress.levelProgress[level];
                const isCurrent = userProgress.currentLevel === level;
                const isCompleted = stats.isCompleted;
                const isUnlocked = stats.isUnlocked;
                
                return (
                  <LevelCard
                    key={level}
                    level={level}
                    stats={stats}
                    isCurrent={isCurrent}
                    isCompleted={isCompleted}
                    isUnlocked={isUnlocked}
                    index={index}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            {/* Main Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartSession}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Play className="w-8 h-8" />
                  <div className="text-left">
                    <h3 className="text-xl font-bold">Comenzar Sesión</h3>
                    <p className="text-blue-100">8 ejercicios únicos y personalizados</p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onViewProgress}
                className="bg-white border-2 border-gray-200 text-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <div className="text-left">
                    <h3 className="text-xl font-bold">Ver Progreso</h3>
                    <p className="text-gray-600">Análisis detallado</p>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Emergency Clean Button */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-yellow-800">¿Ves preguntas repetidas?</h4>
                  <p className="text-sm text-yellow-700">Limpia el historial para obtener ejercicios completamente nuevos</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    try {
                      await repetitionCleaner.cleanAllUserHistory(userProgress.userId);
                      alert('🎉 ¡Historial limpiado! Las próximas sesiones tendrán ejercicios completamente nuevos.');
                    } catch (error) {
                      alert('❌ Error limpiando historial. Inténtalo de nuevo.');
                    }
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  🧹 Limpiar Historial
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Level Up Celebration */}
      <AnimatePresence>
        {showLevelUpCelebration && (
          <LevelUpCelebration
            newLevel={progressCalc?.nextLevel || 'A2'}
            onClose={() => setShowLevelUpCelebration(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Componente StatsCard
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'yellow' | 'blue' | 'orange' | 'green';
  subtitle: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => {
  const colorClasses = {
    yellow: 'from-yellow-400 to-orange-500 text-yellow-600',
    blue: 'from-blue-400 to-blue-600 text-blue-600',
    orange: 'from-orange-400 to-red-500 text-orange-600',
    green: 'from-green-400 to-emerald-500 text-green-600'
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </motion.div>
  );
};

// Componente LevelCard
interface LevelCardProps {
  level: Level;
  stats: any;
  isCurrent: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
  index: number;
}

const LevelCard: React.FC<LevelCardProps> = ({
  level,
  stats,
  isCurrent,
  isCompleted,
  isUnlocked,
  index
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        p-4 rounded-xl border-2 text-center transition-all duration-300 cursor-pointer
        ${isCurrent 
          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100' : 
          isCompleted 
            ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' :
            isUnlocked 
              ? 'border-gray-300 bg-gray-50 hover:border-gray-400' :
              'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
        }
      `}
      whileHover={isUnlocked ? { scale: 1.02 } : {}}
    >
      <div className="text-3xl mb-2">
        {isCompleted ? '🏆' : isCurrent ? '🎯' : isUnlocked ? '🔓' : '🔒'}
      </div>
      <div className="font-bold text-lg mb-1">{level}</div>
      <div className="text-sm text-gray-600 mb-2">
        {stats.exercisesCompleted} ejercicios
      </div>
      {isCompleted && stats.completedAt && (
        <div className="text-xs text-green-600">
          Completado {new Date(stats.completedAt).toLocaleDateString()}
        </div>
      )}
      {isCurrent && (
        <div className="text-xs text-blue-600 font-medium">
          {Math.round(stats.accuracy * 100)}% precisión
        </div>
      )}
    </motion.div>
  );
};

// Componente LevelUpCelebration
interface LevelUpCelebrationProps {
  newLevel: Level;
  onClose: () => void;
}

const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({ newLevel, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="bg-white p-8 rounded-2xl text-center shadow-2xl max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity 
          }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        
        <h2 className="text-3xl font-bold text-yellow-500 mb-2">
          ¡LEVEL UP!
        </h2>
        
        <p className="text-xl text-gray-800 mb-4">
          ¡Ahora eres nivel <span className="font-bold text-blue-600">{newLevel}</span>!
        </p>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-6">
          <p className="text-sm text-gray-600">
            Has desbloqueado nuevos ejercicios y desafíos más avanzados
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
        >
          ¡Continuar Aprendiendo!
        </motion.button>
      </motion.div>
    </motion.div>
  );
};