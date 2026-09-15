import Page from "../infrastructure/Page.js";
import ProjectLink from "../infrastructure/components/ProjectLink.jsx";

export default new Page({
    title: "Home",
    description: "Theodore Meyer's website.",

    component: function Home() {
        return (
            <>
                <h1>Home</h1>

                <p>
                    Welcome to my website.
                </p>

                <ProjectLink
                    name="Test"
                    href="/test/"
                    description="Test Markdown page"
                />
            </>
        );
    }
});