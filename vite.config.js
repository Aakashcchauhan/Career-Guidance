import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'GEMINI_'],
  plugins:  [
    tailwindcss(),
  ],
})
