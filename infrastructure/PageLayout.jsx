export default function PageLayout({
                                       page,
                                       children
                                   }) {
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