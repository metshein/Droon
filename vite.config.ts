import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Suhteline base, et sait töötaks GitHub Pagesis mis tahes repo nime all.
export default defineConfig({
  base: './',
  plugins: [react()],
});
