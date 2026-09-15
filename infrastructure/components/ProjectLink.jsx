import Link from "./Link.jsx";

export default function ProjectLink({
                                        name,
                                        href,
                                        description
                                    }) {
    return (
        <Link href={href}>
            <strong>{name}</strong>

            {description && (
                <span>{description}</span>
            )}
        </Link>
    );
}