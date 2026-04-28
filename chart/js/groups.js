/* =========================
   HIGHLIGHT ENGINE (SHARED LOGIC)
   ========================= */

function applyHighlights(el, text) {
    const matched = [];

    for (const rule of highlightRules) {
        if (rule.test(text)) {
            matched.push(rule);
        }
    }

    if (matched.length === 0) return;

    // if only one match → simple styling
    if (matched.length === 1) {
        const r = matched[0];
        el.style.background = r.bg;
        el.style.borderColor = r.border;
        return;
    }

    // multiple matches → diagonal split effect
    const colors = matched.map(r => r.bg.replace("0.06", "0.10")).join(", ");

    el.style.background = `linear-gradient(135deg, ${colors})`;
    el.style.borderColor = matched[0].border;
}
/* =========================
   GENERATE GROUPS
   ========================= */

function generateGroups() {
    const output = document.getElementById("results-content");
    if (!output) return;

    const names = shuffle(getNames("group-names"));
    const mode = document.getElementById("group-mode").value;
    const value = Number(document.getElementById("group-value").value);

    const groups = [];

    // build groups
    if (mode === "size") {
        for (let i = 0; i < names.length; i += value) {
            groups.push(names.slice(i, i + value));
        }
    } else {
        for (let i = 0; i < value; i++) groups.push([]);

        names.forEach((n, i) => {
            groups[i % value].push(n);
        });
    }

    output.innerHTML = "";

    // render
    groups.forEach((group, i) => {
        const card = document.createElement("div");
        card.className = "group-card";

        const title = document.createElement("strong");
        title.textContent = `Group ${i + 1}`;
        card.appendChild(title);

        card.appendChild(document.createElement("br"));

        group.forEach(name => {
            const el = document.createElement("div");
            el.textContent = name;

            applyHighlights(el, name);

            card.appendChild(el);
        });

        output.appendChild(card);
    });

    document.getElementById("results-view").classList.remove("hidden");
    document.getElementById("app-view").classList.add("hidden");
    document.getElementById("results-title").textContent = "Groups";
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