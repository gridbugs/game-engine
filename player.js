function Player(pos, facing) {
    this.facing = facing;
    this.pos = pos;
}
Player.set_controlled_player = function(player) {
    Player.controlled_player = player;
    Input.register_mousemove_callback("turn_player", function(mouse_pos) {
        player.turn_to_face(mouse_pos);
    });
}
Player.prototype.turn_to_face = function(pt) {
    this.facing = element_array_call(
                swap_args2(numeric.atan2), 
                numeric['-'](Input.mouse_pos, this.pos)
    )[0];
}
Player.prototype.draw = function() { 
    cu.circle(this.pos, 10);
    cu.line_at_angle(this.pos, this.facing, 10);
}
Player.prototype.control_tick = function() {
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
