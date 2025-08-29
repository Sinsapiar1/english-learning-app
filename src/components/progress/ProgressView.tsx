/**
 * VISTA DE PROGRESO DETALLADO - ENGLISH MASTER APP
 * Analytics y métricas completas del usuario
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock, 
  Award,
  BarChart3,
  Activity,
  Zap,
  Star
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { UserProgress } from '../../types/progress';

interface ProgressViewProps {
  userProgress: UserProgress;
  onBack: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  userProgress,
  onBack
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [activeTab, setActiveTab] = useState<'overview' | 'levels' | 'skills' | 'achievements'>('overview');

  // Datos simulados para gráficos (en una app real vendrían de Firebase)
  const weeklyData = [
    { day: 'Lun', exercises: 12, accuracy: 85, xp: 120 },
    { day: 'Mar', exercises: 8, accuracy: 78, xp: 95 },
    { day: 'Mié', exercises: 15, accuracy: 92, xp: 150 },
    { day: 'Jue', exercises: 10, accuracy: 88, xp: 110 },
    { day: 'Vie', exercises: 18, accuracy: 94, xp: 180 },
    { day: 'Sáb', exercises: 6, accuracy: 75, xp: 70 },
    { day: 'Dom', exercises: 9, accuracy: 82, xp: 95 }
  ];

  const levelData = [
    { level: 'A1', progress: 100, color: '#10B981' },
    { level: 'A2', progress: 65, color: '#3B82F6' },
    { level: 'B1', progress: 25, color: '#8B5CF6' },
    { level: 'B2', progress: 0, color: '#6B7280' }
  ];

  const skillsData = [
    { skill: 'Saludos', mastery: 95, exercises: 45 },
    { skill: 'Necesidades Básicas', mastery: 88, exercises: 32 },
    { skill: 'Cortesía', mastery: 92, exercises: 28 },
    { skill: 'Información Personal', mastery: 78, exercises: 24 },
    { skill: 'Rutinas Diarias', mastery: 65, exercises: 18 }
  ];

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
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al Dashboard</span>
            </button>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mi Progreso
            </h1>

            <div className="flex items-center space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="all">Todo el tiempo</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'levels', label: 'Niveles', icon: TrendingUp },
              { id: 'skills', label: 'Habilidades', icon: Target },
              { id: 'achievements', label: 'Logros', icon: Award }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <StatsCard
                title="Total XP"
                value={userProgress.totalXP.toLocaleString()}
                icon={<Star className="w-6 h-6" />}
                color="yellow"
                change="+12%"
                period="esta semana"
              />
              <StatsCard
                title="Ejercicios"
                value={userProgress.totalExercises.toString()}
                icon={<Activity className="w-6 h-6" />}
                color="blue"
                change="+8%"
                period="esta semana"
              />
              <StatsCard
                title="Precisión"
                value={`${Math.round(userProgress.overallAccuracy * 100)}%`}
                icon={<Target className="w-6 h-6" />}
                color="green"
                change="+3%"
                period="esta semana"
              />
              <StatsCard
                title="Racha"
                value={`${userProgress.currentStreak} días`}
                icon={<Zap className="w-6 h-6" />}
                color="orange"
                change="Activa"
                period={`récord: ${userProgress.longestStreak}`}
              />
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weekly Progress Chart */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200/50"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Progreso Semanal</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="exercises" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* XP Distribution */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200/50"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Distribución de XP</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="xp" 
                      fill="url(#xpGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'levels' && (
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Progreso por Niveles</h3>
              
              <div className="space-y-6">
                {levelData.map((level, index) => (
                  <div key={level.level} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: level.color }}
                        />
                        <span className="font-semibold text-lg">Nivel {level.level}</span>
                        {level.level === userProgress.currentLevel && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            Actual
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">{level.progress}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${level.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        className="h-3 rounded-full"
                        style={{ backgroundColor: level.color }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Ejercicios:</span> {
                          userProgress.levelProgress[level.level as keyof typeof userProgress.levelProgress]?.exercisesCompleted || 0
                        }
                      </div>
                      <div>
                        <span className="font-medium">Precisión:</span> {
                          Math.round((userProgress.levelProgress[level.level as keyof typeof userProgress.levelProgress]?.accuracy || 0) * 100)
                        }%
                      </div>
                      <div>
                        <span className="font-medium">XP:</span> {
                          userProgress.levelProgress[level.level as keyof typeof userProgress.levelProgress]?.xpEarned || 0
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'skills' && (
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Dominio de Habilidades</h3>
              
              <div className="space-y-6">
                {skillsData.map((skill, index) => (
                  <div key={skill.skill} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{skill.skill}</span>
                      <div className="text-right text-sm text-gray-600">
                        <div>{skill.mastery}% dominada</div>
                        <div>{skill.exercises} ejercicios</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.mastery}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-3 rounded-full ${
                          skill.mastery >= 90 ? 'bg-green-500' :
                          skill.mastery >= 70 ? 'bg-blue-500' :
                          skill.mastery >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Achievement Cards */}
              <AchievementCard
                title="Primer Paso"
                description="Completa tu primera sesión"
                icon="🎯"
                unlocked={true}
                date="Hace 5 días"
              />
              <AchievementCard
                title="Saludador Experto"
                description="Domina los saludos básicos"
                icon="👋"
                unlocked={true}
                date="Hace 3 días"
              />
              <AchievementCard
                title="Racha de Fuego"
                description="Mantén una racha de 7 días"
                icon="🔥"
                unlocked={userProgress.currentStreak >= 7}
                date={userProgress.currentStreak >= 7 ? "Hoy" : undefined}
              />
              <AchievementCard
                title="Maestro A1"
                description="Completa el nivel A1"
                icon="🏆"
                unlocked={false}
              />
              <AchievementCard
                title="Precisión Perfecta"
                description="Logra 95% de precisión"
                icon="🎯"
                unlocked={userProgress.overallAccuracy >= 0.95}
              />
              <AchievementCard
                title="Explorador B1"
                description="Desbloquea el nivel B1"
                icon="🗺️"
                unlocked={false}
              />
            </div>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
};

// Componentes auxiliares
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'yellow' | 'blue' | 'green' | 'orange';
  change: string;
  period: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, change, period }) => {
  const colorClasses = {
    yellow: 'from-yellow-400 to-orange-500 text-yellow-600',
    blue: 'from-blue-400 to-blue-600 text-blue-600',
    green: 'from-green-400 to-emerald-500 text-green-600',
    orange: 'from-orange-400 to-red-500 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200/50">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <div className="flex items-center space-x-1 text-xs">
        <span className="text-green-600 font-medium">{change}</span>
        <span className="text-gray-500">{period}</span>
      </div>
    </div>
  );
};

interface AchievementCardProps {
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  title, 
  description, 
  icon, 
  unlocked, 
  date 
}) => (
  <div className={`
    p-6 rounded-xl border-2 transition-all duration-300
    ${unlocked 
      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg' 
      : 'bg-gray-50 border-gray-200 opacity-60'
    }
  `}>
    <div className="text-center">
      <div className="text-4xl mb-3">{unlocked ? icon : '🔒'}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      {unlocked && date && (
        <p className="text-xs text-green-600 font-medium">Desbloqueado {date}</p>
      )}
      {!unlocked && (
        <p className="text-xs text-gray-500">Bloqueado</p>
      )}
    </div>
  </div>
);