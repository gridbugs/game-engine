var a, b, c;
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

    const half_walk_period = Math.PI;
    const impact = 5*Math.PI/6;
    const impact_len = Math.PI/5;

    var humanoid = new Humanoid(80, 100, 80, 70);

    var walk = Walk.humanoid_walk(humanoid);

    var agent = new Agent([200, 200], 0);
    //Agent.set_controlled_agent(agent);

    var segs = [[[100, 100], [200, 400]], [[100, 100], [400, 50]], [[400, 50], [600, 50]]];
    agent.set_segs(segs);

    var x = 0;
   //tick();

    function move_body(b, v, a) {
        for (var i in b) {
            b[i] = b[i].v2_rotate(a).v2_add(v);
        }
    }

    var fx = 12;  // foot lateral offset
    var ff = 24;  // foot forward max
    var ffs = 16; // foot forward slow point
    var fb = 20;  // foot backward max
    var fbs = 18; // foot backward slow point
    var kx = 12;  // knee lateral offset
    var kf = 16;  // knee forward max
    var kb = 10;  // knee backward max
    var hip_x = 10;
    var hip_f = 1;
    var sx = 10; // shoulder lateral offset
    var sf = 3; // shoulder forward movement
    var efx = 10;
    var emx = 13;
    var ebx = 11;
    var ef = 12;
    var eb = 7;
    var hfx = 6;
    var hmx = 14;
    var hbx = 12;
    var hf = 18;
    var hb = 10;

    walk_forward = {
        left_foot:  {0: [-fx, -ff], 0.5: [-fx, -ffs], 1: [-fx, 0], 1.5: [-fx, fbs], 2: [-fx, fb], 2.5: [-fx, fbs], 3: [-fx, 0], 3.5: [-fx, -ffs], 4: [-fx, -ff]},
        left_knee: {0: [-kx, -kf], 0.5: [-kx, -kf], 1: [-kx, 0], 1.5: [-kx, kb], 2.5: [-kx, kb], 3.5: [-kx, -kf], 4: [-kx, -kf]},
        left_hip:  {0: [-hip_x, -hip_f], 2: [-hip_x, hip_f], 4: [-hip_x, -hip_f]},
        left_shoulder: {0: [-sx, sf], 2: [-sx, -sf], 4: [-sx, sf]},
        left_elbow: {0: [-ebx, eb], 1: [-emx, 0], 2: [-efx, -ef], 3: [-emx, 0], 4: [-ebx, eb]},
        left_hand: {0: [-hbx, hb], 1: [-hmx, 0], 2: [-hfx, -hf], 3: [-hmx, 0], 4: [-hbx, hb]},

        right_foot:  {0: [fx, fb], 0.5: [fx, fbs], 1: [fx, 0], 1.5: [fx, -ffs], 2: [fx, -ff], 2.5: [fx, -ffs], 3: [fx, 0], 3.5: [fx, fbs], 4: [fx, fb]},
        right_knee: {0: [kx, kb], 0.5: [kx, kb], 1.5: [kx, -kf], 2.5: [kx, -kf], 3: [kx, 0], 3.5: [kx, kb], 4: [kx, kb]},
        right_hip:  {0: [hip_x, hip_f], 2: [hip_x, -hip_f], 4: [hip_x, hip_f]},
        right_shoulder: {0: [sx, -sf], 2: [sx, sf], 4: [sx, -sf]},
        right_elbow: {0: [efx, -ef], 1: [emx, 0], 2: [ebx, eb], 3: [emx, 0], 4: [efx, -ef]},
        right_hand: {0: [hfx, -hf], 1: [hmx, 0], 2: [hbx, eb], 3: [hmx, 0], 4: [hfx, -hf]},
    };

    var stand_foot_x = 14;
    var stand_knee_x = 13;

    stand_still = {
        left_foot:  {0: [-stand_foot_x, 0], 1: [-stand_foot_x, 0]},
        left_knee: {0: [-stand_knee_x, 0], 1: [-stand_knee_x, 0]},
        left_hip:  {0: [-hip_x, 0], 1: [-hip_x, 0]},
        left_shoulder: {0: [-sx, 0], 1: [-sx, 0]},
        left_elbow: {0: [-emx, 0], 1: [-emx, 0]},
        left_hand: {0: [-hmx, 0], 1: [-hmx, 0]},

        right_foot: {0: [stand_foot_x, 0],  1: [stand_foot_x, 0]},
        right_knee: {0: [stand_knee_x, 0], 1: [stand_knee_x, 0]},
        right_hip:  {0: [hip_x, 0], 1: [hip_x, 0]},
        right_shoulder: {0: [sx, 0], 1: [sx, 0]},
        right_elbow: {0: [emx, 0], 1: [emx, 0]},
        right_hand: {0: [hmx, 0], 1: [hmx, 0]},
    };

    a = new SequenceCollection(walk_forward);
    b = new SequenceCollection(stand_still);

    c = new SequenceCollectionManager(b);
    c.start(0.2);
    var state = 1;
    agent.facing = -Math.PI/2;
    agent.move_speed = 6;
    function tick() {
        cu.clear();
        if (state == 0 && agent.absolute_control_tick()) {
            state = 1;
            c.switch_to(a, 0.2, 1);
        } else if (state == 1 && !agent.absolute_control_tick()) {
            state = 0;
            c.switch_to(b, 0.5, 0);
        }
        
        var p = c.next();
//        agent.pos = [200, 200];
        move_body(p, agent.pos, agent.facing + Math.PI/2);
//        for (var i in p) {
            cu.draw_circle([p.left_foot, 5], 'blue');
            cu.draw_circle([p.left_knee, 5], 'red');
            cu.draw_circle([p.left_hip, 5], 'green');
            cu.draw_circle([p.left_shoulder, 5], 'cyan');
            cu.draw_circle([p.left_elbow, 5], 'orange');
            cu.draw_circle([p.left_hand, 5], 'yellow');
            
            cu.draw_circle([p.right_foot, 5], 'blue');
            cu.draw_circle([p.right_knee, 5], 'red');
            cu.draw_circle([p.right_hip, 5], 'green');
            cu.draw_circle([p.right_shoulder, 5], 'cyan');
            cu.draw_circle([p.right_elbow, 5], 'orange');
            cu.draw_circle([p.right_hand, 5], 'yellow');
//        }
        segs.map(function(s){cu.draw_segment(s)});
        setTimeout(tick, 50);
    }
    tick();
 
});
