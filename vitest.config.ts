import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      // Unit tests run against a tiny Phaser stub (see test/stubs/phaser.ts) so
      // pure-logic modules can be imported without loading the real engine.
      phaser: fileURLToPath(new URL('./test/stubs/phaser.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['test/unit/**/*.test.ts'],
  },
});
