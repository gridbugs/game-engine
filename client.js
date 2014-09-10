var g;
var cu;
var ai0;
var editor;
$(function() {
    Info.register("info");
    Info.run();
    Input.set_canvas_offset(parseInt($("#screen").css("left")), parseInt($("#screen").css("top")));
    Input.init();
    cu = new CanvasUtil();
    cu.register_canvas($("#screen")[0]);

    cu.canvas.width = $(window).width();
    cu.canvas.height = $(window).height();

    $(document).resize(function() {
        cu.canvas.width = $(window).width();
        cu.canvas.height = $(window).height();
    });

    var player = new Agent([100, 100], 0);
    Agent.set_controlled_agent(player);
 
    var rad = 20;
    var seg = [[100, 100], [200, 400]];
    var start, end;
    var counter = new Counter({
        0: function() {
            start = [Input.get_mouse_pos(), rad];

            cu.clear();
            cu.draw_circle(start);
            cu.draw_segment(seg);
        },
        1: function() {
            end = [Input.get_mouse_pos(), rad];
            
            var dest = process_collision(start, end, seg) || end;
            
            cu.draw_circle(dest);
            
            counter.count = -1;
        }
    });

    $(window).click(function() {
        counter.next();
    });

    cu.draw_segment(seg);



 /*
    editor = new Editor(cu);

    editor.polygons.push([[100, 100], [100, 200], [200, 200], [200, 100]]);
    editor.polygons.push([[300, 300], [400, 400], [300, 450], [200, 400]]);
    editor.segments.push([[100, 50], [300, 50]]);
    editor.selection = editor.polygons[0];
    
    editor.set_mode('smart');


    function tick() {
        cu.clear();
        editor.draw();
        setTimeout(tick, 50);
    }
    tick();
*/

});

function process_collision(start, end, seg) {
    var middle = [start[0], end[0]];
    var top = middle.seg_move_perpendicular(start[1]);
    var bottom = middle.seg_move_perpendicular(-start[1]);

    // point on start that will eventually intersect seg
    var pt = start.circ_closest_pt_to_seg(seg);

    var move_v = end[0].v2_sub(start[0]);
    var move_line = [end[0], move_v];

    // line through pt in distance of movement
    var collide_line = [pt, move_v];
    
    // point in line with seg at which an edge collision may occur
    var intersection_pt = collide_line.line_intersection(seg.seg_to_line());
    
    // boolean value true if edge collision has occured
    var edge_collision = seg.seg_contains_v2_on_line(intersection_pt);

    var dest = null;
    var candidates = [];
    if (edge_collision) {
        var offset = start[0].v2_sub(pt);
        var dest_centre = intersection_pt.v2_add(offset);
        candidates.push(dest_centre);
        dest = [dest_centre, start[1]];
    }

    /* closest point to centre of start in line with line through start 
     * and end of seg in direction of movement */
    var seg_closest0 = [seg[0], move_v].line_closest_pt_to_v(start[0]);
    var seg_closest1 = [seg[1], move_v].line_closest_pt_to_v(start[0]);

    // check if closest points to centre of start is inside start

    if (seg_closest0.v2_dist(start[0]) <= start[1]) {
        candidates.push(move_line.line_circle_intersections([seg[0], start[1]]).most(function(m){return -m.v2_dist(start[0])}));
    }
    if (seg_closest1.v2_dist(start[0]) <= start[1]) {
        candidates.push(move_line.line_circle_intersections([seg[1], start[1]]).most(function(m){return -m.v2_dist(start[0])}));
    }
    
    if (candidates.length > 0) {
        var dest_centre = candidates.most(function(v){return -start[0].v2_dist(v)});
        if (middle.seg_contains_v2_on_line(dest_centre) && start[0].v2_dist(end[0]) > start[0].v2_dist(dest_centre)) {
            return [dest_centre, start[1]];
        }
    }

    return null;
}

