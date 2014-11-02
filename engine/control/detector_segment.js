function DetectorSegment(seg, left_callback, right_callback) {
    this.seg = seg;
    this.left_callback = left_callback;
    this.right_callback = right_callback;
}

/*
 * If the path starts off the segment on one side, and ends
 * either on the segment or on the other side of the segment
 * after intersecting with the segment, then one of the callbacks
 * will be called.
 *
 * The callback is chosen based on which side of the segment
 * the paths started on. Facing from the start of the segment
 * to the end, if the path moves from right to left, the 'left' callback
 * is called. Otherwise, the 'right' callback is called.
 */
DetectorSegment.prototype.detect = function(path) {

    // if the path starts on the segment, don't detect
    if (this.seg.seg_aligned(path[0]) &&
        Math.between_inclusive(0, this.seg.seg_aligned_ratio(path[0]), 1)) {
        return;
    }

    // if the path crosses the segment
    if (this.seg.seg_intersects(path)) {
        var dot = this.seg.seg_direction().v2_norm().v2_dot(path.seg_direction());
        if (dot > 0) {
            this.left_callback();
        } else {
            this.right_callback();
        }
    }
}

DetectorSegment.prototype.draw = function(drawer) {
    drawer.draw_line_segment(this.seg, tc('lightgrey'), 2);
}
