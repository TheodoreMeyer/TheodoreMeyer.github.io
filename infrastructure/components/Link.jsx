import {
    Link as RouterLink
} from "react-router-dom";

export default function Link({
                                 href,
                                 children,
                                 ...props
                             }) {
    const internal =
        href?.startsWith("/") &&
        !href.startsWith("//");

    if (!internal) {
        return (
            <a
                href={href}
                {...props}
            >
                {children}
            </a>
        );
    }

    return (
        <RouterLink
            to={href}
            viewTransition
            {...props}
        >
            {children}
        </RouterLink>
    );
}