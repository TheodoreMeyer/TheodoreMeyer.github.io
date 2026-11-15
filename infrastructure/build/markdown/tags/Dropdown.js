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
            tagName: "details",
            properties: {},
            children: [
                {
                    type: "element",
                    tagName: "summary",
                    properties: {},
                    children: [
                        {
                            type: "text",
                            value: node.label || "Details"
                        }
                    ]
                },
                ...state.all(node)
            ]
        };
    }

    escapeLabel(value) {
        return value
            .replace(/\\/g, "\\\\")
            .replace(/\]/g, "\\]");
    }
}