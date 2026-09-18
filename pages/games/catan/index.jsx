import { useState } from "react";

import Page from "#/build/Page.js";

import { TRACKS } from "./definitions.js";

import "./catan.css";

const STORAGE_KEY = "catan-cnk";
const SECTIONS_KEY = "catan-sections";

const QUESTS = {
    fish: {
        name: "Fish",
        label: "Fish Caught",
        capstone: "Best Fisher",
        max: 7,
        vp: {
            0: 0,
            2: 1,
            5: 2,
            7: 3
        }
    },

    spice: {
        name: "Spice",
        label: "Spice Returned",
        capstone: "Best Spice Merchant",
        max: 6,
        vp: {
            0: 0,
            2: 1,
            4: 2,
            6: 3
        }
    },

    pirates: {
        name: "Pirates",
        label: "Pirate Points",
        capstone: "Greatest Pirate Scourge",
        max: 7,
        vp: {
            0: 0,
            2: 1,
            5: 2,
            7: 3
        }
    }
};

function createPlayer(name) {
    return {
        name,
        science: 0,
        politics: 0,
        trade: 0,
        fish: 0,
        spice: 0,
        pirates: 0
    };
}

function loadData() {
    if (typeof localStorage === "undefined") {
        return {
            players: [
                createPlayer("Player 1")
            ]
        };
    }

    try {
        const stored =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (stored) {
            const data =
                JSON.parse(stored);

            if (
                Array.isArray(data.players) &&
                data.players.length > 0
            ) {
                return data;
            }
        }
    } catch {
        // Use default data.
    }

    return {
        players: [
            createPlayer("Player 1")
        ]
    };
}

function loadSections() {
    if (typeof localStorage === "undefined") {
        return {
            improvements: true,
            quests: true
        };
    }

    try {
        const stored =
            localStorage.getItem(
                SECTIONS_KEY
            );

        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Use defaults.
    }

    return {
        improvements: true,
        quests: true
    };
}

function getUnlockedBenefits(
    track,
    level
) {
    const benefits = [];

    for (
        let i = 1;
        i <= level;
        i++
    ) {
        benefits.push(
            ...track.levels[i].benefits
        );
    }

    return [
        ...new Set(benefits)
    ];
}

function getQuestVictoryPoints(
    quest,
    amount
) {
    const thresholds =
        Object.entries(quest.vp)
            .sort(
                ([a], [b]) =>
                    Number(a) - Number(b)
            );

    let points = 0;

    for (
        const [threshold, value]
        of thresholds
        ) {
        if (
            amount >= Number(threshold)
        ) {
            points = value;
        }
    }

    return points;
}

function PlayerTabs({
                        players,
                        selectedPlayer,
                        onSelect
                    }) {
    return (
        <div id="player-tabs">
            {players.map(
                (player, index) => (
                    <button
                        key={player.name}
                        type="button"
                        className={
                            index === selectedPlayer
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            onSelect(index)
                        }
                    >
                        {player.name}
                    </button>
                )
            )}
        </div>
    );
}

function ImprovementCard({
                             trackKey,
                             track,
                             player,
                             onChange
                         }) {
    const level =
        player[trackKey];

    const definition =
        track.levels[level];

    const nextDefinition =
        level < 5
            ? track.levels[level + 1]
            : null;

    const benefits =
        getUnlockedBenefits(
            track,
            level
        );

    const colorName =
        track.color
            .charAt(0)
            .toUpperCase() +
        track.color.slice(1);

    return (
        <div
            className={`card ${trackKey}`}
        >
            <h2>
                {track.name}
            </h2>

            <p>
                Current Level:{" "}
                {level}
            </p>

            <p>
                Current Upgrade:{" "}
                {definition.title}
            </p>

            <p>
                Next Upgrade:{" "}
                {nextDefinition
                    ? nextDefinition.title
                    : "Maximum Level Reached"}
            </p>

            <p>
                Upgrade Cost:{" "}
                {level === 5
                    ? "Maximum Level Reached"
                    : `${level + 1} ${track.commodity}`}
            </p>

            <div className="counter">
                <button
                    type="button"
                    onClick={() =>
                        onChange(
                            trackKey,
                            Math.max(
                                0,
                                level - 1
                            )
                        )
                    }
                    disabled={level === 0}
                >
                    -
                </button>

                <span>
                    {level}
                </span>

                <button
                    type="button"
                    onClick={() =>
                        onChange(
                            trackKey,
                            Math.min(
                                5,
                                level + 1
                            )
                        )
                    }
                    disabled={level === 5}
                >
                    +
                </button>
            </div>

            <h3>
                Progress Cards
            </h3>

            {level === 0 ? (
                <p>
                    None
                </p>
            ) : (
                <>
                    <p className="muted">
                        Get {colorName}{" "}
                        progress card when:
                    </p>

                    <ul>
                        <li>
                            {colorName} castle
                            rolled on Event Die
                        </li>

                        <li>
                            Red Die is{" "}
                            {Array.from(
                                {
                                    length:
                                    definition.progressMax
                                },
                                (_, index) =>
                                    index + 1
                            ).join(", ")}
                        </li>
                    </ul>
                </>
            )}

            <h3>
                Special Abilities
            </h3>

            {benefits.length === 0 ? (
                <p>
                    None
                </p>
            ) : (
                <ul>
                    {benefits.map(
                        benefit => (
                            <li
                                key={benefit}
                            >
                                {benefit}
                            </li>
                        )
                    )}
                </ul>
            )}
        </div>
    );
}

