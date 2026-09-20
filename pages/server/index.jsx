import {
    useEffect,
    useState
} from "react";

import Page from "#/build/Page.js";

import "./server.css";

function ServerPortal() {
    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        let cancelled = false;

        async function authenticate() {
            const {
                requireAuth
            } = await import(
                "#/api/auth.js"
                );

            const authenticatedUser =
                await requireAuth();

            if (
                !cancelled &&
                authenticatedUser
            ) {
                setUser(
                    authenticatedUser
                );
                setLoading(false);
            }
        }

        authenticate();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="server-portal">
                <p>Authenticating...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="server-portal">
            <section className="welcome-banner">
                <h2>
                    Welcome, {user.email}
                </h2>

                <p>
                    Role:{" "}
                    <strong>
                        {user.role}
                    </strong>
                </p>
            </section>

            <div className="server-cards">
                <a
                    className="server-card"
                    href="/server/votes/"
                >
                    Votes
                </a>

                <a
                    className="server-card"
                    href="/server/rules/"
                >
                    Rules
                </a>

                {user.role === "Admin" && (
                    <a
                        className="server-card admin-card"
                        href="/server/votes/admin/"
                    >
                        Admin Panel
                    </a>
                )}
            </div>
        </div>
    );
}

export default new Page({
    title: "Server Portal",
    description:
        "Server management portal.",
    theme: "default",
    component: ServerPortal
});