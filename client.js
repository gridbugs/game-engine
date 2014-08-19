var cu;
var ai0;
$(function() {
    Info.register("info");
    Info.run();
    Input.set_canvas_offset(parseInt($("#screen").css("left")), parseInt($("#screen").css("top")));
    Input.init();
    cu = new CanvasUtil();
    cu.register_canvas($("#screen")[0]);

    var player = new Agent([200, 200], 0);
    Agent.set_controlled_agent(player);

    ai0 = new Agent([400, 200], 0);

    function display_loop() {
        cu.clear();
        Agent.controlled_agent.draw();
        ai0.draw();
        setTimeout(display_loop, 50);
    }

    function control_loop() {
        Agent.controlled_agent.control_tick();
        setTimeout(control_loop, 50);
    }

    /*
    display_loop();
    control_loop();
    */
//    var pts = [];
    var midx = 200;
    var left = [];
    var right = [];
    $(document).click(function() {
        var pt = Input.get_mouse_pos();
        
        if (pt[0] > midx) {
            right.push(pt);
        } else {
            left.push(pt);
        }
        
        cu.clear();

        cu.draw_segment([[midx, 0], [midx, 10]], "black", 1);

        left.map(function(x) {cu.draw_point(x, "red")});
        right.map(function(x) {cu.draw_point(x, "blue")});

        if (left.length > 2) {
            quickhull(left).map(function(seg) {cu.draw_segment(seg)});
        }

        if (right.length > 2) {
            quickhull(right).map(function(seg) {cu.draw_segment(seg)});
        }

        if (left.length > 0 && right.length > 0) {
            var t = tangents_to_point_sets(left, right);
            cu.draw_segment(t[0], "black", 2);
        }
    });

    //var pts = [[100, 50], [100, 100], [300, 150], [120, 200], [400, 140], [250, 100], [225, 130], [170, 195], [230, 50], [125, 150], [255, 25]];
    
    var pts = [[100, 50], [50, 180], [200, 225], [300, 125], [425, 65], [445, 150]].map(function(v) {
        return [v[0], v[1]+100]});
    
    //pts = pts.map(function(pt){return [pt[0], 300 -pt[1]]});
/*
    var sorted = sort_left_to_right(pts);

    var left = arr_left_half(sorted);
    var right = arr_right_half(sorted);
    */
/*
    var left = [[100, 100], [100, 140]];
    var right = [[150, 100], [110, 200]];
    left.map(function(pt){cu.draw_point(pt, "red")});
    right.map(function(pt){cu.draw_point(pt, "blue")});

    var bt = tangents_to_point_sets(left, right);

    cu.draw_segment(bt[0], "green", 1);
    cu.draw_segment(bt[1], "orange", 1);
*/
//    cu.draw_segment(bt);

    _.map(triangulate(pts), function(segment) {
        cu.draw_segment(segment);
    });
/*
    var ch = quickhull(pts);
    console.debug(ch);
    ch.map(function(seg){cu.draw_segment(seg)});
*/
});

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
        pts.most(function(v){return v[0]})
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
    console.debug(pts);
    
    var sorted_pts = sort_left_to_right(pts);

    return triangulate_sorted(sorted_pts, 1);
}

var colour_debug = new ColourDebugger(["red", "green", "blue", "yellow", "purple", "grey"]);

/*
 * The recursive function that computes the triangulation of a sorted array of points.
 * Returns an array of segments constituting the triangulation.
 */
function triangulate_sorted(sorted_pts, depth) {
    //console.debug(sorted_pts.length);
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
            
            //console.debug(depth);

            _.map(delaunay_left, function(segment) {cu.draw_segment(segment, colour_debug.get_colour(), depth*2)});
            colour_debug.next_colour();
            _.map(delaunay_right, function(segment) {cu.draw_segment(segment, colour_debug.get_colour(), depth*2)});
            colour_debug.next_colour();
                                            

            var ret = dewall_merge(delaunay_left, delaunay_right, left, right);

            return ret;
    }

}


function get_neighbouring_vertices(segs, pt) {
    return segs.filter(function(seg) {
        return seg[0].v2_equals(pt) || seg[1].v2_equals(pt);
    }).map(function(seg) {
        return seg.seg_other_v(pt);
    });
}

function find_satisfying_candidate(candidates, bottom, is_left) {
    var num_candidates = candidates.length;
    for (var i = 0;i<num_candidates;++i) {

        // the angle to the candidate is less than 180 degrees
        var angle;
        if (is_left) {
            angle = angle_through(bottom[1], bottom[0], candidates[i]);
            console.debug("left: " + angle);
        } else {
            angle = angle_through(candidates[i], bottom[1], bottom[0]);
            //angle = angle_through(bottom[0], bottom[1], candidates[i]);
            //console.debug("right: " + angle);
        }
        if (angle >= Math.PI) {
            continue;
        }

        // the next candidate is not in the circle
        if (i<num_candidates-1) {
            var circle = circle_through(bottom[0], bottom[1], candidates[i]);
            if (circle.circ_contains(candidates[i+1])) {
                continue;
            }
        }

        return candidates[i];
    }
    return null;
}

/*
 * Takes two lists of segments representing the delaunay triangulation of two halves
 * of a point set and computes the delaunay triangulation of the entire point set.
 */
function dewall_merge(left_segs, right_segs, left_pts, right_pts) {

    var merge_segs = [];

    var bottom = tangents_to_point_sets(left_pts, right_pts)[0];
    cu.draw_segment(bottom);

    var n = 0;
    while (true) {
     
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

        
        right_circ && 
            cu.circle(right_circ[0], right_circ[1], false, colour_debug.get_colour(), 8-3*n);
        left_circ && 
            cu.circle(left_circ[0], left_circ[1], false, colour_debug.get_colour(), 8-3*n);

        colour_debug.next_colour();
        n++;

        if (left && right) {

            if (!left_circ.circ_contains(right_candidates[0])) {
                console.debug("left");
                new_segment = [left_candidates[0], bottom[1]];
            } else if (!right_circ.circ_contains(left_candidates[0])) {
                console.debug("right");
                new_segment = [bottom[0], right_candidates[0]];
            }

        } else if (left) {
                console.debug("left only");
            new_segment = [left, bottom[1]];
        } else if (right) {
                console.debug("right only");
            new_segment = [bottom[0], right];
        } else {
            console.debug("done");
            break;
        }
        console.debug(JSON.stringify(new_segment));
        merge_segs.push(new_segment);
        bottom = new_segment;
    }

    merge_segs.map(function(seg){cu.draw_segment(seg)});
}
