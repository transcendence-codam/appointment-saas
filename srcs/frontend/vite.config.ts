import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    // Vite forward all /api/* routes directly to backend container
    proxy: {
      '/api': { target: 'http://backend:3001' },
    },
  },
});
