import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef
} from "react";

const SPIN_DURATION =
    6000;

const FULL_TURN =
    Math.PI * 2;

const POINTER_ANGLE =
    Math.PI * 1.5;

const COLORS = [
    "#ef4444", // red
    "#22c55e", // green
    "#3b82f6", // blue
    "#eab308", // yellow
    "#ec4899", // pink
    "#6b7280"  // gray
];

function easeOut(t) {
    return 1 -
        Math.pow(
            1 - t,
            4.4
        );
}
const Wheel = forwardRef(
    function Wheel(
        {
            names,
            onClick
        },
        ref
    ) {
        const canvasRef =
            useRef(null);

        const namesRef =
            useRef(names);

        const rotationRef =
            useRef(0);

        const animationRef =
            useRef(null);

        const spinningRef =
            useRef(false);

        useEffect(() => {
            namesRef.current =
                names;

            rotationRef.current =
                0;

            draw();
        }, [names]);

        useImperativeHandle(
            ref,
            () => ({
                setNames(nextNames) {
                    namesRef.current =
                        [...nextNames];

                    rotationRef.current =
                        0;

                    draw();
                },

                getRotation() {
                    return rotationRef.current;
                },

                isSpinning() {
                    return spinningRef.current;
                },

                spin(plan, onStop) {
                    spin(plan, onStop);
                },

                cleanup() {
                    if (
                        animationRef.current !==
                        null
                    ) {
                        cancelAnimationFrame(
                            animationRef.current
                        );

                        animationRef.current =
                            null;
                    }

                    spinningRef.current =
                        false;
                }
            }),
            []
        );

        function getSectionColor(index) {
            return COLORS[
            index % COLORS.length
                ];
        }

        function getSectionAtPointer(
            rotation
        ) {
            const currentNames =
                namesRef.current;

            if (
                currentNames.length === 0
            ) {
                return -1;
            }

            const slice =
                FULL_TURN /
                currentNames.length;

            let angle =
                (
                    POINTER_ANGLE -
                    rotation
                ) %
                FULL_TURN;

            if (angle < 0) {
                angle += FULL_TURN;
            }

            return Math.floor(
                angle / slice
            );
        }

        function getFontSize(
            name,
            slice,
            radius,
            ctx
        ) {
            const degrees =
                slice *
                180 /
                Math.PI;

            let size =
                Math.min(
                    36,
                    Math.max(
                        12,
                        8 +
                        degrees *
                        0.25
                    )
                );

            const maxWidth =
                Math.max(
                    50,
                    radius *
                    slice *
                    0.72
                );

            while (size > 11) {
                ctx.font =
                    `700 ${size}px system-ui`;

                if (
                    ctx.measureText(
                        name
                    ).width <=
                    maxWidth
                ) {
                    break;
                }

                size--;
            }

            return size;
        }

        function draw() {
            const canvas =
                canvasRef.current;

            if (!canvas) {
                return;
            }

            const ctx =
                canvas.getContext("2d");

            const width =
                canvas.width;

            const height =
                canvas.height;

            const centerX =
                width / 2;

            const centerY =
                height / 2;

            const radius =
                Math.min(
                    centerX,
                    centerY
                ) - 12;

            ctx.clearRect(
                0,
                0,
                width,
                height
            );

            const currentNames =
                namesRef.current;

            if (
                currentNames.length === 0
            ) {
                return;
            }

            const slice =
                FULL_TURN /
                currentNames.length;

            ctx.save();

            ctx.translate(
                centerX,
                centerY
            );

            ctx.rotate(
                rotationRef.current
            );

            for (
                let i = 0;
                i < currentNames.length;
                i++
            ) {
                const start =
                    i * slice;

                const end =
                    start + slice;

                ctx.beginPath();

                ctx.moveTo(
                    0,
                    0
                );

                ctx.arc(
                    0,
                    0,
                    radius,
                    start,
                    end
                );

                ctx.closePath();

                ctx.fillStyle =
                    getSectionColor(i);

                ctx.fill();

                const fontSize =
                    getFontSize(
                        currentNames[i],
                        slice,
                        radius,
                        ctx
                    );

                ctx.save();

                ctx.rotate(
                    start +
                    slice / 2
                );

                ctx.textAlign =
                    "right";

                ctx.textBaseline =
                    "middle";

                const isYellow =
                    i %
                    COLORS.length ===
                    3;

                ctx.fillStyle =
                    isYellow
                        ? "#111827"
                        : "#ffffff";

                ctx.font =
                    `700 ${fontSize}px system-ui`;

                ctx.fillText(
                    currentNames[i],
                    radius - 24,
                    0
                );

                ctx.restore();
            }

            ctx.restore();

            ctx.beginPath();

            ctx.arc(
                centerX,
                centerY,
                30,
                0,
                FULL_TURN
            );

            ctx.fillStyle =
                "#ffffff";

            ctx.fill();

            ctx.strokeStyle =
                "#cbd5e1";

            ctx.lineWidth =
                4;

            ctx.stroke();

            updatePointer();
        }

        function updatePointer() {
            const pointer =
                canvasRef.current
                    ?.parentElement
                    ?.querySelector(
                        ".wheel-pointer"
                    );

            if (!pointer) {
                return;
            }

            const index =
                getSectionAtPointer(
                    rotationRef.current
                );

            if (index < 0) {
                return;
            }

            pointer.style.borderTopColor =
                getSectionColor(index);
        }

        function spin(
            plan,
            onStop
        ) {
            if (
                spinningRef.current ||
                namesRef.current.length === 0
            ) {
                return;
            }

            spinningRef.current =
                true;

            const startRotation =
                rotationRef.current;

            const endRotation =
                plan.endRotation;

            const duration =
                plan.duration ??
                SPIN_DURATION;

            const startTime =
                performance.now();

            function animate(now) {
                const progress =
                    Math.min(
                        (
                            now -
                            startTime
                        ) /
                        duration,
                        1
                    );

                rotationRef.current =
                    startRotation +
                    (
                        endRotation -
                        startRotation
                    ) *
                    easeOut(
                        progress
                    );

                draw();

                if (
                    progress < 1
                ) {
                    animationRef.current =
                        requestAnimationFrame(
                            animate
                        );

                    return;
                }

                rotationRef.current =
                    endRotation;

                draw();

                animationRef.current =
                    null;

                spinningRef.current =
                    false;

                /*
                 * Verify that the actual final
                 * wheel position matches the
                 * predetermined winner.
                 */
                const actualIndex =
                    getSectionAtPointer(
                        rotationRef.current
                    );

                if (
                    actualIndex !==
                    plan.winnerIndex
                ) {
                    console.error(
                        "Wheel landing mismatch:",
                        {
                            expected:
                            plan.winnerIndex,

                            actual:
                            actualIndex,

                            rotation:
                            rotationRef.current
                        }
                    );
                }

                onStop?.(plan);
            }

            animationRef.current =
                requestAnimationFrame(
                    animate
                );
        }

        return (
            <div
                className="wheel-container"
                onClick={onClick}
            >
                <canvas
                    ref={canvasRef}
                    width="700"
                    height="700"
                />

                <div
                    className="wheel-pointer"
                />
            </div>
        );
    }
);

export default Wheel;