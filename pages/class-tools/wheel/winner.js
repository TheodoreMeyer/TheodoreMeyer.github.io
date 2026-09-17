const FULL_TURN =
    Math.PI * 2;

const POINTER_ANGLE =
    Math.PI * 1.5;


/*
 * Number of full rotations.
 *
 * Example:
 * 10 and 14 allows:
 * 10, 11, 12, 13, or 14 rotations.
 */
const MIN_ROTATIONS =
    10;

const MAX_ROTATIONS =
    14;


/*
 * Percentage of each section to keep
 * clear from the edges.
 *
 * 0.02 = 2%
 * 0.01 = 1%
 * 0 = entire section
 */
const EDGE_MARGIN =
    0.02;


/*
 * Spin duration in milliseconds.
 *
 * Example:
 * 6500–8000ms gives a slightly
 * different duration every spin.
 */
const MIN_SPIN_DURATION =
    6900;

const MAX_SPIN_DURATION =
    9000;


function normalize(angle) {
    return (
        (
            angle %
            FULL_TURN
        ) +
        FULL_TURN
    ) % FULL_TURN;
}


export function createWinnerSystem({
                                       getNames,
                                       getRotation
                                   }) {
    function chooseWinner({
                              rigged,
                              riggedName
                          }) {
        const names =
            getNames();

        if (
            names.length === 0
        ) {
            return null;
        }

        let index =
            -1;

        if (
            rigged &&
            riggedName
        ) {
            index =
                names.indexOf(
                    riggedName
                );
        }

        if (index < 0) {
            index =
                Math.floor(
                    Math.random() *
                    names.length
                );
        }

        return {
            winnerIndex:
            index,

            winnerName:
                names[index]
        };
    }


    function createSpinPlan(
        winner
    ) {
        const names =
            getNames();

        if (
            !winner ||
            names.length === 0
        ) {
            return null;
        }

        const currentRotation =
            getRotation();

        const slice =
            FULL_TURN /
            names.length;


        /*
         * Pick a random position
         * anywhere inside the winner's
         * section.
         */
        const sectionStart =
            winner.winnerIndex *
            slice;

        const edgeMargin =
            slice *
            EDGE_MARGIN;

        const targetOffset =
            edgeMargin +
            Math.random() *
            (
                slice -
                edgeMargin * 2
            );

        const targetAngle =
            sectionStart +
            targetOffset;

        const desiredRotation =
            POINTER_ANGLE -
            targetAngle;


        const current =
            normalize(
                currentRotation
            );

        const target =
            normalize(
                desiredRotation
            );


        /*
         * Find the forward distance
         * to the randomly selected
         * position inside the section.
         */
        let distance =
            target -
            current;

        if (
            distance < 0
        ) {
            distance +=
                FULL_TURN;
        }


        /*
         * Random number of complete
         * rotations.
         */
        const rotations =
            MIN_ROTATIONS +
            Math.floor(
                Math.random() *
                (
                    MAX_ROTATIONS -
                    MIN_ROTATIONS +
                    1
                )
            );


        /*
         * Random spin duration.
         */
        const duration =
            MIN_SPIN_DURATION +
            Math.random() *
            (
                MAX_SPIN_DURATION -
                MIN_SPIN_DURATION
            );


        const endRotation =
            currentRotation +
            distance +
            rotations *
            FULL_TURN;


        return {
            winnerIndex:
            winner.winnerIndex,

            winnerName:
            winner.winnerName,

            endRotation,

            duration
        };
    }


    return {
        chooseWinner,
        createSpinPlan
    };
}