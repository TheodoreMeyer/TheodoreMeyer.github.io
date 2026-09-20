import { useState } from "react";
import Page from "#/build/Page.js";
import { api } from "#/api/api.js";
import "./form.css";

function getToken() {
    return new URLSearchParams(
        window.location.search
    ).get("token");
}

function RegistrationForm() {
    const token = getToken();

    const [realName, setRealName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [eulaAccepted, setEulaAccepted] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    if (!token || !/^\d{8}$/.test(token)) {
        return (
            <div className="registration-form">
                <h2>Invalid Registration Link</h2>
                <p>
                    This registration link is missing or invalid.
                </p>
            </div>
        );
    }

    async function submit(event) {
        event.preventDefault();

        if (!realName.trim()) {
            setError("Please enter your real name.");
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
                "You must accept the EULA to register."
            );
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const result = await api(
                "submitRegistration",
                {
                    token,
                    realName: realName.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    eulaAccepted: "true"
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

    if (submitted) {
        return (
            <div className="registration-form">
                <h2>Registration Submitted</h2>

                <p>
                    Your registration request has been
                    submitted for administrator review.
                </p>

                <p>
                    You may now return to Minecraft.
                </p>
            </div>
        );
    }

    return (
        <div className="registration-form">
            <h2>Server Registration</h2>

            <p>
                Complete this form to request access to
                the server.
            </p>

            {error && (
                <p className="registration-error">
                    {error}
                </p>
            )}

            <form onSubmit={submit}>
                <label>
                    Real Name
                    <input
                        type="text"
                        value={realName}
                        onChange={event =>
                            setRealName(event.target.value)
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
                            setEmail(event.target.value)
                        }
                    />
                </label>

                <label>
                    Phone
                    <input
                        type="tel"
                        value={phone}
                        onChange={event =>
                            setPhone(event.target.value)
                        }
                    />
                </label>

                <label className="registration-checkbox">
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
                        I accept the Minecraft EULA and
                        agree to the server rules.
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
    description: "Register to join the Minecraft server.",
    theme: "default",
    component: RegistrationForm
});