/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const koren = path.dirname(fileURLToPath(import.meta.url));

// Ktorý tréning sa zabalí do buildu. Predvolene verejné demo (src/data/demo).
// Klientsky tréning: TRENING_DIR=treningy_klientov/<firma> (pozri docs/NASADENIE.md).
const treningDir = process.env.TRENING_DIR
  ? path.resolve(process.cwd(), process.env.TRENING_DIR)
  : path.resolve(koren, 'src/data/demo');

const vystupDir = process.env.VYSTUP_DIR ? path.resolve(process.cwd(), process.env.VYSTUP_DIR) : 'dist';

export default defineConfig({
  plugins: [react()],
  // Relatívne cesty: build funguje aj z podpriečinka na statickom hostingu.
  base: './',
  resolve: {
    alias: {
      '@trening': treningDir,
    },
  },
  build: {
    outDir: vystupDir,
    emptyOutDir: true,
  },
  server: {
    port: 5177,
    strictPort: false,
  },
  preview: {
    port: 4177,
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
