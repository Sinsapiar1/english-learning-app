import { useState } from 'react'
import toast from 'react-hot-toast'

interface APIKeySetupProps {
  onComplete: (apiKey: string) => void
}

export function APIKeySetup({ onComplete }: APIKeySetupProps) {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!apiKey.trim()) {
      toast.error('Ingresa tu API Key')
      return
    }

    if (!apiKey.startsWith('AIza')) {
      toast.error('API Key inválida')
      return
    }

    setLoading(true)
    
    try {
      // Test básico de la API key
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey)
      
      if (response.ok) {
        onComplete(apiKey)
        toast.success('API Key configurada correctamente')
      } else {
        toast.error('API Key inválida o sin permisos')
      }
    } catch (error) {
      toast.error('Error validando API Key')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">🔑</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Configura tu API Key
          </h2>
          <p className="text-gray-600">
            Necesitas tu Google AI Studio API Key para generar ejercicios únicos
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">Cómo obtener tu API Key:</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Ve a <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline">Google AI Studio</a></li>
            <li>2. Crea una nueva API Key</li>
            <li>3. Copia y pega aquí</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google AI Studio API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="AIzaSy..."
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !apiKey.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Configurar API Key'}
          </button>
        </form>

        <div className="mt-6 bg-green-50 rounded-xl p-4">
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">🔒 Tu API Key es segura</p>
            <p>Se almacena solo en tu dispositivo y se usa únicamente para generar tus ejercicios.</p>
          </div>
        </div>
      </div>
    </div>
  )
}