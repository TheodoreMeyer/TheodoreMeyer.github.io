/* =========================
   STORAGE KEYS
   ========================= */

const STORAGE_KEY = "classroom_rosters";
const WHEEL_KEY = "wheel_names";

/* =========================
   STATE
   ========================= */

let canvas, ctx;

let namesInput;
let modeSelect;
let targetSelect;
let mappingSection;

let setupView;
let wheelView;

let winnerOverlay;
let winnerName;
let winnerTarget;

let names = [];
let angle = 0;
let spinning = false;

let currentWinner = null;

/* =========================
   VIEW CONTROL
   ========================= */

function showSetup() {
    setupView.classList.remove("hidden");
    wheelView.classList.add("hidden");
    winnerOverlay.classList.add("hidden");
}

function showWheel() {
    setupView.classList.add("hidden");
    wheelView.classList.remove("hidden");
    winnerOverlay.classList.add("hidden");
}

function showWinnerOverlay(name) {
    winnerOverlay.classList.remove("hidden");

    const mode = modeSelect.value;
    const target = targetSelect.value;

    winnerName.textContent = name;

    if (mode !== "winner" && target) {
        winnerTarget.textContent = `→ ${target}`;
    } else {
        winnerTarget.textContent = "";
    }
    styleWinnerOverlay(name);
}

function styleWinnerOverlay(winner) {
    const card = document.querySelector(".winner-card");
    if (!card) return;

    // reset old inline styles (important, or it stacks forever)
    card.style.background = "";
    card.style.borderColor = "";
    card.style.backgroundImage = "";
    card.style.color = "";
    card.style.textShadow = "";

    applyHighlights(card, winner);
}

/* =========================
   STORAGE
   ========================= */

function getRosters() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
        return {};
    }
}
/* =========================
   WHEEL DATA
   ========================= */

function loadNames() {
    names = namesInput.value
        .split("\n")
        .map(n => n.trim())
        .filter(Boolean);

    saveNames();
    drawWheel();
}

function saveNames() {
    localStorage.setItem(WHEEL_KEY, names.join("\n"));
}

function loadNamesFromStorage() {
    namesInput.value = localStorage.getItem(WHEEL_KEY) || "";
    loadNames();
}

function shuffleNames(input) {
    const arr = [...input];

    const rand = () => {
        const x = crypto.getRandomValues(new Uint32Array(1))[0];
        return x / 0xFFFFFFFF;
    };

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

/* =========================
   DRAW WHEEL
   ========================= */

function drawWheel() {
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!names.length) {
        ctx.fillStyle = "#6b7280";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("No names", radius, radius);
        return;
    }

    const slice = (Math.PI * 2) / names.length;

    const colors = [
        "#ef4444",
        "#f97316",
        "#facc15",
        "#22c55e",
        "#06b6d4",
        "#3b82f6",
        "#a855f7",
        "#ec4899"
    ];

    // small stateless jitter to avoid “same quadrant feel”
    const jitter = (names.length <= 6) ? (Math.PI / 36) : 0; // ~5°

    names.forEach((name, i) => {
        const start = angle + (i * slice) + jitter;
        const end = start + slice;

        // slice
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, start, end);
        ctx.closePath();

        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        // text
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(start + slice / 2);

        // dynamic font sizing based on slice size
        let fontSize = Math.floor(radius * slice * 0.85);
        fontSize = Math.max(9, Math.min(16, fontSize));

        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = "#fff";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        const maxWidth = radius * 0.6;

        let displayName = name;

        while (
            displayName.length > 0 &&
            ctx.measureText(displayName + "…").width > maxWidth
            ) {
            displayName = displayName.slice(0, -1);
        }

        if (displayName !== name) displayName += "…";

        ctx.fillText(displayName, radius - 10, 0);

        ctx.restore();
    });
}

/* =========================
   SPIN
   ========================= */

