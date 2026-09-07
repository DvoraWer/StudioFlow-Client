import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The client calls the API with same-origin relative paths ("/api/..."). In dev,
// Vite proxies them to the ASP.NET Core API so no CORS configuration is needed on
// the backend (spec §46 — everything runs locally).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5235',
        changeOrigin: true
      }
    }
  }
});
