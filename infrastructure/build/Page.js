import React from "react";

import {
    hasTheme
} from "../../theme/index.js";

export default class Page {

    path;

    title;

    description;

    metadata;

    theme;

    component;

    constructor({
                    title,
                    description = "",
                    metadata = {},
                    theme = undefined,
                    component
                }) {
        this.path = null;

        this.title = title;
        this.description = description;
        this.metadata = metadata;

        this.theme = theme ?? "default";

        if (!hasTheme(this.theme)) {
            throw new Error(
                `Unknown theme "${this.theme}".`
            );
        }

        this.component = component;
    }

    static fromHtml({
                        title = "",
                        description = "",
                        metadata = {},
                        theme = null,
                        html
                    }) {
        return new Page({
            title,
            description,
            metadata,
            theme,

            component: function StaticPage() {
                return React.createElement(
                    "div",
                    {
                        className: "html-page",
                        dangerouslySetInnerHTML: {
                            __html: html
                        }
                    }
                );
            }
        });
    }

    static fromMarkdown({
                            title = "",
                            description = "",
                            metadata = {},
                            theme = null,
                            html
                        }) {
        return new Page({
            title,
            description,
            metadata,
            theme,

            component: function MarkdownPage() {
                return React.createElement(
                    "div",
                    {
                        className: "markdown",
                        dangerouslySetInnerHTML: {
                            __html: html
                        }
                    }
                );
            }
        });
    }
}