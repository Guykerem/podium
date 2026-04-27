import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["tests/web/api/_helpers/setup.ts"],
    testTimeout: 15000,
    // The api integration tests share a single Neon DB and call resetDb()
    // in beforeEach. Parallel files would stomp each other's rows. Run
    // test files sequentially; tests within a file already run in order.
    fileParallelism: false,
  },
});
