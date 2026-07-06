const STORAGE_KEY = "catan-cnk";

let data = load();

if (data.players.length === 0) {
    data.players.push(createPlayer("Player 1"));
}

let selectedPlayer = 0;

document.getElementById("add-player").addEventListener("click", addPlayer);

document.getElementById("remove-player").addEventListener("click", removePlayer);

function createPlayer(name) {
    return {
        name,
        science: 0,
        politics: 0,
        trade: 0,

        fish: 0,
        spice: 0,
        pirates: 0
    };
}

function load() {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
        return JSON.parse(stored);
    }

    return {
        players: []
    };

}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addPlayer() {
    const name = prompt("Player Name")?.trim();

    if (!name) { return; }

    if (data.players.some(
            player =>
                player.name.toLowerCase() ===
                name.toLowerCase()
        )
    ) {
        alert(`Player "${name}" already exists.`);
        return;
    }

    data.players.push(createPlayer(name));

    save();
    renderPage();
}

function removePlayer() {

    const name =
        prompt("Enter player name to remove:")?.trim();

    if (!name) {
        return;
    }

    const index =
        data.players.findIndex(
            player =>
                player.name.toLowerCase() ===
                name.toLowerCase()
        );

    if (index === -1) {

        alert(`Player "${name}" was not found.`);
        return;
    }

    if (!confirm(`Remove ${name}?`)) {
        return;
    }

    data.players.splice(index, 1);

    if (data.players.length === 0) {

        data.players.push(createPlayer("Player 1"));

        selectedPlayer = 0;

    } else if (selectedPlayer >= data.players.length) {
        selectedPlayer = data.players.length - 1;
    }

    save();
    renderPage();
}

function getUnlockedBenefits(track, level) {

    const benefits = [];

    for (let i = 1; i <= level; i++) {
        benefits.push(...track.levels[i].benefits);
    }

    return [...new Set(benefits)];
}

function renderTabs() {

    const tabs = document.getElementById("player-tabs");

    tabs.innerHTML = "";


    data.players.forEach((player, index) => {

        const button = document.createElement("button");

        button.textContent = player.name;

        if (index === selectedPlayer) {
            button.classList.add("active");
        }

        button.onclick = () => {
            selectedPlayer = index;
            renderPage();
        };

        tabs.appendChild(button);
    });
}

function render() {

    renderTabs();

    const player =
        data.players[selectedPlayer];

    document
        .getElementById("player-name")
        .textContent = player.name;

    const tracks =
        document.getElementById("tracks");

    tracks.innerHTML = "";

    tracks.style.display =
        sections.improvements
            ? "grid"
            : "none";

    if (!sections.improvements) {
        return;
    }

    Object.entries(TRACKS)
        .forEach(([key, track]) => {

            const level =
                player[key];

            const definition =
                track.levels[level];

            const nextDefinition =
                level < 5
                    ? track.levels[level + 1]
                    : null;

            const benefits =
                getUnlockedBenefits(
                    track,
                    level
                );

            const card =
                document.createElement("div");

            card.className = `card ${key}`;

            const colorName =
                track.color.charAt(0).toUpperCase()
                + track.color.slice(1);

            const upgradeCost =
                level === 5
                    ? "Maximum Level Reached"
                    : `${level + 1} ${track.commodity}`;

            const progressCardHtml =
                level === 0
                    ? `
<h3>Progress Cards</h3>
<p>None</p>
`
                    : `
<h3>Progress Cards</h3>

<p class="muted">
    Get ${colorName} progress card when:
</p>

<ul>
    <li>
        ${colorName} castle rolled on Event Die
    </li>

    <li>
        Red Die is ${
                        Array.from(
                            {
                                length:
                                definition.progressMax
                            },
                            (_, i) => i + 1
                        ).join(", ")
                    }
    </li>
</ul>
`;

            const specialAbilitiesHtml =
                benefits.length === 0
                    ? "<p>None</p>"
                    : `
<ul>
${benefits
                        .map(
                            benefit =>
                                `<li>${benefit}</li>`
                        )
                        .join("")}
</ul>
`;

            card.innerHTML = `
<h2>${track.name}</h2>

<p>
    Current Level:
    ${level}
</p>

<p>
    Current Upgrade:
    ${definition.title}
</p>

<p>
    Next Upgrade:
    ${
                nextDefinition
                    ? nextDefinition.title
                    : "Maximum Level Reached"
            }
</p>

<p>
    Upgrade Cost:
    ${upgradeCost}
</p>

<div
    style="
        display:flex;
        gap:0.5rem;
        margin-bottom:1rem;
    "
>
    <button class="minus">-</button>

    <button class="plus">+</button>
</div>

${progressCardHtml}

<h3>Special Abilities</h3>

${specialAbilitiesHtml}
`;

            card.querySelector(".plus")
                .onclick = () => {

                player[key] =
                    Math.min(
                        5,
                        player[key] + 1
                    );

                save();
                renderPage();

            };

            card.querySelector(".minus")
                .onclick = () => {

                player[key] =
                    Math.max(
                        0,
                        player[key] - 1
                    );

                save();
                renderPage();

            };

            tracks.appendChild(card);

        });
}
