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
    
    const upper_scale = 0.5;
    const lower_scale = 0.5;

    function upper(x) {
        return (in_range(0, impact)(x)*ab(x) +
               in_range(impact, impact + impact_len)(x)*(1+ac(x)) +
               in_range(impact + impact_len, Math.PI*2)(x)*ad(x))*upper_scale;
    }

    const mult = 2.2;
    function e(x) {
        return Math.cos(f(x*Math.PI*2/impact));
    }
    function f(x) {
        return x + Math.sin(x)/1.2;
    }
    function g(x) {
        return Math.sin(x);
    }
    function h(x) {
        return x + Math.sin(x);
    }
    function aa(x) {
        return g(h(x));
    }

    const slant_offset = 1;
    function ae(x) {
        x=in_lowest(x);
        return in_range(0, slant_offset)(x)*through_pts([0,0],[slant_offset, Math.PI/2])(x) +
               in_range(slant_offset, Math.PI*2-slant_offset)(x)*through_pts([slant_offset, Math.PI/2],[Math.PI*2-slant_offset,3*Math.PI/2])(x) +
               in_range(Math.PI*2-slant_offset, Math.PI*2)(x)*through_pts([Math.PI*2-slant_offset,3*Math.PI/2],[Math.PI*2, Math.PI*2])(x);
    }
    function af(x) {
        return Math.sin(ae(x));
    }
    function ag(x) {
        //return -af((x-impact-impact_len)*Math.PI/(Math.PI*2-impact-impact_len));
        return -af((x-impact-slant_offset/2)*Math.PI*2/(Math.PI*2-impact));
    }

    function ah(x) {
        return Math.cos(x);
    }
    function aj(x) {
        return Math.sin(x)*0.5+x;
    }
    function ak(x) {
        return ah(aj(x*Math.PI*2/(impact)));
    }

    function lower(x) {
        x=in_lowest(x);
        return ((in_range(0,impact)(x)*ak(x) +
               in_range(impact, Math.PI*2)(x)*ag(x))/2-0.5)*lower_scale;
    }

    function through_pts(a, b) {
        var m = (b[1]-a[1])/(b[0]-a[0]); // rise over run
        var c = a[1] - m*a[0];
        return function(x) {
            return m*x+c;
        }
    }

    function hip_bounce(x) {
        return Math.cos(x*2)*10;
    }

    var guidecol = 'lightgrey';
    new Graph(cu, 80, 60).draw_borders()
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
//        .plot_1var(ae, 'grey', 1)
//        .plot_1var(af, 'grey', 1)
//        .plot_1var(ag, 'red', 1)
//        .plot_1var(f, 'grey', 1)
//        .plot_1var(ah, 'blue', 1)
//        .plot_1var(ak, 'blue', 1)
        .plot_1var(lower, 'red', 2)
        .plot_1var(upper, 'blue', 2)
        .plot_1var(hip_bounce, 'green', 2)
//        .plot_1var(through_pts([1, 1], [2, -1]), 'grey', 1)
//        .plot_1var(ag, 'grey', 1)
 


    var humanoid = new Humanoid(80, 100);

    var walk = new Walk(humanoid, Math.PI*2,
        /* hip */  upper,
        /* knee */ lower,
                   hip_bounce
    );

    function tick(x) {
        cu.clear();

        walk.to_points(x).draw_side(cu, [200, 200]);

        setTimeout(tick, 50, x+Math.PI/24);
    }

    tick(0);

});
