import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const pagesDirectory = path.resolve("pages");

function isInsidePages(filePath) {
    const relative = path.relative(
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

function processLiquidLinks(content, project) {
    return content.replace(
        /\{%\s*project_link\s+([^%]+?)\s*%\}/g,
        (_, target) => {
            if (!project) {
                throw new Error(
                    "project_link can only be used on a project page."
                );
            }

            const path = target.trim();

            if (
                path === "" ||
                path === "index"
            ) {
                return `/projects/${project}/`;
            }

            return `/projects/${project}/${path.replace(
                /^\/|\/$/g,
                ""
            )}/`;
        }
    );
}

function getProject(filePath) {
    const relative = path.relative(
        pagesDirectory,
        filePath
    );

    const parts = relative.split(path.sep);

    if (
        parts[0] !== "projects" ||
        !parts[1]
    ) {
        return null;
    }

    return parts[1];
}

function getDefaultTitle(filePath) {
    const name =
        path.parse(filePath).name;

    if (name === "index") {
        return "";
    }

    return name
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );
}

async function compileMarkdown(
    source,
    project
) {
    const {
        data,
        content
    } = matter(source);

    const processedContent =
        processLiquidLinks(
            content,
            project
        );

    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(processedContent);

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
    title: ${JSON.stringify(
        metadata.title ?? ""
    )},
    description: ${JSON.stringify(
        metadata.description ?? ""
    )},
    metadata: ${JSON.stringify(
        metadata
    )},
    theme: ${JSON.stringify(
        metadata.theme ?? null
    )},
    html: ${JSON.stringify(html)}
});

page.path = ${JSON.stringify(
        pagePath
    )};

export default page;
`;
}

function createMarkdownPageModule({
                                      metadata,
                                      html,
                                      pagePath,
                                      project,
                                      title
                                  }) {
    return `
import Page from "/infrastructure/build/Page.js";

const page = Page.fromMarkdown({
    title: ${JSON.stringify(
        title
    )},
    description: ${JSON.stringify(
        metadata.description ?? ""
    )},
    metadata: ${JSON.stringify(
        metadata
    )},
    theme: ${JSON.stringify(
        metadata.theme ?? "document"
    )},
    project: ${JSON.stringify(
        project
    )},
    html: ${JSON.stringify(html)}
});

page.path = ${JSON.stringify(
        pagePath
    )};

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
                !filePath.endsWith(
                    ".html"
                ) ||
                !isInsidePages(
                    filePath
                )
            ) {
                return null;
            }

            const source =
                await fs.readFile(
                    filePath,
                    "utf8"
                );

            return {
                code:
                    createHtmlPageModule({
                        metadata: {},
                        html: source,
                        pagePath:
                            getPagePath(
                                filePath
                            )
                    }),
                map: null
            };
        },

        async transform(code, id) {
            const filePath =
                id.split("?")[0];

            if (
                !filePath.endsWith(
                    ".md"
                ) ||
                !isInsidePages(
                    filePath
                )
            ) {
                return null;
            }

            const project =
                getProject(filePath);

            const {
                metadata,
                html
            } =
                await compileMarkdown(
                    code,
                    project
                );

            return {
                code:
                    createMarkdownPageModule({
                        metadata,
                        html,
                        pagePath:
                            getPagePath(
                                filePath
                            ),
                        project:
                            getProject(
                                filePath
                            ),
                        title:
                            metadata.title ??
                            getDefaultTitle(
                                filePath
                            )
                    }),
                map: null
            };
        }
    };
}