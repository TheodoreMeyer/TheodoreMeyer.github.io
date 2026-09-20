import {
    useEffect,
    useState
} from "react";

import Page from "#/build/Page.js";
import { api } from "#/api/api.js";

import "./votes.css";

function Vote() {
    const [vote, setVote] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);

    const [submitting, setSubmitting] =
        useState(false);

    const voteId =
        new URLSearchParams(
            window.location.search
        ).get("vote");

    async function loadVote() {
        if (!voteId) {
            setError(
                "No vote was specified."
            );
            setLoading(false);
            return;
        }

        try {
            const result =
                await api(
                    "getVote",
                    {
                        vote: voteId
                    }
                );

            setVote(result);
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setLoading(false);
        }
    }

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

            await loadVote();
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [voteId]);

    async function submitVote(option) {
        const {
            getCurrentToken
        } = await import(
            "#/api/auth.js"
            );

        const token =
            getCurrentToken();

        if (!token || submitting) {
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const result =
                await api(
                    "vote",
                    {
                        vote: voteId,
                        user: token,
                        option
                    }
                );

            if (result?.error) {
                setError(result.error);
                return;
            }

            await loadVote();
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="vote-page">
                <h2>
                    Authenticating...
                </h2>
            </div>
        );
    }

    if (error && !vote) {
        return (
            <div className="vote-page">
                <h2>Vote</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!vote) {
        return null;
    }

    return (
        <div className="vote-page">
            <h2>
                {vote.question}
            </h2>

            {error && (
                <p className="vote-error">
                    {error}
                </p>
            )}

            <div className="vote-options">
                {vote.options.map(option => (
                    <button
                        className="vote-option"
                        key={option.name}
                        onClick={() =>
                            submitVote(
                                option.name
                            )
                        }
                        disabled={submitting}
                    >
                        <strong>
                            {option.name}
                        </strong>

                        <span>
                            {Number(
                                option.votes
                            ).toFixed(2)}{" "}
                            pts
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default new Page({
    title: "Vote",
    description:
        "Cast your vote.",
    theme: "default",
    component: Vote
});