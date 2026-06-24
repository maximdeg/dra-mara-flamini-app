// Registers jest-dom matchers (toBeInTheDocument, toBeDisabled, …) on Vitest's
// expect. Loaded for every test; it only augments expect, so node-environment
// domain tests are unaffected. React Testing Library auto-cleans between tests
// because `globals` is enabled.
import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/dom";

// findBy*/waitFor default to a 1000ms timeout. Vitest runs the node "lib"
// project alongside the jsdom "ui" project, so under suite load a jsdom worker
// can be starved past that window and flake an otherwise-correct async
// assertion. Give the async utilities more headroom so suite load — not
// component behavior — never decides the result.
configure({ asyncUtilTimeout: 5000 });
