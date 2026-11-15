
import { useLocation } from "react-router-dom";

import Page from "#/build/Page.js";
import Link from "#/components/Link.jsx";

import "./Sidebar.css";

const PROJECTS = [
    {
        title: "Simple Voice Geyser",
        url: "/projects/simplevoicegeyser/"
    }
];

const PROJECT_DOCS = import.meta.glob(
    "./**/*.md",
    {
        eager: true
    }
);

function getProjectDocs(project) {
    const prefix = `/projects/${project}/`;

    return Object.entries(PROJECT_DOCS)
        .map(([, module]) => {
            const page = module.default;

            if (!(page instanceof Page)) {
                return null;
            }

            if (!page.path.startsWith(prefix)) {
                return null;
            }

            return page;
        })
        .filter(Boolean);
}

function getDocPath(page, project) {
    const prefix = `/projects/${project}/`;

    return page.path
        .replace(prefix, "")
        .replace(/^\/|\/$/g, "");
}

function buildTree(pages, project) {
    const nodes = new Map();

    pages.forEach(page => {
        const path = getDocPath(page, project);

        nodes.set(path, {
            page,
            path,
            parent: null,
            children: []
        });
    });

    pages.forEach(page => {
        const path = getDocPath(page, project);

        if (path === "") {
            return;
        }

        const parts = path.split("/");
        parts.pop();

        const parentPath = parts.join("/");

        const node = nodes.get(path);
        const parent = nodes.get(parentPath);

        if (node && parent) {
            node.parent = parent;
            parent.children.push(node);
        }
    });

    nodes.forEach(node => {
        node.children.sort((a, b) =>
            a.page.title.localeCompare(b.page.title)
        );
    });

    return nodes.get("");
}

function isActiveBranch(node, currentPath) {
    if (!node) {
        return false;
    }

    if (node.page.path === currentPath) {
        return true;
    }

    return node.children.some(child =>
        isActiveBranch(child, currentPath)
    );
}

function DocsTree({
                      node,
                      currentPath,
                      depth = 0
                  }) {
    if (!node) {
        return null;
    }

    const active = node.page.path === currentPath;

    const expanded = isActiveBranch(
        node,
        currentPath
    );

    const hasChildren = node.children.length > 0;

    return (
        <li
            className={
                depth === 0
                    ? "sidebar-section"
                    : "sidebar-subsection"
            }
        >
            <Link
                href={node.page.path}
                className={[
                    "sidebar-link",
                    depth === 0
                        ? "sidebar-section-title"
                        : "sidebar-subsection-title",
                    active ? "active" : "",
                    hasChildren ? "has-children" : ""
                ].filter(Boolean).join(" ")}
                aria-current={
                    active ? "page" : undefined
                }
            >
                <span className="sidebar-link-text">
                    {node.page.title}
                </span>

                {/*
                {hasChildren && (
                    <span
                        className={`sidebar-chevron${expanded ? " expanded" : ""}`}
                        aria-hidden="true"
                    />
                )}
                */}
            </Link>

            {expanded && hasChildren && (
                <ul className="sidebar-subnav">
                    {node.children.map(child => (
                        <DocsTree
                            key={child.path}
                            node={child}
                            currentPath={currentPath}
                            depth={depth + 1}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

function ProjectSidebar({ project }) {
    const { pathname: currentPath } = useLocation();

    const pages = getProjectDocs(project);

    const root = buildTree(pages, project);

    const projectInfo = PROJECTS.find(
        item => item.url === `/projects/${project}/`
    );

    const title = projectInfo?.title || project;

    const projectPath = `/projects/${project}/`;

    const overviewActive = currentPath === projectPath;

    return (
        <aside
            className="project-sidebar"
            aria-label={`${title} documentation`}
        >
            <div className="sidebar-header">
                <Link
                    href="/projects/"
                    className="sidebar-back"
                >
                    Projects
                </Link>

                <div className="sidebar-project-title">
                    {title}
                </div>
            </div>

            <nav aria-label={`${title} documentation navigation`}>
                <ul className="sidebar-nav">
                    <li className="sidebar-overview">
                        <Link
                            href={projectPath}
                            className={
                                `sidebar-link sidebar-overview-link${overviewActive ? " active" : ""}`
                            }
                            aria-current={
                                overviewActive ? "page" : undefined
                            }
                        >
                            Overview
                        </Link>
                    </li>

                    {root?.children.map(node => (
                        <DocsTree
                            key={node.path}
                            node={node}
                            currentPath={currentPath}
                        />
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

function ProjectsSidebar() {
    const { pathname: currentPath } = useLocation();

    return (
        <aside
            className="project-sidebar"
            aria-label="Projects"
        >
            <div className="sidebar-header">
                <Link
                    href="/projects/"
                    className={
                        `sidebar-title${currentPath === "/projects/" ? " active" : ""}`
                    }
                    aria-current={
                        currentPath === "/projects/"
                            ? "page"
                            : undefined
                    }
                >
                    Projects
                </Link>
            </div>

            <ul className="sidebar-nav">
                {PROJECTS.map(project => {
                    const active = currentPath === project.url;

                    return (
                        <li key={project.url}>
                            <Link
                                href={project.url}
                                className={
                                    `sidebar-link${active ? " active" : ""}`
                                }
                                aria-current={
                                    active ? "page" : undefined
                                }
                            >
                                {project.title}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}

export default function Sidebar({
                                    project = null
                                }) {
    if (project) {
        return (
            <ProjectSidebar project={project} />
        );
    }

    return (
        <ProjectsSidebar />
    );
}
