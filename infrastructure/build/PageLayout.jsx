import {
    useEffect
} from "react";
import Header from "../Header.jsx";
import Footer from "../Footer.jsx";

export default function PageLayout({
                                       page,
                                       children
                                   }) {
    useEffect(() => {
        document.title =
            page.title || "Theodore Meyer";

        const description =
            document.querySelector(
                'meta[name="description"]'
            );

        if (description) {
            description.setAttribute(
                "content",
                page.description || ""
            );
        }
    }, [
        page.title,
        page.description
    ]);

    return (
        <div className={page.theme ? `layout theme-${page.theme}` : ""}>
            <Header />

            <main className="page">
                <div className="page-content">
                    {children}
                </div>
            </main>

            <Footer />

        </div>
    );
}