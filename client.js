var cu;
var ai0;
var editor;
$(function() {
    Input.set_canvas_offset(parseInt($("#screen").css("left")), parseInt($("#screen").css("top")));
    Input.init();
    cu = new CanvasUtil();
    cu.register_canvas($("#screen")[0]);

    cu.canvas.width = $(window).width();
    cu.canvas.height = $(window).height();

    $(document).resize(function() {
        cu.canvas.width = $(window).width();
        cu.canvas.height = $(window).height();
    });


    function draw_leg(hip_angle, knee_angle) {
        const upper_length = 100;
        const lower_length = 80;

        var rotate_amount = Math.PI/2;
        var knee = angle_to_unit_vector(hip_angle).v2_smult(upper_length);
        var foot = knee.v2_add(angle_to_unit_vector(angle_normalize(hip_angle+knee_angle)).v2_smult(lower_length));
        knee = knee.v2_rotate(rotate_amount);
        foot = foot.v2_rotate(rotate_amount);


        var mid = [200, 200];

        var hip_pt = [200, 200];
        var knee_pt = hip_pt.v2_add(knee);
        var foot_pt = hip_pt.v2_add(foot);

        cu.draw_point(hip_pt);
        cu.draw_point(knee_pt);
        cu.draw_point(foot_pt);

        cu.draw_segment([hip_pt, knee_pt]);
        cu.draw_segment([knee_pt, foot_pt]);

    }

    function upper_fn(x) {
        
        return - (Math.PI/6) * Math.cos(x);
    }

    function lower_fn(x) {
        return - (Math.PI/4) * Math.max(Math.sin(x), 0);
    }

    function tick(x) {
        cu.clear();

        draw_leg(upper_fn(x), lower_fn(x));

        setTimeout(tick, 50, x+Math.PI/48);
    }

//    tick(0);
    var g = new Graph(cu, 1, 1, 0, 0, undefined, undefined, undefined, undefined, 8);

    g.set_colours(
        tinycolor({h: 0, s: 255, v: 255, a: 1}),
        tinycolor({h: 255, s: 255, v: 255, a: 1})
    );

    var a;
    var d = function() {
        g.plot_radial(R(function(angle, dist){
            return Math.sin(angle + a + dist/100);
        }).f());
        a+=0.1;
        setTimeout(d, 30)
    };
    a=0;d()


});
