import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import pagesPlugin from "./infrastructure/vite-plugin-pages.js";

export default defineConfig({
  plugins: [
    pagesPlugin(),
    react()
  ]
});