
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Page from "#/build/Page.js";
import { api } from "./api/api.js";
import "./server.css";

export function Forms() {
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const token = params.get("token") ?? "";

    const [challenge, setChallenge] = useState(null);
    const [realName, setRealName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [eulaAccepted, setEulaAccepted] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadChallenge() {
            setLoading(true);
            setError("");
            setChallenge(null);

            if (!token) {
                setError(
                    "This page requires a registration link from the Minecraft server."
                );
                setLoading(false);
                return;
            }

            try {
                const result = await api.getEntry(token);

                if (!result || !result.username) {
                    throw new Error("The registration link is invalid or has expired.");
                }

                if (!cancelled) {
                    setChallenge(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load registration."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadChallenge();

        return () => {
            cancelled = true;
        };
    }, [token]);

    async function handleSubmit(event) {
        event.preventDefault();

        if (submitting || submitted) {
            return;
        }

        setError("");

        const normalizedName = realName.trim();
        const normalizedEmail = email.trim();
        const normalizedPhone = phone.trim();

        if (normalizedName.length < 2) {
            setError("Enter your real name using at least 2 characters.");
            return;
        }

        if (!normalizedEmail && !normalizedPhone) {
            setError("Enter either an email address or a phone number.");
            return;
        }

        if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setError("Enter a valid email address.");
            return;
        }

        if (!eulaAccepted) {
            setError("You must accept the Minecraft EULA before submitting.");
            return;
        }

        setSubmitting(true);

        try {
            await api.submitChallengeApplication(token, {
                realName: normalizedName,
                email: normalizedEmail,
                phone: normalizedPhone,
                eulaAccepted,
            });

            setSubmitted(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Registration could not be submitted. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="server-registration">
            <div className="registration-shell">
                <header className="registration-header">
                    <div className="registration-brand">
                        <span className="registration-brand-icon" aria-hidden="true">
                            <svg
                                viewBox="0 0 48 48"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M8 8H40V40H8V8Z"
                                    fill="currentColor"
                                    opacity=".16"
                                />
                                <path
                                    d="M8 8H40V40H8V8Z"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M16 16H22V22H16V16ZM26 16H32V22H26V16ZM16 26H22V32H16V26ZM26 26H32V32H26V26Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </span>

                        <div>
                            <p className="registration-eyebrow">SERVER ACCESS</p>
                            <p className="registration-brand-name">PixelRunner</p>
                        </div>
                    </div>

                    <span className="registration-secure-label">
                        <span className="registration-status-dot" />
                        Registration portal
                    </span>
                </header>

                <section className="registration-card">
                    <div className="registration-card-heading">
                        <div className="registration-step">PLAYER REGISTRATION</div>

                        <h1>
                            Your next
                            <br />
                            <span>adventure starts here.</span>
                        </h1>

                        <p className="registration-intro">
                            Complete your registration to request access to the
                            PixelRunner Minecraft server.
                        </p>
                    </div>

                    {loading && (
                        <div className="registration-loading" role="status">
                            <span className="registration-spinner" />
                            <div>
                                <strong>Verifying your link</strong>
                                <p>Checking your registration with the server...</p>
                            </div>
                        </div>
                    )}

                    {!loading && error && !challenge && (
                        <section
                            role="alert"
                            className="registration-message registration-message-error"
                        >
                            <span className="registration-message-icon" aria-hidden="true">
                                !
                            </span>
                            <div>
                                <h2>Registration unavailable</h2>
                                <p>{error}</p>
                                <p>
                                    Return to Minecraft and request a new registration
                                    link if necessary.
                                </p>
                            </div>
                        </section>
                    )}

                    {!loading && challenge && submitted && (
                        <section
                            className="registration-success-panel"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="registration-success-icon" aria-hidden="true">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </div>

                            <p className="registration-step">SUBMISSION COMPLETE</p>
                            <h2>Application received.</h2>
                            <p>
                                Your registration has been submitted for review. An
                                administrator must approve it before you can access
                                normal gameplay.
                            </p>

                            <div className="registration-player-summary">
                                <span>Minecraft username</span>
                                <strong>{challenge.username}</strong>
                            </div>

                            <div className="registration-pending">
                                <span className="registration-status-dot" />
                                Awaiting administrator review
                            </div>

                            <p className="registration-footnote">
                                You can close this page and return to Minecraft.
                            </p>
                        </section>
                    )}

                    {!loading && challenge && !submitted && (
                        <>
                            <section
                                className="registration-warning"
                                aria-label="Approval requirements"
                            >
                                <span
                                    className="registration-warning-icon"
                                    aria-hidden="true"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M12 9v4" />
                                        <path d="M12 17h.01" />
                                        <path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" />
                                    </svg>
                                </span>

                                <div>
                                    <strong>Approval is required</strong>
                                    <p>
                                        Submitting this form does not grant immediate
                                        access. You must remain in quarantine until an
                                        administrator approves your registration.
                                    </p>
                                </div>
                            </section>

                            <section
                                className="registration-identity"
                                aria-label="Minecraft account"
                            >
                                <div className="registration-avatar" aria-hidden="true">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="5" y="3" width="14" height="18" rx="2" />
                                        <path d="M9 8h2v2H9zM13 8h2v2h-2zM9 13h2v2H9zM13 13h2v2h-2z" />
                                    </svg>
                                </div>

                                <div className="registration-identity-details">
                                    <span>Registering Minecraft account</span>
                                    <strong>{challenge.username}</strong>
                                </div>

                                <span className="registration-edition">
                                    {challenge.edition === "bedrock" ? "Bedrock" : "Java"}
                                </span>
                            </section>

                            <form className="registration-form" onSubmit={handleSubmit}>
                                <div className="registration-form-heading">
                                    <h2>Your information</h2>
                                    <p>
                                        Provide your details so the server team can
                                        identify your application.
                                    </p>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="realName">
                                        Real name <span className="required-marker">*</span>
                                    </label>
                                    <input
                                        id="realName"
                                        name="realName"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Enter your real name"
                                        minLength={2}
                                        maxLength={100}
                                        value={realName}
                                        onChange={(event) =>
                                            setRealName(event.target.value)
                                        }
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="registration-contact-grid">
                                    <div className="form-field">
                                        <label htmlFor="email">
                                            Email address
                                            <span className="optional-label">OPTIONAL</span>
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            maxLength={254}
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(event.target.value)
                                            }
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="phone">
                                            Phone number
                                            <span className="optional-label">OPTIONAL</span>
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            placeholder="Your phone number"
                                            maxLength={40}
                                            value={phone}
                                            onChange={(event) =>
                                                setPhone(event.target.value)
                                            }
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                <p className="form-hint">
                                    At least one contact method is required. You do not
                                    need to provide both.
                                </p>

                                <div className="registration-divider" />

                                <div className="registration-eula">
                                    <input
                                        id="eulaAccepted"
                                        name="eulaAccepted"
                                        type="checkbox"
                                        checked={eulaAccepted}
                                        onChange={(event) =>
                                            setEulaAccepted(event.target.checked)
                                        }
                                        required
                                        disabled={submitting}
                                    />

                                    <label htmlFor="eulaAccepted">
                                        I have read and agree to the{" "}
                                        <a
                                            href="https://www.minecraft.net/eula"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Minecraft End User License Agreement
                                        </a>
                                        .
                                    </label>
                                </div>

                                {error && (
                                    <div
                                        className="registration-message registration-message-error"
                                        role="alert"
                                    >
                                        <span
                                            className="registration-message-icon"
                                            aria-hidden="true"
                                        >
                                            !
                                        </span>
                                        <p>{error}</p>
                                    </div>
                                )}

                                <button
                                    className="registration-submit"
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="registration-button-spinner" />
                                            Submitting application...
                                        </>
                                    ) : (
                                        <>
                                            Submit registration
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M5 12h14" />
                                                <path d="m12 5 7 7-7 7" />
                                            </svg>
                                        </>
                                    )}
                                </button>

                                <p className="registration-privacy-note">
                                    Your information is submitted securely to the
                                    registration service and is used for server access
                                    administration.
                                </p>
                            </form>
                        </>
                    )}
                </section>

                <footer className="registration-footer">
                    <span>PIXELRUNNER</span>
                    <span>Official server registration</span>
                </footer>
            </div>
        </main>
    );
}

export default new Page({
    title: "Minecraft Server Registration",
    description: "Register for access to the PixelRunner Minecraft server.",
    theme: "base",
    component: Forms,
});
