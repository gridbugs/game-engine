function Animation() {}
Animation.prototype.init = function(initial, ctx) {
    this.sm = this.constructor.sequence_manager(this.constructor.seqs[initial]);
    this.sg = this.constructor.scene_graph(this.sm);
    this.ctx = ctx;
}
Animation.init = {
    run: function(then) {then()},
}
Animation.prototype.tick = function(time_delta) {
    this.sm.tick(time_delta);
}
Animation.prototype.draw = function(translate, rotate, scale) {
    this.sg.global_transform(translate, rotate, scale);
    this.sg.draw(this.ctx);
}
Animation.prototype.update = function(seq_name, duration, offset) {
    this.sm.update(this.constructor.seqs[seq_name], duration, offset);
}
