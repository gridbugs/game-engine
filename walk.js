function Walk(humanoid, period, get_hip_angle, get_knee_angle) {
    this.humanoid = humanoid;

    this.get_left_hip_angle = get_hip_angle;
    this.get_left_knee_angle = get_knee_angle;
    this.get_right_hip_angle = get_hip_angle.slide_x(period/2);
    this.get_right_knee_angle = get_knee_angle.slide_x(period/2);
}

Walk.prototype.to_points = function(x) {
    return this.humanoid.to_points(
        this.get_left_knee_angle(x),
        this.get_right_knee_angle(x),
        this.get_left_hip_angle(x),
        this.get_right_hip_angle(x)
    );
}
