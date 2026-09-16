import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import {
    unified
} from "unified";

import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const pagesDirectory =
    path.resolve("pages");

function isInsidePages(filePath) {
    const relative =
        path.relative(
            pagesDirectory,
            filePath
        );

    return (
        relative &&
        !relative.startsWith("..") &&
        !path.isAbsolute(relative)
    );
}

function getPagePath(filePath) {
    const relative =
        path.relative(
            pagesDirectory,
            filePath
        );

    const parsed =
        path.parse(relative);

    if (
        parsed.name === "index" &&
        parsed.dir === ""
    ) {
        return "/";
    }

    if (parsed.name === "index") {
        return `/${parsed.dir
            .split(path.sep)
            .join("/")}/`;
    }

    return `/${path
        .join(parsed.dir, parsed.name)
        .split(path.sep)
        .join("/")}/`;
}

async function compileMarkdown(source) {
    const {
        data,
        content
    } = matter(source);

    const result =
        await unified()
            .use(remarkParse)
            .use(remarkRehype)
            .use(rehypeStringify)
            .process(content);

    return {
        metadata: data,
        html: String(result)
    };
}

function createHtmlPageModule({
                                  metadata,
                                  html,
                                  pagePath
                              }) {
    return `
import Page from "/infrastructure/build/Page.js";

const page = Page.fromHtml({
    title: ${JSON.stringify(metadata.title ?? "")},
    description: ${JSON.stringify(metadata.description ?? "")},
    metadata: ${JSON.stringify(metadata)},
    theme: ${JSON.stringify(metadata.theme ?? null)},
    html: ${JSON.stringify(html)}
});

page.path = ${JSON.stringify(pagePath)};

export default page;
`;
}

function createMarkdownPageModule({
                                      metadata,
                                      html,
                                      pagePath
                                  }) {
    return `
import Page from "/infrastructure/build/Page.js";

const page = Page.fromMarkdown({
    title: ${JSON.stringify(metadata.title ?? "")},
    description: ${JSON.stringify(metadata.description ?? "")},
    metadata: ${JSON.stringify(metadata)},
    theme: ${JSON.stringify(metadata.theme ?? null)},
    html: ${JSON.stringify(html)}
});

page.path = ${JSON.stringify(pagePath)};

export default page;
`;
}

export default function pagesPlugin() {
    return {
        name: "theodore-pages",

        async load(id) {
            const filePath =
                id.split("?")[0];

            if (
                !filePath.endsWith(".html") ||
                !isInsidePages(filePath)
            ) {
                return null;
            }

            const source =
                await fs.readFile(
                    filePath,
                    "utf8"
                );

            return {
                code: createHtmlPageModule({
                    metadata: {},
                    html: source,
                    pagePath:
                        getPagePath(filePath)
                }),

                map: null
            };
        },

        async transform(code, id) {
            const filePath =
                id.split("?")[0];

            if (
                !filePath.endsWith(".md") ||
                !isInsidePages(filePath)
            ) {
                return null;
            }

            const {
                metadata,
                html
            } = await compileMarkdown(code);

            return {
                code: createMarkdownPageModule({
                    metadata,
                    html,
                    pagePath:
                        getPagePath(filePath)
                }),

                map: null
            };
        }
    };
}