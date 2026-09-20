import { api } from "./api.js";

let currentUser = null;

export function getToken() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    let token =
        params.get("user") ||
        localStorage.getItem(
            "user_token"
        );

    if (!token) {
        token = prompt(
            "Enter your voting token:"
        );
    }

    if (!token) {
        window.location.href = "/404/";
        return null;
    }

    localStorage.setItem(
        "user_token",
        token
    );

    return token;
}

export async function requireAuth() {
    const token = getToken();

    if (!token) {
        return null;
    }

    try {
        const user =
            await api(
                "validateUser",
                {
                    user: token
                }
            );

        if (
            !user ||
            user.error ||
            !user.valid
        ) {
            throw new Error(
                "Invalid token."
            );
        }

        currentUser = user;

        return user;
    } catch (error) {
        localStorage.removeItem(
            "user_token"
        );

        alert("Invalid token.");

        window.location.href =
            "/404/";

        return null;
    }
}

export async function requireAdmin() {
    const user =
        await requireAuth();

    if (!user) {
        return null;
    }

    if (user.role !== "Admin") {
        alert(
            "Admin access required."
        );

        window.location.href =
            "/server/";

        return null;
    }

    return user;
}

export function getCurrentUser() {
    return currentUser;
}

export function getCurrentToken() {
    return localStorage.getItem("user_token");
}

export function logout() {
    localStorage.removeItem(
        "user_token"
    );

    window.location.reload();
}