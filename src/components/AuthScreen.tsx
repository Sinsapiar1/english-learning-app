import { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import toast from 'react-hot-toast'

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const googleProvider = new GoogleAuthProvider()

  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      await signInWithPopup(auth, googleProvider)
      toast.success('¡Bienvenido!')
    } catch (error) {
      toast.error('Error con Google')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Completa todos los campos')
      return
    }

    try {
      setLoading(true)
      
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      
      toast.success(isLogin ? '¡Sesión iniciada!' : '¡Cuenta creada!')
      
    } catch (error: any) {
      toast.error('Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">EM</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            English Master V3
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
          </p>
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 mb-6"
        >
          <span>🔍</span>
          <span>Continuar con Google</span>
        </button>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">o</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="tu@email.com"
            disabled={loading}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold"
          >
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 font-medium"
            disabled={loading}
          >
            {isLogin ? 'Crear cuenta nueva' : 'Ya tengo cuenta'}
          </button>
        </div>
      </div>
    </div>
  )
}