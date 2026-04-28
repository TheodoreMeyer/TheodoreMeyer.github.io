/* =========================
   HIGHLIGHT ENGINE (SHARED LOGIC)
   ========================= */


/* =========================
   GENERATE GROUPS
   ========================= */

function generateGroups() {
    const output = document.getElementById("results-content");
    if (!output) return;

    const names = shuffle(getNames("student-names"));
    const mode = document.getElementById("group-mode").value;
    const value = Number(document.getElementById("group-value").value);

    const groups = [];

    // Build groups
    if (mode === "size") {
        for (let i = 0; i < names.length; i += value) {
            groups.push(names.slice(i, i + value));
        }
    } else {
        for (let i = 0; i < value; i++) {
            groups.push([]);
        }

        names.forEach((name, i) => {
            groups[i % value].push(name);
        });
    }

    output.innerHTML = "";

    // Render groups
    groups.forEach((group, i) => {
        const card = document.createElement("div");
        card.className = "group-card";

        // Highlight the entire card based on all members
        applyHighlights(card, group);

        const title = document.createElement("strong");
        title.textContent = `Group ${i + 1}`;
        card.appendChild(title);

        card.appendChild(document.createElement("br"));

        group.forEach(name => {
            const el = document.createElement("div");
            el.textContent = name;

            card.appendChild(el);
        });

        output.appendChild(card);
    });

    document.getElementById("results-title").textContent = "Groups";
    document.getElementById("app-view").classList.add("hidden");
    document.getElementById("results-view").classList.remove("hidden");
}

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("generate-groups")
        ?.addEventListener("click", generateGroups);
});

/* =========================
   UTILITIES
   ========================= */

function shuffle(a) {
    return [...a].sort(() => Math.random() - 0.5);
}

function getNames(id) {
    return (document.getElementById(id)?.value || "")
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean);
}