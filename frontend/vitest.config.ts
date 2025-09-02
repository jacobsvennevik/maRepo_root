import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['tests/msw/setup.ts'],
    environment: 'jsdom',
  },
});


