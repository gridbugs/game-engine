function CollisionProcessor2(segs) {
    this.segs = segs;
}

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

    var seg_edge_collision_circle_centre = seg_edge_collision_point.v2_sub(start_to_circle_edge_collision_point);
    cu.draw_circle([seg_edge_collision_circle_centre, rad], 'red', 1);

    return seg_edge_collision_point;
}

CollisionProcessor2.prototype.process_micro = function(start, end, rad, seg) {
    
}
