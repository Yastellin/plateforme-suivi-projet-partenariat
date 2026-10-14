import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "cn": path.resolve(import.meta.dirname, "./src/lib/utils.ts"),
    },
  },
  server: {
    host: true,
    // Prévisualisation sandbox (hôtes *.e2b.app) — ne concerne que le serveur de dev.
    allowedHosts: [".e2b.app"],
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
})