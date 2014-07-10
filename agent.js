function Agent(pos, facing) {
    this.facing = facing;
    this.pos = pos;
}
Agent.set_controlled_agent = function(agent) {
    Agent.controlled_agent = agent;
    Input.register_mousemove_callback("turn_agent", function(mouse_pos) {
        agent.turn_to_face(mouse_pos);
    });
}
Agent.prototype.turn_to_face = function(pt) {
    this.facing = element_array_call(
                swap_args2(numeric.atan2), 
                numeric['-'](Input.mouse_pos, this.pos)
    )[0];
}
Agent.prototype.draw = function() { 
    cu.circle(this.pos, 10);
    cu.line_at_angle(this.pos, this.facing, 10);
}
Agent.prototype.control_tick = function() {
    if (Input.is_down("w,")) {
        this.pos = numeric['+'](this.pos, numeric['*'](5, angle_to_unit_vector(this.facing)));
    }
    if (Input.is_down("so")) {
        this.pos = numeric['+'](this.pos, numeric['*'](5, angle_to_unit_vector(this.facing + Math.PI)));
    }
    if (Input.is_down("a")) {
        this.pos = numeric['+'](this.pos, numeric['*'](5, angle_to_unit_vector(this.facing - Math.PI/2)));
    }
    if (Input.is_down("de")) {
        this.pos = numeric['+'](this.pos, numeric['*'](5, angle_to_unit_vector(this.facing + Math.PI/2)));
    }
}
