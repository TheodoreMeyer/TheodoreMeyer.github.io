import {
  defineConfig
} from "vite";

import react from "@vitejs/plugin-react";

import path from "node:path";
import fs from "node:fs";
import {
  fileURLToPath
} from "node:url";

import pagesPlugin from "./infrastructure/build/vite-plugin-pages.js";


const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

function missingStaticFilesPlugin() {
  return {
    name: "missing-static-files",

    configureServer(server) {
      const staticDirectory =
          path.resolve(__dirname, "static");

      server.middlewares.use((request, response, next) => {
        let pathname;

        try {
          pathname = decodeURIComponent(
              new URL(request.url, "http://localhost").pathname
          );
        } catch {
          response.statusCode = 400;
          response.end("Bad request");
          return;
        }

        if (pathname.startsWith('/@') || pathname.startsWith('/node_modules/.vite/')) {
          return next();
        }

        const base = server.config.base;
        if (base !== "/" && pathname.startsWith(base)) {
          pathname = `/${pathname.slice(base.length)}`;
        }

        const relativePath = pathname.replace(/^\/+/, "");
        const requestedFile = path.resolve(staticDirectory, relativePath);
        const existingProjectFile = path.resolve(__dirname, relativePath);
        const insideStaticDirectory =
            requestedFile.startsWith(`${staticDirectory}${path.sep}`);
        const fileLikeUrl =
            Boolean(path.extname(relativePath)) ||
            !pathname.endsWith("/");
        const isFile = filePath => {
          try {
            return fs.statSync(filePath).isFile();
          } catch {
            return false;
          }
        };

        // Existing files are served by publicDir. Missing file-like URLs must
        // not fall through to Vite's SPA HTML fallback.
        if (
          insideStaticDirectory &&
          fileLikeUrl &&
          !isFile(requestedFile) &&
          !isFile(existingProjectFile)
        ) {
          response.statusCode = 404;
          response.end("Not found");
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  // Vite serves these files directly in development and copies them unchanged
  // to the root of the production output.
  publicDir: "static",

  plugins: [
    missingStaticFilesPlugin(),
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
