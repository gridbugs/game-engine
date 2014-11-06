function Vertex(pos) {
    this.pos = pos;
    this.neighbours = [];
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
        if (nei[i].v2_sub(this.pos).v2_nearly_aligned(pos_to_v, tolerance)) {
            return true;
        }
    }
    return false;
}
