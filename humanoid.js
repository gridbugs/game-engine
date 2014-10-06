function HumanoidPoints(left_foot, right_foot, left_knee, right_knee, left_hip, right_hip, shoulder_mid, left_shoulder, right_shoulder, left_elbow, right_elbow, left_hand, right_hand) {
    this.left_foot = left_foot;
    this.right_foot = right_foot;
    this.left_knee = left_knee;
    this.right_knee = right_knee;
    this.left_hip = left_hip;
    this.right_hip = right_hip;
    this.shoulder_mid = shoulder_mid;
    this.left_shoulder = left_shoulder;
    this.right_shoulder = right_shoulder;
    this.left_elbow = left_elbow;
    this.right_elbow = right_elbow;
    this.left_hand = left_hand;
    this.right_hand = right_hand;
}
HumanoidPoints.prototype.to_seqs = function() {
    return [[this.left_foot, this.left_knee, this.left_hip],
            [this.right_foot, this.right_knee, this.right_hip],
            [this.left_hip, this.shoulder_mid],
            [this.left_hand, this.left_elbow, this.left_shoulder, this.shoulder_mid],
            [this.right_hand, this.right_elbow, this.right_shoulder, this.shoulder_mid]];
}
HumanoidPoints.prototype.draw_side = function(cu, centre) {
    this.to_seqs().map(function(seq) {
        return seq.map(function(pt){
            return pt.v2_add(centre)
        })
    }).map(function(seq) {cu.draw_sequence(seq);seq.map(function(pt){cu.draw_point(pt)})});
}

function Humanoid(lower_leg, upper_leg, upper_arm, lower_arm) {
    this.lower_leg = lower_leg;
    this.upper_leg = upper_leg;
    this.upper_arm = upper_arm;
    this.lower_arm = lower_arm;
    this.hip_to_shoulder = [120, 8];
}

Humanoid.prototype.to_half_point_seq = function(
    knee_angle,
    hip_angle,
    hip_y_position,
    shoulder_x_position,
    shoulder_y_position,
    shoulder_angle,
    elbow_angle
) {
    var hip = [0, 0];
    var knee = angle_to_unit_vector(-hip_angle).v2_smult(this.upper_leg);
    var foot = knee.v2_add(angle_to_unit_vector(angle_normalize(-hip_angle-knee_angle)).v2_smult(this.lower_leg));
    var shoulder_mid = hip.v2_sub(this.hip_to_shoulder);
    var shoulder = shoulder_mid.v2_add([shoulder_y_position, shoulder_x_position]);
    var elbow = shoulder.v2_add(angle_to_unit_vector(shoulder_angle).v2_smult(this.upper_arm));
    var hand = elbow.v2_add(angle_to_unit_vector(angle_normalize(elbow_angle+shoulder_angle)).v2_smult(this.lower_arm));

    return [foot, knee, hip, shoulder_mid, shoulder, elbow, hand].map(function(pt){return pt.v2_add([hip_y_position, 0]).v2_rotate(Math.PI/2)});
}

Humanoid.prototype.to_points = function(
    left_knee_angle, 
    right_knee_angle, 
    left_hip_angle, 
    right_hip_angle,
    hip_y_position,
    left_shoulder_x_position,
    left_shoulder_y_position,
    right_shoulder_x_position,
    right_shoulder_y_position,
    left_shoulder_angle,
    right_shoulder_angle,
    left_elbow_angle,
    right_elbow_angle
) {
    var left = this.to_half_point_seq(left_knee_angle, left_hip_angle, hip_y_position, left_shoulder_x_position, left_shoulder_y_position, left_shoulder_angle, 
            left_elbow_angle);
    var right = this.to_half_point_seq(right_knee_angle, right_hip_angle, hip_y_position, right_shoulder_x_position, right_shoulder_y_position, right_shoulder_angle,
            right_elbow_angle);
    return new HumanoidPoints(left[0], right[0], left[1], right[1], left[2], right[2], left[3], left[4], right[4], left[5], right[5], left[6], right[6]);
}


