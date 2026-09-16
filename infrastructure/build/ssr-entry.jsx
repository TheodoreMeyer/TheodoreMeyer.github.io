import React from "react";

import {
    renderToStaticMarkup
} from "react-dom/server";

import {
    StaticRouter
} from "react-router-dom";

import PageLayout from "./PageLayout.jsx";
import {
    discoverPages
} from "./pages.js";

const modules = {
    ...import.meta.glob(
        [
            "/pages/**/*.jsx",
            "/pages/**/*.md"
        ],
        {
            eager: true
        }
    ),

    ...import.meta.glob(
        "/pages/**/*.html",
        {
            eager: true,
            query: "?theodore-page"
        }
    )
};

const pages =
    discoverPages(modules);

export function getPages() {
    return pages;
}

export function renderPage(page) {
    const Component =
        page.component;

    return renderToStaticMarkup(
        <StaticRouter location={page.path}>
            <PageLayout page={page}>
                <Component />
            </PageLayout>
        </StaticRouter>
    );
}