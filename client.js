var a, b, c;

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


    s0 = {
        0: [200, 200],
        0.5: [200, 220],
        1: [200, 300],
        1.5: [400, 300],
        5: [200, 200]
    };

    s1 = {
        0: [300, 300],
        1: [310, 300],
        2: [300, 300]
    };
    
    s2 = {
        0: [210, 210],
        1: [210, 210]
    };

    a = new Sequence(s0);
    b = new Sequence(s1);
    c = new Sequence(s2);
 
    sm = new SequenceManager();
    sm.start(a, 0.1);


    function tick0() {
        cu.clear();
        cu.draw_point(sm.next());
        setTimeout(tick0, 50);
    }
    tick0();
});
