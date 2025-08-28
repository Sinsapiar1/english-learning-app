import React, { useState, useCallback, memo } from "react";

interface Question {
  id: string | number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  isError?: boolean;
  instruction?: string;
  topic?: string;
  level?: string;
  xpReward?: number;
}

interface MultipleChoiceProps {
  question: Question;
  onAnswer: (correct: boolean, xpEarned: number) => void;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = memo(({
  question,
  onAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null || question.isError) return;

    const isCorrect = selectedAnswer === question.correctAnswer;
    const xpEarned = isCorrect ? 10 : 3; // 10 XP por correcta, 3 por intento

    setShowResult(true);
    setAnswered(true);

    // NO MÁS TIMEOUT AUTOMÁTICO - Solo avanza con botón manual
  }, [selectedAnswer, question.isError, question.correctAnswer]);

  const handleNext = useCallback(() => {
    const isCorrect = selectedAnswer === question.correctAnswer;
    const xpEarned = isCorrect ? (question.xpReward || 10) : 3; // XP del ejercicio o default
    onAnswer(isCorrect, xpEarned);
  }, [selectedAnswer, question.correctAnswer, question.xpReward, onAnswer]);

  // Si es un error, mostrar estado de carga
  if (question.isError) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">{question.question}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
      {/* Pregunta */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {question.question}
        </h3>
        {question.instruction && (
          <p className="text-sm text-gray-500 mb-2">{question.instruction}</p>
        )}
      </div>

      {/* Opciones */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          let buttonClass =
            "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ";

          if (!answered) {
            buttonClass +=
              selectedAnswer === index
                ? "border-blue-500 bg-blue-50 text-blue-800"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
          } else {
            if (index === question.correctAnswer) {
              buttonClass += "border-green-500 bg-green-50 text-green-800";
            } else if (
              index === selectedAnswer &&
              selectedAnswer !== question.correctAnswer
            ) {
              buttonClass += "border-red-500 bg-red-50 text-red-800";
            } else {
              buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
            }
          }

          return (
            <button
              key={index}
              onClick={() => !answered && setSelectedAnswer(index)}
              className={buttonClass}
              disabled={answered}
            >
              <span className="font-medium">
                {String.fromCharCode(65 + index)}) {option}
              </span>
              {answered && index === question.correctAnswer && (
                <span className="float-right text-green-600">✓</span>
              )}
              {answered &&
                index === selectedAnswer &&
                selectedAnswer !== question.correctAnswer && (
                  <span className="float-right text-red-600">✗</span>
                )}
            </button>
          );
        })}
      </div>

      {/* Resultado y Explicación */}
      {showResult && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            selectedAnswer === question.correctAnswer
              ? "bg-green-100 border border-green-300"
              : "bg-red-100 border border-red-300"
          }`}
        >
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">
              {selectedAnswer === question.correctAnswer ? "🎉" : "❌"}
            </span>
            <span
              className={`font-semibold ${
                selectedAnswer === question.correctAnswer
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {selectedAnswer === question.correctAnswer
                ? "¡Correcto! +10 XP"
                : "Incorrecto, pero +3 XP por intentar"}
            </span>
          </div>
          {question.explanation && (
            <p className="text-gray-700 text-sm">
              💡 <strong>Explicación:</strong> {question.explanation}
            </p>
          )}
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-center">
        {!answered ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Enviar Respuesta
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
          >
            Siguiente Pregunta →
          </button>
        )}
      </div>
    </div>
  );
});

MultipleChoice.displayName = 'MultipleChoice';

export default MultipleChoice;
