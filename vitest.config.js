import { defineConfig } from 'vitest/config';

// Standalone Vitest config (takes precedence over vite.config.js) so the data-only
// unit tests run in a plain Node environment without loading the app's React/PWA plugins.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
