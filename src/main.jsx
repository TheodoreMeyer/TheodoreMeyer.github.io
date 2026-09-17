import React from "react";
import ReactDOM from "react-dom/client";

import {
    BrowserRouter
} from "react-router-dom";

import PageHandler from "../infrastructure/build/PageHandler.jsx";
import {
    discoverPages
} from "../infrastructure/build/pages.js";

import "../theme/index.css";

const modules = {
    ...import.meta.glob(
        [
            "@/**/*.jsx",
            "@/**/*.md"
        ],
        {
            eager: true
        }
    ),

    ...import.meta.glob(
        "@/**/*.html",
        {
            eager: true,
            query: "?theodore-page"
        }
    )
};

const pages =
    discoverPages(modules);

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <BrowserRouter>
            <PageHandler pages={pages} />
        </BrowserRouter>
    </React.StrictMode>
);