function CollisionProcessor(rad, segs) {
    this.rad = rad;
    this.segs = segs;
    for (var i = 0;i<segs.length;++i) {
        segs[i].id = i;
    }
}

CollisionProcessor.prototype.process_collision = function(start, end, to_ignore, slide) {
    slide = d(slide, true);

    var valid_segs = this.segs.filter(function(s){return to_ignore != s.id});
    if (valid_segs.length == 0) {
        return end;
    }
    var collisions = valid_segs.map(function(s){
        return this.find_collision_path(start, end, s, slide);
    }.bind(this));

    var idx = collisions.most_idx(function(path) {
        return -this.get_collision_path_length(path);
    }.bind(this));

    var seg = valid_segs[idx];
    var path = collisions[idx];

    // the first collision is with seg, and follows path

    // handle simple case by returning destination
    if (path.length == 2) {
        return path[1];
    } else if (path.length == 3) {
        // handle slide case by checking for collisions along slide
        return this.process_collision(path[1], path[2], seg.id, false);
    }

    alert("invalid collision path");
}

CollisionProcessor.prototype.get_collision_path_length = function(path) {
    return path[0].v2_dist(path[1]);
}

/* compute the centre of the circle at which the movement of a circle centred
 * at start would stop on its way to being centred at end by colliding with seg */
CollisionProcessor.prototype.find_collision_path = function(start, end, seg, slide) {
    var middle = [start, end];

    // point on start that will eventually intersect seg
    var pt_will_collide = [start, this.rad].circ_closest_pt_to_seg(seg);

    // vector from start to end
    var move_v = end.v2_sub(start);

    // line through start and end
    var move_line = [end, move_v];

    // line through pt_will_collide in direction of movement
    var collide_line = [pt_will_collide, move_v];
    
    // point in line with seg at which an edge collision may occur
    var intersection_pt = collide_line.line_intersection(seg.seg_to_line());
    
    // boolean value true if edge collision has occured
    var edge_collision = seg.seg_contains_v2_on_line(intersection_pt);

    var candidates = [];
    if (edge_collision) {
        
        // vector from pt_will_collide to centre of start
        var offset = start.v2_sub(pt_will_collide);
        var dest_centre = intersection_pt.v2_add(offset);
        dest_centre._simple = true;
        candidates.push(dest_centre);
    }

    /* closest point to centre of start in line with line through start 
     * and end of seg in direction of movement */
    var seg_closest = seg.map(function(s){return [s, move_v].line_closest_pt_to_v(start)});

    // check if closest points to centre of start is inside start
    var close_vertices = seg.filter(function(pt){return [pt, move_v].line_closest_pt_to_v(start).v2_dist(start) <= this.rad}.bind(this));

    var vertex_collision_points = close_vertices.map(function(pt){
        var circle_ints = move_line.line_circle_intersections([pt, this.rad]);
        return circle_ints.most(function(m){return -m.v2_dist(start)})
    }.bind(this));

    candidates = candidates.concat(vertex_collision_points);
    
    var stop_centre = null;
    if (candidates.length > 0) {
        var dest_centre = candidates.most(function(v){return -start.v2_dist(v)});
        if (middle.seg_contains_v2_on_line(dest_centre) && start.v2_dist(end) > start.v2_dist(dest_centre)) {
            stop_centre = dest_centre;
        }
    }

    if (stop_centre == null) {
        return [start, end];
    }

    var moves = [start, stop_centre];

    if (!stop_centre._simple || !slide) {
        return moves;
    }

    // find closest point on seg's line to end
    var closest_to_end = seg.seg_closest_pt_to_v(end);

    var slide_centre = closest_to_end.v2_add(offset);

    if (seg.seg_contains_v2_on_line(closest_to_end)) {
        moves.push(slide_centre);
    } else {
        var slide_vector = slide_centre.v2_sub(stop_centre);
        var scaled_to_half_seg = slide_vector.v2_to_length(seg.seg_length()/2 + this.rad);
        var closest_end = seg.seg_mid().v2_add(scaled_to_half_seg);
        moves.push(seg.seg_mid().v2_add(scaled_to_half_seg).v2_add(offset));
    }

    return moves;
}

