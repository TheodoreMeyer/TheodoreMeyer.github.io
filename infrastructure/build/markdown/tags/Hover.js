
import MarkdownTag from "./MarkdownTag.js";

export default class Hover extends MarkdownTag {
    static styles = `
        .markdown-hover {
            display: inline;
            cursor: help;
        }

        .markdown-hover--block {
            display: block;
            width: fit-content;
            max-width: 100%;
            margin: 0.75rem 0;
        }

        .markdown-hover__trigger {
            text-decoration: underline;
            text-decoration-style: dotted;
            text-decoration-color: var(--link-color);
            text-underline-offset: 3px;
        }

        .markdown-hover:focus-visible {
            outline: 2px solid var(--link-color);
            outline-offset: 3px;
            border-radius: 2px;
        }

        .markdown-hover--code {
            cursor: help;
        }

        .markdown-hover--code .markdown-hover__trigger {
            text-decoration: underline;
            text-decoration-style: dotted;
            text-decoration-color: var(--link-color);
            text-underline-offset: 2px;
        }

        .markdown-hover__popover {
            position: fixed;
            inset: auto;
            margin: 0;
            z-index: 1000;

            width: max-content;
            max-width: min(420px, calc(100vw - 24px));
            max-height: min(60vh, 500px);

            box-sizing: border-box;
            overflow: auto;

            padding: 1rem;

            border: 1px solid var(--border);
            border-radius: var(--radius);

            background: var(--surface-muted);
            color: var(--text-color);

            box-shadow: var(--shadow);
        }

        .markdown-hover__popover a {
            color: var(--link-color);
        }

        .markdown-hover__popover p:first-child {
            margin-top: 0;
        }

        .markdown-hover__popover p:last-child {
            margin-bottom: 0;
        }
    `;

    constructor() {
        super("hover");

        this.counter = 0;
    }

    process(content) {
        // Extract annotations from fenced code blocks first.
        const codeResult =
            this.extractCodeHovers(content);

        // Then extract ordinary Markdown hover tags.
        const markdownResult =
            this.extractHovers(codeResult.content);

        return {
            content: markdownResult.content,

            data: [
                ...markdownResult.hovers,
                ...codeResult.hovers
            ]
        };
    }

    async transformHtml(html, hovers = [], compileNested) {
        if (!hovers.length) {
            return html;
        }

        if (!html.includes('id="markdown-hover-styles"')) {
            html = `
<style id="markdown-hover-styles">
${Hover.styles}
</style>
${html}`;
        }

        // Ordinary Markdown hovers.
        for (const hover of hovers) {
            if (hover.code) {
                continue;
            }

            const triggerHtml =
                await compileNested(hover.trigger);

            const bodyHtml =
                await compileNested(hover.body);

            const triggerContent =
                this.stripParagraph(triggerHtml);

            const templateId =
                `${hover.id}-template`;

            const wrapper =
                hover.block ? "div" : "span";

            const blockClass =
                hover.block
                    ? " markdown-hover--block"
                    : "";

            const markup = `
<${wrapper}
    class="markdown-hover${blockClass}"
    data-markdown-hover="${hover.id}"
    data-markdown-hover-template="${templateId}"
    tabindex="0"
    role="group"
    aria-describedby="${hover.id}-popover"
    aria-expanded="false"
>
    <span class="markdown-hover__trigger">${triggerContent}</span>
    <template id="${templateId}">${bodyHtml}</template>
</${wrapper}>`;

            if (hover.block) {
                const placeholderPattern = new RegExp(
                    `<p>\\s*${this.escapeRegExp(hover.placeholder)}\\s*</p>`
                );

                if (!placeholderPattern.test(html)) {
                    throw new Error(
                        `Hover: Could not find block placeholder "${hover.placeholder}" in compiled HTML.`
                    );
                }

                html = html.replace(
                    placeholderPattern,
                    markup
                );
            } else {
                if (!html.includes(hover.placeholder)) {
                    throw new Error(
                        `Hover: Could not find inline placeholder "${hover.placeholder}" in compiled HTML.`
                    );
                }

                html = html.replace(
                    hover.placeholder,
                    markup
                );
            }
        }

        // Code-block hovers.
        for (const hover of hovers) {
            if (!hover.code) {
                continue;
            }

            const bodyHtml =
                await compileNested(hover.body);

            const templateId =
                `${hover.id}-template`;

            const template =
                `<template id="${templateId}">${bodyHtml}</template>`;

            const codeBlockPattern =
                /(<pre\b[^>]*>\s*<code\b([^>]*)>)([\s\S]*?)(<\/code>\s*<\/pre>)/g;

            let matchingBlock = 0;
            let found = false;

            html = html.replace(
                codeBlockPattern,
                (fullMatch, opening, attributes, codeHtml, closing) => {
                    if (!this.matchesLanguage(
                        attributes,
                        hover.language
                    )) {
                        return fullMatch;
                    }

                    const currentBlock =
                        matchingBlock++;

                    if (
                        currentBlock !== hover.languageOrdinal
                    ) {
                        return fullMatch;
                    }

                    found = true;

                    const wrappedCode =
                        this.wrapCodeLine(
                            codeHtml,
                            hover.lineIndex,
                            hover.id,
                            templateId
                        );

                    return (
                        `${opening}${wrappedCode}${closing}${template}`
                    );
                }
            );

            if (!found) {
                throw new Error(
                    `Hover: Could not find the ${hover.language || "unlabelled"} code block containing "${hover.id}".`
                );
            }
        }

        return html;
    }

