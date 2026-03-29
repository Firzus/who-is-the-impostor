import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import glsl from "vite-plugin-glsl";
import path from "node:path";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "app"),
    },
  },
  plugins: [
    tanstackStart({
      srcDirectory: "app",
      router: {
        routesDirectory: "routes",
        generatedRouteTree: "routeTree.gen.ts",
      },
    }),
    react(),
    tailwindcss(),
    glsl(),
  ],
});
