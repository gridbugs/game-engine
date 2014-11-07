function Vertex(pos) {
    this.pos = pos;
    this.neighbours = [];
    this.segs = [];
}
Vertex.prototype.has_neighbour = function(v) {
    var nei = this.neighbours;
    for (var i = 0,len=nei.length;i<len;i++) {
        if (nei[i].v2_equals(v)) {
            return true;
        }
    }
    return false;
}
Vertex.prototype.between_any_neighbour = function(v, tolerance) {
    var nei = this.neighbours;
    var pos_to_v = v.v2_sub(this.pos);
    for (var i = 0,len=nei.length;i<len;i++) {
        var rel = nei[i].v2_sub(this.pos);
        if (rel.v2_nearly_aligned(pos_to_v, tolerance) && Math.between_inclusive(0, rel.v2_aligned_ratio(pos_to_v), 1)) {
            return true;
        }
    }
    return false;
}
