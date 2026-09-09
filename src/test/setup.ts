import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { installDialogPolyfill } from "./dialog.polyfill";
import { installIntersectionObserverMock } from "./intersectionObserver.mock";
import { installObjectUrlPolyfill } from "./objectUrl.polyfill";
import { server } from "./server";

// `error`: an uncovered request fails the test instead of hitting a real server.
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  installDialogPolyfill();
});

beforeEach(() => {
  installIntersectionObserverMock();
  installObjectUrlPolyfill();
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  window.localStorage.clear();
});

afterAll(() => {
  server.close();
});
