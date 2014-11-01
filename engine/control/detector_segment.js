function DetectorSegment(seg) {
    this.seg = seg;
}

DetectorSegment.prototype.detect = function(path) {
    if (this.seg.seg_intersects(path)) {
    }
}

DetectorSegment.prototype.draw = function(drawer) {
    drawer.draw_line_segment(this.seg);
}
