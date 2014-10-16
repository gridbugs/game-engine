function WalkDemo(initial, interval, ctx) {
    Animation.prototype.init.call(this, initial, interval, ctx);
}
WalkDemo.prototype = new Animation();
WalkDemo.prototype.constructor = WalkDemo;

WalkDemo.init = Animation.init;
WalkDemo.init.run = function(then) {
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
            'lower_arm.png'
    ]).run(function(images) {

        var shoe_img = new ImageClosure(images[0], [-10, -30], [15, 40]);
        var lower_leg_img = new ImageClosure(images[1], [-5, -45], [10, 50]);
        var knee_img = new ImageClosure(images[2], [-10, -10], [20, 20]);
        var upper_leg_img = new ImageClosure(images[3], [-5, -60], [10, 60]);
        var body_img = new ImageClosure(images[4], [-30, -30], [60, 60]);
        var head_img = new ImageClosure(images[5], [-30, -30], [60, 60]);
        var shoulder_img = new ImageClosure(images[6], [-10, -10], [20, 20]);
        var elbow_img = new ImageClosure(images[7], [-5, -5], [10, 10]);
        var hand_img = new ImageClosure(images[8], [-5, -5], [10, 10]);
        var upper_arm_img = new ImageClosure(images[9], [-5, -40], [10, 40]);
        var lower_arm_img = new ImageClosure(images[10], [-5, -40], [10, 40]);

        function walk() {
            var left_foot = new BodyPart(SV(shoe_img), IV([0, [0, -30]], [1, [0, 0]], [4, [0, 30]], [7, [0, 0]], [8, [0, -30]]));
            var right_foot = left_foot.flip_x().clone_with_offset(4);
            var left_upper_leg = new BodyPart(
                    SV(upper_leg_img),
                    CV(0, 0),
                    CS(0),
                    IV([0, [1, 50/60]], [4, [1, -50/60]], [6, [1, 0]], [7, [1, 45/60]], [8, [1, 50/60]])
                );
            var right_upper_leg = left_upper_leg.flip_x().clone_with_offset(4);
            var left_knee = new BodyPart(
                SV(knee_img),
                IV([0, [0, -30]], [4, [0, 20]], [6, [0, 0]], [7, [0, -25]], [8, [0, -30]])
            );
            var right_knee = left_knee.flip_x().clone_with_offset(4);
            var left_hip = new BodyPart(null, CV(-15, 0));
            var right_hip = left_hip.flip_x().clone_with_offset(4);
            var head = new BodyPart(SV(head_img));

            var left_lower_leg = new BodyPart(
                SV(lower_leg_img), CV(0, 0), CS(0),
                IV([0, [1, 30/50]], [1, [1, 0]], [4, [1, -30/50]], [7, [1, 0]], [8, [1, 30/50]])
            );
            var right_lower_leg = left_lower_leg.flip_x().clone_with_offset(4);
            var left_shoulder = new BodyPart(SV(shoulder_img), IV([0, [-35, 5]], [4, [-35, -5]], [8, [-35, 5]]));
            var right_shoulder = left_shoulder.flip_x().clone_with_offset(4);
            var left_elbow = new BodyPart(SV(elbow_img),
                IV([0, [0, 30]], [2, [-5, 0]], [4, [-10, -30]], [6, [-5, 0]], [8, [0, 30]])
            );
            var right_elbow = left_elbow.clone_with_offset(4);
            var left_hand = new BodyPart(SV(hand_img),
                IV([0, [-5, 20]], [2, [0, 0]], [4, [10, -30]], [6, [0, 0]], [8, [-5, 20]])
            );
            var right_hand = left_hand.clone_with_offset(4);

            return new HumanoidModel(
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
                right_hand
            ).to_seq();
        }

        function still() {
            var left_foot = new BodyPart(SV(shoe_img), CV(0, 0));
            var right_foot = left_foot.flip_x();
            var head = new BodyPart(SV(head_img));
            var left_upper_leg = new BodyPart(SV(upper_leg_img), CV(0, 0), CS(0), CV(1, 0));
            var right_upper_leg = left_upper_leg.flip_x().clone_with_offset(4);
            var left_knee = new BodyPart(SV(knee_img), CV(0, 0));
            var right_knee = left_knee.flip_x().clone_with_offset(4);
            var left_hip = new BodyPart(null, CV(-15, 0));
            var right_hip = left_hip.flip_x().clone_with_offset(4);
            var left_lower_leg = new BodyPart(SV(lower_leg_img), CV(0, 0), CS(0), CV(1, 0));
            var right_lower_leg = left_lower_leg.flip_x().clone_with_offset(4);
            var left_shoulder = new BodyPart(SV(shoulder_img), CV(-35, 0));
            var right_shoulder = left_shoulder.flip_x();
            var left_elbow = new BodyPart(SV(elbow_img), CV(-5, 0));
            var right_elbow = left_elbow.clone_with_offset(4);
            var left_hand = new BodyPart(SV(hand_img), CV(0, 0));
            var right_hand = left_hand.clone_with_offset(4);
            
            return new HumanoidModel(
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
                right_hand
            ).to_seq();
        }

        WalkDemo.seqs = {
            still: still(),
            walk: walk()
        };

        WalkDemo.sequence_manager = function(initial_seq, interval) {
            return new SequenceManager(initial_seq).start(interval);
        }

        WalkDemo.scene_graph = function(m) {
            
            var left_upper_arm = m.g('left_elbow_t').connect(SV(upper_arm_img));
            var left_lower_arm = m.g('left_hand_t').connect(SV(lower_arm_img));
            var right_upper_arm = m.g('right_elbow_t').connect(SV(upper_arm_img));
            var right_lower_arm = m.g('right_hand_t').connect(SV(lower_arm_img));
            var left_upper_leg = m.g('left_knee_t').connect(SV(upper_leg_img));
            var left_lower_leg = m.g('left_foot_t').connect(SV(lower_leg_img));
            var right_upper_leg = m.g('right_knee_t').connect(SV(upper_leg_img));
            var right_lower_leg = m.g('right_foot_t').connect(SV(lower_leg_img));

            return SGRoot('body', SV(body_img),
                [ // before
                    SG('left_hip', m, [SG('left_upper_leg', left_upper_leg), SG('left_knee', m, [SG('left_foot', m), SG('left_lower_leg', left_lower_leg)])]),
                    SG('right_hip', m, [SG('right_upper_leg', right_upper_leg), SG('right_knee', m, [SG('right_foot', m), SG('right_lower_leg', right_lower_leg)])])
                ],
                [ // after
                    SG('head', m), 
                    SG('left_shoulder', m, [SG('left_uppper_arm', left_upper_arm), SG('left_elbow', m, [SG('left_lower_arm', left_lower_arm), SG('left_hand', m)])]),
                    SG('right_shoulder', m, [SG('right_upper_arm', right_upper_arm), SG('right_elbow', m, [SG('right_lower_arm', right_lower_arm), SG('right_hand', m)])])
                ]
            );
        }

        then();
    })
}
