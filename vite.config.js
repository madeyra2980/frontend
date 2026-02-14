import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/auth': { target: 'https://backend-2-jbcd.onrender.com', changeOrigin: true },
      '/profile': { target: 'https://backend-2-jbcd.onrender.com', changeOrigin: true },
      '/orders': { target: 'https://backend-2-jbcd.onrender.com', changeOrigin: true },
      '/organizations': { target: 'https://backend-2-jbcd.onrender.com', changeOrigin: true },
      '/cities': { target: 'https://backend-2-jbcd.onrender.com', changeOrigin: true },
      '/specialties': { target: 'https://backend-2-jbcd.onrender.com', changeOrigin: true },
      '/uploads': { target: 'https://backend-2-jbcd.onrender.com', changeOrigin: true },
    },
  },
});
