function Editor() {
    this.click = null;
    this.segments = [[[100, 200], [400, 300]]];
}
Editor.prototype.init = function(cu) {
    this.cu = cu;

    $(window).click(function() {
        console.debug(Input.get_mouse_pos());
        if (this.click) {
            this.click();
        }
    });

}

Editor.prototype.draw = function() {
    var _this = this;

    this.segments.map(function(seg) {_this.cu.draw_segment(seg)});

    var pt = this.point_near_cursor();
    maybe_function(function(p) {_this.cu.draw_point(p, 'yellow', 8)}, pt);

}

Editor.prototype.point_near_cursor = function() {
    if (this.segments.length == 0) {
        return null;
    }

    var cursor = Input.get_mouse_pos();
    var all_points = this.segments.segs_to_vectors();
    var closest = all_points.most(function(pt) {
        return -pt.v2_dist(cursor);
    });

    if (closest.v2_dist(cursor) < 8) {
        return closest;
    } else {
        return null;
    }
}

Editor.prototype.record_segment = function() {

}
