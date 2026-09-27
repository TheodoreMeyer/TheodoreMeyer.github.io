import {useState} from "react";

import Page from "#/build/Page.js";

export default new Page({
    title: "Jeopardy",

    component: function Jeopardy() {
        const [gameUrl, setGameUrl] = useState("");
        const [urlInput, setUrlInput] = useState("");

        function openGame(event) {
            event.preventDefault();

            const url = urlInput.trim();

            if (!url) {
                return;
            }

            setGameUrl(url);
        }

        if (gameUrl) {
            return (
                <>
                    <iframe
                        src={gameUrl}
                        title="Jeopardy"
                        style={{
                            position: "fixed",
                            inset: 0,
                            width: "100vw",
                            height: "100vh",
                            border: "none",
                            zIndex: 9999
                        }}
                    />

                    <a
                        role="button"
                        href="#"
                        aria-label="Exit Game"
                        onClick={(event) => {
                            event.preventDefault();

                            const confirmed = window.confirm(
                                "Are you sure you want to exit?\n\n" +
                                "You may (or may not) lose your progress,\n" +
                                "and the game will probably reset."
                            );

                            if (confirmed) {
                                setGameUrl("");
                            }
                        }}
                        style={{
                            position: "fixed",
                            right: 0,
                            bottom: 0,

                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",

                            padding: "10px 10px",

                            backgroundColor: "#131844",
                            color: "#999",

                            fontWeight: "bold",
                            lineHeight: 1.25,
                            textTransform: "uppercase",

                            borderLeft: "2px solid #999",
                            borderTop: "2px solid #999",

                            marginLeft: "10px",

                            textDecoration: "none",

                            zIndex: 10000,

                            cursor: "pointer"
                        }}
                    >
                        E<br/>
                        x<br/>
                        i<br/>
                        t
                    </a>
                </>
            );
        }

        return (

            <div>

                <div className="card">
                    <a href="/class-tools/">
                        Go back to Main hub
                    </a>
                </div>

                <div className="card">
                    <h1>Jeopardy</h1>

                    <p>
                        This tool lets you open a JeopardyLabs game
                        directly inside this page.
                    </p>

                    <p>
                        Paste the URL of a JeopardyLabs game below.
                        Once opened, the game will fill the entire
                        screen so you can play it without leaving
                        this page.
                    </p>

                    <p>
                        To exit game, reload the page.
                    </p>

                    <form onSubmit={openGame}>
                        <label>
                            JeopardyLabs Game URL

                            <input
                                type="url"
                                value={urlInput}
                                onChange={(event) =>
                                    setUrlInput(event.target.value)
                                }
                                placeholder="https://jeopardylabs.com/play/..."
                                required
                            />
                        </label>

                        <button type="submit">
                            Open Game
                        </button>
                    </form>
                </div>
            </div>
        );
    }
});