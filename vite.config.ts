import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`
    : "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@tensorflow/tfjs-core")) return "tfjs-core";
          if (id.includes("@tensorflow/tfjs-backend-webgl")) return "tfjs-webgl";
          if (id.includes("@tensorflow/tfjs-backend-cpu")) return "tfjs-cpu";
          if (id.includes("@tensorflow/tfjs-converter")) return "tfjs-converter";
          if (id.includes("@tensorflow/tfjs-layers")) return "tfjs-layers";
          if (id.includes("@tensorflow/tfjs-data")) return "tfjs-data";
          if (id.includes("@tensorflow/tfjs")) return "tensorflow";
          if (id.includes("@teachablemachine")) return "teachablemachine";
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
