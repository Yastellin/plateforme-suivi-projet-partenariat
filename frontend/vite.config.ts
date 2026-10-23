import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const cibleProxyApi =
    process.env.DEV_API_PROXY_TARGET ??
    env.DEV_API_PROXY_TARGET ??
    "http://localhost:3000";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
        cn: path.resolve(import.meta.dirname, "./src/lib/utils.ts"),
      },
    },
    server: {
      host: true,
      proxy: {
        "/api": {
          target: cibleProxyApi,
          changeOrigin: true,
        },
        "/uploads": {
          target: cibleProxyApi,
          changeOrigin: true,
        },
      },
      // Prévisualisation sandbox (hôtes *.e2b.app) — ne concerne que le serveur de dev.
      allowedHosts: [".e2b.app"],
      watch: {
        usePolling: true,
        interval: 300,
      },
    },
  };
});
