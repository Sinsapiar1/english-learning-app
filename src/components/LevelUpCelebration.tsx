import React, { useState, useEffect } from 'react';
import { ImprovedLevelSystem } from '../services/levelProgression';

interface LevelUpCelebrationProps {
  newLevel: string;
  onClose: () => void;
}

const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({ 
  newLevel, 
  onClose 
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  const celebrationData = ImprovedLevelSystem.createLevelUpCelebration(newLevel);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 12000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '⭐', '🏆', '🎊', '🌟'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className={`bg-gradient-to-r ${celebrationData.color} p-6 text-white text-center rounded-t-3xl`}>
          <div className="text-6xl mb-4 animate-bounce">
            {celebrationData.emoji}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {celebrationData.title}
          </h1>
          <p className="text-blue-100 font-medium">
            Level {newLevel} Unlocked!
          </p>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-gray-700 text-center">
              {celebrationData.message}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              🎁 ¡Recompensas Desbloqueadas!
            </h3>
            <div className="space-y-2">
              {celebrationData.rewards.map((reward, index) => (
                <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-600 font-medium text-sm">
                    {reward}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              🎯 Próximos Objetivos
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {celebrationData.nextGoals.map((goal, index) => (
                <div key={index} className="flex items-center p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center text-xs font-bold text-orange-800 mr-3">
                    {index + 1}
                  </span>
                  <span className="text-orange-700 text-sm">
                    {goal}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Ver Dashboard
            </button>
            <button
              onClick={() => {
                setShowConfetti(false);
                onClose();
              }}
              className={`flex-1 bg-gradient-to-r ${celebrationData.color} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105`}
            >
              🚀 ¡Seguir Aprendiendo!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelUpCelebration;