import {
    Link
} from "react-router-dom";

import "./Header.css";

export default function Header() {
    return (
        <header
            className="site-header"
            role="banner"
        >
            <div className="wrapper">
                <Link
                    className="site-title"
                    to="/"
                >
                    Theo Meyer
                </Link>

                <nav className="site-nav">
                    <Link to="/about/">
                        About
                    </Link>

                    <Link to="/projects/">
                        Projects
                    </Link>
                </nav>
            </div>
        </header>
    );
}