import MarkdownTag from "./MarkdownTag.js";

export default class ProjectLink extends MarkdownTag {
    constructor({ project = null } = {}) {
        super("projectLink");
        this.project = project;
    }

    process(content) {
        const lines = content.split(/\r?\n/);
        const output = [];

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

            output.push(
                line.replace(
                    /\{%\s*project_link\s+([^%]+?)\s*%\}/g,
                    (_, target) => {
                        if (!this.project) {
                            throw new Error(
                                "project_link can only be used on a project page."
                            );
                        }

                        const targetPath = target.trim();

                        if (!targetPath || targetPath === "index") {
                            return `/projects/${this.project}/`;
                        }

                        return `/projects/${this.project}/${targetPath.replace(/^\/|\/$/g, "")}/`;
                    }
                )
            );
        }

        return output.join("\n");
    }
}