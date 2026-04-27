import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["tests/web/api/_helpers/setup.ts"],
    testTimeout: 15000,
  },
});
