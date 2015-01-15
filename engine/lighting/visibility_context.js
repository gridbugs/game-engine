function VisibilityContext(vertices, segs) {
    this.vertices = vertices;
    this.segs = segs;

    /* debug */
    var cell_size = [100, 100];
    this.spacial_hash = new SpacialHashTable(cell_size, [1000, 1000]);
    this.spacial_hash.loop_indices(function(i, j) {
        this.spacial_hash.put_idx(i, j, debug_drawer.coloured_rectangle([i*cell_size[0], j*cell_size[1]], cell_size, [0,0,1,0.6]));
    }.bind(this));

    this.compute_visible_vertex_hash();
    
}

VisibilityContext.prototype.compute_vertex_segment_table = function() {
    var vertex_segment_table = new Array(this.vertices.length);
    for (var i = 0,vlen = this.vertices.length;i<vlen;i++) {
        vertex_segment_table[i] = new Array(this.segs.length);
    }

    for (var i = 0,vlen = this.vertices.length;i<vlen;i++) {
        for (var j = 0,slen = this.segs.length;j<slen;j++) {
            vertex_segment_table[i][j] = new VisibilityContext.VertexSegmentTableEntry(this.vertices[i], this.segs[j]);
        }
    }

    this.vertex_segment_table = vertex_segment_table;
}

VisibilityContext.VertexCheckData = function(vertex, segments_to_check) {
    this.vertex = vertex;
    this.segments_to_check = segmentns_to_check;
}
VisibilityContext.VertexState = function(vertex) {
    this.visibility = VisibilityContext.VertexState.VISIBLE;
}
VisibilityContext.VertexState.VISIBLE = 'visible';
VisibilityContext.VertexState.HIDDEN = 'hidden';
VisibilityContext.VertexState.RUNTIME = 'runtime';

VisibilityContext.VertexState.prototype.toString = function() {
    return this.visibility;
}

VisibilityContext.CellData = function(vc, spacial_hash_table_entry) {
    this.visibility_context = vc;
    this.vertex_states = new Array(vc.vertices.length);
    for (var i = 0;i<vc.vertices.length;i++) {
        this.vertex_states[i] = new VisibilityContext.VertexState(vc.vertices[i]);
    }
    this.spacial_hash_table_entry = spacial_hash_table_entry;

    var entry = spacial_hash_table_entry;
    var table = spacial_hash_table_entry.spacial_hash_table;
    this.rect = debug_drawer.coloured_rectangle(
        [entry.i_index*table.cell_size[0], entry.j_index*table.cell_size[1]], table.cell_size, [0,0,1,0.6]
    );
}

VisibilityContext.CellData.prototype.set_vertex_state = function(idx, state) {
    this.vertex_states[idx].visibility = state;
}

VisibilityContext.CellData.prototype.draw = function() {
    this.rect.draw();
}

VisibilityContext.prototype.compute_visible_vertex_hash = function() {
    this.compute_vertex_segment_table();
    var count = 0;
    this.spacial_hash.loop_entries(function(spacial_hash_table_entry) {
        
        var data = new VisibilityContext.CellData(this, spacial_hash_table_entry);

        for (var i = 0,ilen=this.vertex_segment_table.length;i<ilen;i++) {
            var vertex_segments = this.vertex_segment_table[i];
            var cell_vertex_state = data.vertex_states[i];
            for (var j = 0,jlen=vertex_segments.length;j<jlen;j++) {
                var vertex_segment_table_entry = vertex_segments[j];
                
                // check if the spacial hash table cell is contained in the obscured area
                if (vertex_segment_table_entry.obscured_area.contains_all_points(
                        spacial_hash_table_entry.vertices)) {
                    
                    // the current vertex is entirely hidden by the current segment
                    data.set_vertex_state(i, VisibilityContext.VertexState.HIDDEN);

                    // there's no point looking at any more segments
                    break;
                    
                }
            }
        }

        spacial_hash_table_entry.set(data);

    }.bind(this));

    console.debug(count);
}

