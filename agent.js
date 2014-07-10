function Agent(pos, facing) {
    this.facing = facing;
    this.pos = pos;
    this.move_speed = 5;
    this.turn_speed = Math.PI/12;
    this.colour = "black";
}
Agent.set_controlled_agent = function(agent) {
    Agent.controlled_agent = agent;
    Input.register_mousemove_callback("turn_agent", function(mouse_pos) {
        agent.turn_to_face(mouse_pos);
    });
}
Agent.prototype.turn_to_face = function(pt) {
    this.facing = angle_between(this.pos, Input.mouse_pos);
}
Agent.prototype.draw = function() { 
    cu.circle(this.pos, 10, false, this.colour);
    cu.line_at_angle(this.pos, this.facing, 10);
}
Agent.prototype.control_tick = function() {
    this.turn_to_face(Input.get_mouse_pos());
    if (Input.is_down("w,")) {
        this.pos = numeric['+'](this.pos, numeric['*'](this.move_speed, angle_to_unit_vector(this.facing)));
    }
    if (Input.is_down("so")) {
        this.pos = numeric['+'](this.pos, numeric['*'](this.move_speed, angle_to_unit_vector(this.facing + Math.PI)));
    }
    if (Input.is_down("a")) {
        this.pos = numeric['+'](this.pos, numeric['*'](this.move_speed, angle_to_unit_vector(this.facing - Math.PI/2)));
    }
    if (Input.is_down("de")) {
        this.pos = numeric['+'](this.pos, numeric['*'](this.move_speed, angle_to_unit_vector(this.facing + Math.PI/2)));
    }
}

Agent.prototype.turn_towards = function(pt) {
    var target_angle = angle_between(this.pos, pt);
    var angle_diff = radians_between(this.facing, target_angle);
    if (angle_diff <= this.turn_speed) {
        this.facing = target_angle;
    } else {
        this.facing += this.turn_speed * nearest_rotation_type(this.facing, target_angle);
    }
}

Agent.prototype.move_forward = function() {
    this.pos = numeric['+'](this.pos, numeric['*'](this.move_speed, angle_to_unit_vector(this.facing)));
}
