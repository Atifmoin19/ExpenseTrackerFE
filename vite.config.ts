import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: false, // registered manually in main.tsx via virtual:pwa-register
      registerType: 'autoUpdate',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,webmanifest}'],
      },
      devOptions: {
        enabled: false,
        type: 'module',
      },
      manifest: {
        name: 'All Square: split trip expenses',
        short_name: 'All Square',
        description: 'Split group trip expenses four ways, see who owes whom, and settle up. Works offline.',
        theme_color: '#0E7C74',
        background_color: '#F7F8F8',
        display: 'standalone',
        start_url: '/app',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  build: {
    outDir: './build',
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ['recharts'],
          vendor: ['react', 'react-dom', 'react-redux', 'react-router-dom', '@reduxjs/toolkit'],
        },
      },
    },
  },
  server: {
    watch: { usePolling: true },
  },
})
