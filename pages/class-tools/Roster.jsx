import {useRef, useState} from "react";

import {deleteRoster, exportRoster, getRosters, importRosterFile, saveRoster} from "./roster.js";

import "./roster.css";

export default function Roster({
                                   names,
                                   onNamesChange
                               }) {
    const [
        rosters,
        setRosters
    ] = useState(
        getRosters
    );


    const [
        selectedRoster,
        setSelectedRoster
    ] = useState("");

    const [
        rosterName,
        setRosterName
    ] = useState("");

    const [
        namesText,
        setNamesText
    ] = useState(
        names.join("\n")
    );

    const fileInputRef =
        useRef(null);

    function updateNames(
        value
    ) {
        setNamesText(
            value
        );

        const nextNames =
            value
                .split("\n")
                .map(name =>
                    name.trim()
                )
                .filter(Boolean);

        onNamesChange(
            nextNames
        );
    }

    function handleSave() {
        const name =
            rosterName.trim();

        if (!name) {
            return;
        }

        if (
            saveRoster(
                name,
                names
            )
        ) {
            setRosters(
                getRosters()
            );

            setSelectedRoster(
                name
            );

            setRosterName("");
        }
    }

    function handleLoad(
        event
    ) {
        const name =
            event.target.value;

        setSelectedRoster(
            name
        );

        if (!name) {
            return;
        }

        const roster =
            getRosters()[name];

        if (!roster) {
            return;
        }

        setNamesText(
            roster.names.join("\n")
        );

        onNamesChange(
            roster.names
        );
    }

    function handleDelete() {
        if (!selectedRoster) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete roster "${selectedRoster}"?`
            );

        if (!confirmed) {
            return;
        }

        deleteRoster(
            selectedRoster
        );

        setRosters(
            getRosters()
        );

        setSelectedRoster(
            ""
        );

        setNamesText("");

        onNamesChange([]);
    }

    function handleExport() {
        if (!selectedRoster) {
            return;
        }

        exportRoster(
            selectedRoster
        );
    }

    function openImport() {
        fileInputRef.current?.click();
    }

    async function handleImport(
        event
    ) {
        const file =
            event.target.files?.[0];

        event.target.value = "";

        if (!file) {
            return;
        }

        try {
            const roster =
                await importRosterFile(
                    file
                );

            const existing =
                getRosters()[
                    roster.Roster
                    ];

            if (
                existing &&
                !window.confirm(
                    `A roster named "${roster.Roster}" already exists. Replace it?`
                )
            ) {
                return;
            }

            saveRoster(
                roster.Roster,
                roster.names
            );

            setRosters(
                getRosters()
            );

            setSelectedRoster(
                roster.Roster
            );

            setNamesText(
                roster.names.join("\n")
            );

            onNamesChange(
                roster.names
            );
        } catch (error) {
            window.alert(
                error.message
            );
        }
    }

    return (
        <section className="roster">
            <div className="roster-header">
            <span className="eyebrow">
                ROSTER
            </span>

                <h2>
                    Student Roster
                </h2>

                <p>
                    Create, save, and reuse
                    lists of names across
                    classroom tools.
                </p>
            </div>

            <div className="roster-instructions">
                <strong>
                    How to use
                </strong>

                <ol>
                    <li>
                        Enter one name per
                        line.
                    </li>

                    <li>
                        Give the roster a
                        name and save it.
                    </li>

                    <li>
                        Select a saved
                        roster whenever you
                        need it.
                    </li>

                    <li>
                        Use Import or
                        Export to move
                        rosters between
                        devices.
                    </li>
                </ol>
            </div>

            <div className="roster-field">
                <label htmlFor="rosterSelect">
                    Saved Roster
                </label>

                <select
                    id="rosterSelect"
                    value={
                        selectedRoster
                    }
                    onChange={
                        handleLoad
                    }
                >
                    <option value="">
                        Select a roster
                    </option>

                    {Object.keys(
                        rosters
                    )
                        .sort()
                        .map(name => (
                            <option
                                key={name}
                                value={name}
                            >
                                {name}
                            </option>
                        ))}
                </select>
            </div>

            <div className="roster-field">
                <label htmlFor="rosterName">
                    Roster Name
                </label>

                <input
                    id="rosterName"
                    value={
                        rosterName
                    }
                    onChange={event =>
                        setRosterName(
                            event.target.value
                        )
                    }
                    placeholder="e.g. Period 3"
                />
            </div>

            <div className="roster-actions">
                <button
                    type="button"
                    onClick={
                        handleSave
                    }
                    disabled={
                        !rosterName.trim() ||
                        names.length === 0
                    }
                >
                    Save Roster
                </button>

                <button
                    type="button"
                    className="secondary"
                    onClick={
                        handleExport
                    }
                    disabled={
                        !selectedRoster
                    }
                >
                    Export JSON
                </button>

                <button
                    type="button"
                    className="secondary"
                    onClick={
                        openImport
                    }
                >
                    Import JSON
                </button>

                <button
                    type="button"
                    className="danger"
                    onClick={
                        handleDelete
                    }
                    disabled={
                        !selectedRoster
                    }
                >
                    Delete
                </button>
            </div>

            <input
                ref={
                    fileInputRef
                }
                type="file"
                accept=".json,application/json"
                hidden
                onChange={
                    handleImport
                }
            />

            <div className="roster-field">
                <label htmlFor="rosterNames">
                    Names
                </label>

                <textarea
                    id="rosterNames"
                    value={
                        namesText
                    }
                    onChange={event =>
                        updateNames(
                            event.target
                                .value
                        )
                    }
                    placeholder={
                        "Enter one name per line..."
                    }
                    rows={12}
                />

                <span className="roster-count">
                {names.length}{" "}
                    {names.length === 1
                        ? "name"
                        : "names"}
            </span>
            </div>
        </section>
    );


}
