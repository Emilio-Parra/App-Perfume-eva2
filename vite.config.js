import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // El backend ahora usa rutas versionadas (/api/v1/...).
        // Mientras actualizamos los services, redirigimos /api/... -> /api/v1/...
        // (también sirve para las imágenes antiguas guardadas como /api/productos/imagen/...).
        rewrite: (path) => path.replace(/^\/api(?!\/v1)/, '/api/v1'),
      },
    },
  },
})
