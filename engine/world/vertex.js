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
