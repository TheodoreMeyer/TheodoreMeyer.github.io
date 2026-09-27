const STORAGE_KEY =
    "classroom_rosters";

export function getRosters() {
    if (
        typeof localStorage ===
        "undefined"
    ) {
        return {};
    }


    try {
        const stored =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                ) || "{}"
            );

        if (
            !stored ||
            typeof stored !==
            "object" ||
            Array.isArray(stored)
        ) {
            return {};
        }

        return stored;
    } catch {
        return {};
    }


}

export function saveRosters(
    rosters
) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(rosters)
    );
}

export function getRoster(
    rosterName
) {
    if (!rosterName) {
        return null;
    }


    const rosters =
        getRosters();

    return rosters[rosterName] || null;


}

export function saveRoster(
    rosterName,
    names
) {
    const name =
        rosterName.trim();


    const cleanNames =
        names
            .map(value =>
                value.trim()
            )
            .filter(Boolean);

    if (
        !name ||
        cleanNames.length === 0
    ) {
        return false;
    }

    const rosters =
        getRosters();

    rosters[name] = {
        Roster: name,
        names: cleanNames
    };

    saveRosters(rosters);

    return true;


}

export function deleteRoster(
    rosterName
) {
    if (!rosterName) {
        return false;
    }


    const rosters =
        getRosters();

    if (
        !Object.hasOwn(
            rosters,
            rosterName
        )
    ) {
        return false;
    }

    delete rosters[rosterName];

    saveRosters(rosters);

    return true;


}

export function exportRoster(
    rosterName
) {
    const roster =
        getRoster(rosterName);


    if (!roster) {
        return false;
    }

    const json =
        JSON.stringify(
            roster,
            null,
            2
        );

    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        `roster-${sanitizeFileName(
            rosterName
        )}.json`;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );

    return true;


}

export function importRosterFile(
    file
) {
    return new Promise(
        (resolve, reject) => {
            const reader =
                new FileReader();


            reader.onload = () => {
                try {
                    const roster =
                        JSON.parse(
                            reader.result
                        );

                    if (
                        !roster ||
                        typeof roster !==
                        "object" ||
                        Array.isArray(roster)
                    ) {
                        throw new Error(
                            "Invalid roster file."
                        );
                    }

                    const name =
                        typeof roster.Roster ===
                        "string"
                            ? roster.Roster.trim()
                            : "";

                    const names =
                        Array.isArray(
                            roster.names
                        )
                            ? roster.names
                                .map(value =>
                                    String(
                                        value
                                    ).trim()
                                )
                                .filter(
                                    Boolean
                                )
                            : [];

                    if (
                        !name ||
                        names.length === 0
                    ) {
                        throw new Error(
                            "Roster files must contain a Roster name and a non-empty names array."
                        );
                    }

                    resolve({
                        Roster: name,
                        names
                    });
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(
                    new Error(
                        "Could not read roster file."
                    )
                );
            };

            reader.readAsText(
                file
            );
        }
    );


}

export function sanitizeFileName(
    value
) {
    return value
        .trim()
        .replace(
            /[<>:"/\|?*\x00-\x1F]/g,
            "-"
        )
        .replace(
            /\s+/g,
            "-"
        );
}
