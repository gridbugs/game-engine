function VisibilityContext(vertices, segs) {
    this.vertices = vertices;
    this.segs = segs;
}
VisibilityContext.LARGE_NUMBER = 10000;
VisibilityContext.TOLERANCE = 0.00000001;

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

            if (intersection == null) {
                continue;
            }

           
            var seg_ratio = seg.seg_aligned_ratio(intersection);
            if (seg_ratio < 0 || seg_ratio > 1) {
                continue;
            }
 

            // if the interesction was anywhere on the ray except right at the end
            var ray_ratio = ray.seg_aligned_ratio(intersection);
            if (ray_ratio > 0 && ray_ratio < (1 - VisibilityContext.TOLERANCE)) {
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

VisibilityContext.prototype.closest_ray_intersection = function(ray) {
    var min_distance = ray.seg_length();
    var closest = ray[0].v2_add(ray.seg_direction().v2_to_length(VisibilityContext.LARGE_NUMBER));
    var segs = this.segs;
    for (var i = 0,slen = segs.length;i<slen;i++) {
        var seg = segs[i];
        var intersection = ray.seg_to_line().line_intersection(seg.seg_to_line());

        // lines were parallel so no intersection
        if (intersection == null) {
            continue;
        }

        // intersection did not occur within the line segment      
        var seg_ratio = seg.seg_aligned_ratio(intersection);
        if (seg_ratio > 1 || seg_ratio < 0) {
            continue;
        }
        
        var ray_ratio = ray.seg_aligned_ratio(intersection);
        if (ray_ratio > 0) {
            var dist = ray[0].v2_dist(intersection);
            if (dist > min_distance && dist < ray[0].v2_dist(closest)) {
                closest = intersection;
            }
        }
        
    }

    return closest;
}

VisibilityContext.prototype.connected_points_on_one_side = function(ray, vertex, radial_vector) {
    /* check if all the connected points to this vertex are all on one side
     * of the ray
     */
    var ray_norm = ray.seg_direction().v2_norm();
    var neighbours = vertex.neighbours;
    var left = false;
    var right = false;
    for (var i = 0,nlen = neighbours.length;i<nlen;i++) {
        var v_to_nei = neighbours[i].v2_sub(vertex.pos);
        var dot = ray_norm.v2_dot(v_to_nei);
        if (dot < 0) {
            left = true;
        } else {
            right = true;
        }
    }

    return left && right;
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
        var radial_vector = radial_vectors[i];

        if (this.connected_points_on_one_side(ray, vertex, radial_vector)) {
            drawer.draw_line_segment(ray);
        } else {
            var closest_intersection = this.closest_ray_intersection(ray);
            drawer.draw_line_segment([ray[0], closest_intersection]);
        }
        
    }
}