function QuestCard({
                       questKey,
                       quest,
                       player,
                       onChange
                   }) {
    const amount =
        player[questKey];

    const points =
        getQuestVictoryPoints(
            quest,
            amount
        );

    const capstone =
        amount >= quest.max
            ? quest.capstone
            : "Not Eligible";

    return (
        <div className="card">
            <h2>
                {quest.name}
            </h2>

            <p>
                {quest.label}:{" "}
                {amount}
            </p>

            <p>
                Victory Points:{" "}
                {points}
            </p>

            <p>
                Capstone:{" "}
                {capstone}
            </p>

            <div className="counter">
                <button
                    type="button"
                    onClick={() =>
                        onChange(
                            questKey,
                            Math.max(
                                0,
                                amount - 1
                            )
                        )
                    }
                    disabled={amount === 0}
                >
                    -
                </button>

                <span>
                    {amount}
                </span>

                <button
                    type="button"
                    onClick={() =>
                        onChange(
                            questKey,
                            Math.min(
                                quest.max,
                                amount + 1
                            )
                        )
                    }
                    disabled={
                        amount === quest.max
                    }
                >
                    +
                </button>
            </div>
        </div>
    );
}

function CatanTracker() {
    const [data, setData] =
        useState(loadData);

    const [selectedPlayer, setSelectedPlayer] =
        useState(0);

    const [sections, setSections] =
        useState(loadSections);

    const player =
        data.players[selectedPlayer];

    function saveData(nextData) {
        setData(nextData);

        if (
            typeof localStorage !==
            "undefined"
        ) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(nextData)
            );
        }
    }

    function updatePlayer(
        key,
        value
    ) {
        const players =
            data.players.map(
                (currentPlayer, index) =>
                    index === selectedPlayer
                        ? {
                            ...currentPlayer,
                            [key]: value
                        }
                        : currentPlayer
            );

        saveData({
            ...data,
            players
        });
    }

    function addPlayer() {
        const name =
            prompt("Player Name")?.trim();

        if (!name) {
            return;
        }

        if (
            data.players.some(
                player =>
                    player.name.toLowerCase() ===
                    name.toLowerCase()
            )
        ) {
            alert(
                `Player "${name}" already exists.`
            );

            return;
        }

        saveData({
            ...data,
            players: [
                ...data.players,
                createPlayer(name)
            ]
        });
    }

    function removePlayer() {
        const name =
            prompt(
                "Enter player name to remove:"
            )?.trim();

        if (!name) {
            return;
        }

        const index =
            data.players.findIndex(
                player =>
                    player.name.toLowerCase() ===
                    name.toLowerCase()
            );

        if (index === -1) {
            alert(
                `Player "${name}" was not found.`
            );

            return;
        }

        if (
            !confirm(
                `Remove ${name}?`
            )
        ) {
            return;
        }

        const players =
            data.players.filter(
                (_, playerIndex) =>
                    playerIndex !== index
            );

        if (players.length === 0) {
            players.push(
                createPlayer("Player 1")
            );
        }

        saveData({
            ...data,
            players
        });

        setSelectedPlayer(
            Math.min(
                selectedPlayer,
                players.length - 1
            )
        );
    }

    function toggleSection(
        section
    ) {
        const next = {
            ...sections,
            [section]:
                !sections[section]
        };

        setSections(next);

        if (
            typeof localStorage !==
            "undefined"
        ) {
            localStorage.setItem(
                SECTIONS_KEY,
                JSON.stringify(next)
            );
        }
    }

    return (
        <main className="page catan-page">
            <div className="card controls-card">
                <PlayerTabs
                    players={data.players}
                    selectedPlayer={
                        selectedPlayer
                    }
                    onSelect={
                        setSelectedPlayer
                    }
                />

                <div className="header-actions">
                    <button
                        type="button"
                        onClick={addPlayer}
                    >
                        Add Player
                    </button>

                    <button
                        type="button"
                        className="danger"
                        onClick={
                            removePlayer
                        }
                    >
                        Remove Player
                    </button>
                </div>
            </div>

            <h1>
                {player.name}
            </h1>

            <hr />

            <h2
                className="section-header"
                onClick={() =>
                    toggleSection(
                        "improvements"
                    )
                }
            >
                {sections.improvements
                    ? "▼"
                    : "▶"}{" "}
                City Improvements
            </h2>

            {sections.improvements && (
                <div className="grid">
                    {Object.entries(
                        TRACKS
                    ).map(
                        ([
                             key,
                             track
                         ]) => (
                            <ImprovementCard
                                key={key}
                                trackKey={key}
                                track={track}
                                player={player}
                                onChange={
                                    updatePlayer
                                }
                            />
                        )
                    )}
                </div>
            )}

            <hr />

            <h2
                className="section-header"
                onClick={() =>
                    toggleSection(
                        "quests"
                    )
                }
            >
                {sections.quests
                    ? "▼"
                    : "▶"}{" "}
                Quests
            </h2>

            {sections.quests && (
                <div className="grid">
                    {Object.entries(
                        QUESTS
                    ).map(
                        ([
                             key,
                             quest
                         ]) => (
                            <QuestCard
                                key={key}
                                questKey={key}
                                quest={quest}
                                player={player}
                                onChange={
                                    updatePlayer
                                }
                            />
                        )
                    )}
                </div>
            )}
        </main>
    );
}

export default new Page({
    title:
        "Catan Cities & Knights",
    description:
        "Catan Cities & Knights player tracker.",
    theme: "default",
    component:
    CatanTracker
});