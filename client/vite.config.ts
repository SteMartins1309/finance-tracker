import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Permite usar "@/..." em vez de caminhos relativos longos
    },
  },
  build: {
    outDir: "dist", // Saída do build
  },
});
