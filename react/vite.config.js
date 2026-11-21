import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" keeps asset paths relative so the build deploys cleanly to
// GitHub Pages subpaths as well as Vercel root domains.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
});
