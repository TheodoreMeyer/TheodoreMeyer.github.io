import {
    Routes,
    Route
} from "react-router-dom";

import PageLayout from "./PageLayout.jsx";
import NotFound from "./../NotFound.jsx";

export default function PageHandler({
                                        pages
                                    }) {
    return (
        <Routes>
            {pages.map(page => {
                const Component =
                    page.component;

                return (
                    <Route
                        key={page.path}
                        path={page.path}
                        element={
                            <PageLayout page={page}>
                                <Component />
                            </PageLayout>
                        }
                    />
                );
            })}

            <Route
                path="*"
                element={
                    <PageLayout
                        page={{
                            title: "404 - Not Found",
                            description:
                                "The requested page could not be found."
                        }}
                    >
                        <NotFound />
                    </PageLayout>
                }
            />
        </Routes>
    );
}