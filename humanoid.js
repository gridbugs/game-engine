function HumanoidPoints(left_foot, right_foot, left_knee, right_knee, left_hip, right_hip) {
    this.left_foot = left_foot;
    this.right_foot = right_foot;
    this.left_knee = left_knee;
    this.right_knee = right_knee;
    this.left_hip = left_hip;
    this.right_hip = right_hip;
}
HumanoidPoints.prototype.to_seqs = function() {
    return [[this.left_foot, this.left_knee, this.left_hip],
            [this.right_foot, this.right_knee, this.right_hip]];
}
HumanoidPoints.prototype.draw_side = function(cu, centre) {
    this.to_seqs().map(function(seq) {
        return seq.map(function(pt){
            return pt.v2_add(centre)
        })
    }).map(function(seq) {cu.draw_sequence(seq);seq.map(function(pt){cu.draw_point(pt)})});
}

function Humanoid(lower_leg, upper_leg) {
    this.lower_leg = lower_leg;
    this.upper_leg = upper_leg;
}

Humanoid.prototype.to_half_point_seq = function(
    knee_angle,
    hip_angle,
    hip_y_position
) {
    var hip = [0, 0];
    var knee = angle_to_unit_vector(-hip_angle).v2_smult(this.upper_leg);
    var foot = knee.v2_add(angle_to_unit_vector(angle_normalize(-hip_angle-knee_angle)).v2_smult(this.lower_leg));
    return [foot, knee, hip].map(function(pt){return pt.v2_add([hip_y_position, 0]).v2_rotate(Math.PI/2)});
}

Humanoid.prototype.to_points = function(
    left_knee_angle, 
    right_knee_angle, 
    left_hip_angle, 
    right_hip_angle,
    hip_y_position
) {
    var left = this.to_half_point_seq(left_knee_angle, left_hip_angle, hip_y_position);
    var right = this.to_half_point_seq(right_knee_angle, right_hip_angle, hip_y_position);
    return new HumanoidPoints(left[0], right[0], left[1], right[1], left[2], right[2]);
}
