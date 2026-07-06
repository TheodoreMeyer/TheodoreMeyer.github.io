const QUESTS = {

    fish: {

        name: "Fish",
        label: "Fish Caught",
        capstone: "Best Fisher",
        max: 7,
        vp: {
            0: 0,
            2: 1,
            5: 2,
            7: 3
        }
    },

    spice: {
        name: "Spice",
        label: "Spice Returned",
        capstone: "Best Spice Merchant",
        max: 6,
        vp: {
            0: 0,
            2: 1,
            4: 2,
            6: 3
        }
    },

    pirates: {
        name: "Pirates",
        label: "Pirate Points",
        capstone: "Greatest Pirate Scourge",
        max: 7,
        vp: {

            0: 0,
            2: 1,
            5: 2,
            7: 3

        }
    }
};

function getQuestVictoryPoints(quest, amount) {

    for (const [max, value] of Object.entries(quest.vp)) {

        if (amount <= Number(max)) {
            return value;
        }

    }

    return 0;
}

function hasQuestCapstone(quest, amount) {
    return amount >= quest.max;
}

function renderQuests(player) {

    const quests =
        document.getElementById("quests");

    quests.innerHTML = "";

    Object.entries(QUESTS)
        .forEach(([key, quest]) => {

            const amount =
                player[key];

            const card =
                document.createElement("div");

            card.className =
                "card";

            card.innerHTML = `
<h2>${quest.name}</h2>

<p>
    ${quest.label}:
    ${amount}
</p>

<p>
    Victory Points:
    ${getQuestVictoryPoints(
                quest,
                amount
            )}
</p>

<p>
    Capstone:
    ${
                hasQuestCapstone(
                    quest,
                    amount
                )
                    ? quest.capstone
                    : "Not Eligible"
            }
</p>

<div
    style="
        display:flex;
        gap:0.5rem;
        margin-top:1rem;
    "
>

    <button class="minus">
        -
    </button>

    <button class="plus">
        +
    </button>

</div>
`;

            card.querySelector(".plus")
                .onclick = () => {

                player[key] =
                    Math.min(
                        quest.max,
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

            quests.appendChild(card);

        });

}