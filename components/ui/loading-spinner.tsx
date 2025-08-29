/**
 * LOADING SPINNER - ENGLISH MASTER V3
 */

'use client'

import { motion } from 'framer-motion'

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">English Master V3</h2>
        <p className="text-gray-600">Cargando tu experiencia personalizada...</p>
      </motion.div>
    </div>
  )
}