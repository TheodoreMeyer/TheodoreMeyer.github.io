function generateGroups() {
    const output = document.getElementById("results-content");
    if (!output) return;

    const names = shuffle(getNames("group-names"));
    const mode = document.getElementById("group-mode").value;
    const value = Number(document.getElementById("group-value").value);

    const groups = [];

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

    groups.forEach((g, i) => {
        const div = document.createElement("div");
        div.className = "group-card";
        div.innerHTML = `<strong>Group ${i + 1}</strong><br>${g.join("<br>")}`;
        output.appendChild(div);
    });

    document.getElementById("results-view").classList.remove("hidden");
    document.getElementById("app-view").classList.add("hidden");
    document.getElementById("results-title").textContent = "Groups";
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("generate-groups")?.addEventListener("click", generateGroups);
});

function shuffle(a) {
    return [...a].sort(() => Math.random() - 0.5);
}

function getNames(id) {
    return (document.getElementById(id)?.value || "")
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean);
}