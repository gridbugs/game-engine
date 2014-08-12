function canvas_fill_window() {
    $("#screen")[0].width = $(window).width();
    $("#screen")[0].height = $(window).height();
}
$(window).resize(canvas_fill_window);
$(canvas_fill_window);

var cu;
var ai0;
$(function() {
    Info.register("info");
    Info.run();
    Input.set_canvas_offset(0 ,0);
    Input.init();
    cu = new CanvasUtil();
    cu.register_canvas($("#screen")[0]);

    var player = new Agent([200, 200], 0);
    Agent.set_controlled_agent(player);

    ai0 = new Agent([400, 200], 0);

    var pts = [];
    
    function display_loop() {
        cu.clear();
        //Agent.controlled_agent.draw();
        //ai0.draw();
        pts.map(function(pt){cu.draw_point(pt)});
        if (pts.length >= 3) {
            quickhull(pts).map(function(seg){cu.draw_segment(seg)});
        }
        setTimeout(display_loop, 50);
    }

    function control_loop() {
        Agent.controlled_agent.control_tick();
        setTimeout(control_loop, 50);
    }

    display_loop();
    /*
    control_loop();
    */


    $(document).click(function() {
        console.debug(Input.mouse_pos);
        console.debug(Input.mouse_pos.slice());
        pts.push(Input.mouse_pos.slice());
    });

//    _.map(pts, function(pt){cu.draw_point(pt)});

/*
    _.map(triangulate(pts), function(segment) {
        cu.draw_segment(segment);
    });

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
    var next = arr_most(pts, function(pt) {
        return signed_segment_right_angle_distance(seg, pt)
    }, distances);

    // the left and right sub-segments
    var left = [seg[0], next];
    var right = [next, seg[1]];

    // points above the left and right sub-segments
    var left_pts = pts.filter(function(pt) {
        return signed_segment_right_angle_distance(left, pt) > 0
    });
    
    var right_pts = pts.filter(function(pt) {
        return signed_segment_right_angle_distance(right, pt) > 0
    });

    return qh_seg(left, left_pts).concat(qh_seg(right, right_pts));
}

function quickhull(pts) {
    // segment connection left-most to right-most points
    var initial_segment = arr_mosts(pts, [
        function(pt) {return -pt[0]}, // left most
        function(pt) {return pt[0]}   // right most
    ]);

    var above_pts = points_above_segment(initial_segment, pts);
    var below_pts = points_below_segment(initial_segment, pts);

    var above_hull = qh_seg(initial_segment, above_pts);
    var below_hull = qh_seg(segment_flip(initial_segment), below_pts);

    return above_hull.concat(below_hull);

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

            var left = arr_left_half(sorted_pts);
            var right = arr_right_half(sorted_pts);

            var delaunay_left = triangulate_sorted(left, depth + 1);
            var delaunay_right = triangulate_sorted(right, depth + 1);
            
            console.debug(depth);

            _.map(delaunay_left, function(segment) {cu.draw_segment(segment, colour_debug.get_colour(), depth*4)});
            colour_debug.next_colour();
            _.map(delaunay_right, function(segment) {cu.draw_segment(segment, colour_debug.get_colour(), depth*4)});
            colour_debug.next_colour();
                                            

            var ret = dewall_merge(delaunay_left, delaunay_right);

            return ret;
    }

}

/*
 * Returns a line segment which is the bottom-most tangent to the point sets.
 */
function bottom_tangent(left, right) {

}


/*
 * Takes two lists of segments representing the delaunay triangulation of two halves
 * of a point set and computes the delaunay triangulation of the entire point set.
 */
function dewall_merge(left, right) {

    

}
