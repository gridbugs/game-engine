function VisibilityContext(vertices, segs) {
    this.vertices = vertices;
    this.segs = segs;
}

VisibilityContext.prototype.visible_polygon = function(eye) {
    var indices = Array.range(0, this.vertices.length);


    var radial_vectors = this.vertices.map(function(v) {
        return v.pos.v2_sub(eye);
    });
    
    var angles = radial_vectors.map(function(v) {
        return v.v2_angle();
    });

    indices.sort(function(i, j) {
        return angles[i] < angles[j];
    });

    var vertices = this.vertices;
    var segs = this.segs;
    for (var i = 0,len=indices.length;i<len;++i) {
        var idx = indices[i];
        var ray = [eye, vertices[idx].pos];

        var hits_seg = false;
        for (var j = 0,slen = segs.length;j<slen;j++) {
            var seg = segs[j];
            var intersection = ray.seg_to_line().line_intersection(seg.seg_to_line());

            if (intersection == null || !seg.seg_contains_v2_on_line(intersection)) {
                continue;
            }
            var ratio = ray.seg_aligned_ratio(intersection);
            if (ratio > 0 && ratio < 0.9) {
                hits_seg = true;
                break
            }
        
        }
        if (hits_seg) {
            continue;
        }
        drawer.draw_line_segment(ray);
    }
}
