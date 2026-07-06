const TRACKS = {
science: {
    name: "Science (Green)",
    color: "green",
    commodity: "Paper",

    levels: {
        0: {
            title: "None",
            cost: 0,
            progressMax: 0,
            benefits: []
        },

        1: {
            title: "Abbey",
            cost: 1,
            progressMax: 2,
            benefits: []
        },

        2: {
            title: "Library",
            cost: 2,
            progressMax: 3,
            benefits: []
        },

        3: {
            title: "Aqueduct",
            cost: 3,
            progressMax: 4,
            benefits: [
                "If no resources are received from a production roll (and a 7 was not rolled), choose any resource from the bank."
            ]
        },

        4: {
            title: "Theater",
            cost: 4,
            progressMax: 5,
            benefits: [
                "Eligible to claim the Science Metropolis."
            ]
        },

        5: {
            title: "University",
            cost: 5,
            progressMax: 6,
            benefits: [
                "Claim or retain the Science Metropolis."
            ]
        }
    }
},

politics: {
    name: "Politics (Blue)",
    color: "blue",
    commodity: "Coin",

    levels: {
        0: {
            title: "None",
            cost: 0,
            progressMax: 0,
            benefits: []
        },

        1: {
            title: "Town Hall",
            cost: 1,
            progressMax: 2,
            benefits: []
        },

        2: {
            title: "Church",
            cost: 2,
            progressMax: 3,
            benefits: []
        },

        3: {
            title: "Fortress",
            cost: 3,
            progressMax: 4,
            benefits: [
                "Strong Knights may be promoted to Mighty Knights."
            ]
        },

        4: {
            title: "Cathedral",
            cost: 4,
            progressMax: 5,
            benefits: [
                "Eligible to claim the Political Metropolis."
            ]
        },

        5: {
            title: "High Assembly",
            cost: 5,
            progressMax: 6,
            benefits: [
                "Claim or retain the Political Metropolis."
            ]
        }
    }
},

trade: {
    name: "Trade (Yellow)",
    color: "yellow",
    commodity: "Cloth",

    levels: {
        0: {
            title: "None",
            cost: 0,
            progressMax: 0,
            benefits: []
        },

        1: {
            title: "Market",
            cost: 1,
            progressMax: 2,
            benefits: []
        },

        2: {
            title: "Trading House",
            cost: 2,
            progressMax: 3,
            benefits: []
        },

        3: {
            title: "Merchant Guild",
            cost: 3,
            progressMax: 4,
            benefits: [
                "Commodities may be traded at a 2:1 rate."
            ]
        },

        4: {
            title: "Bank",
            cost: 4,
            progressMax: 5,
            benefits: [
                "Eligible to claim the Trade Metropolis."
            ]
        },

        5: {
            title: "Great Exchange",
            cost: 5,
            progressMax: 6,
            benefits: [
                "Claim or retain the Trade Metropolis"
            ]
        }
    }
}
};