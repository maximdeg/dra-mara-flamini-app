import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Domain modules and seams live under lib/ and are tested through their
// interfaces. Tests run in a node environment with no database — the
// in-memory repository fake stands in at the repository seam.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
