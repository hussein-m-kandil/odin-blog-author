import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    root: './src',
    setupFiles: ['./src/test-setup.ts'],
    environment: 'jsdom',
    globals: true,
  },
});
