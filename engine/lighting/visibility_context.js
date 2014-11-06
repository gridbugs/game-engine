var test;
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
    var hint = null;
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
                    if (vertex == null) {
                        hint = seg;
                    } else {
                        hint = vertex;
                    }
                }
            }
        }

        
    }

    return [closest, hint];
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
        return angles[i] - angles[j];
    });

    var points = [];

    var segs = this.segs;

    var last_hint = null;

    for (var i = 0,len=indices.length;i<len;++i) {
        var idx = indices[i];
        var vertex = vertices[idx];
        var ray = [eye, vertex.pos];

        if (this.connected_points_on_one_side(ray, vertex)) {
            points.push(ray[1]);
 //           drawer.draw_line_segment(ray);
            //drawer.draw_point(ray[1], tc('black'), 4);
            last_hint = vertex;
        } else {

            /* the ray hit the side of a corner, so we continue it until
             * it hits something more substantial (either a segment edge
             * or the front of a corner
             */
            var closest_intersection = this.closest_ray_intersection(ray);
            var intersection_point = closest_intersection[0];

            /* the hint is used by the next vertex when determining the order
             * to insert points into the points array in the case where
             * the ray hits the side of a corner (ie. this case)
             */
            var hint = closest_intersection[1];

            /* Use the last hint to determine the order to insert points.
             * The choice is between the "near" point, which is the vertex
             * whose side was glanced by the ray, and the "far" point,
             * which is the point where the extended ray hits something.
             *
             * If the last hint is a segment, the last ray also glanced a vertex,
             * and was extended to collide with that segment. The first point
             * to insert is a point on that segment.
             *
             * If the last hint is a vertex, either the last ray hit that
             * vertex directly, or it glanced a different vertex and eventually
             * hit this vertex. In either case, the first point should be a
             * point between the hint vertex and one of its neighbours.
             */
            var near_first = true;
            if (last_hint && last_hint.constructor == Vertex) {
                if (last_hint.between_any_neighbour(ray[1], VisibilityContext.TOLERANCE)) {
                    near_first = true;
                } else if (last_hint.between_any_neighbour(intersection_point, VisibilityContext.TOLERANCE)) {
                    near_first = false;
                } else {
                    console.debug(last_hint);
                    console.debug(ray[1]);
                    console.debug(intersection_point);
                    console.debug('error vertex');
                }
            } else if (last_hint) {
               if (last_hint.seg_nearly_contains(ray[1], VisibilityContext.TOLERANCE)) {
                    near_first = true;
               } else if (last_hint.seg_nearly_contains(intersection_point, VisibilityContext.TOLERANCE)) {
                    near_first = false;
               } else {
                    console.debug(last_hint);
                    console.debug(ray[1]);
                    console.debug(intersection_point);
                    console.debug('error segment');
               }
            }

            if (near_first) {
                points.push(ray[1]);
                points.push(intersection_point);
            } else {
                points.push(intersection_point);
                points.push(ray[1]);
            }
         
            last_hint = hint;
        }
        
    }

//   points.polygon_to_segments().map(function(s){drawer.draw_line_segment(s)});

    return points;
}
