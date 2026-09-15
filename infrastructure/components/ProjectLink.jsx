export default function ProjectLink({
                                        name,
                                        href,
                                        description
                                    }) {
    return (
        <a href={href}>
            <strong>{name}</strong>

            {description && (
                <span>{description}</span>
            )}
        </a>
    );
}