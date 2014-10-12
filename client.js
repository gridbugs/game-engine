var a, b, c, a1, a2, m, sg;
var walk_forward, stand_still;

var s0, s1, s2, sm;
var cu;
var ai0;
var editor;
$(function() {
    Input.set_canvas_offset(parseInt($("#screen").css("left")), parseInt($("#screen").css("top")));
    Input.init();
    cu = new CanvasUtil($("#screen")[0]);

    cu.canvas.width = $(window).width();
    cu.canvas.height = $(window).height();

    $(document).resize(function() {
        cu.canvas.width = $(window).width();
        cu.canvas.height = $(window).height();
    });

    var agent = new Agent([200, 200], 0);

    var segs = [[[100, 100], [200, 400]], [[100, 100], [400, 50]], [[400, 50], [600, 50]]];
    agent.set_segs(segs);

 
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
    ]).load_async(function(images) {

        var shoe_img = new ImageClosure(images[0], [-10, -30], [20, 40]);
        var lower_leg_img = new ImageClosure(images[1], [-5, -45], [10, 50]);
        var knee_img = new ImageClosure(images[2], [-10, -10], [20, 20]);
        var upper_leg_img = new ImageClosure(images[3], [-5, -60], [10, 60]);
        var body_img = new ImageClosure(images[4], [-50, -50], [100, 100]);
        var head_img = new ImageClosure(images[5], [-45, -50], [90, 90]);
        var shoulder_img = new ImageClosure(images[6], [-10, -10], [20, 20]);
        var elbow_img = new ImageClosure(images[7], [-8, -8], [16, 16]);
        var hand_img = new ImageClosure(images[8], [-10, -10], [20, 20]);
        var upper_arm_img = new ImageClosure(images[9], [-5, -40], [10, 40]);
        var lower_arm_img = new ImageClosure(images[10], [-5, -40], [10, 40]);

        function to_r(v) {
            return Math.PI/2-[v[0], -v[1]].v2_angle();
        }
        function to_s(v) {
            var a = [1, v.v2_len()/40];
            console.debug(a);
            return a;
        }

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
                IV([0, [0, -50]], [4, [0, 50]], [6, [0, 0]], [7, [0, -45]], [8, [0, -50]])
            );
            var right_knee = left_knee.flip_x().clone_with_offset(4);
            var left_hip = new BodyPart(null, CV(-35, 0));
            var right_hip = left_hip.flip_x().clone_with_offset(4);
            var head = new BodyPart(SV(head_img));

            var left_lower_leg = new BodyPart(
                SV(lower_leg_img), CV(0, 0), CS(0),
                IV([0, [1, 30/50]], [1, [1, 0]], [4, [1, -30/50]], [7, [1, 0]], [8, [1, 30/50]])
            );
            var right_lower_leg = left_lower_leg.flip_x().clone_with_offset(4);
            var left_shoulder = new BodyPart(SV(shoulder_img), CV(-55, 0));
            var right_shoulder = left_shoulder.flip_x();
            var left_elbow = new BodyPart(SV(elbow_img),
                IV([0, [-10, 30]], [2, [-5, 0]], [4, [-15, -30]], [6, [-5, 0]], [8, [-10, 30]])
            );
            var right_elbow = left_elbow.clone_with_offset(4);
            var left_hand = new BodyPart(SV(hand_img),
                IV([0, [-5, 20]], [2, [0, 0]], [4, [10, -30]], [6, [0, 0]], [8, [-5, 20]])
            );
            var right_hand = left_hand.clone_with_offset(4);

            var left_upper_arm = left_elbow.connect(SV(upper_arm_img));
            /*
            var left_upper_arm = new BodyPart(SV(upper_arm_img), CV(0, 0),
                IA([0, to_r([-10, 30])], [2, to_r([-5, 0])], [4, to_r([-15, -30])], [6, to_r([-5, 0])], [8, to_r([-10, 30])]),
                IV([0, to_s([-10, 30])], [2, to_s([-5, 0])], [4, to_s([-15, -30])], [6, to_s([-5, 0])], [8, to_s([-10, 30])])

                //IS([0, [-10, -30].v2_angle()], [2, [-10, -30].v2_angle()], [4, [-10, -30].v2_angle()], [6, [-10, -30].v2_angle()], [8, [-10, -30].v2_angle()])
            );
            */
            var right_upper_arm = right_elbow.connect(SV(upper_arm_img));
            console.debug(left_upper_arm);
            console.debug(right_upper_arm);
            return new HumanoidModel(
                left_foot, 
                right_foot, 
                head, 
                left_upper_leg, 
                right_upper_leg, 
                left_knee, 
                right_knee, 
                left_hip, 
                right_hip,
                left_lower_leg,
                right_lower_leg,
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
            var left_foot = new BodyPart(SV(shoe_img), CV(0, 0));
            var right_foot = left_foot.flip_x();
            var head = new BodyPart(SV(head_img));
            var left_upper_leg = new BodyPart(SV(upper_leg_img), CV(0, 0), CS(0), CV(1, 0));
            var right_upper_leg = left_upper_leg.flip_x().clone_with_offset(4);
            var left_knee = new BodyPart(SV(knee_img), CV(0, 0));
            var right_knee = left_knee.flip_x().clone_with_offset(4);
            var left_hip = new BodyPart(null, CV(-35, 0));
            var right_hip = left_hip.flip_x().clone_with_offset(4);
            var left_lower_leg = new BodyPart(SV(lower_leg_img), CV(0, 0), CS(0), CV(1, 0));
            var right_lower_leg = left_lower_leg.flip_x().clone_with_offset(4);
            var left_shoulder = new BodyPart(SV(shoulder_img), CV(-30, 0));
            var right_shoulder = left_shoulder.flip_x();
            var left_elbow = new BodyPart(SV(elbow_img), CV(-5, 0));
            var right_elbow = left_elbow.clone_with_offset(4);
            var left_hand = new BodyPart(SV(hand_img), CV(0, 0));
            var right_hand = left_hand.clone_with_offset(4);
            var left_upper_arm = new BodyPart(SV(upper_arm_img), CV(0, 0));
            var right_upper_arm = left_upper_arm.clone_with_offset(4);
            
            return new HumanoidModel(
                left_foot, 
                right_foot, 
                head, 
                left_upper_leg, 
                right_upper_leg, 
                left_knee, 
                right_knee, 
                left_hip, 
                right_hip,
                left_lower_leg,
                right_lower_leg,
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

        var still_seq = still();
        var walk_seq = walk();

        m = new SequenceManager(walk_seq).start(0.2);
        
        sg = 
            SGRoot('body', SV(body_img),
                [ // before
                    SG('left_hip', m, [SG('left_upper_leg', m), SG('left_knee', m, [SG('left_foot', m), SG('left_lower_leg', m)])]),
                    SG('right_hip', m, [SG('right_upper_leg', m), SG('right_knee', m, [SG('right_foot', m), SG('right_lower_leg', m)])])
                ],
                [ // after
                    SG('head', m), 
                    SG('left_shoulder', m, [SG('left_upper_arm', m), SG('left_elbow', m, [SG('left_hand', m)])]),
                    SG('right_shoulder', m, [SG('right_upper_arm', m), SG('right_elbow', m, [SG('right_hand', m)])])
                ]
            );

        sg.global_transform([200, 200]);
        sg.draw(cu.ctx);
        
        agent.facing = -Math.PI/2;
        agent.move_speed = 8;
        var state = 1;
        function t() {
            cu.clear();
       
            if (state == 0 && agent.absolute_control_tick()) {
                state = 1;
                m.update(still_seq);
            } else if (state == 1 && !agent.absolute_control_tick()) {
                state = 0;
                m.update(walk_seq, 1, -1);
            }
 
            sg.global_transform(agent.pos, agent.facing + Math.PI/2);
            sg.draw(cu.ctx);
            m.tick();
       //     agent.draw();
            segs.map(function(s){cu.draw_segment(s)});
            setTimeout(t, 33);
        }
        t();

    });

    a1 = new IV([0, [200, 200]], [1, [200, 300]], [2, [300, 300]], [5, [200, 200]]);
    a2 = new IV([0, [300, 300]], [1, [300, 100]], [2, [100, 400]], [5, [300, 300]]);
    a3 = new CV(500, 500);



    b = new SequenceInterpolator(a1);

    b.start(0.1);

    function tick() {
        cu.clear();
        b.tick();
        var pt = b.get().val();
        cu.draw_point(pt);
        setTimeout(tick, 50);
    }
    //tick();
});
