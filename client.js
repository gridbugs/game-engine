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

    walk_forward = {
        left_leg:  {0: [-10, -20], 0.5: [-10, -16], 1: [-10, 0], 1.5: [-10, 16], 2: [-10, 20], 2.5: [-10, 16], 3: [-10, 0], 3.5: [-10, -16], 4: [-10, -20]},
        right_leg:  {0: [10, 20], 0.5: [10, 16], 1: [10, 0], 1.5: [10, -16], 2: [10, -20], 2.5: [10, -16], 3: [10, 0], 3.5: [10, 16], 4: [10, 20]},
    };

    stand_still = {
        left_leg:  {0: [-10, 0], 1: [-10, 0]},
        right_leg: {0: [10, 0],  1: [10, 0]}
    };

    a = new SequenceCollection(walk_forward);
    b = new SequenceCollection(stand_still);

    c = new SequenceCollectionManager(b);
    c.start(0.2);
    var state = 1;
    agent.facing = Math.PI/2;
    function tick() {
        cu.clear();
        if (state == 0 && agent.absolute_control_tick()) {
            state = 1;
            c.switch_to(a, 0.01, 0);
        } else if (state == 1 && !agent.absolute_control_tick()) {
            state = 0;
            c.switch_to(b, 0.5, 0);
        }
        
        var p = c.next();
        move_body(p, agent.pos, agent.facing - Math.PI/2);
        for (var i in p) {
            cu.draw_circle([p[i], 8]);
        }
        segs.map(function(s){cu.draw_segment(s)});
        setTimeout(tick, 50);
    }
    tick();
 
});
