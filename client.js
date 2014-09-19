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


    const impact = 5*Math.PI/6;
    const impact_len = Math.PI/7;
    const impact_strength = 0.1;

    function a(x) {
        return x + Math.sin(x)/2;
    }

    const increase = 0.1;
    function b(x) {
        return Math.pow((Math.sin(x-Math.PI/2)/2+0.5), 50)*increase;
    }
    function c(x) {
        const half = increase/2;
        return -Math.cos(x)*(1+half) + half;
    }
    function d(x) {
        return -Math.cos(a(x)) + b(x);
    }
    function ab(x) {
        return -Math.cos(in_lowest(x)*Math.PI/impact);
    }
    function ac(x) {
        return (-Math.cos((in_lowest(x)-impact)*(Math.PI/impact_len))+1)*impact_strength/2;
    }
    function ad(x) {
        return (1+impact_strength/2)*Math.cos((Math.PI/(2*Math.PI-impact-impact_len))*(in_lowest(x)-impact-impact_len))+impact_strength/2;
    }

    function in_second_half(x) {
        return Math.abs(Math.floor(x/Math.PI)%2);
    }
    function in_first_half(x) {
        return 1-Math.abs(Math.floor(x/Math.PI)%2);
    }

    function in_range(lo, hi) {
        return function(x) {
            var a = x - Math.floor(x/(Math.PI*2))*Math.PI*2;
            if (a >= lo && a < hi) {
                return 1;
            } else {
                return 0;
            }
        }
    }
    function in_lowest(x) {
        return x - Math.floor(x/(Math.PI*2))*Math.PI*2;
    }

    function upper(x) {
        return in_range(0, impact)(x)*ab(x) +
               in_range(impact, impact + impact_len)(x)*(1+ac(x)) +
               in_range(impact + impact_len, Math.PI*2)(x)*ad(x);
    }

    const mult = 2.2;
    function e(x) {
        return Math.pow(Math.cos(x)/2+0.5, 2)*2-1;
    }
    function f(x) {
        return x + Math.sin(x)/1.5;
    }
    function g(x) {
        return -e(x-Math.PI);
    }
    function h(x) {
        return in_range(0, Math.PI)(x)*e(x) + in_range(Math.PI, Math.PI*2)(x)*g(x);
    }
    function aa(x) {
        x = in_lowest(x);
        return h(2*x/3);
    }


    var guidecol = 'lightgrey';
    new Graph(cu, 80, 200).draw_borders()
        .draw_v_line(0, guidecol, 1)
        .draw_v_line(Math.PI/2, guidecol, 1)
        .draw_v_line(Math.PI, guidecol, 1)
        .draw_v_line(3*Math.PI/2, guidecol, 1)
        .draw_v_line(2*Math.PI, guidecol, 1)
        .draw_v_line(impact, 'blue', 1)
        .draw_v_line(impact+impact_len, 'blue', 1)
        .draw_h_line(1, guidecol, 1)
        .draw_h_line(0, guidecol, 1)
        .draw_h_line(-1, guidecol, 1)
        .plot_1var(function(x) {return Math.sin(x)}, guidecol, 1)
//        .plot_1var(e, 'blue', 1)
//        .plot_1var(f, 'grey', 1)
//        .plot_1var(g, 'grey', 1)
        .plot_1var(upper, 'blue', 2);
 


    var humanoid = new Humanoid(80, 100);

    var walk = new Walk(humanoid, Math.PI*2,
        /* hip */  upper,
        /* knee */ function(x) {return 0}
    );

    function tick(x) {
        cu.clear();

        walk.to_points(x).draw_side(cu, [200, 200]);

        setTimeout(tick, 50, x+Math.PI/24);
    }

//    tick(0);

});
