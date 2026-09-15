import React from "react";
import ReactDOM from "react-dom/client";

import {
    BrowserRouter
} from "react-router-dom";

import PageHandler from "../infrastructure/PageHandler.jsx";

import "../theme/base.css";

const modules = import.meta.glob(
    [
        "../pages/**/*.jsx",
        "../pages/**/*.md"
    ],
    {
        eager: true
    }
);

function getPagePath(file) {
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
        filename === "index.md"
    ) {
        if (parts.length === 0) {
            return "/";
        }

        return `/${parts.join("/")}/`;
    }

    const name =
        filename.replace(
            /\.(jsx|md)$/,
            ""
        );

    return `/${[
        ...parts,
        name
    ].join("/")}/`;
}

const pages = Object.entries(modules)
    .map(([file, module]) => {
        const page = module.default;

        if (!page) {
            return null;
        }

        page.path = getPagePath(file);

        return page;
    })
    .filter(Boolean);

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <BrowserRouter>
            <PageHandler pages={pages} />
        </BrowserRouter>
    </React.StrictMode>
);