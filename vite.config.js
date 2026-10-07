import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' is REQUIRED so the built app loads over file:// inside Electron.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Allow sandboxed/cloud preview proxies (subdomain suffix match).
    allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Vendor chunking: three.js / charts / motion load in parallel.
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
});
