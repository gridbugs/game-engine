function WalkDemo(drawer) {
    Animation.call(this, drawer);
}
WalkDemo.inherits_from(Animation);

WalkDemo.prototype.run = function(then) {
    new ImageLoader('images/', [
            'shoe.png', 
            'lower_leg.png', 
            'knee.png', 
            'upper_leg.png', 
            'body.png', 
            'head.png',
            'shoulder.png',
            'elbow.png',
            'hand.png',
            'upper_arm.png',
            'lower_arm.png',
            'upper_arm_back.png'
    ]).run(function(images) {
        var drawer = this.drawer;

        var shoe_img = drawer.image(images[0], [-10, -30], [15, 40]);
        var lower_leg_img = drawer.image(images[1], [-5, -45], [10, 50]);
        var knee_img = drawer.image(images[2], [-10, -10], [20, 20]);
        var upper_leg_img = drawer.image(images[3], [-5, -60], [10, 60]);
        var body_img = drawer.image(images[4], [-30, -30], [60, 60]);
        var head_img = drawer.image(images[5], [-30, -30], [60, 60]);
        var shoulder_img = drawer.image(images[6], [-10, -10], [20, 20]);
        var elbow_img = drawer.image(images[7], [-5, -5], [10, 10]);
        var hand_img = drawer.image(images[8], [-5, -5], [10, 10]);
        var upper_arm_img = drawer.image(images[9], [-5, -40], [10, 40]);
        var lower_arm_img = drawer.image(images[10], [-5, -40], [10, 40]);
        var upper_arm_back_img = drawer.image(images[11], [-5, -40], [10, 40]);


        function walk() {

            var body = new BodyPart(CI(body_img));
            var left_foot = new BodyPart(CI(shoe_img), 
        IV([0, [0, -30]], [100, [0, 0]], [400, [0, 30]], [700, [0, 0]], [800, [0, -30]]));
            var right_foot = left_foot.flip_x().clone_with_offset(400);

            var left_knee = new BodyPart(
                CI(knee_img),
                IV([0, [0, -30]], [400, [0, 20]], [600, [0, 0]], [700, [0, -25]], [800, [0, -30]])
            );
            var right_knee = left_knee.flip_x().clone_with_offset(400);
            var left_hip = new BodyPart(null, CV(-15, 0));
            var right_hip = left_hip.flip_x().clone_with_offset(400);
            var head = new BodyPart(CI(head_img));

            var left_shoulder = new BodyPart(CI(shoulder_img), IV([0, [-35, 5]], [400, [-35, -5]], [800, [-35, 5]]));
            var right_shoulder = left_shoulder.flip_x().clone_with_offset(400);
            var left_elbow = new BodyPart(CI(elbow_img),
                IV([0, [0, 30]], [200, [-5, 0]], [400, [-10, -30]], [600, [-5, 0]], [800, [0, 30]])
            );
            var right_elbow = left_elbow.flip_x().clone_with_offset(400);
            var left_hand = new BodyPart(CI(hand_img),
                IV([0, [-5, 20]], [200, [0, 0]], [400, [10, -30]], [600, [0, 0]], [800, [-5, 20]])
            );
            var right_hand = left_hand.flip_x().clone_with_offset(400);

            var left_upper_arm = new BodyPart(
                ID([0, upper_arm_back_img], [200, upper_arm_img], [600, upper_arm_back_img], [800, upper_arm_back_img])
            );
            var right_upper_arm = left_upper_arm.clone_with_offset(400);

            return new HumanoidModel(
                body,
                left_foot, 
                right_foot, 
                head, 
                left_knee, 
                right_knee, 
                left_hip, 
                right_hip,
                left_shoulder,
                right_shoulder,
                left_elbow,
                right_elbow,
                left_hand,
                right_hand,
                left_upper_arm,
                right_upper_arm
            ).to_seq();
        }

        function still() {
            var body = new BodyPart(CI(body_img));
            var left_foot = new BodyPart(CI(shoe_img), CV(0, 0));
            var right_foot = left_foot.flip_x();
            var head = new BodyPart(CI(head_img));
            var left_knee = new BodyPart(CI(knee_img), CV(0, 0));
            var right_knee = left_knee.flip_x().clone_with_offset(4);
            var left_hip = new BodyPart(null, CV(-15, 0));
            var right_hip = left_hip.flip_x().clone_with_offset(4);
            var left_shoulder = new BodyPart(CI(shoulder_img), CV(-35, 0));
            var right_shoulder = left_shoulder.flip_x();
            var left_elbow = new BodyPart(CI(elbow_img), CV(-5, 0));
            var right_elbow = left_elbow.clone_with_offset(4);
            var left_hand = new BodyPart(CI(hand_img), CV(0, 0));
            var right_hand = left_hand.clone_with_offset(4);
            var left_upper_arm = new BodyPart(CI(upper_arm_img));
            var right_upper_arm = left_upper_arm.flip_x();
            
            return new HumanoidModel(
                body,
                left_foot, 
                right_foot, 
                head, 
                left_knee, 
                right_knee, 
                left_hip, 
                right_hip,
                left_shoulder,
                right_shoulder,
                left_elbow,
                right_elbow,
                left_hand,
                right_hand,
                left_upper_arm,
                right_upper_arm
            ).to_seq();
        }

        this.seqs = {
            still: still(),
            walk: walk()
        };

        this.sequence_manager = function(initial_seq) {
            return new SequenceManager(initial_seq);
        }

        this.scene_graph = function(drawer, m) {
            return new SceneGraph(drawer, m, 'body', [
                'left_hip', [
                    {connect_to: 'left_knee', with: upper_leg_img},
                    'left_knee', [
                        'left_foot',
                        {connect_to: 'left_foot', with: lower_leg_img}
                    ]
                ],
                'right_hip', [
                    {connect_to: 'right_knee', with: upper_leg_img},
                    'right_knee', [
                        'right_foot',
                        {connect_to: 'right_foot', with: lower_leg_img}
                    ]
                ]
            ], [
                'head',
                'left_shoulder', [
                    {connect_to: 'left_elbow', with: 'left_upper_arm'},
                    'left_elbow', [
                        {connect_to: 'left_hand', with: lower_arm_img},
                        'left_hand'
                    ],
                ],
                'right_shoulder', [
                    {connect_to: 'right_elbow', with: 'right_upper_arm'},
                    'right_elbow', [
                        {connect_to: 'right_hand', with: lower_arm_img},
                        'right_hand'
                    ]
                ]
            ]);
        }

        then(this);
    }.bind(this))
}
