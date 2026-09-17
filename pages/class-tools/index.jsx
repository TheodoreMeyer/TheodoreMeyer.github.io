import Page from "#/build/Page.js";
import Link from "#/components/Link.jsx";

import "./index.css";

export default new Page({
    title: "Class Tools Hub",

    component: function ClassTools() {
        return (
            <>
                <header className="card class-tools-header">
                    <h1>Class Tools</h1>

                    <p>
                        Quick access hub for classroom utilities
                    </p>
                </header>

                <div className="tools-grid">
                    <div className="card">
                        <Link href="/class-tools/chart/">
                            Classroom Randomizer
                        </Link>

                        <div className="tool-description">
                            Seating charts, group generator,
                            and roster tools
                        </div>
                    </div>

                    <div className="card">
                        <Link href="/class-tools/wheel/">
                            Spin da wheel
                        </Link>

                        <div className="tool-description">
                            Create charts or winners from a wheel.
                        </div>
                    </div>

                    <div className="card">
                        <Link href="/class-tools/timer/">
                            Long timer
                        </Link>

                        <div className="tool-description">
                            A simple, full-screen timer for
                            classroom use.
                        </div>
                    </div>
                </div>
            </>
        );
    }
});