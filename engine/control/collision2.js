function CollisionProcessor(segs) {
    this.segs = segs;
}

CollisionProcessor.Collision = function(centre) {
    this.centre = centre;
}

CollisionProcessor.EdgeCollision = function(centre, to_collision) {
    CollisionProcessor.Collision.call(this, centre);
    this.to_collision = to_collision;
}
CollisionProcessor.EdgeCollision.inherits_from(CollisionProcessor.Collision);

CollisionProcessor.VertexCollision = function(centre, vertex) {
    CollisionProcessor.Collision.call(this, centre);
    this.vertex = vertex;
}
CollisionProcessor.VertexCollision.inherits_from(CollisionProcessor.Collision);

/* 
 * Returns the position at which the circle moving from being centred at
 * start to being centred at end, stops after intersecting the edge of seg, or null if
 * no such intersection occurs.
 */
CollisionProcessor.prototype.edge_intersection = function(start, end, rad, seg) {
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

    return new CollisionProcessor.EdgeCollision(seg_edge_collision_point, start_to_circle_edge_collision_point);
}

/*
 * Returns the position at which the circle moving from being centred at
 * start to being centred at end, stops after intersecting a vertex of seg, or null if
 * no such intersection occurs.
 */
CollisionProcessor.prototype.vertex_intersection = function(start, end, rad, seg) {
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
    });
    circle_intersection_points.map(function(arr){arr.map(function(v){cu.draw_point(v, 'green', 4)})});

    /* early exit if there are no circle intersection points */
    if (circle_intersection_points[0].length == 0 && circle_intersection_points[1].length == 0) {
        return null;
    }

    var shortest_distance = -1;
    var closest_intersection_point;
    var closest_vertex;
    for (var i = 0;i!=2;++i) {
        var arr = circle_intersection_points[i];
        for (var j = 0;j!=arr.length;++j) {
            var dist = arr[j].v2_dist(start);
            if (shortest_distance == -1 || dist < shortest_distance) {
                shortest_distance = dist;
                closest_intersection_point = arr[j];
                closest_vertex = seg[i];
            }
        }
    }

    cu.draw_circle([closest_intersection_point, rad], 'blue', 2);

    return new CollisionProcessor.VertexCollision(closest_intersection_point, closest_vertex);
}

CollisionProcessor.EdgeCollision.prototype.slide = function(start, end, rad, seg) {
    /* point in line with seg that is closest ot the end point */
    var end_projection_on_seg = seg.seg_closest_pt_to_v(end);
    cu.draw_segment([end, end_projection_on_seg], 'orange', 2);

    var projected_centre = end_projection_on_seg.v2_sub(this.to_collision);
    cu.draw_circle([projected_centre, rad], 'orange', 2);

    this.slide_end = projected_centre;

    return projected_centre;
}

CollisionProcessor.VertexCollision.prototype.slide = function(start, end, rad, seg) {
    cu.draw_point(this.vertex, 'yellow', 4);

    /* vector from start position to the vertex involved in the collision
     */
    var start_to_vertex = this.vertex.v2_sub(this.centre);

    /* tangent to the circle at the intersection point
     */
    var tangent_at_vertex = [this.vertex, start_to_vertex.v2_norm()];
    cu.draw_line(tangent_at_vertex);

}
