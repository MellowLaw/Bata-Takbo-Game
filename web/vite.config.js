import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['all', 'proofs-bunkbed-dandelion.ngrok-free.dev', 'wpjgg-180-195-68-59.run.pinggy-free.link'],
    open: true,
    proxy: {
      '/auth': 'http://localhost:3001',
      '/admin': 'http://localhost:3001',
      '/leaderboard': 'http://localhost:3001'
    }
  },
});
