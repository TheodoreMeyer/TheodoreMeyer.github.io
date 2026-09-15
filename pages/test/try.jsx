import Page from "../../infrastructure/Page.js";

export default new Page({
    title: "JSX Test",
    description: "Testing JSX page support.",

    component: function Try() {
        return (
            <>
                <h1>JSX Test</h1>

                <p>
                    This page is written in JSX.
                </p>

                <button
                    onClick={() => {
                        alert("JavaScript works.");
                    }}
                >
                    Test JavaScript
                </button>
            </>
        );
    }
});