VisibilityContext.VertexSegmentTableEntry = function(vertex, segment) {
    this.vertex = vertex;
    this.segment = segment;
    this.obscured_area = this.create_obscured_area(vertex, segment);
}

VisibilityContext.VertexSegmentTableEntry.prototype.create_obscured_area = function(vertex, segment) {
    if (vertex.pos.v2_equals(segment[0]) || vertex.pos.v2_equals(segment[1])) {
        return new VisibilityContext.NothingObscured();
    } else {
        return new VisibilityContext.ObscuredQuad(vertex, segment);
    }
}

VisibilityContext.ObscuredArea = function(){}

VisibilityContext.ObscuredArea.prototype.contains_all_points = function(pts) {
    return pts.map(function(p) {
        return this.contains_point(p)
    }.bind(this)).reduce(function(b, acc) {
        return b && acc;
    }, true);
}


VisibilityContext.ObscuredQuad = function(vertex, segment) {
    const QUAD_LENGTH = 2000;
    var far_points = segment.map(function(v) {
        return v.v2_sub(vertex.pos).v2_to_length(QUAD_LENGTH).v2_add(v)
    });

    this.points = [segment[0], segment[1], far_points[1], far_points[0]];

    this.segments = [
        [segment[0], segment[1]],
        [segment[1], far_points[1]],
        [far_points[1], far_points[0]],
        [far_points[0], segment[0]]
    ];
}
VisibilityContext.ObscuredQuad.inherits_from(
    VisibilityContext.ObscuredArea
);

VisibilityContext.ObscuredQuad.prototype.contains_point = function(p) {
    return this.points.polygon_contains(p);
}

VisibilityContext.ObscuredQuad.prototype.draw = function() {
    this.segments.map(function(s){debug_drawer.draw_line_segment(s, [0,1,0,1], 4)});
}

VisibilityContext.NothingObscured = function() {
}
VisibilityContext.NothingObscured.inherits_from(
    VisibilityContext.ObscuredArea
);

VisibilityContext.NothingObscured.prototype.draw = function(){}
VisibilityContext.NothingObscured.prototype.contains_point = function(p) {
    return false;
}

VisibilityContext.from_regions = function(regions, extra) {
    var segs = [];
    for (var i = 0;i<regions.length;i++) {
        segs = segs.concat(regions[i].segs);
    }
    return VisibilityContext.from_segs(segs, extra);
}

VisibilityContext.from_segs = function(segs, extra) {
    var all_segs = segs.concat(extra);
    var vertices = Vertex.vertices_from_segs(all_segs);
    return new VisibilityContext(vertices, all_segs);
}

VisibilityContext.LARGE_NUMBER = 10000;
VisibilityContext.TOLERANCE = 0.01;
VisibilityContext.LOW_TOLERANCE = 0.0001;

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
    var ret_idx = 0;
    var ray = new Array(2);
    for (var i = 0,len=vertices.length;i<len;++i) {
        var vertex = vertices[i];
        ray[0] = eye;
        ray[1] = vertex.pos;

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
            ret[ret_idx++] = vertex;
        }
    }
    return ret;
}

