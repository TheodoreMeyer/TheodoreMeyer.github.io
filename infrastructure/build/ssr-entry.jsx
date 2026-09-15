import React from "react";

import {
    renderToStaticMarkup
} from "react-dom/server";

import PageLayout from "./PageLayout.jsx";
import {
    discoverPages
} from "./pages.js";

const modules = import.meta.glob(
    [
        "../pages/**/*.jsx",
        "../pages/**/*.md"
    ],
    {
        eager: true
    }
);

const pages =
    discoverPages(modules);

export function getPages() {
    return pages;
}

export function renderPage(page) {
    const Component =
        page.component;

    return renderToStaticMarkup(
        <PageLayout page={page}>
            <Component />
        </PageLayout>
    );
}