const entries = new Map();

export async function testApi(action, params = {}) {
    switch (action) {
        case "getEntry":
            return getEntry(params.token);

        case "submitForm":
            return submitForm(
                params.token,
                params.data
            );

        case "createEntry":
            return createEntry(
                params.token,
                params.username
            );

        case "deleteEntry":
            return deleteEntry(params.token);

        case "sendEmail":
            return sendEmail(
                params.to,
                params.content
            );

        default:
            return {
                error: "invalid_action"
            };
    }
}

function createEntry(token, username) {
    if (!token) {
        return {
            error: "missing_token"
        };
    }

    if (!username) {
        return {
            error: "missing_username"
        };
    }

    if (entries.has(token)) {
        return {
            error: "entry_exists"
        };
    }

    entries.set(token, {
        username,
        data: {
            realName: "",
            email: "",
            phone: "",
            eulaAccepted: false
        },
        created: new Date().toISOString()
    });

    console.log(
        "[TEST API] Created entry:",
        token,
        username
    );

    return {
        success: true,
        token,
        username
    };
}

function getEntry(token) {
    if (!token) {
        return {
            error: "missing_token"
        };
    }

    // Allow any 8-digit token during frontend testing.
    if (!entries.has(token)) {
        entries.set(token, {
            username: "TestPlayer",
            data: {
                realName: "",
                email: "",
                phone: "",
                eulaAccepted: false
            },
            created: new Date().toISOString()
        });
    }

    const entry = entries.get(token);

    return {
        found: true,
        token,
        username: entry.username,
        data: entry.data,
        created: entry.created
    };
}

function submitForm(token, data) {
    if (!token) {
        return {
            error: "missing_token"
        };
    }

    if (!entries.has(token)) {
        return {
            error: "entry_not_found"
        };
    }

    const parsed =
        typeof data === "string"
            ? JSON.parse(data)
            : data;

    const entry = entries.get(token);

    entry.data = parsed;

    console.log(
        "[TEST API] Submitted form:",
        token,
        parsed
    );

    return {
        success: true,
        token
    };
}

function deleteEntry(token) {
    if (!entries.has(token)) {
        return {
            success: false,
            error: "entry_not_found"
        };
    }

    entries.delete(token);

    console.log(
        "[TEST API] Deleted entry:",
        token
    );

    return {
        success: true,
        token
    };
}

function sendEmail(to, content) {
    console.log(
        "[TEST API] Email",
        {
            to,
            content
        }
    );

    return {
        success: true
    };
}