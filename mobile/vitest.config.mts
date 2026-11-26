import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// the pure script logic only (src/script/*.test.ts); screens are tried on a phone
export default defineConfig({
  resolve: {
    alias: {
      "@screenplay": fileURLToPath(new URL("../web-new/src/screenplay", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {include: ["src/**/*.test.ts"]},
});
