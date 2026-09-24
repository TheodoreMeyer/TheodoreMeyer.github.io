import Page from "#/build/Page.js";
import "./server.css";

function Server() {
    return (
        <div className="server-page">
            <h1>Server</h1>

            <p>
                This page contains information and tools
                for the Minecraft server.
            </p>

            <div className="server-links">
                <a href="/server/rules/">
                    EULA
                </a>

                <a href="/server/forms/">
                    Registration Form
                </a>
            </div>
        </div>
    );
}

export default new Page({
    title: "Server",
    description: "Minecraft server information.",
    theme: "default",
    component: Server
});