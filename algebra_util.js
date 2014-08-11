/* return the vector at a right angle to the given vector
 * of the same length
 */
function vector_normal(v) {
    return [-v[1], v[0]];
}

function vector_project(a, b) {
    return numeric['*'](numeric.dot(a, b) / numeric.dot(b, b), b);
}

function vector_length(v) {
    return Math.sqrt(v[0]*v[0]+v[1]*v[1]);
}

function vector_right_angle_distance(a, b) {
    return vector_length(numeric['-'](a, vector_project(a, b)));
}
