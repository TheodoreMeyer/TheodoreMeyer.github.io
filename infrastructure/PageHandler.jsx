import {
    Routes,
    Route
} from "react-router-dom";

import PageLayout from "./PageLayout.jsx";

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
        </Routes>
    );
}