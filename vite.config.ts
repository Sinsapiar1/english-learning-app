import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  define: {
    // Expose env variables to client
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    // Optimize bundle
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],
          'ai': ['@google/generative-ai'],
          'ui': ['framer-motion', 'lucide-react', 'react-hot-toast'],
          'charts': ['recharts'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging
    sourcemap: true,
    // Target modern browsers
    target: 'esnext',
  },
  server: {
    port: 3000,
    open: true,
    host: true, // Allow external connections
  },
  preview: {
    port: 4173,
    host: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth', 
      'firebase/firestore',
      'firebase/analytics',
      '@google/generative-ai',
      'framer-motion',
      'lucide-react',
      'react-hot-toast',
      'recharts',
    ],
  },
  // Environment variables
  envPrefix: 'VITE_',
})