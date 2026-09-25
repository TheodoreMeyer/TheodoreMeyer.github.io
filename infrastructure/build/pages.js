import Page from "./Page.js";

export function getPagePath(file) {
    const normalized =
        file.replaceAll("\\", "/");

    const pagesIndex =
        normalized.indexOf("/pages/");

    const relative =
        normalized.substring(
            pagesIndex + "/pages/".length
        );

    const parts =
        relative.split("/");

    const filename =
        parts.pop();

    if (
        filename === "index.jsx" ||
        filename === "index.md" ||
        filename === "index.html"
    ) {
        if (parts.length === 0) {
            return "/";
        }

        return `/${parts.join("/")}/`;
    }

    const name =
        filename.replace(
            /\.(jsx|md|html)$/,
            ""
        );

    return `/${[
        ...parts,
        name
    ].join("/")}/`;
}

export function discoverPages(modules) {
    return Object.entries(modules)
        .map(([file, module]) => {
            const page =
                module.default;

            if (!(page instanceof Page)) {
                return null;
            }

            page.path =
                getPagePath(file);

            return page;
        })
        .filter(Boolean);
}