function spin() {
    if (spinning || !names.length) return;

    spinning = true;

    const spins = Math.random() * 8 + 10; // more rotations = more tension
    const finalAngle = angle + spins * Math.PI * 2;

    const duration = 10000; // MUCH longer spin (key change)
    const start = performance.now();
    const startAngle = angle;

    // custom "tension easing"
    function tensionEase(t) {
        // holds speed longer, then crashes into slow motion
        return 1 - Math.pow(1 - t, 8);
    }

    function animate(time) {
        const t = Math.min(1, (time - start) / duration);

        const eased = tensionEase(t);

        angle = startAngle + (finalAngle - startAngle) * eased;

        drawWheel();

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            resolveWinner();
        }
    }

    requestAnimationFrame(animate);
}

/* =========================
   WINNER LOGIC
   ========================= */
function resolveWinner() {
    const slice = (Math.PI * 2) / names.length;

    // normalize angle into [0, 2π)
    let a = angle % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;

    // pointer is at top (12 o'clock)
    const pointerAngle = (3 * Math.PI) / 2;

    // shift wheel so pointer aligns with correct slice
    const adjusted = (pointerAngle - a + Math.PI * 2) % (Math.PI * 2);

    const index = Math.floor(adjusted / slice);

    currentWinner = names[index];

    showWinnerOverlay(currentWinner);
}

/* =========================
   ACTIONS
   ========================= */

function removeWinner() {
    if (!currentWinner) return;

    names = names.filter(n => n !== currentWinner);

    currentWinner = null;

    namesInput.value = names.join("\n");
    saveNames();

    angle = 0;          // IMPORTANT reset rotation
    drawWheel();        // force sync render

    winnerOverlay.classList.add("hidden");
    showWheel();        // stay in wheel view, NOT setup
}

/* =========================
   ROSTERS
   ========================= */
function applyRoster(name) {
    const rosters = getRosters();
    const data = rosters[name];

    if (!data) return;

    namesInput.value = data;

    // force sync
    loadNames();
}

function refreshRosterDropdown() {
    const select = document.getElementById("savedRosterSelect");
    if (!select) return;

    const rosters = getRosters();

    select.innerHTML =
        `<option value="">Select roster</option>` +
        Object.keys(rosters)
            .map(name => `<option value="${name}">${name}</option>`)
            .join("");
}

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ===== DOM ===== */
    canvas = document.getElementById("wheelCanvas");
    ctx = canvas.getContext("2d");

    namesInput = document.getElementById("namesInput");
    modeSelect = document.getElementById("modeSelect");
    targetSelect = document.getElementById("targetSelect");
    mappingSection = document.getElementById("mappingSection");

    setupView = document.getElementById("setupView");
    wheelView = document.getElementById("wheelView");

    winnerOverlay = document.getElementById("winnerOverlay");
    winnerName = document.getElementById("winnerName");
    winnerTarget = document.getElementById("winnerTarget");

    /* ===== LOAD ===== */
    loadNamesFromStorage();
    drawWheel();

    showSetup();

    /* ===== BUTTONS ===== */
    document.getElementById("createWheelBtn")
        ?.addEventListener("click", () => {

            names = shuffleNames(names); // no mutation side effects

            drawWheel();
            showWheel();
        });

    document.getElementById("spinBtn")
        ?.addEventListener("click", spin);

    canvas.addEventListener("click", spin);

    document.getElementById("backBtn")
        ?.addEventListener("click", showSetup);

    document.getElementById("removeWinnerBtn")
        ?.addEventListener("click", removeWinner);

    document.getElementById("closeWinnerBtn")
        ?.addEventListener("click", () => {
            winnerOverlay.classList.add("hidden");
        });

    /* ===== INPUT ===== */
    namesInput.addEventListener("input", loadNames);

    /* ===== MODE ===== */
    modeSelect.addEventListener("change", () => {
        mappingSection.classList.toggle(
            "hidden",
            modeSelect.value === "winner"
        );
    });

    refreshRosterDropdown();

    /* ===== ROSTERS ===== */
    document.getElementById("savedRosterSelect")
        ?.addEventListener("change", (e) => {
            if (e.target.value) applyRoster(e.target.value);
        });
});