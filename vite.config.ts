import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: "./src/test/setup.ts",
    restoreMocks: true,
  },
  server: {
    proxy: {
      "/posts": "http://localhost:3000",
      "/auth": "http://localhost:3000",
      "/users": "http://localhost:3000",
      "/comments": "http://localhost:3000",
      "/uploads": "http://localhost:3000",
    },
  },
});
