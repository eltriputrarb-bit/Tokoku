import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // 1. Matikan sourcemap agar kode asli .jsx tidak bisa diintip di DevTools
    sourcemap: false,
    // 2. Kompresi & acak (mangle) seluruh nama variabel dan fungsi
    minify: 'esbuild',
    // 3. Batas ukuran chunk
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    // 4. Hapus semua console.log otomatis saat build produksi agar tidak bocor info internal
    drop: ['console', 'debugger'],
  },
})
