const FULL_TURN =
    Math.PI * 2;

const POINTER_ANGLE =
    Math.PI * 1.5;

const MIN_ROTATIONS =
    10;

const MAX_ROTATIONS =
    14;

const EDGE_MARGIN =
    0.02;

const EDGE_BIAS =
    0.23;

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

        /*
         * Use the exact index selected by
         * chooseWinner().
         */
        const winnerIndex =
            winner.winnerIndex;

        if (
            winnerIndex < 0 ||
            winnerIndex >=
                names.length ||
            names[winnerIndex] !==
                winner.winnerName
        ) {
            return null;
        }

        const currentRotation =
            getRotation();

        const slice =
            FULL_TURN /
            names.length;

        const sectionStart =
            winnerIndex *
            slice;

        const edgeMargin =
            slice *
            EDGE_MARGIN;

        /*
         * Pick a point inside the winner's
         * section, away from the edges.
         */
        const random =
            Math.random();

        const targetOffset =
            random < 0.5
                ? edgeMargin +
                  Math.random() *
                  (
                      EDGE_BIAS *
                      slice -
                      edgeMargin
                  )
                : (1 - EDGE_BIAS) *
                      slice +
                  Math.random() *
                  (
                      EDGE_BIAS *
                      slice -
                      edgeMargin
                  );

        const targetAngle =
            sectionStart +
            targetOffset;

        /*
         * Rotation that puts targetAngle
         * underneath the pointer.
         */
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

        let distance =
            target -
            current;

        if (
            distance < 0
        ) {
            distance +=
                FULL_TURN;
        }

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

        const duration =
            MIN_SPIN_DURATION +
            Math.random() *
            (
                MAX_SPIN_DURATION -
                MIN_SPIN_DURATION
            );

        return {
            winnerIndex,

            winnerName:
                winner.winnerName,

            endRotation:
                currentRotation +
                distance +
                rotations *
                FULL_TURN,

            duration
        };
    }


    return {
        chooseWinner,
        createSpinPlan
    };
}