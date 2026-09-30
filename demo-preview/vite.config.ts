/**
 * DEMO PREVIEW ONLY - not part of the app bundle.
 *
 * Runs the real portal components from ../src with:
 *   - context/AppContext  -> mock/AppContext.tsx  (sample ledger, in-memory, no Firebase)
 *   - lib/aiOcr           -> mock/aiOcr.ts        (simulated scan progress + extraction)
 *
 * Everything else (components, styling, storage helpers) is the real code from this branch.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const here = import.meta.dirname;
const repoRoot = path.resolve(here, '..');

export default defineConfig({
  root: here,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^(\.\.?\/)+context\/AppContext$/, replacement: path.join(here, 'mock/AppContext.tsx') },
      { find: /^(\.\.?\/)+lib\/aiOcr$/, replacement: path.join(here, 'mock/aiOcr.ts') }
    ]
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: true,
    fs: { allow: [repoRoot] }
  }
});