/* computes the partial convex hull for a given segment and
 * array of points where all points must be above the segment
 * using the quickhull divide and conquer stategy.
 * Returns an array of segments constituting the convex hull.
 */
function qh_seg(seg, pts) {

    // if there are no more points the ch is complete
    if (pts.length == 0) {
        return [seg];
    }

    // this will hold the distance to each point
    var distances = new Array(pts.length);

    // find the furthest point from the segment
    var next = pts.most(function(pt) {
        return seg.seg_signed_shortest_dist_to(pt)
    }, distances);

    // the left and right sub-segments
    var left = [seg[0], next];
    var right = [next, seg[1]];

    // points above the left and right sub-segments
    var left_pts = pts.filter(function(pt) {
        return left.seg_signed_shortest_dist_to(pt) > 0
    });
    
    var right_pts = pts.filter(function(pt) {
        return right.seg_signed_shortest_dist_to(pt) > 0
    });

    return qh_seg(left, left_pts).concat(qh_seg(right, right_pts));
}

function quickhull(pts) {
    // segment connecting left-most to right-most points
    var initial_segment = [
        pts.most(function(v){return -v[0]}),
        pts.get_reverse().most(function(v){return v[0]})
    ];

    var above_pts = initial_segment.seg_filter_above(pts);
    var below_pts = initial_segment.seg_filter_below(pts);

    var above_hull = qh_seg(initial_segment, above_pts);
    var below_hull = qh_seg(initial_segment.seg_flip(), below_pts);

    return above_hull.concat(below_hull);

}

/*
 * Returns a line segment which is the bottom-most tangent to the point sets.
 */
function tangents_to_point_sets(left, right) {

    var tangents = [];

    var left_hull = quickhull(left);
    var right_hull = quickhull(right);
    
    var hull = quickhull(left.concat(right));
    
//    cu.draw_segment(hull[0], "blue", 2);
    var left_idx = 0;
    while (hull.ring(left_idx) .seg_equals (left_hull.ring(left_idx))) {
        ++left_idx;
    }
    
    tangents.push(hull.ring(left_idx));
    left_idx = -1;
    while (hull.ring(left_idx) .seg_equals (left_hull.ring( left_idx))) {
        --left_idx;
    }
    tangents.push(hull.ring(left_idx));

    return tangents;

}




function sort_left_to_right(pts) {
    // sort the array of points in order of increasing x coord with y coord breaking ties
    var sorted_pts = pts.slice(0); // make a copy of the point list
    sorted_pts.sort(function(a, b) {
        if (a[0] == b[0]) {
            return a[1] - b[1];
        } else {
            return a[0] - b[0];
        }
    });

    return sorted_pts;
}

function triangulate(pts) {

    
    var sorted_pts = sort_left_to_right(pts);

    return triangulate_sorted(sorted_pts, 1);
}

var colour_debug = new ColourDebugger(["red", "green", "blue", "yellow", "purple", "grey"]);

/*
 * The recursive function that computes the triangulation of a sorted array of points.
 * Returns an array of segments constituting the triangulation.
 */
function triangulate_sorted(sorted_pts, depth) {

    switch(sorted_pts.length) {
        case 0:
        case 1:
            return [];
        case 2:
            return [ [sorted_pts[0], sorted_pts[1]] ];
        case 3:
            return [ 
                        [sorted_pts[0], sorted_pts[1]],
                        [sorted_pts[1], sorted_pts[2]],
                        [sorted_pts[2], sorted_pts[0]],
                   ];
        default:

            var left = sorted_pts.left_half();
            var right = sorted_pts.right_half();

            var delaunay_left = triangulate_sorted(left, depth + 1);
            var delaunay_right = triangulate_sorted(right, depth + 1);
            

/*
            _.map(delaunay_left, function(segment) {cu.draw_segment(segment, colour_debug.get_colour(), depth*4)});
            colour_debug.next_colour();
            _.map(delaunay_right, function(segment) {cu.draw_segment(segment, colour_debug.get_colour(), depth*4)});
            colour_debug.next_colour();
                                            
*/
            var ret = dewall_merge(delaunay_left, delaunay_right, left, right);

            return ret;
    }

}


