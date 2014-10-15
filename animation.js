function Animation() {}
Animation.prototype.init = function(initial, interval, ctx) {
    this.sm = this.constructor.sequence_manager(this.constructor.seqs[initial], interval);
    this.sg = this.constructor.scene_graph(this.sm);
    this.ctx = ctx;
}
Animation.init = {
    run: function(then) {then()},
    val: function(){return null}
}
Animation.prototype.tick = function() {
    this.sm.tick();
}
Animation.prototype.draw = function(translate, rotate, scale) {
    this.sg.global_transform(translate, rotate, scale);
    this.sg.draw(this.ctx);
}
Animation.prototype.update = function(seq_name, duration, offset) {
    this.sm.update(this.constructor.seqs[seq_name], duration, offset);
}
