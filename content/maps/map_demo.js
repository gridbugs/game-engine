function MapDemo() {
    this.regions({
        r1: [
            [[100, 100], [100, 300]],
            [[100, 300], [400, 300]],
            [[550, 300], [600, 300]],
            [[600, 300], [600, 250]],
            [[600, 150], [600, 100]],
            [[600, 100], [100, 100]]
        ],
        r2: [
            [[400, 300], [400, 350]],
            [[400, 350], [350, 400]],
            [[350, 400], [300, 350]],
            [[550, 300], [550, 350]],
            [[550, 350], [350, 550]],
            [[350, 550], [150, 350]],
//            [[300, 350], [150, 350]]
            
        ],
        r3: [
            [[150, 350], [150, 50]],
            [[300, 350], [300, 250]],
            [[150, 50], [500, 50]],
            [[500, 50], [500, 250]],
            [[500, 250], [300, 250]]
        ],
        r4: [
            [[600, 150], [610, 150]],
            [[610, 150], [610, 50]],
            [[610, 50], [1200, 50]],
            [[1200, 50], [1200, 400]],
            [[1200, 400], [1610, 400]],
            [[1610, 400], [1610, 600]],
            [[1610, 600], [800, 600]],
            [[700, 600], [610, 600]],
            [[610, 600], [610, 250]],
            [[610, 250], [600, 250]]
        ],
        r5: [
            [[700, 600], [700, 750]],
            [[800, 600], [800, 750]]
        ],
        r6: [
            [[700, 750], [400, 750]],
            [[400, 750], [400, 1000]],
            [[400, 1000], [1000, 1000]],
            [[1000, 1000], [1000, 750]],
            [[1000, 750], [800, 750]]
        ]
    });

    this.connect(
        ['r1', 'r2', [[400, 300], [550, 300]]],
//        ['r3', 'r2', [[150, 350], [300, 350]]],
        ['r1', 'r4', [[600, 250], [600, 150]]],
        ['r4', 'r5', [[700, 600], [800, 600]]],
        ['r5', 'r6', [[700, 750], [800, 750]]]
    );

    this.visible({
        r1: true,
        r2: true,
        r3: false,
        r4: true,
        r5: true,
        r6: true
    });

    this.display_detectors(
        ['r2', ['r1', 'r4', 'r5'], 'r3', [[350, 400], [350, 550]]]
//        ['r5', ['r1', 'r4', 'r2'], 'r6', [[700, 675], [800, 675]]]
    )
}
