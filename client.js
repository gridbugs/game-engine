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


    const walk_period = Math.PI*2;
    const half_walk_period = Math.PI;
    
    // point in period where foot touches the ground
    const impact = 5*half_walk_period/6;

    // time between foot touching the ground and leaving the ground
    const impact_len = half_walk_period/7;

    // size of the affect the impact between the foot and the ground has on the walk
    const impact_strength = 0.1;

    // point in the lower leg's trajectory after impact that switches from moving back to forward
    const skew_offset = 1;

    const upper_scale = 0.5;
    const lower_scale = 0.5;


    function forward_swing(x) {
        return -Math.cos(Wave.in_lowest(x)*half_walk_period/impact);
    }
    function impact_jolt(x) {
        return (-Math.cos((Wave.in_lowest(x)-impact)*(half_walk_period/impact_len))+1)*impact_strength/2;
    }
    function back_swing(x) {
        return (1+impact_strength/2)*Math.cos((half_walk_period/(2*half_walk_period-impact-impact_len))*(Wave.in_lowest(x)-impact-impact_len))+impact_strength/2;
    }

   
    function upper(x) {
        return (Wave.in_range(0, impact)(x)*forward_swing(x) +
               Wave.in_range(impact, impact + impact_len)(x)*(1+impact_jolt(x)) +
               Wave.in_range(impact + impact_len, walk_period)(x)*back_swing(x))*upper_scale;
    }

    function post_impact_skew(x) {
        x=Wave.in_lowest(x);
        return Wave.in_range(0, skew_offset)(x)*Function.through_pts([0,0],[skew_offset, half_walk_period/2])(x) +
               Wave.in_range(skew_offset, walk_period-skew_offset)(x)*Function.through_pts([skew_offset, half_walk_period/2],[walk_period-skew_offset,3*half_walk_period/2])(x) +
               Wave.in_range(walk_period-skew_offset, walk_period)(x)*Function.through_pts([walk_period-skew_offset,3*half_walk_period/2],[walk_period, walk_period])(x);
    }

    function post_impact(x) {
        return -Math.sin(post_impact_skew(((x-impact-skew_offset/2)*walk_period/(walk_period-impact))));
    }

    function pre_impact_flatenner(x) {
        return Math.sin(x)*0.5+x;
    }
    function pre_impact(x) {
        return Math.cos(pre_impact_flatenner(x*walk_period/(impact)));
    }

    function lower(x) {
        x=Wave.in_lowest(x);
        return ((Wave.in_range(0,impact)(x)*pre_impact(x) +
               Wave.in_range(impact, walk_period)(x)*post_impact(x))/2-0.5)*lower_scale;
    }

    function hip_bounce(x) {
        return Math.cos(x*2)*10;
    }

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
        .plot_1var(post_impact_skew, 'grey', 1)
//        .plot_1var(af, 'grey', 1)
//        .plot_1var(post_impact, 'red', 1)
//        .plot_1var(f, 'grey', 1)
//        .plot_1var(ah, 'blue', 1)
//        .plot_1var(pre_impact, 'blue', 1)
        .plot_1var(lower, 'red', 2)
        .plot_1var(upper, 'blue', 2)
//        .plot_1var(hip_bounce.divide(10), 'green', 2)
//        .plot_1var(through_pts([1, 1], [2, -1]), 'grey', 1)
//        .plot_1var(post_impact, 'grey', 1)
 


    var humanoid = new Humanoid(80, 100);

    var walk = new Walk(humanoid, walk_period,
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