    /**
     * Wraps a complete highlighted code line.
     *
     * This works with nested syntax-highlighting spans because
     * the wrapper is inserted around the HTML range of the line,
     * rather than splitting or rebuilding the highlighted markup.
     */
    wrapCodeLine(codeHtml, lineIndex, id, templateId) {
        let start = 0;

        for (let i = 0; i < lineIndex; i++) {
            const newline = codeHtml.indexOf("\n", start);

            if (newline === -1) {
                throw new Error(
                    `Hover: Code line ${lineIndex + 1} does not exist.`
                );
            }

            start = newline + 1;
        }

        let end = codeHtml.indexOf("\n", start);

        if (end === -1) {
            end = codeHtml.length;
        }

        if (start >= codeHtml.length) {
            throw new Error(
                `Hover: Code line ${lineIndex + 1} is missing.`
            );
        }

        const opening =
            `<span class="markdown-hover markdown-hover--code" ` +
            `data-markdown-hover="${id}" ` +
            `data-markdown-hover-template="${templateId}" ` +
            `tabindex="0" role="group" ` +
            `aria-describedby="${id}-popover" ` +
            `aria-expanded="false">` +
            `<span class="markdown-hover__trigger">`;

        const closing =
            `</span></span>`;

        return (
            codeHtml.slice(0, start) +
            opening +
            codeHtml.slice(start, end) +
            closing +
            codeHtml.slice(end)
        );
    }

    matchesLanguage(attributes, language) {
        const classMatch =
            attributes.match(
                /\bclass=["']([^"']*)["']/
            );

        const classes =
            classMatch?.[1]?.split(/\s+/) || [];

        if (!language) {
            return !classes.some(
                value => value.startsWith("language-")
            );
        }

        const acceptedLanguages =
            language === "yaml"
                ? ["yaml", "yml"]
                : [language];

        return acceptedLanguages.some(
            value => classes.includes(`language-${value}`)
        );
    }

