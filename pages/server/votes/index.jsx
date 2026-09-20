import {
    useEffect,
    useState
} from "react";

import Page from "#/build/Page.js";
import { api } from "#/api/api.js";

import "./votes.css";

function Votes() {
    const [votes, setVotes] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const {
                requireAuth
            } = await import(
                "#/api/auth.js"
                );

            const user =
                await requireAuth();

            if (!user || cancelled) {
                return;
            }

            try {
                const result =
                    await api(
                        "listVotes"
                    );

                if (!cancelled) {
                    setVotes(
                        Array.isArray(result)
                            ? result
                            : []
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    setError(
                        error.message
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="votes-page">
                <h2>Active Votes</h2>
                <p>Loading votes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="votes-page">
                <h2>Active Votes</h2>
                <p>
                    Unable to load votes:{" "}
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="votes-page">
            <h2>Active Votes</h2>

            {votes.length === 0 ? (
                <p>
                    <i>
                        No active votes.
                    </i>
                </p>
            ) : (
                <div className="vote-list">
                    {votes.map(vote => (
                        <div
                            className="vote-card"
                            key={vote.id}
                        >
                            <strong>
                                {vote.question}
                            </strong>

                            <a
                                className="vote-button"
                                href={
                                    `/server/votes/vote/?vote=${encodeURIComponent(
                                        vote.id
                                    )}`
                                }
                            >
                                Vote
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default new Page({
    title: "Votes",
    description:
        "Active server votes.",
    theme: "default",
    component: Votes
});