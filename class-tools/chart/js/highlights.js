/* =========================
   NAME HIGHLIGHT RULES
   ========================= */

const highlightRules = [
    {
        test: name => (name || "").toLowerCase().includes("theo"),
        bg: "rgba(37, 99, 235, 0.35)",
        border: "rgba(37, 99, 235, 0.7)",
        bgImage: "url('images/mc_1.png')",
        textColor: "#ffffff",
        textShadow: "0 1px 3px rgba(0, 0, 0, 0.9)"
    },
    {
        test: (name) => {
            const n = (name || "").toLowerCase().trim();

            // Handle "Last, First" vs "First Last"
            const isCommaFormat = n.includes(",");

            let first = "";
            let last = "";

            if (isCommaFormat) {
                const [l, f] = n.split(",").map(s => s.trim());
                last = l || "";
                first = f || "";
            } else {
                const parts = n.split(/\s+/);
                first = parts[0] || "";
                last = parts.slice(1).join(" ");
            }

            const isEli = first === "eli" || last === "eli";

            const isJonathan = first === "jonathan" || last === "jonathan";

            const hasJustice = /\bjustice\b/.test(n); // word-safe match

            return isEli || (isJonathan && !hasJustice);
        },

        bg: "rgba(34, 197, 94, 0.06)",
        border: "rgba(34, 197, 94, 0.18)",
        bgImage: "url('images/mc_3.png')",
        textColor: "#ffffff",
        // softer shadow so text doesn't look “blurry heavy”
        textShadow: "0 1px 3px rgba(0, 0, 0, 0.65)"
    },

    {
        test: (name) => (name || "").toLowerCase().includes("julianne"),
        bg: "rgba(244, 114, 182, 0.06)", // pink
        border: "rgba(244, 114, 182, 0.18)",
        bgImage: "url('images/mc_2.png')",

        textColor: "#0b1220",
        textShadow: "0 0 2px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(0,0,0,0.35)"
    },

    {
        test: (name) => (name || "").toLowerCase().includes("zoey"),
        bg: "rgba(168, 85, 247, 0.06)", // purple
        border: "rgba(168, 85, 247, 0.18)"
    },

    {
        test: (name) => (name || "").toLowerCase().includes("nehemiah"),
        bg: "rgba(239, 68, 68, 0.06)", // red
        border: "rgba(239, 68, 68, 0.18)",
        bgImage: "url('images/mc_4.png')",
        textColor: "#f1f5f9",
        textShadow: "0 1px 2px rgba(15, 23, 42, 0.75)"
    },
    {
        test: (name) => (name || "").toLowerCase().includes("georgia"),
        bg: "rgba(20, 184, 166, 0.06)", // teal
        border: "rgba(20, 184, 166, 0.18)"
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

    const applyImage = (rule) => {
        if (!rule.bgImage) return;

        el.style.backgroundImage = rule.bgImage;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.backgroundRepeat = "no-repeat";
        el.style.backgroundBlendMode = rule.blendMode || "multiply";

        // Allow per-rule text styling
        el.style.color = rule.textColor || "#ffffff";
        el.style.textShadow =
            rule.textShadow || "0 1px 3px rgba(0, 0, 0, 0.85)";
    };

    if (matched.length === 1) {
        const rule = matched[0];

        el.style.background = rule.bg;
        el.style.borderColor = rule.border;

        applyImage(rule);
        return;
    }

    const colors = matched
        .map(rule => rule.bg.replace("0.06", "0.10"))
        .join(", ");

    el.style.background = `linear-gradient(135deg, ${colors})`;
    el.style.borderColor = matched[0].border;

    const imageRule = matched.find(rule => rule.bgImage);
    if (imageRule) {
        applyImage(imageRule);
    }
}