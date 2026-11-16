import MarkdownTag from "./MarkdownTag.js";

export default class Dropdown extends MarkdownTag {
    constructor() {
        super("dropdown");
    }

    process(content) {
        const lines = content.split(/\r?\n/);
        const output = [];

        const stack = [];
        let codeFence = null;

        for (const line of lines) {
            const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);

            if (codeFence) {
                output.push(line);

                if (
                    fenceMatch &&
                    fenceMatch[1][0] === codeFence.character &&
                    fenceMatch[1].length >= codeFence.length
                ) {
                    codeFence = null;
                }

                continue;
            }

            if (fenceMatch) {
                codeFence = {
                    character: fenceMatch[1][0],
                    length: fenceMatch[1].length
                };

                output.push(line);
                continue;
            }

            const start = line.match(
                /^\s*\{%\s*dropdownStart(?:\s+(.+?))?\s*%\}\s*$/
            );

            const end = line.match(
                /^\s*\{%\s*dropdownEnd\s*%\}\s*$/
            );

            if (start) {
                const title = start[1]?.trim() || "Details";

                if (output.length && output.at(-1) !== "") {
                    output.push("");
                }

                output.push(`:::dropdown[${this.escapeLabel(title)}]`);
                output.push("");

                stack.push(title);
                continue;
            }

            if (end) {
                if (!stack.length) {
                    throw new Error(
                        "Dropdown: dropdownEnd has no matching dropdownStart."
                    );
                }

                if (output.length && output.at(-1) !== "") {
                    output.push("");
                }

                output.push(":::");
                output.push("");

                stack.pop();
                continue;
            }

            output.push(line);
        }

        if (stack.length) {
            throw new Error(
                `Dropdown: ${stack.length} dropdown(s) have no matching dropdownEnd.`
            );
        }

        return output.join("\n");
    }

    get remarkHandlers() {
        return {
            containerDirective: Dropdown.handler
        };
    }

    static handler(state, node) {
        if (node.name !== "dropdown") {
            return state.applyData({ hName: "div" }, node);
        }

        return {
            type: "element",
            tagName: "div",
            properties: {
                className: ["markdown-dropdown-wrapper"]
            },
            children: [
                {
                    type: "element",
                    tagName: "style",
                    properties: {},
                    children: [
                        {
                            type: "text",
                            value: `
                            .markdown-dropdown {
                                margin: 1.25rem 0;
                                border: 1px solid var(--border);
                                border-radius: var(--radius);
                                background: var(--surface-muted);
                                overflow: hidden;
                            }

                            .markdown-dropdown__title {
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                gap: 1rem;
                                padding: 0.85rem 1rem;
                                font-weight: 600;
                                cursor: pointer;
                                list-style: none;
                                user-select: none;
                            }

                            .markdown-dropdown__title::-webkit-details-marker {
                                display: none;
                            }

                            .markdown-dropdown__title::after {
                                content: "";
                                width: 0.55rem;
                                height: 0.55rem;
                                flex-shrink: 0;
                                border-right: 2px solid currentColor;
                                border-bottom: 2px solid currentColor;
                                transform: rotate(45deg);
                                transition: transform 160ms ease;
                            }

                            .markdown-dropdown[open] > .markdown-dropdown__title::after {
                                transform: rotate(225deg);
                            }

                            .markdown-dropdown__title:hover {
                                background: color-mix(in srgb, var(--text-color) 5%, transparent);
                            }

                            .markdown-dropdown__content {
                                padding: 0 1rem 1rem;
                                border-top: 1px solid var(--border);
                            }

                            .markdown-dropdown__content > :first-child {
                                margin-top: 1rem;
                            }

                            .markdown-dropdown__content > :last-child {
                                margin-bottom: 0;
                            }
                        `
                        }
                    ]
                },
                {
                    type: "element",
                    tagName: "details",
                    properties: {
                        className: ["markdown-dropdown"]
                    },
                    children: [
                        {
                            type: "element",
                            tagName: "summary",
                            properties: {
                                className: ["markdown-dropdown__title"]
                            },
                            children: [
                                {
                                    type: "text",
                                    value: node.label || "Details"
                                }
                            ]
                        },
                        {
                            type: "element",
                            tagName: "div",
                            properties: {
                                className: ["markdown-dropdown__content"]
                            },
                            children: state.all(node)
                        }
                    ]
                }
            ]
        };
    }

    escapeLabel(value) {
        return value
            .replace(/\\/g, "\\\\")
            .replace(/\]/g, "\\]");
    }
}