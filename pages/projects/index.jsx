import Page from "#/build/Page.js";

import Sidebar from "./Sidebar.jsx";
import "./index.css";

function Projects() {
    return (
        <div className="projects-page">
            <div className="project-wrapper">
                <Sidebar />

                <article className="content-wrapper">
                    <h1>
                        My Projects
                    </h1>

                    <p>
                        This is a list of my current
                        projects that are publicly
                        available.
                    </p>

                    <h2>
                        Simple Voice Geyser
                    </h2>

                    <ul>
                        <li>
                            Simple Voice Geyser is a
                            lightweight Bukkit plugin
                            that lets Bedrock players
                            on Geyser servers use
                            Simple Voice Chat, even
                            though they cannot install
                            client-side mods.
                        </li>

                        <li>
                            It is made for servers that
                            want both Java and Bedrock
                            players to be able to use
                            proximity voice chat with
                            no extra setup for players.
                        </li>

                        <li>
                            Find more at{" "}
                            <a href="/projects/simplevoicegeyser/">
                                SVG Overview
                            </a>.
                        </li>
                    </ul>
                </article>
            </div>
        </div>
    );
}

export default new Page({
    title: "Projects",
    description:
        "A list of my publicly available projects.",
    theme: "base",
    component: Projects
});