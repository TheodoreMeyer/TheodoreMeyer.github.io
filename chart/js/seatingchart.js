let seatLayout = [];

function buildGrid() {
    const rows = Number(document.getElementById("rows").value);
    const cols = Number(document.getElementById("columns").value);

    seatLayout = Array.from({ length: rows }, () =>
        Array(cols).fill(true)
    );

    renderBuilder();
}

function renderBuilder() {
    const grid = document.getElementById("seat-builder");
    if (!grid) return;

    grid.innerHTML = "";
    grid.style.gridTemplateColumns =
        `repeat(${seatLayout[0].length}, 1fr)`;

    seatLayout.forEach((row, r) => {
        row.forEach((on, c) => {
            const btn = document.createElement("button");
            btn.className = "seat-cell" + (on ? "" : " disabled");
            btn.textContent = on ? "active" : "disabled";

            btn.onclick = () => {
                seatLayout[r][c] = !seatLayout[r][c];
                renderBuilder();
            };

            grid.appendChild(btn);
        });
    });
}

function generateSeating() {
    const output = document.getElementById("results-content");
    if (!output) return;

    const names = getNames("seating-names");

    const seats = [];
    seatLayout.forEach((r, i) =>
        r.forEach((on, j) => {
            if (on) seats.push([i, j]);
        })
    );

    const shuffled = shuffle(seats);
    const map = new Map();

    names.forEach((n, i) => {
        const s = shuffled[i];
        map.set(`${s[0]}-${s[1]}`, n);
    });

    output.innerHTML = "";
    output.style.gridTemplateColumns =
        `repeat(${seatLayout[0].length}, 1fr)`;

    seatLayout.forEach((row, r) => {
        row.forEach((on, c) => {
            const div = document.createElement("div");
            div.className = "output-seat";

            div.textContent = on
                ? (map.get(`${r}-${c}`) || "")
                : "—";

            output.appendChild(div);
        });
    });

    document.getElementById("results-view").classList.remove("hidden");
    document.getElementById("app-view").classList.add("hidden");
    document.getElementById("results-title").textContent = "Seating Chart";
}

function shuffle(a) {
    return [...a].sort(() => Math.random() - 0.5);
}

function getNames(id) {
    return (document.getElementById(id)?.value || "")
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("build-grid")?.addEventListener("click", buildGrid);
    document.getElementById("generate-seating")?.addEventListener("click", generateSeating);

    buildGrid();
});