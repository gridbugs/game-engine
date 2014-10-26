function Animation(drawer) {
    this.drawer = drawer;   
}
Animation.prototype.instance = function(initial) {
    return new Animation.Instance(this, initial);
}
Animation.Instance = function(animation, initial) {
    this.sm = animation.sequence_manager(animation.seqs[initial]);
    this.sg = animation.scene_graph(animation.drawer, this.sm);
    this.animation = animation;
}
Animation.Instance.prototype.tick = function(time_delta) {
    this.sm.tick(time_delta);
}
Animation.Instance.prototype.draw_at = function(translate, rotate, scale) {
    this.sg.draw_at(translate, rotate, scale);
}
Animation.Instance.prototype.draw = function() {
    this.sg.draw();
}
Animation.Instance.prototype.update = function(seq_name, duration, offset) {
    this.sm.update(this.animation.seqs[seq_name], duration, offset);
}
