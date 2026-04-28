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
   MODAL (REPLACES confirm())
   ========================= */

function confirmDelete(message, onConfirm) {
    const modal = document.getElementById("confirm-modal");
    const text = document.getElementById("confirm-text");
    const yesBtn = document.getElementById("confirm-yes");
    const noBtn = document.getElementById("confirm-no");

    if (!modal || !text || !yesBtn || !noBtn) return;

    text.textContent = message;
    modal.classList.remove("hidden");

    yesBtn.onclick = null;
    noBtn.onclick = null;

    yesBtn.onclick = () => {
        modal.classList.add("hidden");
        onConfirm();
    };

    noBtn.onclick = () => {
        modal.classList.add("hidden");
    };
}

/* =========================
   STORAGE HELPERS
   ========================= */

function getRosters() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function saveRosters(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* =========================
   SAVE ROSTER
   ========================= */

function saveRoster(type) {
    const nameInput = document.getElementById(`roster-name-${type}`);
    const textarea = document.getElementById(`${type}-names`);

    if (!nameInput || !textarea) return;

    const name = nameInput.value.trim();
    const value = textarea.value.trim();

    if (!name || !value) return;

    const rosters = getRosters();
    rosters[name] = value;

    saveRosters(rosters);
    refreshRosterDropdowns();
}

/* =========================
   LOAD ROSTER
   ========================= */

function loadRoster(type, name) {
    const textarea = document.getElementById(`${type}-names`);
    if (!textarea) return;

    const rosters = getRosters();
    if (!rosters[name]) return;

    textarea.value = rosters[name];
}

/* =========================
   DELETE ROSTER
   ========================= */

function deleteRoster(name) {
    if (!name) return;

    confirmDelete(`Delete roster "${name}"?`, () => {
        const rosters = getRosters();

        if (!rosters[name]) return;

        delete rosters[name];
        saveRosters(rosters);

        refreshRosterDropdowns();

        const s = document.getElementById("saved-rosters-seating");
        const g = document.getElementById("saved-rosters-groups");

        if (s) s.value = "";
        if (g) g.value = "";
    });
}

/* =========================
   DROPDOWN REFRESH
   ========================= */

function refreshRosterDropdowns() {
    const rosters = getRosters();

    const seatingSelect = document.getElementById("saved-rosters-seating");
    const groupsSelect = document.getElementById("saved-rosters-groups");

    const options =
        `<option value="">Select roster</option>` +
        Object.keys(rosters)
            .map(name => `<option value="${name}">${name}</option>`)
            .join("");

    if (seatingSelect) seatingSelect.innerHTML = options;
    if (groupsSelect) groupsSelect.innerHTML = options;
}

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", () => {

    refreshRosterDropdowns();

    /* BACK BUTTON */
    document.getElementById("back-button")
        ?.addEventListener("click", showGenerator);

    /* TABS */
    document.getElementById("seating-tab")
        ?.addEventListener("click", () => showTab("seating"));

    document.getElementById("groups-tab")
        ?.addEventListener("click", () => showTab("groups"));

    /* SAVE */
    document.getElementById("save-roster-seating")
        ?.addEventListener("click", () => saveRoster("seating"));

    document.getElementById("save-roster-groups")
        ?.addEventListener("click", () => saveRoster("groups"));

    /* LOAD */
    document.getElementById("saved-rosters-seating")
        ?.addEventListener("change", (e) => loadRoster("seating", e.target.value));

    document.getElementById("saved-rosters-groups")
        ?.addEventListener("change", (e) => loadRoster("groups", e.target.value));

    /* DELETE */
    document.getElementById("delete-roster-seating")
        ?.addEventListener("click", () => {
            const name = document.getElementById("saved-rosters-seating")?.value;
            deleteRoster(name);
        });

    document.getElementById("delete-roster-groups")
        ?.addEventListener("click", () => {
            const name = document.getElementById("saved-rosters-groups")?.value;
            deleteRoster(name);
        });

    /* INITIAL STATE */
    showTab("seating");
});