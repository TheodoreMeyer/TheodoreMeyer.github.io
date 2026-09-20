import {
    useEffect,
    useState
} from "react";

import Page from "#/build/Page.js";
import { api } from "#/api/api.js";

import "./votes.css";

function AdminVotes() {
    const [votes, setVotes] =
        useState([]);

    const [users, setUsers] =
        useState([]);

    const [question, setQuestion] =
        useState("");

    const [options, setOptions] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);

    async function loadVotes() {
        const result =
            await api("adminVotes");

        setVotes(
            Array.isArray(result)
                ? result
                : []
        );
    }

    async function loadUsers() {
        const result =
            await api("listUsers");

        setUsers(
            Array.isArray(result)
                ? [...result].sort(
                    (a, b) =>
                        Number(a.approved) -
                        Number(b.approved)
                )
                : []
        );
    }

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const {
                requireAdmin
            } = await import(
                "#/api/auth.js"
                );

            const user =
                await requireAdmin();

            if (!user || cancelled) {
                return;
            }

            try {
                await Promise.all([
                    loadVotes(),
                    loadUsers()
                ]);
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

    async function createVote() {
        const cleanQuestion =
            question.trim();

        const voteOptions =
            options
                .split(",")
                .map(option =>
                    option.trim()
                )
                .filter(Boolean);

        if (
            !cleanQuestion ||
            voteOptions.length < 2
        ) {
            alert(
                "Enter a question and at least 2 options."
            );
            return;
        }

        try {
            const {
                getCurrentToken
            } = await import(
                "#/api/auth.js"
                );

            const result =
                await api(
                    "createVote",
                    {
                        user:
                            getCurrentToken(),
                        question:
                        cleanQuestion,
                        options:
                            voteOptions.join(
                                "|"
                            )
                    }
                );

            if (result?.error) {
                alert(result.error);
                return;
            }

            setQuestion("");
            setOptions("");

            await loadVotes();
        } catch (error) {
            alert(error.message);
        }
    }

    async function closeVote(voteId) {
        try {
            const {
                getCurrentToken
            } = await import(
                "#/api/auth.js"
                );

            const result =
                await api(
                    "closeVote",
                    {
                        vote: voteId,
                        user:
                            getCurrentToken()
                    }
                );

            if (result?.error) {
                alert(result.error);
                return;
            }

            await loadVotes();
        } catch (error) {
            alert(error.message);
        }
    }

    async function changeRole(
        userToken,
        role
    ) {
        try {
            const {
                getCurrentToken
            } = await import(
                "#/api/auth.js"
                );

            const result =
                await api(
                    "updateUserRole",
                    {
                        admin:
                            getCurrentToken(),
                        token: userToken,
                        role
                    }
                );

            if (result?.error) {
                alert(result.error);
                return;
            }

            await loadUsers();
        } catch (error) {
            alert(error.message);
        }
    }

    async function approveUser(
        userToken
    ) {
        try {
            const {
                getCurrentToken
            } = await import(
                "#/api/auth.js"
                );

            const result =
                await api(
                    "approveUser",
                    {
                        admin:
                            getCurrentToken(),
                        token: userToken
                    }
                );

            if (result?.error) {
                alert(result.error);
                return;
            }

            await loadUsers();
        } catch (error) {
            alert(error.message);
        }
    }

    if (loading) {
        return (
            <div className="admin-votes">
                <h2>Admin Panel</h2>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-votes">
                <h2>Admin Panel</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="admin-votes">
            <h2>Admin Panel</h2>

            <section className="admin-section">
                <h3>Create Vote</h3>

                <label>
                    Question
                    <input
                        value={question}
                        onChange={event =>
                            setQuestion(
                                event.target.value
                            )
                        }
                    />
                </label>

                <label>
                    Options
                    <input
                        value={options}
                        onChange={event =>
                            setOptions(
                                event.target.value
                            )
                        }
                        placeholder="Option 1, Option 2"
                    />
                </label>

                <button
                    className="primary-button"
                    onClick={createVote}
                >
                    Create Vote
                </button>
            </section>

            <section className="admin-section">
                <h3>Existing Votes</h3>

                {votes.length === 0 ? (
                    <p>
                        <i>
                            No votes created yet.
                        </i>
                    </p>
                ) : (
                    <div className="admin-vote-list">
                        {votes.map(vote => (
                            <div
                                className="vote-card"
                                key={vote.id}
                            >
                                <div>
                                    <strong>
                                        {
                                            vote.question
                                        }
                                    </strong>

                                    <span
                                        className={
                                            `vote-status ${vote.status}`
                                        }
                                    >
                                        {
                                            vote.status
                                        }
                                    </span>
                                </div>

                                <div className="vote-actions">
                                    <a
                                        href={
                                            `/server/votes/vote/?vote=${encodeURIComponent(
                                                vote.id
                                            )}`
                                        }
                                    >
                                        View
                                    </a>

                                    {vote.status ===
                                        "OPEN" && (
                                            <button
                                                onClick={() =>
                                                    closeVote(
                                                        vote.id
                                                    )
                                                }
                                            >
                                                Close
                                            </button>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="admin-section">
                <h3>User Manager</h3>

                <div className="user-list">
                    {users.map(user => {
                        if (
                            user.category ===
                            "Admin"
                        ) {
                            return (
                                <div
                                    className="user-row"
                                    key={
                                        user.token
                                    }
                                >
                                    <span>
                                        {
                                            user.email
                                        }
                                    </span>

                                    <strong>
                                        Admin
                                    </strong>
                                </div>
                            );
                        }

                        return (
                            <div
                                className="user-row"
                                key={
                                    user.token
                                }
                            >
                                <span>
                                    {
                                        user.email
                                    }
                                </span>

                                <select
                                    value={
                                        user.category
                                    }
                                    onChange={event =>
                                        changeRole(
                                            user.token,
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >
                                    <option value="Player">
                                        Player
                                    </option>

                                    <option value="VIP">
                                        VIP
                                    </option>
                                </select>

                                {user.approved ? (
                                    <span className="approved">
                                        Approved
                                    </span>
                                ) : (
                                    <button
                                        onClick={() =>
                                            approveUser(
                                                user.token
                                            )
                                        }
                                    >
                                        Approve
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            <button
                className="secondary-button"
                onClick={async () => {
                    const {
                        logout
                    } = await import(
                        "#/api/auth.js"
                        );

                    logout();
                }}
            >
                Log Out
            </button>
        </div>
    );
}

export default new Page({
    title: "Admin Votes",
    description:
        "Manage server votes and users.",
    theme: "default",
    component: AdminVotes
});