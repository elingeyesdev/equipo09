import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Requiere el backend Nest en http://localhost:3000 (p. ej. `cd backend && npm run start:dev`).
      // Si ves 502 en el navegador, el proxy no puede conectar a ese puerto.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
