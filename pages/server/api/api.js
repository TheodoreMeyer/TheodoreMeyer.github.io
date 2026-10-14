const API_BASE_URL =
    "https://registration-cloudflare.pr-registration.workers.dev";

async function request(path, options = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...options.headers,
            },
            cache: "no-store",
        });
    } catch {
        throw new Error(
            "Could not reach the registration service. Please try again."
        );
    }

    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error("The registration service returned an invalid response.");
    }

    if (!response.ok || result.success !== true) {
        const messages = {
            challenge_invalid_or_expired:
                "This registration link is invalid, expired, or has already been used.",
            application_already_exists:
                "An application already exists for this Minecraft account.",
            invalid_real_name:
                "Enter your real name, using between 2 and 100 characters.",
            email_or_phone_required:
                "Enter either an email address or a phone number.",
            invalid_email:
                "Enter a valid email address.",
            invalid_phone:
                "Enter a valid phone number.",
            eula_required:
                "You must accept the EULA before submitting.",
            contact_field_too_long:
                "Your email address or phone number is too long.",
        };

        throw new Error(
            messages[result.error] ??
            result.error ??
            "The registration request failed."
        );
    }

    return result;
}

export const api = {
    async getEntry(token) {
        if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
            throw new Error("The registration link is missing or invalid.");
        }

        const params = new URLSearchParams({ token });

        return request(`/api/entry?${params.toString()}`);
    },

    async submitChallengeApplication(token, data) {
        if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
            throw new Error("The registration link is missing or invalid.");
        }

        return request(
            `/api/challenges/${encodeURIComponent(token)}/submit`,
            {
                method: "POST",
                body: JSON.stringify({
                    realName: data.realName,
                    email: data.email,
                    phone: data.phone,
                    eulaAccepted: data.eulaAccepted === true,
                }),
            }
        );
    },
};