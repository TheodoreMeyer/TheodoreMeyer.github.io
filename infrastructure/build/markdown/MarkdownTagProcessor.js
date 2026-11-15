import ProjectLink from "./tags/ProjectLink.js";
import Dropdown from "./tags/Dropdown.js";
import Hover from "./tags/Hover.js";

export default class MarkdownTagProcessor {
    constructor({ project = null } = {}) {
        this.project = project;

        this.tags = [
            new ProjectLink({ project }),
            new Dropdown(),
            new Hover()
        ];
    }

    /**
     * Process and compile Markdown using all registered tags.
     *
     * @param {string} source
     * @param {(source: string, handlers: Object) => Promise<string>} compileMarkdown
     * @returns {Promise<string>}
     */
    async compile(source, compileMarkdown) {
        const context = {
            data: new Map()
        };

        let content = source;

        // Run each tag's Markdown processor.
        for (const tag of this.tags) {
            const result = tag.process(content, context);

            if (typeof result === "string") {
                content = result;
            } else {
                content = result.content;
                context.data.set(tag.name, result.data);
            }
        }

        // Collect all registered remark handlers.
        const handlers = Object.assign(
            {},
            ...this.tags.map(tag => tag.remarkHandlers)
        );

        // Compile the transformed Markdown.
        let html = await compileMarkdown(content, handlers);

        // Allow tags to transform the resulting HTML.
        for (const tag of this.tags) {
            html = await tag.transformHtml(
                html,
                context.data.get(tag.name),
                nestedSource => this.compile(nestedSource, compileMarkdown)
            );
        }

        return html;
    }
}