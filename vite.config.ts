import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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