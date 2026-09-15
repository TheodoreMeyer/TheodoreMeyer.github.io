import {
    useEffect
} from "react";

export default function PageLayout({
                                       page,
                                       children
                                   }) {
    useEffect(() => {
        document.title =
            page.title || "Theodore Meyer";

        let description =
            document.querySelector(
                'meta[name="description"]'
            );

        if (!description) {
            description =
                document.createElement("meta");

            description.name =
                "description";

            document.head.appendChild(
                description
            );
        }

        description.content =
            page.description || "";
    }, [
        page.title,
        page.description
    ]);

    return (
        <>
            <header>
                <a href="/">
                    Theodore Meyer
                </a>
            </header>

            <main>
                {children}
            </main>

            <footer>
                Theodore Meyer
            </footer>
        </>
    );
}