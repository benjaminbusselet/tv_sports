import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/tv_sports/", // Nom du repository GitHub pour Pages
  publicDir: "public", // Copie tout le contenu de public/ vers dist/
});
