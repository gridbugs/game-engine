function VisibilityContext(vertices, segs) {
    this.vertices = vertices;
    this.segs = segs;
}
VisibilityContext.LARGE_NUMBER = 10000;
VisibilityContext.TOLERANCE = 0.001;

VisibilityContext.prototype.vertex_by_position = function(pos) {
    for (var i = 0;i<this.vertices.length;i++) {
        if (this.vertices[i].pos.v2_close(pos, VisibilityContext.TOLERANCE)) {
            return this.vertices[i];
        }
    }
    return null;
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
        
        var vertex = this.vertex_by_position(intersection);

        if (vertex == null || this.connected_points_on_one_side(ray, vertex)) {
            var ray_ratio = ray.seg_aligned_ratio(intersection);
            if (ray_ratio > 0) {
                var dist = ray[0].v2_dist(intersection);
                if (dist < ray[0].v2_dist(closest)) {
                    closest = intersection;
                }
            }
        }

        
    }

    return closest;
}

VisibilityContext.prototype.connected_points_on_one_side = function(ray, vertex) {
    /* check if all the connected points to this vertex are all on one side
     * of the ray
     */
    var radial_vector = ray.seg_direction();
    var ray_norm = radial_vector.v2_norm();
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

    var points = [];

    var segs = this.segs;

    var last_vertex = null;
    for (var i = 0,len=indices.length;i<len;++i) {
        var idx = indices[i];
        var vertex = vertices[idx];
        var ray = [eye, vertex.pos];

        if (this.connected_points_on_one_side(ray, vertex)) {
            points.push(ray[1]);
            drawer.draw_line_segment(ray);
            drawer.draw_point(ray[1], tc('black'), 4);
        } else {
            var closest_intersection = this.closest_ray_intersection(ray);
            drawer.draw_line_segment([ray[0], closest_intersection]);

            /*
            if (last_vertex != null && last_vertex.has_neighbour(ray[1])) {
                points.push(ray[1]);
                points.push(closest_intersection);
            } else {
                points.push(closest_intersection);
                points.push(ray[1]);
                last_vertex = vertex;
            }
            */

            drawer.draw_point(closest_intersection, tc('black'), 4);
            drawer.draw_point(ray[1], tc('black'), 4);
        }
        
        last_vertex = vertex;
    }

 //   points.polygon_to_segments().map(function(s){drawer.draw_line_segment(s)});

    return points;
}
