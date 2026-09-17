import {
    useNavigate
} from "react-router-dom";

const styles = `
.not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
}

.not-found-card {
    width: 100%;
    max-width: 480px;
    padding: 2rem;
    text-align: center;

    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-large);
    box-shadow: var(--shadow);
}

.not-found-card h1 {
    margin-bottom: 0.75rem;
}

.not-found-card p {
    color: var(--muted);
    margin-bottom: 1.5rem;
}

.not-found-actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.not-found-actions button {
    min-width: 100px;
}
`;

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <>
            <style>{styles}</style>

            <div className="not-found">
                <div className="not-found-card">
                    <h1>404 - Not Found</h1>

                    <p>
                        The page you are looking for does not exist.
                    </p>

                    <div className="not-found-actions">
                        <button
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </button>

                        <button
                            onClick={() => navigate("/")}
                        >
                            Home
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}