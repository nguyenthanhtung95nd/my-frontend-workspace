import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer'; // optional, gated by env below

// Performance-oriented Vite config for React. Clone and adapt.
//
// React Compiler note:
//  - The compiler runs as a Babel plugin, so use @vitejs/plugin-react (Babel), NOT plugin-react-swc.
//  - Start in 'opt-in' mode; expand once you have fixed Rules-of-React violations and captured a baseline.
//  - If you are NOT adopting the compiler, prefer @vitejs/plugin-react-swc for faster builds instead.
const ANALYZE = process.env.ANALYZE === '1';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // Auto-memoization. Remove most manual useMemo/useCallback/memo once this is on.
          ['babel-plugin-react-compiler', { compilationMode: 'opt-in' }],
        ],
      },
    }),
    // ...(ANALYZE ? [visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true })] : []),
  ],
  build: {
    // Content-hashed, cacheable output. Hashed assets can be cached immutable for a year.
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
        // Split stable vendor code so it caches independently of app code.
        manualChunks: { react: ['react', 'react-dom'] },
      },
    },
    // Fail the build if a chunk blows the budget (tune to your baseline).
    chunkSizeWarningLimit: 500,
    sourcemap: true, // keep for bundle analysis; strip from public hosting if needed
  },
});
