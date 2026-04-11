import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/tests/unit.setup.ts"],
    include: ["./src/tests/**/*.unit.test.ts"]
  }
});
