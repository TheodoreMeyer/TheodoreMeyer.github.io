import { useEffect, useRef, useState } from "react";

import Page from "#/build/Page.js";

import "./timer.css";

function formatTime(seconds) {
    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function Timer() {
    const [minutes, setMinutes] =
        useState(5);

    const [seconds, setSeconds] =
        useState(0);

    const [totalSeconds, setTotalSeconds] =
        useState(300);

    const [remainingSeconds, setRemainingSeconds] =
        useState(300);

    const [isRunning, setIsRunning] =
        useState(false);

    const [showTimer, setShowTimer] =
        useState(false);

    const intervalRef =
        useRef(null);

    useEffect(() => {
        return () => {
            clearInterval(
                intervalRef.current
            );
        };
    }, []);

    function stopTimer() {
        clearInterval(
            intervalRef.current
        );

        intervalRef.current =
            null;

        setIsRunning(false);
    }

    function startTimer() {
        if (
            isRunning ||
            remainingSeconds <= 0
        ) {
            return;
        }

        setIsRunning(true);

        intervalRef.current =
            setInterval(() => {
                setRemainingSeconds(
                    current => {
                        const next =
                            current - 1;

                        if (next <= 0) {
                            clearInterval(
                                intervalRef.current
                            );

                            intervalRef.current =
                                null;

                            setIsRunning(false);

                            alert("Time's up!");

                            return 0;
                        }

                        return next;
                    }
                );
            }, 1000);
    }

    function toggleTimer() {
        if (isRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    }

    function resetTimer() {
        stopTimer();

        setRemainingSeconds(
            totalSeconds
        );
    }

    function showSetupScreen() {
        resetTimer();
        setShowTimer(false);
    }

    function beginTimer() {
        const safeMinutes =
            Math.max(
                0,
                Math.min(
                    999,
                    parseInt(minutes, 10) || 0
                )
            );

        const safeSeconds =
            Math.max(
                0,
                Math.min(
                    59,
                    parseInt(seconds, 10) || 0
                )
            );

        const nextTotal =
            safeMinutes * 60 +
            safeSeconds;

        if (nextTotal <= 0) {
            return;
        }

        stopTimer();

        setTotalSeconds(
            nextTotal
        );

        setRemainingSeconds(
            nextTotal
        );

        setShowTimer(true);
    }

    if (!showTimer) {
        return (
            <section className="timer-page">
                <div className="timer-container card">
                    <header className="timer-header">
                        <h1>
                            Classroom Timer
                        </h1>

                        <p>
                            Set your timer, then begin.
                        </p>
                    </header>

                    <div className="time-grid">
                        <div className="input-group">
                            <label htmlFor="minutesInput">
                                Minutes
                            </label>

                            <input
                                id="minutesInput"
                                type="number"
                                min="0"
                                max="999"
                                value={minutes}
                                onChange={event =>
                                    setMinutes(
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="secondsInput">
                                Seconds
                            </label>

                            <input
                                id="secondsInput"
                                type="number"
                                min="0"
                                max="59"
                                value={seconds}
                                onChange={event =>
                                    setSeconds(
                                        event.target.value
                                    )
                                }
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={beginTimer}
                    >
                        Start Timer
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="timer-page">
            <div className="timer-container card">
                <div className="timer-display">
                    {formatTime(
                        remainingSeconds
                    )}
                </div>

                <div className="controls">
                    <button
                        type="button"
                        onClick={showSetupScreen}
                    >
                        Back
                    </button>

                    <button
                        type="button"
                        onClick={toggleTimer}
                    >
                        {isRunning
                            ? "Pause"
                            : "Start"}
                    </button>

                    <button
                        type="button"
                        className="danger"
                        onClick={resetTimer}
                    >
                        Reset
                    </button>
                </div>
            </div>
        </section>
    );
}

export default new Page({
    title: "Classroom Timer",
    theme: "base",
    description:
        "A simple classroom countdown timer.",
    component: Timer
});