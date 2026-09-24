import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Page from "#/build/Page.js";
import { api } from "#/api/api.js";
import "./server.css";

function Forms() {
    const { search } = useLocation();
    const token = new URLSearchParams(search).get("token");

    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState("");

    const [realName, setRealName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [eulaAccepted, setEulaAccepted] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (!token) {
                setError(
                    "No registration token was provided."
                );
                setLoading(false);
                return;
            }

            try {
                const result = await api("getEntry", {
                    token
                });

                if (cancelled) return;

                if (!result.found) {
                    setError(
                        "This registration link is invalid."
                    );
                    setLoading(false);
                    return;
                }

                setUsername(
                    result.username || ""
                );

                if (result.data) {
                    setRealName(
                        result.data.realName || ""
                    );

                    setEmail(
                        result.data.email || ""
                    );

                    setPhone(
                        result.data.phone || ""
                    );

                    setEulaAccepted(
                        result.data.eulaAccepted === true
                    );
                }

                setValid(true);
            } catch (error) {
                if (!cancelled) {
                    setError(error.message);
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
    }, [token]);

    async function submit(event) {
        event.preventDefault();

        if (!realName.trim()) {
            setError(
                "Please enter your real name."
            );
            return;
        }

        if (!email.trim() && !phone.trim()) {
            setError(
                "Please provide an email address or phone number."
            );
            return;
        }

        if (!eulaAccepted) {
            setError(
                "You must accept the EULA before submitting."
            );
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const result = await api(
                "submitForm",
                {
                    token,
                    data: JSON.stringify({
                        realName: realName.trim(),
                        email: email.trim(),
                        phone: phone.trim(),
                        eulaAccepted: true
                    })
                }
            );

            if (result?.error) {
                throw new Error(result.error);
            }

            setSubmitted(true);
        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="server-page">
                <h1>Server Registration</h1>
                <p>Loading registration...</p>
            </div>
        );
    }

    if (error && !valid) {
        return (
            <div className="server-page">
                <h1>Server Registration</h1>
                <p className="server-error">
                    {error}
                </p>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="server-page">
                <h1>Registration Submitted</h1>

                <p>
                    Your registration information has been
                    submitted.
                </p>

                <p>
                    An administrator will review your
                    registration.
                </p>
            </div>
        );
    }

    return (
        <div className="server-page">
            <h1>Server Registration</h1>

            <p>
                Complete the following form to request
                access to the Minecraft server.
            </p>

            {username && (
                <p className="server-username">
                    Registering as{" "}
                    <strong>{username}</strong>
                </p>
            )}

            {error && (
                <p className="server-error">
                    {error}
                </p>
            )}

            <form
                className="server-form"
                onSubmit={submit}
            >
                <label>
                    Real Name
                    <input
                        type="text"
                        value={realName}
                        onChange={event =>
                            setRealName(
                                event.target.value
                            )
                        }
                        required
                    />
                </label>

                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={event =>
                            setEmail(
                                event.target.value
                            )
                        }
                    />
                </label>

                <label>
                    Phone
                    <input
                        type="tel"
                        value={phone}
                        onChange={event =>
                            setPhone(
                                event.target.value
                            )
                        }
                    />
                </label>

                <label className="server-consent">
                    <input
                        type="checkbox"
                        checked={eulaAccepted}
                        onChange={event =>
                            setEulaAccepted(
                                event.target.checked
                            )
                        }
                    />

                    <span>
                        I have read and agree to the{" "}
                        <a href="/server/eula/">
                            server EULA and rules
                        </a>
                        .
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={submitting}
                >
                    {submitting
                        ? "Submitting..."
                        : "Submit Registration"}
                </button>
            </form>
        </div>
    );
}

export default new Page({
    title: "Server Registration",
    description: "Register for the Minecraft server.",
    theme: "default",
    component: Forms
});