HumanoidPoints.prototype.side_to_topdown = function(scale) {
    scale = d(scale, 0.3);
    var foot_offset = 50*scale;
    var knee_offset = 40*scale;
    var hip_offset = 20*scale;
    var shoulder_lean = 8*scale;
    var shoulder_offset = 30*scale;
    var elbow_offset = 40*scale;
    var hand_offset = 40*scale;

    // all the fields are side view relative
    return new HumanoidPoints(
        [-foot_offset, this.left_foot[0]*scale],
        [foot_offset, this.right_foot[0]*scale],
        [-knee_offset, this.left_knee[0]*scale],
        [knee_offset, this.right_knee[0]*scale],
        [-hip_offset, this.left_hip[0]*scale],
        [hip_offset, this.right_hip[0]*scale],
        [0, shoulder_offset],
        [-shoulder_offset, this.left_shoulder[0]*scale],
        [shoulder_offset, this.right_shoulder[0]*scale],
        [-elbow_offset, this.left_elbow[0]*scale],
        [elbow_offset, this.right_elbow[0]*scale],
        [-hand_offset, this.left_hand[0]*scale],
        [hand_offset, this.right_hand[0]*scale]
            );
}

HumanoidPoints.prototype.draw_topdown = function(cu, centre, direction, scale) {
    scale = d(scale, 0.3);
    direction = d(direction, 0);
    direction = angle_normalize(direction - Math.PI/2);
    var foot_radius = 20*scale;
    var knee_radius = 15*scale;
    var hip_radius = 10*scale;
    var shoulder_radius = 10*scale;
    var elbow_radius = 10*scale;
    var hand_radius = 5*scale;
    var topdown_points = this.side_to_topdown(scale).rotate(direction);

    cu.draw_circle([topdown_points.left_foot.v2_add(centre), foot_radius]);
    cu.draw_circle([topdown_points.right_foot.v2_add(centre), foot_radius]);
    cu.draw_circle([topdown_points.left_knee.v2_add(centre), knee_radius], 'blue');
    cu.draw_circle([topdown_points.right_knee.v2_add(centre), knee_radius], 'blue');
    cu.draw_circle([topdown_points.left_hip.v2_add(centre), hip_radius], 'green');
    cu.draw_circle([topdown_points.right_hip.v2_add(centre), hip_radius], 'green');
    cu.draw_circle([topdown_points.left_shoulder.v2_add(centre), shoulder_radius], 'red');
    cu.draw_circle([topdown_points.right_shoulder.v2_add(centre), shoulder_radius], 'red');
    cu.draw_circle([topdown_points.left_elbow.v2_add(centre), elbow_radius], 'orange');
    cu.draw_circle([topdown_points.right_elbow.v2_add(centre), elbow_radius], 'orange');
    cu.draw_circle([topdown_points.left_hand.v2_add(centre), hand_radius], 'cyan');
    cu.draw_circle([topdown_points.right_hand.v2_add(centre), hand_radius], 'cyan');

}

HumanoidPoints.prototype.rotate = function(rads) {
    return new HumanoidPoints(
        this.left_foot.v2_rotate(rads),
        this.right_foot.v2_rotate(rads),
        this.left_knee.v2_rotate(rads),
        this.right_knee.v2_rotate(rads),
        this.left_hip.v2_rotate(rads),
        this.right_hip.v2_rotate(rads),
        this.shoulder_mid.v2_rotate(rads),
        this.left_shoulder.v2_rotate(rads),
        this.right_shoulder.v2_rotate(rads),
        this.left_elbow.v2_rotate(rads),
        this.right_elbow.v2_rotate(rads),
        this.left_hand.v2_rotate(rads),
        this.right_hand.v2_rotate(rads)
            );
}
