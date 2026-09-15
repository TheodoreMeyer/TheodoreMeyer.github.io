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

function getPagePath(filePath) {
    const relative = path.relative(
        pagesDirectory,
        filePath
    );

    const parsed = path.parse(relative);

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

    const result = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeStringify)
        .process(content);

    return {
        metadata: data,
        html: String(result)
    };
}

export default function pagesPlugin() {
    return {
        name: "theodore-pages",

        async transform(code, id) {
            const filePath =
                id.split("?")[0];

            if (!filePath.endsWith(".md")) {
                return null;
            }

            const {
                metadata,
                html
            } = await compileMarkdown(code);

            const pagePath =
                getPagePath(filePath);

            return {
                code: `
import React from "react";
import Page from "/infrastructure/build/Page.js";

const metadata = ${JSON.stringify(metadata)};

const page = new Page({
    title: metadata.title ?? "",
    description: metadata.description ?? "",
    metadata,

    component: function MarkdownPage() {
        return React.createElement(
            "div",
            {
                className: "markdown",
                dangerouslySetInnerHTML: {
                    __html: ${JSON.stringify(html)}
                }
            }
        );
    }
});

page.path = ${JSON.stringify(pagePath)};

export default page;
                `,

                map: null
            };
        }
    };
}