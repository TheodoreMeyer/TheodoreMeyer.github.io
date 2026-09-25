import {
    useLocation
} from "react-router-dom";

import Page from "#/build/Page.js";

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
    const prefix =
        `/projects/${project}/`;

    return Object.entries(
        PROJECT_DOCS
    )
        .map(([file, module]) => {
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
    const prefix =
        `/projects/${project}/`;

    return page.path
        .replace(prefix, "")
        .replace(/^\/|\/$/g, "");
}

function buildTree(pages, project) {
    const nodes = new Map();

    pages.forEach(page => {
        const path =
            getDocPath(page, project);

        nodes.set(path, {
            page,
            path,
            parent: null,
            children: []
        });
    });

    pages.forEach(page => {
        const path =
            getDocPath(page, project);

        if (path === "") {
            return;
        }

        const parts =
            path.split("/");

        parts.pop();

        const parentPath = parts.join("/");

        const node =
            nodes.get(path);

        const parent =
            nodes.get(parentPath);

        if (node && parent) {
            node.parent = parent;
            parent.children.push(node);
        }
    });

    nodes.forEach(node => {
        node.children.sort(
            (a, b) =>
                a.page.title.localeCompare(
                    b.page.title
                )
        );
    });

    return nodes.get("");
}

function DocsTree({
                      node,
                      currentPath,
                      depth = 0
                  }) {
    if (!node?.children.length) {
        return null;
    }

    return (
        <ul
            className={
                depth > 0
                    ? "sidebar-subnav"
                    : ""
            }
        >
            {node.children.map(child => (
                <li key={child.path}>
                    <a
                        href={child.page.path}
                        className={
                            child.page.path ===
                            currentPath
                                ? "active"
                                : ""
                        }
                    >
                        {child.page.title}
                    </a>

                    <DocsTree
                        node={child}
                        currentPath={
                            currentPath
                        }
                        depth={
                            depth + 1
                        }
                    />
                </li>
            ))}
        </ul>
    );
}

function ProjectSidebar({
                            project
                        }) {
    const { pathname: currentPath } =
        useLocation();

    const pages =
        getProjectDocs(project);

    const root =
        buildTree(
            pages,
            project
        );

    const projectInfo =
        PROJECTS.find(
            item =>
                item.url ===
                `/projects/${project}/`
        );

    const title =
        projectInfo?.title ||
        project;

    return (
        <aside className="project-sidebar">
            <div className="sidebar-header">
                <a
                    href={`/projects/${project}/`}
                    className={
                        `sidebar-title${
                            currentPath ===
                            `/projects/${project}/`
                                ? " active"
                                : ""
                        }`
                    }
                >
                    {title}
                </a>
            </div>

            <DocsTree
                node={root}
                currentPath={
                    currentPath
                }
            />
        </aside>
    );
}

function ProjectsSidebar() {
    const { pathname: currentPath } =
        useLocation();

    return (
        <aside className="project-sidebar">
            <div className="sidebar-header">
                <a
                    href="/projects/"
                    className={
                        `sidebar-title${
                            currentPath ===
                            "/projects/"
                                ? " active"
                                : ""
                        }`
                    }
                >
                    Projects
                </a>
            </div>

            <ul>
                {PROJECTS.map(project => (
                    <li
                        key={
                            project.url
                        }
                    >
                        <a
                            href={
                                project.url
                            }
                            className={
                                currentPath ===
                                project.url
                                    ? "active"
                                    : ""
                            }
                        >
                            {project.title}
                        </a>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default function Sidebar({
                                    project = null
                                }) {
    if (project) {
        return (
            <ProjectSidebar
                project={project}
            />
        );
    }

    return (
        <ProjectsSidebar />
    );
}