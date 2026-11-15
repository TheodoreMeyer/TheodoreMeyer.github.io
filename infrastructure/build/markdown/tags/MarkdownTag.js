export default class MarkdownTag {
    constructor(name) {
        this.name = name;
    }

    /**
     * Transform Markdown before it is compiled.
     *
     * @param {string} content
     * @returns {string}
     */
    process(content) {
        return content;
    }

    /**
     * Optional remark-rehype handlers.
     *
     * @returns {Object}
     */
    get remarkHandlers() {
        return {};
    }

    /**
     * Transform compiled HTML.
     *
     * @param {string} html
     * @param {*} data
     * @param {(source: string) => Promise<string>} compileNested
     * @returns {Promise<string>|string}
     */
    async transformHtml(html, data, compileNested) {
        return html;
    }
}