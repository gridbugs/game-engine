// add vector methods to Array

// algebraic sum of 2 vectors
extend(Array, 'v2_add', function(v){return [this[0]+v[0], this[1]+v[1]]});

// algebraic sum of this and -v
extend(Array, 'v2_sub', function(v){return [this[0]-v[0], this[1]-v[1]]});

// length of this squared
extend(Array, 'v2_len_squared', function() {return this[0]*this[0]+this[1]*this[1]});

// length of this
extend(Array, 'v2_len', function(){return Math.sqrt(this.v2_len_squared())});

// true iff this is identical to v
extend(Array, 'v2_equals', function(v){return this[0]==v[0] && this[1]==v[1]});

// returns this rotated 90 degrees anticlockwise
extend(Array, 'v2_norm', function() {return [-this[1], this[0]]});

// distance between this and v
extend(Array, 'v2_dist', function(v) {return this.v2_sub(v).v2_len()});

// dot product of this and v
extend(Array, 'v2_dot', function(v) {return this[0]*v[0] + this[1]*v[1]});

// scalar multiple of this and s
extend(Array, 'v2_smult', function(s) {return [this[0]*s, this[1]*s]});

// projection of v on this
extend(Array, 'v2_project', function(v) {
    return this.v2_smult(this.v2_dot(v)/this.v2_len_squared());
});

/* shortest distance from this to v 
 * (length of line segment from v at right angles to this to some point on this) */
extend(Array, 'v2_shortest_dist_to', function(v) {
    return v.v2_dist(this.v2_project(v));
});

extend(Array, 'v2_angle_between', function(v) {
    var ret = Math.atan2(this[1], this[0]) - Math.atan2(v[1], v[0]);
    if (ret < 0) {
        ret += Math.PI*2;
    }
    return ret;
});

/* return multiplier for the distance from v to a point on this
 * such that positive distances are 'to the left'
 */
extend(Array, 'v2_relative_sign', function(v) {
    if (this.v2_norm().v2_dot(v) > 0) {
        return 1;
    } else {
        return -1;
    }
});

extend(Array, 'v2_signed_shortest_dist_to', function(v) {
    return this.v2_shortest_dist_to(v) * this.v2_relative_sign(v);
});

// add segment methods to Array
extend(Array, 'seg_equals', function(s) {
    return this[0].v2_equals(s[0]) && this[1].v2_equals(s[1]);
});

extend(Array, 'seg_unsigned_equals', function(s) {
    return this.seg_equals(s) || this.seg_flip().seg_equals(s);
});

extend(Array, 'seg_to_dir_v2', function() {
    return this[1].v2_sub(this[0]);
});

extend(Array, 'seg_signed_shortest_dist_to', function(v) {
    return this.seg_to_dir_v2().v2_signed_shortest_dist_to(v.v2_sub(this[0]));
});

extend(Array, 'seg_flip', function() {return [this[1], this[0]]});

extend(Array, 'seg_filter_above', function(vs) {
    var _this = this;
    return vs.filter(function(v) {
        return _this.seg_signed_shortest_dist_to(v) > 0;
    });
});

extend(Array, 'seg_filter_below', function(vs) {
    return this.seg_flip().seg_filter_above(vs);
});

extend(Array, 'seg_other_v', function(v) {
    if (this[0].v2_equals(v)) {
        return this[1];
    } else if (this[1].v2_equals(v)) {
        return this[0];
    } else {
        return null;
    }
});

extend(Array, 'seg_mid', function() {
    return [(this[0][0] + this[1][0])/2, (this[0][1] + this[1][1])/2];
});

extend(Array, 'seg_norm_v', function() {
    return this.seg_to_dir_v2().v2_norm();
});

extend(Array, 'seg_perpendicular_bisector_line', function() {
    return [this.seg_mid(), this.seg_norm_v()];
});


// add line methods to Array
// a line is a pair of vectors [p, v]
// such that p is a point on the line and v is its direction
// (ie. line = p + av for all real numbers 'a'

extend(Array, 'line_intersection', function(l) {
    var r = this[0].v2_sub(l[0]);
    var matrix = [[l[1][0], this[1][0]], [l[1][1], this[1][1]]];


    var inverse = numeric.inv(matrix);


    var mult = numeric.dot(inverse, r);

    return l[0].v2_add(l[1].v2_smult(mult[0]));
});

extend(Array, 'circ_contains', function(v) {
    return this[0].v2_dist(v) <= this[1];
});

// returns the circle which passes through the three specified
// points in the form [centre, radius]
var circle_through = function(a, b, c) {
    var l0 = [a, b].seg_perpendicular_bisector_line();
    var l1 = [b, c].seg_perpendicular_bisector_line();



    var centre = l0.line_intersection(l1);

    var radius = centre.v2_dist(a);
    return [centre, radius];
}

var radians_to_degrees = function(r) {
    return r * 180 / Math.PI;
}

var angle_through = function(a, b, c) {
    var a_shift = a.v2_sub(b);
    var c_shift = c.v2_sub(b);
    return a_shift.v2_angle_between(c_shift);
}

