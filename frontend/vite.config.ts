import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Production build optimizations
  build: {
    // Output directory
    outDir: 'dist',

    // Minification
    minify: 'esbuild',

    // Source maps (disabled for production)
    sourcemap: false,

    // Target browsers
    target: 'es2015',

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // React and React-DOM in separate chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // D3 in separate chunk (large library)
          'd3-vendor': ['d3'],
        },
      },
    },

    // Asset handling
    assetsInlineLimit: 4096, // 4kb - inline small assets as base64
  },

  // Server configuration for development
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
  },
})
