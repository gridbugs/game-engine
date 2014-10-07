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
    function tick() {
        cu.clear();
        if (agent.absolute_control_tick()) {
            x+=Math.PI/20;
        }
        //walk.to_points(x).draw_topdown(cu, agent.pos, _angle_between(agent.pos, Input.get_mouse_pos()), 0.5);
        walk.to_points(x).draw_topdown(cu, agent.pos, agent.facing, 0.5);
        //agent.draw();
        segs.map(function(s){cu.draw_segment(s)});
        setTimeout(tick, 50);
    }
    //tick();

    walk_forward = {
        left_leg:  {0: [-50, -100], 1: [-50, 0], 2: [-50, 100], 3: [-50, 0], 4: [-50, -100]},
        right_leg: {0: [50, 100],   1: [50, 0],  2: [50, -100], 3: [50, 0],  4: [50, 100]}
    };

    stand_still = {
        left_leg:  {0: [-50, 0], 1: [-50, 0]},
        right_leg: {0: [50, 0],  1: [50, 0]}
    };

    a = new SequenceCollection(walk_forward);
    b = new SequenceCollection(stand_still);

    c = new SequenceCollectionManager(a);
    c.start(0.1);
    c.set_offset([400, 400]);
    function tick0() {
        cu.clear();
        var pts = c.next();
        for (var i in pts) {
            cu.draw_point(pts[i]);
        }
        setTimeout(tick0, 50);
    }
    tick0();
});
