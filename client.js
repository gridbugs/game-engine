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

//    console.debug(walk.get_left_shoulder_angle);
/*
    var guidecol = 'lightgrey';
    new Graph(cu, 80, 60).draw_borders()
        .draw_v_line(0, guidecol, 1)
        .draw_v_line(half_walk_period/2, guidecol, 1)
        .draw_v_line(half_walk_period, guidecol, 1)
        .draw_v_line(3*half_walk_period/2, guidecol, 1)
        .draw_v_line(2*half_walk_period, guidecol, 1)
        .draw_v_line(impact, 'blue', 1)
        .draw_v_line(impact+impact_len, 'blue', 1)
        .draw_h_line(1, guidecol, 1)
        .draw_h_line(0, guidecol, 1)
        .draw_h_line(-1, guidecol, 1)
        .plot_1var(function(x) {return Math.sin(x)}, guidecol, 1)
//        .plot_1var(walk.get_left_shoulder_x_position.divide(10), 'blue', 2)
//        .plot_1var(walk.get_left_shoulder_angle, 'red', 2)
        .plot_1var(walk.get_left_knee_angle, 'blue', 2)
        .plot_1var(walk.get_left_elbow_angle, 'orange', 2)
        .plot_1var(walk.get_left_shoulder_angle, 'red', 2)
//        .plot_1var(walk.get_right_elbow_angle, 'cyan', 2)
 */


    function tick(x) {
        cu.clear();

//        walk.to_points(x).draw_side(cu, [200, 400]);
        var centre = [400, 400];
        walk.to_points(x).draw_topdown(cu, centre, _angle_between(centre, Input.get_mouse_pos()), 0.5);

        setTimeout(tick, 50, x+Math.PI/12);
    }

    tick(0);

});
