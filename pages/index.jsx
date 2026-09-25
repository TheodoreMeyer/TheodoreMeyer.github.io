import Page from "#/build/Page.js";

import "./home.css";

export default new Page({
    title: "Theodore Meyer",
    description: "Theo's public website.",

    component: function Home() {
        return (
            <>
                <h1>
                    Hi there, I'm Theodore Meyer.
                </h1>

                <p>
                    I'm a quick learner just starting
                    his journey.
                </p>

                <hr />

                <h2>About Me</h2>

                <ul>
                    <li>
                        I am a HighSchool student who
                        likes learning as much as he can...
                    </li>

                    <li>
                        My hobbies are: Taekwondo,
                        Programming (as you can see)
                        and a bit more.
                    </li>
                </ul>

                <h2>What I'm up to</h2>

                <ul>
                    <li>
                        I'm currently learning Java,
                        HTML, JavaScript, and Python.
                    </li>

                    <li>
                        I'm currently working on
                        SimpleVoice-Geyser.
                        <ul>
                            <li>
                                This helps bridge Bedrock
                                and Java voice chat through
                                a browser page.
                            </li>
                        </ul>
                    </li>
                </ul>

                <h2>GitHub Statistics</h2>

                <p>
                    Here are some of my stats:
                </p>

                <div className="github-stats">
                    <img
                        src="https://github-readme-stats-fast.vercel.app/api?username=theodoremeyer&show_icons=true"
                        height="140"
                        alt="GitHub statistics"
                    />

                    <img
                        src="https://github-readme-stats-fast.vercel.app/api/streak?username=theodoremeyer"
                        height="140"
                        alt="GitHub streak statistics"
                    />
                </div>

                <div className="callout note">
                    <strong>NOTE</strong>

                    <p>
                        I am usually unavailable to respond
                        on <strong>Mondays, Wednesdays, and
                        Fridays</strong>.
                    </p>
                </div>
            </>
        );
    }
});