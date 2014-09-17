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


    var hip_pt = [1000, 200];
    
    function draw_leg(hip_angle, knee_angle) {
        const upper_length = 100;
        const lower_length = 80;

        var rotate_amount = Math.PI/2;
        var knee = angle_to_unit_vector(hip_angle).v2_smult(upper_length);
        var foot = knee.v2_add(angle_to_unit_vector(angle_normalize(hip_angle+knee_angle)).v2_smult(lower_length));
        knee = knee.v2_rotate(rotate_amount);
        foot = foot.v2_rotate(rotate_amount);


        var knee_pt = hip_pt.v2_add(knee);
        var foot_pt = hip_pt.v2_add(foot);

        cu.draw_point(hip_pt);
        cu.draw_point(knee_pt);
        cu.draw_point(foot_pt);

        cu.draw_segment([hip_pt, knee_pt]);
        cu.draw_segment([knee_pt, foot_pt]);

    }

    var humanoid = new Humanoid(80, 100);

    var walk = new Walk(humanoid, Math.PI*2,
        /* hip */  function(x) {return - (Math.PI/6) * triangle_wave.sin_to_cos()(x)},
        /* knee */ function(x) {return - (Math.PI/4) * Math.max(triangle_wave(x), 0)}
    );

    function tick(x) {
        cu.clear();

        walk.to_points(x).draw_side(cu, [200, 200]);

        setTimeout(tick, 50, x+Math.PI/24);
    }

    tick(0);
    /*
    new Graph(cu, 50, 50).draw_borders()
        .plot_1var(walk.get_left_hip_angle, "red")
        .plot_1var(walk.get_left_knee_angle, "orange")
        .plot_1var(walk.get_right_hip_angle, "blue")
        .plot_1var(walk.get_right_knee_angle, "purple");
    */
});
