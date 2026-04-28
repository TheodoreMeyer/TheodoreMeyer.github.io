let seatLayout = [];
let seatAssignments = new Map();
let selectedSeat = null;

/* =========================
   NAME HIGHLIGHT RULES
   ========================= */

const highlightRules = [
    {
        test: (name) => (name || "").toLowerCase().includes("theo"),
        bg: "rgba(37, 99, 235, 0.06)",
        border: "rgba(37, 99, 235, 0.18)"
    },
    {
        test: (name) => {
            const n = (name || "").toLowerCase();
            return n.includes("eli") || n.includes("jonathan");
        },
        bg: "rgba(34, 197, 94, 0.06)",
        border: "rgba(34, 197, 94, 0.18)"
    }
];

/* =========================
   APPLY HIGHLIGHTS (SCALABLE)
   ========================= */

function applyHighlights(el, text) {
    const values = Array.isArray(text) ? text : [text];
    const matched = [];

    for (const rule of highlightRules) {
        if (values.some(value => rule.test(value))) {
            matched.push(rule);
        }
    }

    if (matched.length === 0) {
        return;
    }

    if (matched.length === 1) {
        const rule = matched[0];
        el.style.background = rule.bg;
        el.style.borderColor = rule.border;
        return;
    }

    const colors = matched
        .map(rule => rule.bg.replace("0.06", "0.10"))
        .join(", ");

    el.style.background = `linear-gradient(135deg, ${colors})`;
    el.style.borderColor = matched[0].border;
}

/* =========================
   GRID BUILDING
   ========================= */

function buildGrid() {
    const rows = Number(document.getElementById("rows").value);
    const cols = Number(document.getElementById("columns").value);

    seatLayout = Array.from({ length: rows }, () =>
        Array(cols).fill(true)
    );

    seatAssignments = new Map();
    selectedSeat = null;

    renderBuilder();
}

/* =========================
   SEAT EDITOR GRID
   ========================= */

function renderBuilder() {
    const grid = document.getElementById("seat-builder");
    if (!grid) return;

    grid.innerHTML = "";
    grid.style.gridTemplateColumns = `repeat(${seatLayout[0].length}, 1fr)`;

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

/* =========================
   GENERATE SEATING
   ========================= */

function generateSeating() {
    const output = document.getElementById("results-content");
    if (!output) return;

    const names = getNames("student-names");

    const seats = [];
    seatLayout.forEach((row, r) =>
        row.forEach((on, c) => {
            if (on) seats.push([r, c]);
        })
    );

    const shuffled = shuffle(seats);
    seatAssignments = new Map();

    names.forEach((n, i) => {
        const s = shuffled[i];
        if (!s) return;
        seatAssignments.set(`${s[0]}-${s[1]}`, n);
    });

    selectedSeat = null;

    renderSeating();

    document.getElementById("results-view").classList.remove("hidden");
    document.getElementById("app-view").classList.add("hidden");
    document.getElementById("results-title").textContent = "Seating Chart";
}

/* =========================
   RENDER SEATING
   ========================= */

function renderSeating() {
    const output = document.getElementById("results-content");
    if (!output) return;

    output.innerHTML = "";
    output.style.gridTemplateColumns = `repeat(${seatLayout[0].length}, 1fr)`;

    seatLayout.forEach((row, r) => {
        row.forEach((on, c) => {
            const div = document.createElement("div");
            div.className = "output-seat";

            const key = `${r}-${c}`;
            const name = on ? (seatAssignments.get(key) || "") : "—";

            div.textContent = name;

            if (on && name) {
                applyHighlights(div, name);
            }

            div.addEventListener("click", () => {
                handleSeatClick(r, c);
            });

            if (selectedSeat && selectedSeat.r === r && selectedSeat.c === c) {
                div.style.outline = "2px solid #2563eb";
                div.style.outlineOffset = "2px";
            }

            output.appendChild(div);
        });
    });
}

/* =========================
   SWAP LOGIC
   ========================= */

function handleSeatClick(r, c) {
    if (!seatLayout[r][c]) return;

    if (!selectedSeat) {
        selectedSeat = { r, c };
        renderSeating();
        return;
    }

    const prev = selectedSeat;

    if (prev.r === r && prev.c === c) {
        selectedSeat = null;
        renderSeating();
        return;
    }

    const keyA = `${prev.r}-${prev.c}`;
    const keyB = `${r}-${c}`;

    const temp = seatAssignments.get(keyA);
    seatAssignments.set(keyA, seatAssignments.get(keyB));
    seatAssignments.set(keyB, temp);

    selectedSeat = null;
    renderSeating();
}

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

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("build-grid")?.addEventListener("click", buildGrid);
    document.getElementById("generate-seating")?.addEventListener("click", generateSeating);

    buildGrid();
});