function Walk(humanoid, period, get_hip_angle, get_knee_angle, get_hip_y_position, get_shoulder_x_position, get_shoulder_y_position, get_shoulder_angle, get_elbow_angle) {
    this.humanoid = humanoid;

    this.get_left_hip_angle = get_hip_angle;
    this.get_left_knee_angle = get_knee_angle;
    this.get_right_hip_angle = get_hip_angle.slide_x(period/2);
    this.get_right_knee_angle = get_knee_angle.slide_x(period/2);
    this.get_hip_y_position = get_hip_y_position;
    this.get_left_shoulder_x_position = get_shoulder_x_position.slide_x(period/2);
    this.get_left_shoulder_y_position = get_shoulder_y_position.slide_x(period/2);
    this.get_right_shoulder_x_position = get_shoulder_x_position;
    this.get_right_shoulder_y_position = get_shoulder_y_position;
    this.get_left_shoulder_angle = get_shoulder_angle;
    this.get_right_shoulder_angle = get_shoulder_angle.slide_x(period/2);
    this.get_left_elbow_angle = get_elbow_angle;
    this.get_right_elbow_angle = get_elbow_angle.slide_x(period/2);
}

Walk.prototype.to_points = function(x) {
    return this.humanoid.to_points(
        this.get_left_knee_angle(x),
        this.get_right_knee_angle(x),
        this.get_left_hip_angle(x),
        this.get_right_hip_angle(x),
        this.get_hip_y_position(x),
        this.get_left_shoulder_x_position(x),
        this.get_left_shoulder_y_position(x),
        this.get_right_shoulder_x_position(x),
        this.get_right_shoulder_y_position(x),
        this.get_left_shoulder_angle(x),
        this.get_right_shoulder_angle(x),
        this.get_left_elbow_angle(x),
        this.get_right_elbow_angle(x)
    );
}

Walk.humanoid_walk = function(
humanoid,
period, impact, impact_len, impact_strength, skew_offset, upper_scale, lower_scale
) {
    
    period = d(period, Math.PI*2);
    impact = d(impact, 5*Math.PI/6);
    impact_len = d(impact_len, Math.PI/5);
    impact_strength = d(impact_strength, 0.3);
    skew_offset = d(skew_offset, 1);
    upper_scale = d(upper_scale, 0.5);
    lower_scale = d(lower_scale, 0.5);

    var walk_period = period;
    var half_walk_period = period/2;

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

    function shoulder_move_x(x) {
        return Math.sin(x+period/4)*5;
    }
    function shoulder_move_y(x) {
        return (Math.sin(x+period/2)+1)*5;
    }

    function shoulder_angle(x) {
        return Math.sin(x)/2;
    }
    
    function elbow_angle(x) {
        return Math.sin(x)/4-0.25;
    }

    return new Walk(humanoid, period, upper, lower, hip_bounce, shoulder_move_x, shoulder_move_y, shoulder_angle, elbow_angle);   

}
