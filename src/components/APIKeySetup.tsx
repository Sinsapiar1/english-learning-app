import React, { useState } from "react";

interface APIKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string | null;
}

const APIKeySetup: React.FC<APIKeySetupProps> = ({
  onApiKeySet,
  currentApiKey = null,
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey || "");
  const [step, setStep] = useState(currentApiKey ? "ready" : "intro");
  const [isValidating, setIsValidating] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const validateApiKey = async (key: string) => {
    setIsValidating(true);

    // Simular validación de API key
    setTimeout(() => {
      if (key.startsWith("AIza") || key.length > 20) {
        setStep("success");
        onApiKeySet(key);
      } else {
        setStep("error");
      }
      setIsValidating(false);
    }, 2000);
  };

  const handleSubmit = () => {
    if (apiKey.trim()) {
      setStep("validating");
      validateApiKey(apiKey.trim());
    }
  };

  if (step === "ready" && currentApiKey) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800">
              IA Personalizada Activa ✨
            </h3>
            <p className="text-green-700 text-sm">
              Tu asistente de inglés con IA está listo para crear lecciones
              personalizadas
            </p>
          </div>
          <button
            onClick={() => setStep("intro")}
            className="text-green-600 hover:text-green-800 text-sm underline"
          >
            Cambiar API
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Paso 1: Introducción */}
      {step === "intro" && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6 text-white text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-2">
              Desbloquea tu IA Personal
            </h2>
            <p className="text-blue-100">
              Conecta tu Google AI Studio para lecciones infinitas y
              personalizadas
            </p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Ve a Google AI Studio
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Es gratis y solo toma 30 segundos
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    Abrir Google AI Studio →
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Crea tu API Key
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Click en "Create API Key" → Copia la clave que aparece
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Pégala aquí ⬇️
                  </h4>
                  <p className="text-gray-600 text-sm">
                    ¡Y listo! Tu IA personal estará configurada
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setStep("input")}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Ya tengo mi API Key →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paso 2: Input de API Key */}
      {step === "input" && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔑</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Conecta tu IA Personal
            </h2>
            <p className="text-gray-600">
              Pega tu API key de Google AI Studio aquí
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google AI Studio API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && apiKey.trim() && handleSubmit()
                  }
                  placeholder="AIzaSyD...tu-api-key-aquí"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors pr-12"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tu API key se guarda localmente en tu navegador. Es 100% privada
                y segura.
              </p>
            </div>

            <button
              onClick={() => apiKey.trim() && handleSubmit()}
              disabled={!apiKey.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Conectar mi IA Personal ✨
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setStep("intro")}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              ← Volver a las instrucciones
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Validando */}
      {step === "validating" && (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin text-6xl mb-6">🤖</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Conectando con tu IA...
          </h2>
          <p className="text-gray-600 mb-6">
            Validando tu API key y configurando tu asistente personal
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
      )}

      {/* Paso 4: Éxito */}
      {step === "success" && (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            ¡Perfecto! IA Conectada
          </h2>
          <p className="text-gray-600 mb-6">
            Tu asistente personal de inglés está listo. Ahora tendrás:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-2xl mb-2">∞</div>
              <p className="text-sm font-medium text-green-800">
                Lecciones Infinitas
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-sm font-medium text-blue-800">
                Súper Personalizadas
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="text-2xl mb-2">🧠</div>
              <p className="text-sm font-medium text-purple-800">
                Aprende de tus Errores
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm font-medium text-orange-800">
                Feedback Instantáneo
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep("ready")}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-[1.02]"
          >
            ¡Empezar a Aprender! 🚀
          </button>
        </div>
      )}

      {/* Paso 5: Error */}
      {step === "error" && (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-6">😕</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">
            Oops! API Key Inválida
          </h2>
          <p className="text-gray-600 mb-6">
            Parece que hay un problema con tu API key. Vamos a intentarlo de
            nuevo.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
            <h4 className="font-semibold text-red-800 mb-2">Verifica que:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>✓ Tu API key empiece con "AIza"</li>
              <li>✓ La copiaste completa (sin espacios extra)</li>
              <li>✓ La API key esté activa en Google AI Studio</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setStep("input")}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-200"
            >
              Intentar de Nuevo
            </button>
            <button
              onClick={() => setStep("intro")}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Ver Instrucciones Otra Vez
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIKeySetup;