VisibilityContext.prototype.closest_ray_intersection = function(ray, side_mask) {
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
        
        var intersection_occured = false;
        if (vertex == null) {
            intersection_occured = true;
        } else {
            var connected_sides = this.connected_sides(ray, vertex);
            intersection_occured = (connected_sides[0]||side_mask[0])&&(connected_sides[1]||side_mask[1]);
            
       }

        if (intersection_occured) {
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

VisibilityContext.prototype.connected_sides = function(ray, vertex) {
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
        if (dot < -VisibilityContext.LOW_TOLERANCE) {
            left = true;
        } else if (dot > VisibilityContext.LOW_TOLERANCE) {
            right = true;
        }
        // if dot == 0 it's not on either side
    }

    return [left, right];
}

VisibilityContext.prototype.connected_points_on_both_sides = function(ray, vertex) {
    var sides = this.connected_sides(ray, vertex);
    return sides[0] && sides[1];
}

VisibilityContext.prototype.visible_polygon = function(eye, points, rect_ref) {
    if (rect_ref) {
        rect_ref.value = this.spacial_hash.get_v2(eye);
    }
    
    // quadratic 10ms on macbook air
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

//    var points = [];

    var segs = this.segs;

    var last_hint = null;

    // used to determine if there are multiple consecutive aligned vertices
    var last_radial_vector = null; 


    // rotate indices so indices[0] refers to a vertex connecetd on both sides
    for (var i = 0,len=indices.length;i<len;++i) {
        var idx = indices[i];
        var vertex = vertices[idx];
        var ray = [eye, vertex.pos];

        if (this.connected_points_on_both_sides(ray, vertex)) {
            indices = indices.rotate(i);
            break;
        }
    }
  
    var points_idx = 0;

    for (var i = 0,len=indices.length;i<len;++i) {
        var idx = indices[i];
        var vertex = vertices[idx];
        var ray = [eye, vertex.pos];

        var radial_vector = radial_vectors[i];

        var connected_sides = this.connected_sides(ray, vertex);
        if (connected_sides[0] && connected_sides[1]) {
            points[points_idx++] = [ray[1][0], ray[1][1], 0];
            last_hint = vertex;
        } else {

            /* the ray hit the side of a corner, so we continue it until
             * it hits something more substantial (either a segment edge
             * or the front of a corner
             */
            var closest_intersection = this.closest_ray_intersection(ray, connected_sides);
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
                    console.debug(agent.pos);
                    
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
                    console.debug('pos', agent.pos);
               }
            }

            if (near_first) {
                points[points_idx++] = [ray[1][0], ray[1][1], 1];
                points[points_idx++] = [intersection_point[0], intersection_point[1], 1];
                last_hint = hint;
            } else {
                points[points_idx++] = [intersection_point[0], intersection_point[1], 1];
                points[points_idx++] = [ray[1][0], ray[1][1], 1];
                last_hint = vertex;
            }
         
        }
        
    }
    
    return points_idx;
}


VisibilityContext.prototype.visible_polygon2 = function(eye, points, rect_ref) {
    rect_ref.value = this.spacial_hash.get_v2(eye);
    
    // quadratic
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

//    var points = [];

    var segs = this.segs;

    var last_hint = null;

    // used to determine if there are multiple consecutive aligned vertices
    var last_radial_vector = null; 


    // rotate indices so indices[0] refers to a vertex connecetd on both sides
    for (var i = 0,len=indices.length;i<len;++i) {
        var idx = indices[i];
        var vertex = vertices[idx];
        var ray = [eye, vertex.pos];

        if (this.connected_points_on_both_sides(ray, vertex)) {
            indices = indices.rotate(i);
            break;
        }
    }
  
    var points_idx = 0;
    //console.debug(indices.map(function(i){return [eye, vertices[i].pos]}));

    for (var i = 0,len=indices.length;i<len;++i) {
        var idx = indices[i];
        var vertex = vertices[idx];
        var ray = [eye, vertex.pos];

        var radial_vector = radial_vectors[i];

        var connected_sides = this.connected_sides(ray, vertex);
        if (connected_sides[0] && connected_sides[1]) {
            points[points_idx++] = [ray[1][0], ray[1][1], 0];
            last_hint = vertex;
        } else {

            /* the ray hit the side of a corner, so we continue it until
             * it hits something more substantial (either a segment edge
             * or the front of a corner
             */
            var closest_intersection = this.closest_ray_intersection(ray, connected_sides);
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
                    console.debug(agent.pos);
                    
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
                    console.debug('pos', agent.pos);
               }
            }

            if (near_first) {
                points[points_idx++] = [ray[1][0], ray[1][1], 1];
                points[points_idx++] = [intersection_point[0], intersection_point[1], 1];
                last_hint = hint;
            } else {
                points[points_idx++] = [intersection_point[0], intersection_point[1], 1];
                points[points_idx++] = [ray[1][0], ray[1][1], 1];
                last_hint = vertex;
            }
         
        }
        
    }
    
    return points_idx;
}
