import {
    API_CONFIG
} from "./config.js";

export async function api(
    action,
    params = {}
) {
    const query =
        new URLSearchParams({
            action,
            client: API_CONFIG.clientId,
            ...params
        });

    const response =
        await fetch(
            `${API_CONFIG.url}?${query}`
        );

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status}`
        );
    }

    return response.json();
}