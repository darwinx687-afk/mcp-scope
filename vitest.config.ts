import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node"
  },
  resolve: {
    alias: {
      "@mcp-scope/core": fileURLToPath(new URL("./packages/core/src/index.ts", import.meta.url)),
      "@mcp-scope/report": fileURLToPath(new URL("./packages/report/src/index.ts", import.meta.url))
    }
  }
});
