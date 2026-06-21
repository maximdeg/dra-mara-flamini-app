// Registers jest-dom matchers (toBeInTheDocument, toBeDisabled, …) on Vitest's
// expect. Loaded for every test; it only augments expect, so node-environment
// domain tests are unaffected. React Testing Library auto-cleans between tests
// because `globals` is enabled.
import "@testing-library/jest-dom/vitest";
