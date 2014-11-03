function DetectorSegment(seg, left_callback, right_callback) {
    this.seg = seg;
    this.left_callback = left_callback;
    this.right_callback = right_callback;
}

/*
 * If the path intersects the segment (inclusive on both ends of the path)
 * then call one of the callbacks. If you stand at this.seg[0], looking towards
 * this.seg[1], if path points to the left, the left callback is called.
 * Otherwise, the right callback is called.
 */
DetectorSegment.prototype.detect = function(path) {

    // if the path starts and ends on the segment, don't detect
    if (this.seg.seg_aligned(path[0]) && this.seg.seg_aligned(path[1])) {
        return;
    }

    // if the path crosses the segment
    if (this.seg.seg_intersects(path)) {
        var dot = this.seg.seg_direction().v2_norm().v2_dot(path.seg_direction());
        if (dot > 0) {
            this.left_callback.apply(window, arguments);
        } else {
            this.right_callback.apply(window, arguments);
        }
    }
}

DetectorSegment.prototype.draw = function(drawer) {
    drawer.draw_line_segment(this.seg, tc('lightgrey'), 2);
}