    /**
     * Extracts annotations from standard fenced code blocks.
     *
     * Supported languages include:
     * - yaml
     * - yml
     * - json
     *
     * The language is not restricted, so other fenced languages
     * can also use this syntax.
     */
    extractCodeHovers(source) {
        const lines =
            source.match(/[^\r\n]*(?:\r\n|\n|\r|$)/g) || [];

        const output = [];
        const hovers = [];

        const languageCounts = new Map();

        let index = 0;

        while (index < lines.length) {
            const openingLine =
                this.removeLineEnding(lines[index]);

            const openingMatch =
                openingLine.match(
                    /^ {0,3}(`{3,}|~{3,})(.*)$/
                );

            if (!openingMatch) {
                output.push(lines[index]);
                index++;
                continue;
            }

            const fence =
                openingMatch[1];

            const fenceCharacter =
                fence[0];

            const fenceLength =
                fence.length;

            const info =
                openingMatch[2].trim();

            // CommonMark does not allow backticks in the
            // info string of a backtick fence.
            if (
                fenceCharacter === "`" &&
                info.includes("`")
            ) {
                output.push(lines[index]);
                index++;
                continue;
            }

            const language =
                this.getFenceLanguage(info);

            const languageOrdinal =
                languageCounts.get(language) || 0;

            languageCounts.set(
                language,
                languageOrdinal + 1
            );

            // Find the closing fence.
            let closingIndex = -1;

            for (
                let cursor = index + 1;
                cursor < lines.length;
                cursor++
            ) {
                const line =
                    this.removeLineEnding(lines[cursor]);

                const closingMatch =
                    line.match(
                        /^ {0,3}(`+|~+)[ \t]*$/
                    );

                if (
                    closingMatch &&
                    closingMatch[1][0] === fenceCharacter &&
                    closingMatch[1].length >= fenceLength
                ) {
                    closingIndex = cursor;
                    break;
                }
            }

            // Leave unclosed fences untouched.
            if (closingIndex === -1) {
                output.push(
                    ...lines.slice(index)
                );

                break;
            }

            const codeLines =
                lines.slice(index + 1, closingIndex);

            const result =
                this.processCodeAnnotations(
                    codeLines,
                    {
                        language,
                        languageOrdinal
                    }
                );

            output.push(lines[index]);
            output.push(...result.lines);
            output.push(lines[closingIndex]);

            hovers.push(...result.hovers);

            index = closingIndex + 1;
        }

        return {
            content: output.join(""),
            hovers
        };
    }

    processCodeAnnotations(codeLines, blockInfo) {
        const output = [];
        const hovers = [];

        const startPattern =
            /^[ \t]*\{%\s*hoverStart\s*%\}[ \t]*$/;

        const endPattern =
            /^[ \t]*\{%\s*hoverEnd\s*%\}[ \t]*$/;

        let index = 0;

        while (index < codeLines.length) {
            const line =
                this.removeLineEnding(codeLines[index]);

            if (!startPattern.test(line)) {
                output.push(codeLines[index]);
                index++;
                continue;
            }

            // Skip blank lines between hoverStart and trigger.
            let triggerIndex = index + 1;

            while (
                triggerIndex < codeLines.length &&
                this.removeLineEnding(
                    codeLines[triggerIndex]
                ).trim() === ""
                ) {
                triggerIndex++;
            }

            if (triggerIndex >= codeLines.length) {
                throw new Error(
                    "Hover: Code hover has no trigger line."
                );
            }

            const triggerLine =
                this.removeLineEnding(
                    codeLines[triggerIndex]
                );

            if (!triggerLine.trim()) {
                throw new Error(
                    "Hover: Code hover trigger cannot be empty."
                );
            }

            // A blank line separates the code trigger from
            // the Markdown tooltip.
            const separatorIndex =
                triggerIndex + 1;

            if (
                separatorIndex >= codeLines.length ||
                this.removeLineEnding(
                    codeLines[separatorIndex]
                ).trim() !== ""
            ) {
                throw new Error(
                    "Hover: Code hover requires a blank line after its trigger line."
                );
            }

            // Find hoverEnd.
            let endIndex =
                separatorIndex + 1;

            while (endIndex < codeLines.length) {
                const currentLine =
                    this.removeLineEnding(
                        codeLines[endIndex]
                    );

                if (startPattern.test(currentLine)) {
                    throw new Error(
                        "Hover: Nested code hovers are not supported."
                    );
                }

                if (endPattern.test(currentLine)) {
                    break;
                }

                endIndex++;
            }

            if (endIndex >= codeLines.length) {
                throw new Error(
                    "Hover: Code hover has no matching hoverEnd."
                );
            }

            const bodyLines =
                codeLines.slice(
                    separatorIndex + 1,
                    endIndex
                );

            const body =
                this.dedent(bodyLines.join(""))
                    .trim();

            if (!body) {
                throw new Error(
                    "Hover: Code hover tooltip cannot be empty."
                );
            }

            const id =
                `markdown-hover-${this.counter++}`;

            // The output index is the line's position after
            // removing annotation delimiters and tooltip text.
            const lineIndex =
                output.length;

            // Preserve the original trigger line and its
            // original line ending.
            output.push(
                codeLines[triggerIndex]
            );

            hovers.push({
                id,
                code: true,
                language: blockInfo.language,
                languageOrdinal: blockInfo.languageOrdinal,
                lineIndex,
                trigger: triggerLine,
                body
            });

            index = endIndex + 1;
        }

        return {
            lines: output,
            hovers
        };
    }

    getFenceLanguage(info) {
        const language =
            info
                .split(/\s+/)[0]
                .replace(/^\{\.?/, "")
                .replace(/\}$/, "")
                .toLowerCase();

        if (language === "yml") {
            return "yaml";
        }

        return language;
    }

    dedent(content) {
        const lines =
            content.split(/\r?\n/);

        const indentation = lines
            .filter(line => line.trim())
            .map(line => (
                line.match(/^[ \t]*/)?.[0].length || 0
            ));

        if (!indentation.length) {
            return content;
        }

        const minimum =
            Math.min(...indentation);

        return lines
            .map(line => line.slice(minimum))
            .join("\n");
    }

    extractHovers(source) {
        const maskedSource =
            this.maskCode(source);

        const tagRegex =
            /\{%\s*hover(Start|End)(?:\s+([^%]*?))?\s*%\}/g;

        const hovers = [];
        const replacements = [];

        let openHover = null;
        let match;

        while (
            (match = tagRegex.exec(maskedSource)) !== null
            ) {
            const start = match.index;
            const end = start + match[0].length;

            const originalTag =
                source.slice(start, end);

            if (match[1] === "Start") {
                if (openHover) {
                    throw new Error(
                        "Hover: Nested hover tags are not supported."
                    );
                }

                const labelMatch =
                    originalTag.match(
                        /hoverStart(?:\s+([^%]*?))?\s*%\}/
                    );

                const label =
                    labelMatch?.[1]?.trim() || null;

                openHover = {
                    start,
                    end,
                    label,
                    block: this.isStandaloneTag(
                        source,
                        start,
                        end
                    )
                };

                continue;
            }

            if (!openHover) {
                throw new Error(
                    "Hover: hoverEnd has no matching hoverStart."
                );
            }

            const blockEnd =
                this.isStandaloneTag(
                    source,
                    start,
                    end
                );

            if (openHover.block && !blockEnd) {
                throw new Error(
                    "Hover: A block hoverEnd must be on its own line."
                );
            }

            const rawContent =
                source.slice(openHover.end, start);

            let trigger;
            let body;

            if (openHover.block) {
                if (openHover.label) {
                    throw new Error(
                        "Hover: Block hover tags use their first paragraph as the trigger. Do not provide a label."
                    );
                }

                ({
                    trigger,
                    body
                } = this.splitBlockHover(rawContent));
            } else {
                if (!openHover.label) {
                    throw new Error(
                        "Hover: Inline hover tags require a trigger label."
                    );
                }

                trigger = openHover.label;
                body = rawContent.trim();
            }

            if (!body.trim()) {
                throw new Error(
                    "Hover: Tooltip content cannot be empty."
                );
            }

            const id =
                `markdown-hover-${this.counter++}`;

            const placeholder =
                `MARKDOWNHOVERPLACEHOLDER${this.counter}END`;

            hovers.push({
                id,
                placeholder,
                trigger,
                body,
                block: openHover.block
            });

            replacements.push({
                start: openHover.start,
                end,
                placeholder
            });

            openHover = null;
        }

        if (openHover) {
            throw new Error(
                "Hover: hoverStart has no matching hoverEnd."
            );
        }

        let content = source;

        for (
            const replacement of replacements.reverse()
            ) {
            content =
                content.slice(0, replacement.start) +
                replacement.placeholder +
                content.slice(replacement.end);
        }

        return {
            content,
            hovers
        };
    }

    /**
     * Masks code before extracting ordinary Markdown hovers.
     * This prevents hover syntax inside code from being processed.
     */
    maskCode(source) {
        const characters =
            source.split("");

        const lines =
            source.match(/[^\r\n]*(?:\r\n|\n|\r|$)/g) || [];

        let offset = 0;
        let fence = null;

        const maskRange = (start, end) => {
            for (let i = start; i < end; i++) {
                if (
                    characters[i] !== "\n" &&
                    characters[i] !== "\r"
                ) {
                    characters[i] = " ";
                }
            }
        };

        // Fenced and indented code blocks.
        for (const rawLine of lines) {
            if (!rawLine) {
                continue;
            }

            const line =
                this.removeLineEnding(rawLine);

            const fenceMatch =
                line.match(
                    /^ {0,3}(`{3,}|~{3,})(.*)$/
                );

            const insideFence =
                fence !== null;

            if (!insideFence && fenceMatch) {
                if (
                    fenceMatch[1][0] === "`" &&
                    fenceMatch[2].includes("`")
                ) {
                    offset += rawLine.length;
                    continue;
                }

                fence = {
                    character: fenceMatch[1][0],
                    length: fenceMatch[1].length
                };

                maskRange(
                    offset,
                    offset + rawLine.length
                );

                offset += rawLine.length;
                continue;
            }

            if (insideFence) {
                const closingMatch =
                    line.match(
                        /^ {0,3}(`+|~+)[ \t]*$/
                    );

                const closesFence =
                    closingMatch &&
                    closingMatch[1][0] === fence.character &&
                    closingMatch[1].length >= fence.length;

                maskRange(
                    offset,
                    offset + rawLine.length
                );

                if (closesFence) {
                    fence = null;
                }

                offset += rawLine.length;
                continue;
            }

            // Indented code blocks.
            if (
                /^(?: {4}|\t)/.test(line) &&
                line.trim() !== ""
            ) {
                maskRange(
                    offset,
                    offset + rawLine.length
                );
            }

            offset += rawLine.length;
        }

        // Inline code spans.
        let index = 0;

        while (index < characters.length) {
            if (characters[index] !== "`") {
                index++;
                continue;
            }

            const runStart = index;

            while (
                index < characters.length &&
                characters[index] === "`"
                ) {
                index++;
            }

            const runLength =
                index - runStart;

            let closingIndex = -1;
            let searchIndex = index;

            while (
                searchIndex < characters.length
                ) {
                if (characters[searchIndex] !== "`") {
                    searchIndex++;
                    continue;
                }

                const candidateStart =
                    searchIndex;

                while (
                    searchIndex < characters.length &&
                    characters[searchIndex] === "`"
                    ) {
                    searchIndex++;
                }

                const candidateLength =
                    searchIndex - candidateStart;

                if (candidateLength === runLength) {
                    closingIndex = searchIndex;
                    break;
                }
            }

            if (closingIndex === -1) {
                continue;
            }

            maskRange(
                runStart,
                closingIndex
            );

            index = closingIndex;
        }

        return characters.join("");
    }

    splitBlockHover(content) {
        const normalized = content
            .replace(/^\s*\r?\n/, "")
            .replace(/\r?\n\s*$/, "");

        const separator =
            normalized.search(/\r?\n[ \t]*\r?\n/);

        if (separator === -1) {
            throw new Error(
                "Hover: Block hover requires a blank line between its trigger and tooltip content."
            );
        }

        const trigger = normalized
            .slice(0, separator)
            .trim();

        const body = normalized
            .slice(separator)
            .replace(/^\r?\n[ \t]*\r?\n/, "")
            .trim();

        if (!trigger) {
            throw new Error(
                "Hover: Block hover requires a trigger paragraph."
            );
        }

        if (!body) {
            throw new Error(
                "Hover: Tooltip content cannot be empty."
            );
        }

        return {
            trigger,
            body
        };
    }

    isStandaloneTag(source, start, end) {
        const lineStart =
            source.lastIndexOf("\n", start - 1) + 1;

        const nextNewline =
            source.indexOf("\n", end);

        const lineEnd =
            nextNewline === -1
                ? source.length
                : nextNewline;

        return (
            source.slice(lineStart, start).trim() === "" &&
            source.slice(end, lineEnd).trim() === ""
        );
    }

    stripParagraph(html) {
        return html
            .replace(/^\s*<p>/, "")
            .replace(/<\/p>\s*$/, "")
            .trim();
    }

    removeLineEnding(line) {
        return line.replace(/(?:\r\n|\n|\r)$/, "");
    }

    escapeRegExp(value) {
        return value.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
    }
}
