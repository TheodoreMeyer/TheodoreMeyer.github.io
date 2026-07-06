document.addEventListener("DOMContentLoaded", () => {

    const dataEl = document.getElementById("docs-sidebar-data");
    if (!dataEl) return;

    const data = JSON.parse(dataEl.textContent);

    const sidebar = document.getElementById("project-sidebar");
    if (!sidebar) return;

    sidebar.classList.add("project-sidebar");

    const current = location.pathname.replace(/\/$/, "");

    ////////////////////////////////////////////////////////////
    // Create nodes
    ////////////////////////////////////////////////////////////

    const nodes = new Map();

    data.forEach(doc => {

        nodes.set(doc.path, {
            title: doc.title,
            url: doc.url,
            path: doc.path,
            parent: null,
            children: [],
            expanded: false
        });

    });

    ////////////////////////////////////////////////////////////
    // Determine parents
    ////////////////////////////////////////////////////////////

    data.forEach(doc => {

        if (doc.path === "index.md")
            return;

        let parentPath;

        if (doc.path.endsWith("/index.md")) {

            // Folder page

            const dir = doc.path.substring(0, doc.path.length - "/index.md".length);
            const slash = dir.lastIndexOf("/");

            if (slash === -1) {
                parentPath = "index.md";
            } else {
                parentPath = dir.substring(0, slash) + "/index.md";
            }

        } else {

            // Regular page

            const slash = doc.path.lastIndexOf("/");

            if (slash === -1) {
                parentPath = "index.md";
            } else {
                parentPath = doc.path.substring(0, slash) + "/index.md";
            }

        }

        const node = nodes.get(doc.path);
        const parent = nodes.get(parentPath);

        if (node && parent) {
            node.parent = parent;
            parent.children.push(node);
        }

    });

    ////////////////////////////////////////////////////////////
    // Sort alphabetically
    ////////////////////////////////////////////////////////////

    nodes.forEach(node => {

        node.children.sort((a, b) =>
            a.title.localeCompare(b.title)
        );

    });

    ////////////////////////////////////////////////////////////
    // Find active page
    ////////////////////////////////////////////////////////////

    let active = null;

    nodes.forEach(node => {

        if (node.url.replace(/\/$/, "") === current)
            active = node;

    });

    ////////////////////////////////////////////////////////////
    // Expand parents
    ////////////////////////////////////////////////////////////

    let walk = active;

    while (walk) {
        walk.expanded = true;
        walk = walk.parent;
    }

    ////////////////////////////////////////////////////////////
    // Render
    ////////////////////////////////////////////////////////////

    function renderChildren(parent, depth = 0) {

        if (!parent.children.length)
            return null;

        const ul = document.createElement("ul");

        if (depth > 0)
            ul.className = "sidebar-subnav";

        if (!parent.expanded)
            ul.style.display = "none";

        for (const child of parent.children) {

            const li = document.createElement("li");

            const link = document.createElement("a");
            link.href = child.url;
            link.textContent = child.title;

            if (child.url.replace(/\/$/, "") === current)
                link.classList.add("active");

            // Indent based on nesting depth
            link.style.paddingLeft = `${0.6 + depth * 1.25}rem`;

            li.appendChild(link);

            const sub = renderChildren(child, depth + 1);

            if (sub)
                li.appendChild(sub);

            ul.appendChild(li);

        }

        return ul;

    }

    ////////////////////////////////////////////////////////////
    // Build sidebar
    ////////////////////////////////////////////////////////////

    const root = nodes.get("index.md");
    if (!root) return;

    const title = document.createElement("h3");

    const home = document.createElement("a");
    home.href = root.url;
    home.textContent = root.title;

    if (root.url.replace(/\/$/, "") === current)
        home.classList.add("active");

    title.appendChild(home);
    sidebar.appendChild(title);

    const tree = renderChildren(root, 0);

    if (tree)
        sidebar.appendChild(tree);

});