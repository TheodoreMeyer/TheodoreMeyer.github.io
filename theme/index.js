import themes from "./themes.js";

export function getTheme(name) {
    const theme =
        themes.find(
            theme => theme.name === name
        );

    if (!theme) {
        throw new Error(
            `Unknown theme "${name}".`
        );
    }

    return theme;
}

export function hasTheme(name) {
    return themes.some(
        theme => theme.name === name
    );
}

export function getThemes() {
    return [...themes];
}