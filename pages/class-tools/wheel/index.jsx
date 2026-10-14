import {
    useEffect,
    useRef,
    useState
} from "react";

import Page from "#/build/Page.js";
import Link from "#/components/Link.jsx";

import Roster from "../Roster.jsx";
import Wheel from "./wheel.jsx";

import {
    createWinnerSystem
} from "./winner.js";

import "./wheel.css";

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

        /*
         * The complete roster being configured.
         *
         * This does not change when winners are
         * removed from the active wheel.
         */
        const [rosterNames, setRosterNames] =
            useState([]);

        /*
         * The names currently on the wheel.
         *
         * Winners can be removed from this
         * without changing the roster.
         */
        const [names, setNames] =
            useState([]);

        const [winner, setWinner] =
            useState(null);

        const [mode, setMode] =
            useState("winner");

        const [mappingTarget, setMappingTarget] =
            useState("");

        const [target, setTarget] =
            useState("");

        /*
         * Each item is either:
         *
         * ""       = Random
         * "Alice"  = fixed to Alice
         *
         * In Rigged mode, these slots are
         * resolved into a complete sequence
         * when the wheel is created.
         */
        const [wheelOrder, setWheelOrder] =
            useState([]);

        /*
         * The resolved sequence used by
         * Rigged mode.
         *
         * Example:
         *
         * Wheel Order:
         * 1. Bob
         * 2. Random
         * 3. Eli
         * 4. Random
         *
         * Resolved sequence:
         * 1. Bob
         * 2. Theo
         * 3. Eli
         * 4. Tom
         */
        const [riggedSequence, setRiggedSequence] =
            useState([]);

        /*
         * The next rigged sequence entry
         * to consume.
         */
        const [riggedIndex, setRiggedIndex] =
            useState(0);

        const [showWheelOrder, setShowWheelOrder] =
            useState(false);

        useEffect(() => {
            namesRef.current =
                names;

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

        function handleNamesChange(
            nextNames
        ) {
            setRosterNames(
                nextNames
            );

            setNames(
                nextNames
            );

            namesRef.current =
                nextNames;

            setMappingTarget(previous =>
                nextNames.includes(previous)
                    ? previous
                    : ""
            );

            setWheelOrder(
                previous =>
                    nextNames.map(
                        name => {
                            const existing =
                                previous.find(
                                    value =>
                                        value ===
                                        name
                                );

                            return existing ||
                                "";
                        }
                    )
            );
        }

        function handleOrderChange(
            index,
            value
        ) {
            setWheelOrder(
                previous => {
                    const next =
                        [...previous];

                    if (value) {
                        for (
                            let i =
                                0;
                            i <
                                next.length;
                            i++
                        ) {
                            if (
                                i !== index &&
                                next[i] === value
                            ) {
                                next[i] = "";
                            }
                        }
                    }

                    next[index] =
                        value;

                    return next;
                }
            );
        }

        function shuffle(
            values
        ) {
            const result =
                [...values];

            for (
                let i =
                    result.length - 1;
                i > 0;
                i--
            ) {
                const j =
                    Math.floor(
                        Math.random() *
                        (i + 1)
                    );

                [
                    result[i],
                    result[j]
                ] = [
                    result[j],
                    result[i]
                ];
            }

            return result;
        }

        function createWheelHandler() {
            if (
                rosterNames.length ===
                0
            ) {
                return;
            }

            let orderedNames;

            if (
                mode === "rigged"
            ) {
                const assigned =
                    wheelOrder.filter(
                        Boolean
                    );

                const remaining =
                    shuffle(
                        rosterNames.filter(
                            name =>
                                !assigned.includes(
                                    name
                                )
                        )
                    );

                let remainingIndex =
                    0;

                /*
                 * Resolve every wheel slot now.
                 *
                 * Random slots are randomized once
                 * and become part of the rigged
                 * sequence.
                 */
                orderedNames =
                    wheelOrder.map(
                        value => {
                            if (value) {
                                return value;
                            }

                            const name =
                                remaining[
                                    remainingIndex
                                ];

                            remainingIndex++;

                            return name;
                        }
                    );

                /*
                 * Safety fallback if the order
                 * array is out of sync.
                 */
                if (
                    orderedNames.length !==
                        rosterNames.length ||
                    orderedNames.some(
                        name =>
                            !name
                    )
                ) {
                    orderedNames =
                        shuffle(
                            rosterNames
                        );
                }

                /*
                 * The resolved wheel order is
                 * also the predetermined sequence.
                 */
                setRiggedSequence(
                    [...orderedNames]
                );

                setRiggedIndex(0);
            } else {
                orderedNames =
                    shuffle(
                        rosterNames
                    );

                setRiggedSequence([]);
                setRiggedIndex(0);
            }

            setNames(
                orderedNames
            );

            namesRef.current =
                orderedNames;

            setWinner(null);
            setTarget("");

            wheelRef.current?.setNames(
                orderedNames
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

            let selected =
                null;

            /*
             * During the rigged sequence, select
             * the next predetermined name.
             *
             * This is independent of whether the
             * previous winner was removed or kept.
             */
            if (
                mode === "rigged" &&
                riggedIndex <
                    riggedSequence.length
            ) {
                const riggedName =
                    riggedSequence[
                        riggedIndex
                    ];

                const currentNames =
                    namesRef.current;

                const winnerIndex =
                    currentNames.indexOf(
                        riggedName
                    );

                /*
                 * The name may have been removed
                 * from the active wheel.
                 */
                if (
                    winnerIndex >= 0
                ) {
                    selected = {
                        winnerIndex,

                        winnerName:
                            riggedName
                    };
                }

                /*
                 * Consume this rigged result
                 * regardless of whether the previous
                 * result was Continued or Removed.
                 */
                setRiggedIndex(
                    previous =>
                        previous + 1
                );
            }

            /*
             * Once the rigged sequence is exhausted,
             * selection becomes completely random.
             */
            if (!selected) {
                selected =
                    winnerSystem.chooseWinner({
                        rigged: false,
                        riggedName: ""
                    });
            }

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
                                mode !==
                                "winner"
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
                        name !==
                        winner
                );

            setNames(
                nextNames
            );

            namesRef.current =
                nextNames;

            wheelRef.current?.setNames(
                nextNames
            );

            setWinner(null);

            setMappingTarget(previous =>
                nextNames.includes(
                    previous
                )
                    ? previous
                    : ""
            );
        }

        function resetWheel() {
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

            /*
             * Completely restore the active
             * wheel from the original roster.
             */
            const resetNames =
                [...rosterNames];

            setNames(
                resetNames
            );

            namesRef.current =
                resetNames;

            wheelRef.current?.setNames(
                resetNames
            );

            /*
             * Reset all configuration state.
             */
            setWheelOrder(
                resetNames.map(
                    () => ""
                )
            );

            setRiggedSequence([]);
            setRiggedIndex(0);

            setWinner(null);
            setMappingTarget("");
            setTarget("");
            setShowWheelOrder(false);

            setView("setup");
        }

        function handleModeChange(
            value
        ) {
            setMode(value);

            if (
                value !== "rigged"
            ) {
                setShowWheelOrder(
                    false
                );
            }
        }

        return (
            <>
                <section
                    className={
                        `setup-view ${
    view !==
    "setup"
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

                        <Roster
                            names={rosterNames}
                            onNamesChange={
                                handleNamesChange
                            }
                        />

                        <div className="form-field">
                            <label htmlFor="modeSelect">
                                Mode
                            </label>

                            <select
                                id="modeSelect"
                                value={mode}
                                onChange={event =>
                                    handleModeChange(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="winner">
                                    Winner
                                </option>

                                <option value="rigged">
                                    Rigged
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

                        {mode ===
                            "rigged" &&
                            rosterNames.length >
                                0 && (
                                <div className="rig-section">
                                    <div className="form-field">
                                        <h2>
                                            Rigged Setup
                                        </h2>
                                        <label htmlFor="wheelOrder-0">
                                            Slot 1
                                        </label>

                                        <select
                                            id="wheelOrder-0"
                                            value={
                                                wheelOrder[
                                                    0
                                                ] ??
                                                ""
                                            }
                                            onChange={event =>
                                                handleOrderChange(
                                                    0,
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Random
                                            </option>

                                            {rosterNames.map(
                                                name => (
                                                    <option
                                                        key={
                                                            name
                                                        }
                                                        value={
                                                            name
                                                        }
                                                    >
                                                        {
                                                            name
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        className="wheel-order-toggle"
                                        onClick={() =>
                                            setShowWheelOrder(
                                                previous => !previous
                                            )
                                        }
                                    >
                                        <span>
                                            {showWheelOrder
                                                ? "Hide wheel order"
                                                : "Show wheel order"}
                                        </span>

                                        <span
                                            className={
                                                `wheel-order-arrow ${
                                                    showWheelOrder
                                                        ? "expanded"
                                                        : ""
                                                }`
                                            }
                                        >
                                            ▾
                                        </span>
                                    </button>

                                    {showWheelOrder && (
                                        <div>
                                            {rosterNames
                                                .slice(
                                                    1
                                                )
                                                .map(
                                                    (
                                                        name,
                                                        index
                                                    ) => {
                                                        const slot =
                                                            index +
                                                            1;

                                                        return (
                                                            <div
                                                                className="form-field"
                                                                key={`${name}-${slot}`}
                                                            >
                                                                <label
                                                                    htmlFor={`wheelOrder-${slot}`}
                                                                >
                                                                    Slot{" "}
                                                                    {slot +
                                                                        1}
                                                                </label>

                                                                <select
                                                                    id={`wheelOrder-${slot}`}
                                                                    value={
                                                                        wheelOrder[
                                                                            slot
                                                                        ] ??
                                                                        ""
                                                                    }
                                                                    onChange={event =>
                                                                        handleOrderChange(
                                                                            slot,
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Random
                                                                    </option>

                                                                    {rosterNames.map(
                                                                        option => {
                                                                            const assignedIndex =
                                                                                wheelOrder.findIndex(
                                                                                    value =>
                                                                                        value ===
                                                                                        option
                                                                                );

                                                                            if (
                                                                                assignedIndex !==
                                                                                    -1 &&
                                                                                assignedIndex !==
                                                                                    slot
                                                                            ) {
                                                                                return null;
                                                                            }

                                                                            return (
                                                                                <option
                                                                                    key={
                                                                                        option
                                                                                    }
                                                                                    value={
                                                                                        option
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        option
                                                                                    }
                                                                                </option>
                                                                            );
                                                                        }
                                                                    )}
                                                                </select>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                        </div>
                                    )}
                                </div>
                            )}

                        {mode !==
                            "winner" &&
                            mode !==
                                "rigged" && (
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
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select target
                                        </option>

                                        {rosterNames.map(
                                            name => (
                                                <option
                                                    key={
                                                        name
                                                    }
                                                    value={
                                                        name
                                                    }
                                                >
                                                    {
                                                        name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            )}

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
                            view !== "wheel" ? 
                                "hidden" : ""
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
                                    resetWheel
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
                                    →{" "}
                                    {target}
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
                                        setWinner(
                                            null
                                        );

                                        setTarget(
                                            ""
                                        );
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