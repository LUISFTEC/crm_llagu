import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  // 🔥 AQUÍ ES EL TRUCO: esbuild va AFUERA del bloque 'build'
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },

  build: {
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
  },
}))