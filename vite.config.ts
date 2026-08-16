import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Sotto is currently deployed as a GitHub Pages project site at /Sotto/.
  // Keeping this explicit prevents asset URLs from breaking in production.
  base: '/Sotto/',
  plugins: [react()],
  build: {
    target: 'es2022',
    cssMinify: 'lightningcss',
    sourcemap: false,
  },
});
