function CollisionProcessor2(segs) {
    this.segs = segs;
}

/* 
 * Returns the position at which the circle moving from being centred at
 * start to being centred at end, stops after intersecting the edge of seg, or null if
 * no such intersection occurs.
 */
CollisionProcessor2.prototype.edge_intersection = function(start, end, rad, seg) {
    /* find point on circle at the start that will first touch the segment
     * if the collision is with the edge (and not one of the vertices).
     */
    var circle_edge_collision_point = [start, rad].circ_closest_pt_to_seg(seg);
    cu.draw_point(circle_edge_collision_point, 'red', 6);

    /* a vector representing the path from start to end
     */
    var path_vector = end.v2_sub(start);

    /* segment from the edge collision point on the start circle to the corresponding
     * point on the end circle
     */
    var circle_edge_collision_point_path_seg = [circle_edge_collision_point, circle_edge_collision_point.v2_add(path_vector)];
    cu.draw_segment(circle_edge_collision_point_path_seg, 'red', 2);

    /* point on seg at which an edge collision will occur, if an
     * edge collision is going to occur
     */
    var seg_edge_collision_point = seg.seg_intersection(circle_edge_collision_point_path_seg);
    if (seg_edge_collision_point == null) {
        return null;
    }
    cu.draw_point(seg_edge_collision_point, 'red', 6);

    /* vector from centre of start circle to the circle edge collision point
     */
    var start_to_circle_edge_collision_point = circle_edge_collision_point.v2_sub(start);

    /* centre of circle intersecting the segment if it is an edge collision */
    var seg_edge_collision_circle_centre = seg_edge_collision_point.v2_sub(start_to_circle_edge_collision_point);
    cu.draw_circle([seg_edge_collision_circle_centre, rad], 'red', 1);

    return seg_edge_collision_point;
}

/*
 * Returns the position at which the circle moving from being centred at
 * start to being centred at end, stops after intersecting a vertex of seg, or null if
 * no such intersection occurs.
 */
CollisionProcessor2.prototype.vertex_intersection = function(start, end, rad, seg) {
    /* the circles with centres of each vertex of radius rad
     */
    var vertex_circles = seg.map(function(v){return [v, rad]});
    vertex_circles.map(function(c){cu.draw_circle(c, 'green', 1)});

    /* segment starting at start and finishing at end
     */
    var path_seg = [start, end];

    /* points of interesction between the path segment and both the circles
     */
    var circle_intersection_points = vertex_circles.map(function(c) {
        return path_seg.seg_circle_intersections(c);
    }).flatten();
    circle_intersection_points.map(function(v){cu.draw_point(v, 'green', 4)});

    if (circle_intersection_points.length == 0) {
        return null;
    }

    var closest_intersection_point = circle_intersection_points.most(function(v) {
        return -v.v2_dist(start);
    });
    cu.draw_point(closest_intersection_point, 'blue', 8);
    cu.draw_circle([closest_intersection_point, rad], 'blue', 2);

    return closest_intersection_point;
}

CollisionProcessor2.prototype.process_micro = function(start, end, rad, seg) {
    
}
