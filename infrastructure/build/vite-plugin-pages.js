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

function createPageModule({
                              metadata,
                              html,
                              pagePath,
                              className
                          }) {
    return `
import React from "react";
import Page from "/infrastructure/build/Page.js";

const metadata = ${JSON.stringify(metadata)};

const page = new Page({
    title: metadata.title ?? "",
    description: metadata.description ?? "",
    metadata,

    component: function StaticPage() {
        return React.createElement(
            "div",
            {
                className: ${JSON.stringify(className)},
                dangerouslySetInnerHTML: {
                    __html: ${JSON.stringify(html)}
                }
            }
        );
    }
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
                code: createPageModule({
                    metadata: {},
                    html: source,
                    pagePath:
                        getPagePath(filePath),
                    className: "html-page"
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
                code: createPageModule({
                    metadata,
                    html,
                    pagePath:
                        getPagePath(filePath),
                    className: "markdown"
                }),

                map: null
            };
        }
    };
}