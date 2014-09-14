function Agent(pos, facing) {
    this.facing = facing;
    this.pos = pos;
    this.move_speed = 5;
    this.turn_speed = Math.PI/12;
    this.colour = "black";
    this.rad = 20;
}

Agent.prototype.set_collision_processor = function(cp) {
    this.collision_processor = cp;
}

Agent.set_controlled_agent = function(agent) {
    Agent.controlled_agent = agent;
    Input.register_mousemove_callback("turn_agent", function(mouse_pos) {
        agent.turn_to_face(mouse_pos);
    });
}
Agent.prototype.turn_to_face = function(pt) {
    this.facing = _angle_between(this.pos, Input.mouse_pos);
}
Agent.prototype.draw = function() { 
    cu.circle(this.pos, this.rad, false, this.colour);
    cu.line_at_angle(this.pos, this.facing, this.rad);
}
Agent.prototype.control_tick = function() {
    this.turn_to_face(Input.get_mouse_pos());
    var angle;

    if (Input.is_down("w,")) {
        angle = this.facing;
    } else if (Input.is_down("so")) {
        angle = this.facing + Math.PI;
    } else if (Input.is_down("a")) {
        angle = this.facing - Math.PI/2;
    } else if (Input.is_down("de")) {
        angle = this.facing + Math.PI/2;
    } else {
        return;
    }
    
    var dest = this.pos.v2_add(angle_to_unit_vector(angle).v2_smult(this.move_speed));
    this.pos = this.collision_processor.process_collision(this.pos, dest);

}

Agent.prototype.turn_towards = function(pt) {
    var target_angle = _angle_between(this.pos, pt);
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
