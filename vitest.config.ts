import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Two test projects, sharing the root resolve/esbuild config:
//   - "lib": domain modules and seams under lib/, tested through their
//     interfaces in a node environment (the in-memory repository fake stands in
//     at the repository seam).
//   - "ui": presentation primitives under components/, tested in jsdom through
//     React Testing Library — external behavior only, never CSS class names.
// The "ui" project is the reference pattern for future UI tests.
export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "lib",
          environment: "node",
          include: ["lib/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "ui",
          environment: "jsdom",
          globals: true,
          include: ["components/**/*.test.tsx"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
});
