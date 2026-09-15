export default class Page {

    path;

    title;

    description;

    metadata;

    component;

    constructor({
                    title,
                    description = "",
                    metadata = {},
                    component
                }) {
        this.path = null;

        this.title = title;
        this.description = description;
        this.metadata = metadata;
        this.component = component;
    }
}