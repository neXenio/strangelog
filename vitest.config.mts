import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/specs/**/*.spec.ts'],
    exclude: [...configDefaults.exclude, '.claude/**', 'tmpTest/**'],
    // Specs share tmpTest/ and some call process.chdir(), which needs child processes and must not
    // run concurrently
    pool: 'forks',
    fileParallelism: false
  }
});
