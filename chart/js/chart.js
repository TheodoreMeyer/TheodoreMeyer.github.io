const STORAGE_KEY = "classroom_rosters";

/* =========================
   RESULTS / UI STATE
   ========================= */

function showResults(title, contentElement) {
    const app = document.getElementById("app-view");
    const results = document.getElementById("results-view");

    const titleEl = document.getElementById("results-title");
    const container = document.getElementById("results-content");

    if (!app || !results || !titleEl || !container) return;

    app.classList.add("hidden");
    results.classList.remove("hidden");

    titleEl.textContent = title;
    container.innerHTML = "";

    if (contentElement) {
        container.appendChild(contentElement);
    }
}

function showGenerator() {
    const results = document.getElementById("results-view");
    const app = document.getElementById("app-view");

    if (!results || !app) return;

    results.classList.add("hidden");
    app.classList.remove("hidden");

    showTab("seating");
}

/* =========================
   TAB SYSTEM
   ========================= */

function showTab(tab) {
    const seating = document.getElementById("seating-section");
    const groups = document.getElementById("groups-section");

    const seatingTab = document.getElementById("seating-tab");
    const groupsTab = document.getElementById("groups-tab");

    if (!seating || !groups || !seatingTab || !groupsTab) return;

    const isSeating = tab === "seating";

    seating.classList.toggle("hidden", !isSeating);
    groups.classList.toggle("hidden", isSeating);

    seatingTab.classList.toggle("active", isSeating);
    groupsTab.classList.toggle("active", !isSeating);
}

/* =========================
   STORAGE HELPERS
   ========================= */

function getRosters() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
        return {};
    }
}

function saveRosters(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* =========================
   CORE FIX: SINGLE ROSTER APPLIER
   ========================= */

function applyRoster(name) {
    const textarea = document.getElementById("student-names");
    const rosters = getRosters();

    if (!textarea || !name || !rosters[name]) return;

    textarea.value = rosters[name];
}

/* =========================
   SAVE ROSTER
   ========================= */
function saveRoster() {
    const nameInput = document.getElementById("roster-name");
    const textarea = document.getElementById("student-names");

    if (!nameInput || !textarea) return;

    const name = nameInput.value.trim();
    const value = textarea.value.trim();

    if (!name || !value) return;

    const rosters = getRosters();
    rosters[name] = value;

    saveRosters(rosters);
    refreshRosterDropdowns();

    nameInput.value = "";
}

/* =========================
   DELETE ROSTER
   ========================= */

function deleteRoster(name) {
    if (!name) return;

    const ok = confirm(`Delete roster "${name}"?`);
    if (!ok) return;

    const rosters = getRosters();

    delete rosters[name];
    saveRosters(rosters);

    refreshRosterDropdowns();

    document.getElementById("saved-rosters").value = "";
}

/* =========================
   DROPDOWN REFRESH
   ========================= */

function refreshRosterDropdowns() {
    const rosters = getRosters();
    const select = document.getElementById("saved-rosters");

    const options =
        `<option value="">Select roster</option>` +
        Object.keys(rosters)
            .map(name => `<option value="${name}">${name}</option>`)
            .join("");

    if (select) select.innerHTML = options;
}

/* =========================
   LOAD HANDLER (FIXED)
   ========================= */

function autoFillRosterOnSelect(type, value) {
    if (!value) return;
    applyRoster(type, value);
}

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", () => {

    refreshRosterDropdowns();

    /* BACK */
    document.getElementById("back-button")
        ?.addEventListener("click", showGenerator);

    /* PRINT */
    document.getElementById("print-button")
        ?.addEventListener("click", () => window.print());

    /* TABS */
    document.getElementById("seating-tab")
        ?.addEventListener("click", () => showTab("seating"));

    document.getElementById("groups-tab")
        ?.addEventListener("click", () => showTab("groups"));

    /* SAVE */
    document.getElementById("save-roster")
        ?.addEventListener("click", saveRoster);

    document.getElementById("saved-rosters")
        ?.addEventListener("change", (e) => {
            if (e.target.value) applyRoster(e.target.value);
        });

    document.getElementById("delete-roster")
        ?.addEventListener("click", () => {
            const name = document.getElementById("saved-rosters")?.value;
            deleteRoster(name);
        });

    /* INITIAL STATE */
    showTab("seating");
});