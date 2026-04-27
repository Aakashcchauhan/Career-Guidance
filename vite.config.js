import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'GEMINI_', 'OPENAI_'],
  plugins:  [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth'],
          icons: ['lucide-react', 'react-icons'],
        },
      },
    },
  },
})
