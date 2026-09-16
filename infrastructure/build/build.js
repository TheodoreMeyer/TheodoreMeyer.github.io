import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "vite";
import pagesPlugin from "./vite-plugin-pages.js";

const root =
    path.resolve(
        path.dirname(
            fileURLToPath(import.meta.url)
        ),
        "../.."
    );

const distDirectory =
    path.join(root, "dist");

const ssrOutputDirectory =
    path.join(root, ".vite-ssr");

function outputDirectory(pagePath) {
    if (pagePath === "/") {
        return distDirectory;
    }

    return path.join(
        distDirectory,
        pagePath.replace(/^\/|\/$/g, "")
    );
}

function pageFile(pagePath) {
    return path.join(
        outputDirectory(pagePath),
        "index.html"
    );
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function createDocument({
                            page,
                            content,
                            assets
                        }) {
    const title =
        escapeHtml(
            page.title || "Theodore Meyer"
        );

    const description =
        escapeHtml(
            page.description || ""
        );

    const stylesheet =
        assets.css
            .map(asset =>
                `<link rel="stylesheet" href="/${asset}">`
            )
            .join("\n");

    const scripts =
        assets.js
            .map(asset =>
                `<script type="module" src="/${asset}"></script>`
            )
            .join("\n");

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>${title}</title>

    ${
        description
            ? `<meta name="description" content="${description}">`
            : ""
    }

    ${stylesheet}
</head>

<body>
    <div id="root">${content}</div>

    ${scripts}
</body>
</html>
`;
}

async function getManifest() {
    const manifestPath =
        path.join(
            distDirectory,
            ".vite",
            "manifest.json"
        );

    const source =
        await fs.readFile(
            manifestPath,
            "utf8"
        );

    return JSON.parse(source);
}

function getAssets(manifest) {
    const js = [];
    const css = [];

    for (const entry of Object.values(manifest)) {
        if (entry.file?.endsWith(".js")) {
            js.push(entry.file);
        }

        if (entry.css) {
            css.push(...entry.css);
        }
    }

    return {
        js: [...new Set(js)],
        css: [...new Set(css)]
    };
}

async function buildSsr() {
    await build({
        root,

        plugins: [
            pagesPlugin()
        ],

        build: {
            ssr: path.join(
                root,
                "infrastructure",
                "build",
                "ssr-entry.jsx"
            ),

            outDir: ssrOutputDirectory,

            emptyOutDir: true,

            rollupOptions: {
                output: {
                    entryFileNames: "ssr-entry.js"
                }
            }
        }
    });
}

async function renderPages() {
    const manifest =
        await getManifest();

    const assets =
        getAssets(manifest);

    const ssrModule =
        await import(
            path.join(
                ssrOutputDirectory,
                "ssr-entry.js"
            )
            );

    const pages =
        ssrModule.getPages();

    console.log(
        `Rendering ${pages.length} pages...`
    );

    for (const page of pages) {
        const content =
            ssrModule.renderPage(page);

        const html =
            createDocument({
                page,
                content,
                assets
            });

        const output =
            pageFile(page.path);

        await fs.mkdir(
            path.dirname(output),
            {
                recursive: true
            }
        );

        await fs.writeFile(
            output,
            html,
            "utf8"
        );

        console.log(
            `  ${page.path}`
        );
    }
}

async function main() {
    console.log("");
    console.log("Building static site...");
    console.log("");

    await fs.rm(
        ssrOutputDirectory,
        {
            recursive: true,
            force: true
        }
    );

    // Normal Vite client build.
    await build();

    // Build the SSR renderer.
    await buildSsr();

    // Render every Page.
    await renderPages();

    // SSR output is only temporary.
    await fs.rm(
        ssrOutputDirectory,
        {
            recursive: true,
            force: true
        }
    );

    console.log("");
    console.log("Static build complete.");
    console.log("");
}

main().catch(error => {
    console.error("");
    console.error("Build failed.");
    console.error("");
    console.error(error);

    process.exit(1);
});