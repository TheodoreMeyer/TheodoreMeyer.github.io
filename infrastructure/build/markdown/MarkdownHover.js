
const CLOSE_DELAY = 200;

export function initializeMarkdownHover() {
    // Avoid registering duplicate event listeners.
    if (window.__markdownHoverInitialized) return;
    window.__markdownHoverInitialized = true;

    let activeHover = null;
    let closeTimeout = null;

    function getPopover(hover) {
        const templateId = hover.dataset.markdownHoverTemplate;
        const template = document.getElementById(templateId);

        if (!template) {
            console.error(
                `MarkdownHover: Template "${templateId}" was not found.`
            );
            return null;
        }

        let popover = document.getElementById(
            `${hover.dataset.markdownHover}-popover`
        );

        if (popover) return popover;

        popover = document.createElement("div");
        popover.id = `${hover.dataset.markdownHover}-popover`;
        popover.className = "markdown-hover__popover";
        popover.setAttribute("popover", "manual");
        popover.setAttribute("role", "tooltip");

        popover.innerHTML = template.innerHTML;

        document.body.appendChild(popover);

        return popover;
    }

    function positionPopover(hover, popover) {
        const trigger =
            hover.querySelector(".markdown-hover__trigger");

        if (!trigger) {
            return;
        }

        const rect =
            trigger.getBoundingClientRect();

        const popoverRect =
            popover.getBoundingClientRect();

        const gap = 6;
        const margin = 12;

        let top = rect.bottom + gap;

        if (
            top + popoverRect.height >
            window.innerHeight - margin
        ) {
            top = rect.top - popoverRect.height - gap;
        }

        const left = Math.max(
            margin,
            Math.min(
                rect.left + (rect.width - popoverRect.width) / 2,
                window.innerWidth - popoverRect.width - margin
            )
        );

        popover.style.left = `${left}px`;
        popover.style.top = `${Math.max(margin, top)}px`;
    }

    function cancelClose() {
        if (closeTimeout !== null) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }
    }

    function closeHover(hover = activeHover) {
        if (!hover) return;

        cancelClose();

        const popover = document.getElementById(
            `${hover.dataset.markdownHover}-popover`
        );

        if (popover?.matches(":popover-open")) {
            popover.hidePopover();
        }

        hover.setAttribute("aria-expanded", "false");

        if (activeHover === hover) {
            activeHover = null;
        }
    }

    function scheduleClose(hover) {
        cancelClose();

        closeTimeout = window.setTimeout(() => {
            const popover = document.getElementById(
                `${hover.dataset.markdownHover}-popover`
            );

            const triggerHovered = hover.matches(":hover");
            const popoverHovered = popover?.matches(":hover");
            const triggerFocused = hover.contains(document.activeElement);

            if (
                !triggerHovered &&
                !popoverHovered &&
                !triggerFocused
            ) {
                closeHover(hover);
            }
        }, CLOSE_DELAY);
    }

    function openHover(hover) {
        cancelClose();

        if (activeHover && activeHover !== hover) {
            closeHover(activeHover);
        }

        const popover = getPopover(hover);

        if (!popover) return;

        activeHover = hover;

        if (!popover.matches(":popover-open")) {
            popover.showPopover();
        }

        hover.setAttribute("aria-expanded", "true");

        positionPopover(hover, popover);
    }

    // Mouse interaction.
    document.addEventListener("pointerover", event => {
        if (event.pointerType !== "mouse") return;

        const hover = event.target.closest("[data-markdown-hover]");

        if (!hover) return;

        if (hover.contains(event.relatedTarget)) return;

        openHover(hover);
    });

    document.addEventListener("pointerout", event => {
        if (event.pointerType !== "mouse") return;

        const hover = event.target.closest("[data-markdown-hover]");

        if (!hover) return;

        if (hover.contains(event.relatedTarget)) return;

        scheduleClose(hover);
    });

    // Keep the popover open when the pointer enters it.
    document.addEventListener("pointerover", event => {
        if (event.pointerType !== "mouse") return;

        const popover = event.target.closest(
            ".markdown-hover__popover"
        );

        if (!popover) return;

        cancelClose();
    });

    document.addEventListener("pointerout", event => {
        if (event.pointerType !== "mouse") return;

        const popover = event.target.closest(
            ".markdown-hover__popover"
        );

        if (!popover) return;

        if (popover.contains(event.relatedTarget)) return;

        if (activeHover) {
            scheduleClose(activeHover);
        }
    });

    // Keyboard interaction.
    document.addEventListener("focusin", event => {
        const hover = event.target.closest("[data-markdown-hover]");

        if (hover) {
            openHover(hover);
        }
    });

    document.addEventListener("focusout", event => {
        const hover = event.target.closest("[data-markdown-hover]");

        if (!hover) return;

        if (hover.contains(event.relatedTarget)) return;

        scheduleClose(hover);
    });

    // Touch interaction: tap to toggle.
    document.addEventListener("pointerup", event => {
        if (event.pointerType !== "touch") return;

        const hover = event.target.closest("[data-markdown-hover]");

        if (hover) {
            if (activeHover === hover) {
                closeHover(hover);
            } else {
                openHover(hover);
            }

            return;
        }

        // Tapping outside closes the active tooltip.
        if (
            !event.target.closest(".markdown-hover__popover") &&
            activeHover
        ) {
            closeHover(activeHover);
        }
    });

    // Escape closes the active tooltip.
    document.addEventListener("keydown", event => {
        if (event.key !== "Escape" || !activeHover) return;

        closeHover(activeHover);
    });

    // Reposition on viewport changes.
    window.addEventListener("resize", () => {
        if (!activeHover) return;

        const popover = document.getElementById(
            `${activeHover.dataset.markdownHover}-popover`
        );

        if (popover?.matches(":popover-open")) {
            positionPopover(activeHover, popover);
        }
    });

    // Close when the page scrolls.
    window.addEventListener(
        "scroll",
        () => {
            if (activeHover) {
                closeHover(activeHover);
            }
        },
        true
    );
}