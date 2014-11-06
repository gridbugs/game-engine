function VisibilityContext(vertices, segs) {
    this.vertices = vertices;
    this.segs = segs;
}

VisibilityContext.prototype.non_intersecting_vertices = function(eye) {
    var vertices = this.vertices;
    var segs = this.segs;
    var ret = [];
    for (var i = 0,len=vertices.length;i<len;++i) {
        var vertex = vertices[i];
        var ray = [eye, vertex.pos];

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
        if (!hits_seg) {
            ret.push(vertex);
        }
    }
    return ret;
}

VisibilityContext.prototype.visible_polygon = function(eye) {

    var vertices = this.non_intersecting_vertices(eye);

    var indices = Array.range(0, vertices.length);

    var radial_vectors = vertices.map(function(v) {
        return v.pos.v2_sub(eye);
    });
    
    var angles = radial_vectors.map(function(v) {
        return v.v2_angle();
    });

    indices.sort(function(i, j) {
        return angles[i] < angles[j];
    });

    var segs = this.segs;
    for (var i = 0,len=indices.length;i<len;++i) {
        var idx = indices[i];
        var vertex = vertices[idx];
        var ray = [eye, vertex.pos];

        /* check if all the connected points to this vertex are all on one side
         * of the ray
         */
        var ray_norm = ray.seg_direction().v2_norm();
        var neighbours = vertex.neighbours;
        var left = false;
        var right = false;
        var radial_vector = radial_vectors[i];
        for (var j = 0,nlen = neighbours.length;j<nlen;j++) {
            var v_to_nei = neighbours[j].v2_sub(vertex.pos);
            var dot = ray_norm.v2_dot(v_to_nei);
            if (dot < 0) {
                left = true;
            } else {
                right = true;
            }
        }

        if (left && right) {
            drawer.draw_line_segment(ray);
        } else {
            var long_ray = ray.seg_extend(10000);
            drawer.draw_line_segment(long_ray);
        }
        
    }
}
