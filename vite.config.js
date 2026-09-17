import {
  defineConfig
} from "vite";

import react from "@vitejs/plugin-react";

import path from "node:path";
import {
  fileURLToPath
} from "node:url";

import pagesPlugin from "./infrastructure/build/vite-plugin-pages.js";


const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


export default defineConfig({
  plugins: [
    pagesPlugin(),
    react()
  ],

  resolve: {
    alias: {
      "#":
          path.resolve(__dirname, "./infrastructure"),

      "@":
          path.resolve(__dirname, "./pages")
    }
  },

  build: {
    manifest: true
  }
});