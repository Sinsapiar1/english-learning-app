export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800">English Master V3</h2>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}