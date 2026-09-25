import { useState } from "react";

import Page from "#/build/Page.js";

import "./chart.css";

const STORAGE_KEY = "classroom_rosters";

function shuffle(array) {
    return [...array].sort(
        () => Math.random() - 0.5
    );
}

function getRosters() {
    if (typeof localStorage === "undefined") {
        return {};
    }
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );
    } catch {
        return {};
    }
}

function saveRosters(rosters) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(rosters)
    );
}

function getNames(text) {
    return text
        .split("\n")
        .map(name => name.trim())
        .filter(Boolean);
}

function ClassroomRandomizer() {
    const [tab, setTab] =
        useState("seating");

    const [students, setStudents] =
        useState("");

    const [rosters, setRosters] =
        useState(getRosters);

    const [selectedRoster, setSelectedRoster] =
        useState("");

    const [rosterName, setRosterName] =
        useState("");

    const [rows, setRows] =
        useState(5);

    const [columns, setColumns] =
        useState(6);

    const [seatLayout, setSeatLayout] =
        useState(() =>
            Array.from(
                { length: 5 },
                () => Array(6).fill(true)
            )
        );

    const [seatAssignments, setSeatAssignments] =
        useState(new Map());

    const [selectedSeat, setSelectedSeat] =
        useState(null);

    const [results, setResults] =
        useState(null);

    const [groupMode, setGroupMode] =
        useState("size");

    const [groupValue, setGroupValue] =
        useState(4);

    function saveRoster() {
        const name =
            rosterName.trim();

        const value =
            students.trim();

        if (!name || !value) {
            return;
        }

        const next = {
            ...rosters,
            [name]: value
        };

        saveRosters(next);

        setRosters(next);
        setRosterName("");
        setSelectedRoster(name);
    }

    function loadRoster(name) {
        setSelectedRoster(name);

        if (!name || !rosters[name]) {
            return;
        }

        setStudents(
            rosters[name]
        );
    }

    function deleteRoster() {
        const name =
            selectedRoster;

        if (!name) {
            return;
        }

        if (
            !confirm(
                `Delete roster "${name}"?\n\nThis will also clear the current student input text.`
            )
        ) {
            return;
        }

        const next = {
            ...rosters
        };

        delete next[name];

        saveRosters(next);

        setRosters(next);
        setSelectedRoster("");
        setStudents("");
    }

    function buildGrid() {
        const safeRows =
            Math.max(
                1,
                Number(rows) || 1
            );

        const safeColumns =
            Math.max(
                1,
                Number(columns) || 1
            );

        setRows(safeRows);
        setColumns(safeColumns);

        setSeatLayout(
            Array.from(
                { length: safeRows },
                () =>
                    Array(
                        safeColumns
                    ).fill(true)
            )
        );

        setSeatAssignments(
            new Map()
        );

        setSelectedSeat(null);
    }

    function toggleSeat(
        row,
        column
    ) {
        setSeatLayout(current =>
            current.map(
                (seatRow, r) =>
                    r === row
                        ? seatRow.map(
                            (enabled, c) =>
                                c === column
                                    ? !enabled
                                    : enabled
                        )
                        : seatRow
            )
        );
    }

    function generateSeating() {
        const names =
            getNames(students);

        const seats = [];

        seatLayout.forEach(
            (seatRow, row) => {
                seatRow.forEach(
                    (enabled, column) => {
                        if (enabled) {
                            seats.push([
                                row,
                                column
                            ]);
                        }
                    }
                );
            }
        );

        const shuffledSeats =
            shuffle(seats);

        const assignments =
            new Map();

        names.forEach(
            (name, index) => {
                const seat =
                    shuffledSeats[index];

                if (!seat) {
                    return;
                }

                assignments.set(
                    `${seat[0]}-${seat[1]}`,
                    name
                );
            }
        );

        setSeatAssignments(
            assignments
        );

        setSelectedSeat(null);

        setResults({
            type: "seating"
        });
    }

    function handleSeatClick(
        row,
        column
    ) {
        if (
            !seatLayout[row]?.[column]
        ) {
            return;
        }

        if (!selectedSeat) {
            setSelectedSeat({
                row,
                column
            });

            return;
        }

        if (
            selectedSeat.row === row &&
            selectedSeat.column === column
        ) {
            setSelectedSeat(null);
            return;
        }

        const keyA =
            `${selectedSeat.row}-${selectedSeat.column}`;

        const keyB =
            `${row}-${column}`;

        setSeatAssignments(
            current => {
                const next =
                    new Map(current);

                const studentA =
                    next.get(keyA);

                const studentB =
                    next.get(keyB);

                if (
                    studentA === undefined
                ) {
                    next.delete(keyB);
                } else {
                    next.set(
                        keyB,
                        studentA
                    );
                }

                if (
                    studentB === undefined
                ) {
                    next.delete(keyA);
                } else {
                    next.set(
                        keyA,
                        studentB
                    );
                }

                return next;
            }
        );

        setSelectedSeat(null);
    }

    function generateGroups() {
        const names =
            shuffle(
                getNames(students)
            );

        const value =
            Math.max(
                1,
                Number(groupValue) || 1
            );

        const groups = [];

        if (groupMode === "size") {
            for (
                let i = 0;
                i < names.length;
                i += value
            ) {
                groups.push(
                    names.slice(
                        i,
                        i + value
                    )
                );
            }
        } else {
            for (
                let i = 0;
                i < value;
                i++
            ) {
                groups.push([]);
            }

            names.forEach(
                (name, index) => {
                    groups[
                    index % value
                        ].push(name);
                }
            );
        }

        setResults({
            type: "groups",
            groups
        });
    }

    function showGenerator() {
        setResults(null);
        setSelectedSeat(null);
        setTab("seating");
    }

    function printResults() {
        window.print();
    }

    if (results) {
        const isSeating =
            results.type === "seating";

        return (
            <section className="chart-page">
                <div className="results-header">
                    <div className="results-title-block">
                        <h1>
                            {isSeating
                                ? "Seating Chart"
                                : "Groups"}
                        </h1>

                        <p className="results-subtitle">
                            {isSeating
                                ? "Click a student, then click another to swap their positions."
                                : ""}
                        </p>
                    </div>

                    <div className="results-actions">
                        <button
                            type="button"
                            onClick={printResults}
                        >
                            Print
                        </button>

                        <button
                            type="button"
                            className="secondary"
                            onClick={showGenerator}
                        >
                            Back
                        </button>
                    </div>
                </div>

                {isSeating ? (
                    <div
                        className="seating-results"
                        style={{
                            gridTemplateColumns:
                                `repeat(${seatLayout[0]?.length || 1}, 1fr)`
                        }}
                    >
                        {seatLayout.map(
                            (seatRow, row) =>
                                seatRow.map(
                                    (
                                        enabled,
                                        column
                                    ) => {
                                        const key =
                                            `${row}-${column}`;

                                        const name =
                                            enabled
                                                ? seatAssignments.get(key) || ""
                                                : "—";

                                        const selected =
                                            selectedSeat?.row === row &&
                                            selectedSeat?.column === column;

                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                className={
                                                    `output-seat` +
                                                    `${selected ? " selected" : ""}` +
                                                    `${!enabled ? " disabled" : ""}`
                                                }
                                                onClick={() =>
                                                    handleSeatClick(
                                                        row,
                                                        column
                                                    )
                                                }
                                                disabled={!enabled}
                                            >
                                                {name}
                                            </button>
                                        );
                                    }
                                )
                        )}
                    </div>
                ) : (
                    <div className="groups-results">
                        {results.groups.map(
                            (
                                group,
                                index
                            ) => (
                                <div
                                    className="group-card"
                                    key={index}
                                >
                                    <strong>
                                        Group{" "}
                                        {index + 1}
                                    </strong>

                                    {group.map(
                                        name => (
                                            <div
                                                key={name}
                                            >
                                                {name}
                                            </div>
                                        )
                                    )}
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>
        );
    }

    return (
        <section className="chart-page">
            <div className="chart-header">
                <h1>
                    Classroom Randomizer
                </h1>

                <p>
                    Seating charts and group generator
                </p>
            </div>

            <nav className="tabs">
                <button
                    type="button"
                    className={
                        `tab` +
                        `${tab === "seating" ? " active" : ""}`
                    }
                    onClick={() =>
                        setTab("seating")
                    }
                >
                    Seating
                </button>

                <button
                    type="button"
                    className={
                        `tab` +
                        `${tab === "groups" ? " active" : ""}`
                    }
                    onClick={() =>
                        setTab("groups")
                    }
                >
                    Groups
                </button>
            </nav>

            <div className="chart-card">
                <a href="/class-tools/">
                    Go back to Main hub
                </a>
            </div>

            <div className="chart-card">
                <h2>
                    Students
                </h2>

                <h3>
                    Saved Rosters
                </h3>

                <select
                    value={selectedRoster}
                    onChange={event =>
                        loadRoster(
                            event.target.value
                        )
                    }
                >
                    <option value="">
                        Select roster
                    </option>

                    {Object.keys(
                        rosters
                    ).map(name => (
                        <option
                            key={name}
                            value={name}
                        >
                            {name}
                        </option>
                    ))}
                </select>

                <input
                    value={rosterName}
                    onChange={event =>
                        setRosterName(
                            event.target.value
                        )
                    }
                    placeholder="Roster name"
                />

                <button
                    type="button"
                    onClick={saveRoster}
                >
                    Save
                </button>

                <button
                    type="button"
                    className="danger"
                    onClick={deleteRoster}
                >
                    Delete
                </button>

                <h3>
                    Add Students
                </h3>

                <p>
                    Enter one student name per line.
                </p>

                <textarea
                    value={students}
                    onChange={event =>
                        setStudents(
                            event.target.value
                        )
                    }
                />
            </div>

            {tab === "seating" ? (
                <div className="chart-card">
                    <h2>
                        Layout
                    </h2>

                    <div className="row">
                        <input
                            type="number"
                            min="1"
                            value={rows}
                            onChange={event =>
                                setRows(
                                    event.target.value
                                )
                            }
                        />

                        <input
                            type="number"
                            min="1"
                            value={columns}
                            onChange={event =>
                                setColumns(
                                    event.target.value
                                )
                            }
                        />

                        <button
                            type="button"
                            onClick={buildGrid}
                        >
                            Build
                        </button>
                    </div>

                    <div
                        className="seat-builder"
                        style={{
                            gridTemplateColumns:
                                `repeat(${seatLayout[0]?.length || 1}, 1fr)`
                        }}
                    >
                        {seatLayout.map(
                            (seatRow, row) =>
                                seatRow.map(
                                    (
                                        enabled,
                                        column
                                    ) => (
                                        <button
                                            key={
                                                `${row}-${column}`
                                            }
                                            type="button"
                                            className={
                                                `seat-cell` +
                                                `${enabled ? "" : " disabled"}`
                                            }
                                            onClick={() =>
                                                toggleSeat(
                                                    row,
                                                    column
                                                )
                                            }
                                        >
                                            {enabled
                                                ? "active"
                                                : "disabled"}
                                        </button>
                                    )
                                )
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={
                            generateSeating
                        }
                    >
                        Generate Seating
                    </button>
                </div>
            ) : (
                <div className="chart-card">
                    <h2>
                        Groups
                    </h2>

                    <select
                        value={groupMode}
                        onChange={event =>
                            setGroupMode(
                                event.target.value
                            )
                        }
                    >
                        <option value="size">
                            Groups of Size
                        </option>

                        <option value="count">
                            Number of Groups
                        </option>
                    </select>

                    <input
                        type="number"
                        min="1"
                        value={groupValue}
                        onChange={event =>
                            setGroupValue(
                                event.target.value
                            )
                        }
                    />

                    <button
                        type="button"
                        onClick={
                            generateGroups
                        }
                    >
                        Generate Groups
                    </button>
                </div>
            )}
        </section>
    );
}

export default new Page({
    title: "Classroom Randomizer",
    description:
        "Seating charts and group generator.",
    theme: "base",
    component:
    ClassroomRandomizer
});