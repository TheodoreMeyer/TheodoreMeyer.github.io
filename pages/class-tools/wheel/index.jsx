import {
    useEffect,
    useRef,
    useState
} from "react";

import Page from "#/build/Page.js";
import Link from "#/components/Link.jsx";

import Wheel from "./wheel.jsx";

import {
    createWinnerSystem
} from "./winner.js";

import "./wheel.css";

const WHEEL_KEY =
    "wheel_names";

const WINNER_DELAY =
    1000;

export default new Page({
    title: "Wheel System",

    component: function WheelPage() {
        const wheelRef =
            useRef(null);

        const winnerSystemRef =
            useRef(null);

        const winnerTimeoutRef =
            useRef(null);

        const namesRef =
            useRef([]);

        const [view, setView] =
            useState("setup");

        const [names, setNames] =
            useState([]);

        const [namesText, setNamesText] =
            useState("");

        const [winner, setWinner] =
            useState(null);

        const [rigWheel, setRigWheel] =
            useState(false);

        const [rigTarget, setRigTarget] =
            useState("");

        const [mode, setMode] =
            useState("winner");

        const [mappingTarget, setMappingTarget] =
            useState("");

        useEffect(() => {
            let storedNames = [];

            try {
                const stored =
                    JSON.parse(
                        localStorage.getItem(
                            WHEEL_KEY
                        )
                    );

                if (Array.isArray(stored)) {
                    storedNames = stored;
                }
            } catch {
                storedNames = [];
            }

            setNames(storedNames);
            setNamesText(
                storedNames.join("\n")
            );

            namesRef.current =
                storedNames;

            winnerSystemRef.current =
                createWinnerSystem({
                    getNames: () =>
                        namesRef.current,

                    getRotation: () =>
                        wheelRef.current?.getRotation() ??
                        0
                });

            return () => {
                if (
                    winnerTimeoutRef.current !==
                    null
                ) {
                    clearTimeout(
                        winnerTimeoutRef.current
                    );
                }

                wheelRef.current?.cleanup();

                winnerSystemRef.current =
                    null;
            };
        }, []);

        function saveNames(nextNames) {
            localStorage.setItem(
                WHEEL_KEY,
                JSON.stringify(nextNames)
            );
        }

        function handleNamesChange(event) {
            const value =
                event.target.value;

            const nextNames =
                value
                    .split("\n")
                    .map(name =>
                        name.trim()
                    )
                    .filter(Boolean);

            setNamesText(value);
            setNames(nextNames);

            namesRef.current =
                nextNames;

            saveNames(nextNames);

            setRigTarget(previous =>
                nextNames.includes(previous)
                    ? previous
                    : ""
            );

            setMappingTarget(previous =>
                nextNames.includes(previous)
                    ? previous
                    : ""
            );
        }

        function createWheelHandler() {
            const nextNames =
                namesText
                    .split("\n")
                    .map(name =>
                        name.trim()
                    )
                    .filter(Boolean);

            if (
                nextNames.length === 0
            ) {
                return;
            }

            const shuffled =
                [...nextNames];

            for (
                let i =
                    shuffled.length - 1;
                i > 0;
                i--
            ) {
                const j =
                    Math.floor(
                        Math.random() *
                        (i + 1)
                    );

                [
                    shuffled[i],
                    shuffled[j]
                ] = [
                    shuffled[j],
                    shuffled[i]
                ];
            }

            setNames(shuffled);
            setNamesText(
                shuffled.join("\n")
            );

            namesRef.current =
                shuffled;

            saveNames(shuffled);

            setWinner(null);

            wheelRef.current?.setNames(
                shuffled
            );

            setView("wheel");
        }

        function spinHandler() {
            const winnerSystem =
                winnerSystemRef.current;

            const wheel =
                wheelRef.current;

            if (
                !winnerSystem ||
                !wheel
            ) {
                return;
            }

            if (
                wheel.isSpinning()
            ) {
                return;
            }

            const selected =
                winnerSystem.chooseWinner({
                    rigged:
                    rigWheel,

                    riggedName:
                    rigTarget
                });

            if (!selected) {
                return;
            }

            const plan =
                winnerSystem.createSpinPlan(
                    selected
                );

            if (!plan) {
                return;
            }

            wheel.spin(
                plan,
                finishedPlan => {
                    if (
                        winnerTimeoutRef.current !==
                        null
                    ) {
                        clearTimeout(
                            winnerTimeoutRef.current
                        );
                    }

                    winnerTimeoutRef.current =
                        setTimeout(() => {
                            setWinner(
                                finishedPlan.winnerName
                            );

                            if (
                                mode !== "winner"
                            ) {
                                setTarget(
                                    mappingTarget
                                );
                            }
                        }, WINNER_DELAY);
                }
            );
        }

        function removeWinner() {
            if (!winner) {
                return;
            }

            const nextNames =
                names.filter(
                    name =>
                        name !== winner
                );

            setNames(nextNames);
            setNamesText(
                nextNames.join("\n")
            );

            namesRef.current =
                nextNames;

            saveNames(nextNames);

            wheelRef.current?.setNames(
                nextNames
            );

            setWinner(null);
        }

        function showSetup() {
            if (
                winnerTimeoutRef.current !==
                null
            ) {
                clearTimeout(
                    winnerTimeoutRef.current
                );

                winnerTimeoutRef.current =
                    null;
            }

            setWinner(null);
            setView("setup");
        }

        const [target, setTarget] =
            useState("");

        return (
            <>
                <section
                    className={
                        `setup-view ${
                            view !== "setup"
                                ? "hidden"
                                : ""
                        }`
                    }
                >
                    <div className="card setup-back">
                        <Link href="/class-tools/">
                            Go back to Main hub
                        </Link>
                    </div>

                    <div className="card control-panel">
                        <div className="control-panel-header">
                            <span className="eyebrow">
                                CLASS TOOLS
                            </span>

                            <h2>
                                Wheel Setup
                            </h2>

                            <p>
                                Configure the names
                                and choose how the
                                wheel should select
                                a result.
                            </p>
                        </div>

                        <div className="form-field">
                            <label htmlFor="savedRosterSelect">
                                Roster
                            </label>

                            <select id="savedRosterSelect">
                                <option>
                                    No saved roster
                                </option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="namesInput">
                                Names
                            </label>

                            <textarea
                                id="namesInput"
                                value={namesText}
                                onChange={
                                    handleNamesChange
                                }
                                placeholder={
                                    "Enter one name per line..."
                                }
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="modeSelect">
                                Mode
                            </label>

                            <select
                                id="modeSelect"
                                value={mode}
                                onChange={event =>
                                    setMode(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="winner">
                                    Winner
                                </option>

                                <option
                                    value="seat"
                                    hidden
                                    disabled
                                >
                                    Seat
                                </option>

                                <option
                                    value="group"
                                    hidden
                                    disabled
                                >
                                    Group
                                </option>
                            </select>
                        </div>

                        {mode !== "winner" && (
                            <div className="form-field">
                                <label htmlFor="targetSelect">
                                    Target
                                </label>

                                <select
                                    id="targetSelect"
                                    value={
                                        mappingTarget
                                    }
                                    onChange={event =>
                                        setMappingTarget(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Select target
                                    </option>

                                    {names.map(name => (
                                        <option
                                            key={name}
                                            value={name}
                                        >
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="rig-section">
                            <label className="rig-toggle">
                                <input
                                    type="checkbox"
                                    checked={rigWheel}
                                    onChange={event =>
                                        setRigWheel(
                                            event.target.checked
                                        )
                                    }
                                />

                                <span>
                                    Rig Wheel
                                </span>
                            </label>

                            {rigWheel && (
                                <div className="form-field">
                                    <label htmlFor="rigTargetSelect">
                                        Rigged Winner
                                    </label>

                                    <select
                                        id="rigTargetSelect"
                                        value={rigTarget}
                                        onChange={event =>
                                            setRigTarget(
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select winner
                                        </option>

                                        {names.map(name => (
                                            <option
                                                key={name}
                                                value={name}
                                            >
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <button
                            className="create-wheel"
                            onClick={
                                createWheelHandler
                            }
                        >
                            Create Wheel
                        </button>
                    </div>
                </section>

                <section
                    className={
                        `wheel-view ${
                            view !== "wheel"
                                ? "hidden"
                                : ""
                        }`
                    }
                >
                    <div className="card wheel-stage">
                        <div className="wheel-header">
                            <div>
                                <span className="eyebrow">
                                    WHEEL SYSTEM
                                </span>

                                <h2>
                                    Spin the Wheel
                                </h2>
                            </div>

                            <span className="wheel-hint">
                                Click the wheel to spin
                            </span>
                        </div>

                        <Wheel
                            ref={wheelRef}
                            names={names}
                            onClick={
                                spinHandler
                            }
                        />

                        <div className="wheel-actions">
                            <button
                                onClick={
                                    spinHandler
                                }
                            >
                                Spin
                            </button>

                            <button
                                className="secondary"
                                onClick={
                                    showSetup
                                }
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </section>

                {winner && (
                    <div className="winner-overlay">
                        <div className="winner-card">
                            <span className="eyebrow">
                                RESULT
                            </span>

                            <div className="winner-label">
                                Winner
                            </div>

                            <div className="winner-name">
                                {winner}
                            </div>

                            {target && (
                                <div className="winner-target">
                                    → {target}
                                </div>
                            )}

                            <div className="winner-actions">
                                <button
                                    className="danger"
                                    onClick={
                                        removeWinner
                                    }
                                >
                                    Remove
                                </button>

                                <button
                                    onClick={() => {
                                        setWinner(null);
                                        setTarget("");
                                    }}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
});