import {
    useEffect
} from "react";

import Header from "../Header.jsx";
import Footer from "../Footer.jsx";
import Sidebar from "../../pages/projects/Sidebar.jsx";

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
        <div className={`layout theme-${page.theme}`}>
            <Header />

            <main className="page">
                {page.project ? (
                    <div className="project-wrapper">
                        <Sidebar
                            project={page.project}
                        />

                        <article className="content-wrapper">
                            {children}
                        </article>
                    </div>
                ) : (
                    <div className="page-content">
                        {children}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}