function get_neighbouring_vertices(segs, pt) {
    return segs.filter(function(seg) {
        return seg[0].v2_equals(pt) || seg[1].v2_equals(pt);
    }).map(function(seg) {
        var v = seg.seg_other_v(pt);
        v.__segment = seg; // tack on a reference back to the segment
        return v;
    });
}


function find_satisfying_candidate(candidates, bottom, is_left) {
    var num_candidates = candidates.length;
    for (var i = 0;i<num_candidates;++i) {

        // the angle to the candidate is less than 180 degrees
        var angle;
        if (is_left) {
            angle = angle_through(bottom[1], bottom[0], candidates[i]);

        } else {
            angle = angle_through(candidates[i], bottom[1], bottom[0]);
            //angle = angle_through(bottom[0], bottom[1], candidates[i]);

        }
        if (angle >= Math.PI) {
            return null;
        }

        // the next candidate is not in the circle
        if (i<num_candidates-1) {

            var circle = circle_through(bottom[0], bottom[1], candidates[i]);
            if (circle.circ_contains(candidates[i+1])) {


                candidates[i].__segment.__will_remove = true;
                continue;
            }
        }

        return candidates[i];
    }
    return null;
}

function remove_flagged(s) {
    var ret = [];
    for (var i = 0,len=s.length;i<len;++i) {
        if (!s[i].__will_remove) {
            ret.push(s[i]);
        } else {

        }
    }
    return ret;
}

/*
 * Takes two lists of segments representing the delaunay triangulation of two halves
 * of a point set and computes the delaunay triangulation of the entire point set.
 */
var count = 0;
function dewall_merge(left_segs, right_segs, left_pts, right_pts) {

    count++;

    var merge_segs = [];

    var bottom = tangents_to_point_sets(left_pts, right_pts)[0];
   // cu.draw_segment(bottom);

    var n = 0;
    var done = false;
    while (!done) {
     
        var left_candidates = get_neighbouring_vertices(left_segs, bottom[0]);
        var right_candidates = get_neighbouring_vertices(right_segs, bottom[1]);

        left_candidates.sort(function(a, b) {
            return angle_through(bottom[1], bottom[0], a) - 
                   angle_through(bottom[1], bottom[0], b);
        });

        right_candidates.sort(function(a, b) {
            return angle_through(a, bottom[1], bottom[0]) - 
                   angle_through(b, bottom[1], bottom[0]);
        });

        var left = find_satisfying_candidate(left_candidates, bottom, true);
        var right = find_satisfying_candidate(right_candidates, bottom, false);



        var new_segment;

        var left_circ, right_circ;
        if (left) {



            left_circ = circle_through(bottom[0], bottom[1], left);

        }
        if (right) {
            right_circ = circle_through(bottom[0], bottom[1], right);
        }
/*
        if (count == 2) {
        right_circ && 
            cu.circle(right_circ[0], right_circ[1], false);
        left_circ && 
            cu.circle(left_circ[0], left_circ[1], false);
        }
    */

        n++;

        if (left && right) {

            if (!left_circ.circ_contains(right)) {

                new_segment = [left, bottom[1]];
            } else if (!right_circ.circ_contains(left)) {

                new_segment = [bottom[0], right];
            }

        } else if (left) {

            new_segment = [left, bottom[1]];
        } else if (right) {

            new_segment = [bottom[0], right];
        } else {

            done = true;
        }

        merge_segs.push(bottom);
        bottom = new_segment;
        /*
        if (count == 1) {
            if (n >= 0) {
                break;
            }
        }
        */
    }

    //merge_segs.map(function(seg){cu.draw_segment(seg)});

    return merge_segs.concat(remove_flagged(left_segs.concat(right_segs)));
}
