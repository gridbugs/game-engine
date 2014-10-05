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


HumanoidPoints.prototype.side_to_topdown = function() {

    const foot_offset = 50;
    const knee_offset = 40;
    const hip_offset = 20;
    const shoulder_lean = 8;
    const shoulder_offset = 30;
    const elbow_offset = 40;
    const hand_offset = 40;

    // all the fields are side view relative
    return new HumanoidPoints(
        [-foot_offset, this.left_foot[0]],
        [foot_offset, this.right_foot[0]],
        [-knee_offset, this.left_knee[0]],
        [knee_offset, this.right_knee[0]],
        [-hip_offset, this.left_hip[0]],
        [hip_offset, this.right_hip[0]],
        [0, shoulder_offset],
        [-shoulder_offset, this.left_shoulder[0]],
        [shoulder_offset, this.right_shoulder[0]],
        [-elbow_offset, this.left_elbow[0]],
        [elbow_offset, this.right_elbow[0]],
        [-hand_offset, this.left_hand[0]],
        [hand_offset, this.right_hand[0]]
            );
}

HumanoidPoints.prototype.draw_topdown = function(cu, centre) {
    const foot_radius = 20;
    const knee_radius = 15;
    const hip_radius = 10;
    const shoulder_radius = 10;
    const elbow_radius = 10;
    const hand_radius = 5;

    var topdown_points = this.side_to_topdown();
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

    console.debug(topdown_points.left_foot);
}
