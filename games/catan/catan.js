const sections =
    loadSections();

renderPage();

function renderPage() {

    const improvementsHeader =
        document.getElementById(
            "improvements-header"
        );

    improvementsHeader.textContent =
        `${sections.improvements ? "▼" : "▶"} City Improvements`;

    improvementsHeader.onclick =
        () => toggleSection(
            "improvements"
        );

    const questsHeader =
        document.getElementById(
            "quests-header"
        );

    questsHeader.textContent =
        `${sections.quests ? "▼" : "▶"} Quests`;

    questsHeader.onclick =
        () => toggleSection(
            "quests"
        );

    render();

    const player =
        data.players[selectedPlayer];

    const quests =
        document.getElementById(
            "quests"
        );

    quests.style.display =
        sections.quests
            ? "grid"
            : "none";

    if (sections.quests) {
        renderQuests(player);
    }

}

function loadSections() {

    const stored =
        localStorage.getItem(
            "catan-sections"
        );

    if (stored) {
        return JSON.parse(stored);
    }

    return {

        improvements: true,
        quests: true

    };

}

function saveSections() {

    localStorage.setItem(
        "catan-sections",
        JSON.stringify(sections)
    );

}

function toggleSection(section) {

    sections[section] =
        !sections[section];

    saveSections();

    renderPage();

}