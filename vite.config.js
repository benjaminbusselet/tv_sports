import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? "/tv_sports/" : "/", // Base différente selon l'env
  publicDir: "public", // Copie tout le contenu de public/ vers dist/
});
