/* return the vector at a right angle to the given vector
 * of the same length. Always the original vector rotated
 * 90 degrees anticlolckwise about the origin.
 */
function vector_normal(v) {
    return [-v[1], v[0]];
}

/* the projection of a on b
 */
function vector_project(a, b) {
    return numeric['*'](numeric.dot(a, b) / numeric.dot(b, b), b);
}

function vector_length(v) {
    return Math.sqrt(v[0]*v[0]+v[1]*v[1]);
}

/* this shortest distance from a vector a to the line from the
 * origin through a vector b
 */
function vector_right_angle_distance(a, b) {
    return vector_length(numeric['-'](a, vector_project(a, b)));
}

/* if the direction of b is that of a rotated anticlockwise
 * by less than 180 degrees and greater than 0 degrees,
 * return 1 else return -1
 */
function signed_multiplier(a, b) {
    if (numeric.dot(vector_normal(a), b) > 0) {
        return 1;
    } else {
        return -1;
    }
}

/* right angle distance where the positive direction is
 * 'to the left' or rotated anticlockwise less than 180
 */
function signed_vector_right_angle_distance(a, b) {
    // the vector from some point on origin->b to a at right angles to orign->b
    var right_angle_vector = numeric['-'](a, vector_project(a, b));
    var multiplier = signed_multiplier(b, right_angle_vector);
    return vector_length(right_angle_vector)*multiplier;
}

/* right angle distance to line on which segment lies to point.
 * Direction of segment is first point to second point for 
 * the purposes of signedness.
 */
function signed_segment_right_angle_distance(seg, pt) {
    // put the start point of the segment at the origin
    var seg_direction = numeric['-'](seg[1], seg[0]);
    var pt_relative = numeric['-'](pt, seg[0]);

    // now use regular vector arithmetic
    return signed_vector_right_angle_distance(pt_relative, seg_direction);
}

function segment_flip(seg) {
    return [seg[1], seg[0]];
}

function points_above_segment(seg, pts) {
    return pts.filter(function(pt) {
        return signed_segment_right_angle_distance(seg, pt) > 0
    });
}

function points_below_segment(seg, pts) {
    return points_above_segment(segment_flip(seg), pts);
}
