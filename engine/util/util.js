/* takes a function and an array and calls
 * the function on the elements as individual
 * arguments
 */
function element_call(fn, vec) {
    return fn.apply(null, vec);
}

function to_array(x) {
    return [x];
}

/* takes a function and an array and calls
 * the function on each element of the array
 * as individual arguments, enclosing each argument
 * in an array of length 1.
 * This helps with some numeric.js functions.
 */
function element_array_call(fn, vec) {
    return fn.apply(null, vec.map(to_array));
}

function default_value(value, def_value) {
    return value == undefined ? def_value : value;
}

/* returns true iff the angle b is between a and c
 */
function angle_between(a, b, c) {
    if (a <= c) {
        return a <= b && b <= c;
    } else {
        return !(c <= b && b <= a);
    }
}

function _angle_between(start, end) {
    return element_array_call(
                swap_args2(numeric.atan2), 
                numeric['-'](end, start)
    )[0];
}

function radians_between(a1, a2) {
    var radians = Math.abs(a1 - a2);
    while (radians > Math.PI) {
        radians -= Math.PI*2;
    }
    return Math.abs(radians);
}

function nearest_rotation_type(current, target) {
    var diff = target - current;
    if (diff < -Math.PI || (diff >= 0 && diff < Math.PI)) {
        return 1;
    } else {
        return -1;
    }
}

function curry2(f, arg1) {
    return function(arg2) {
        return f(arg1, arg2);
    }
}

function swap_args2(f) {
    return function(x, y) {
        return f(y, x);
    }
}

function call_on_split_array(merge, f, arr) {
    return merge(f(arr_left_half(arr)), f(arr_right_half(arr)));
}

// creates an array populated with undefineds of a given length
function create_undefined_array(length) {
    return Array.apply(null, new Array(length));
}

// takes a value and returns a function that takes no arguments and returns that value
function tofn(x) {
    return function(){return x};
}

// creates an array populated with a given value of a given length
function create_array_with_value(length, value) {
    return create_undefined_array(length).map(tofn(value));
}

// identity function
function id(x) {
    return x;
}

function Approx(value, tolerance) {
    this.value = value;
    this.tolerance = tolerance == undefined ? 1 : tolerance;
}
function A(value, tolerance) {
    return new Approx(value, tolerance);
}
A.approx = function(x) {
    if (x.constructor == Approx) {
        return x;
    } else {
        return A(x, 0);
    }
}

Approx.prototype.equals = function(b) {
    b = A.approx(b);
    return Math.abs(this.value - b.value) < this.tolerance + b.tolerance;
}

Approx.prototype.fmap = function(f) {
    return A(f(this.value), this.tolerance);
}

function Maybe(v) {
    this.v = v;
}

function maybe(v) {
    return new Maybe(v);
}
Maybe.prototype.fmap = function(f) {
    if (this.v == null) {
        return maybe(null);
    } else {
        return maybe(f(this.v));
    }
}
Maybe.prototype.mmap = function(m) {
    if (this.v == null) {
        return maybe(null);
    } else {
        return maybe(m.call(this.v));
    }
}

function maybe_method(m, v) {
    if (v == null) {
        return null;
    } else {
        return m.call(v);
    }
}

function maybe_function(f, v) {
    if (v == null) {
        return null;
    } else {
        return f(v);
    }
}
function do_nothing() {}

function Counter(what) {
    this.what = what;
    this.count = 0;
}
Counter.prototype.next = function() {

    if (this.what[this.count]) {
        this.what[this.count]();
    }

    this.count++;
}

function d(value, def_value) {
    return value == undefined ? def_value : value;
}

function approx_non_negative(x) {
    if (x < 0 && x > -0.00001) {
        return 0;
    } else {
        return x;
    }
}

function round_to_nearest(value, nearest) {
    var a = Math.floor((value+nearest/2)/nearest);
    var b = a * nearest;
    return b;
}

function obj_merge(a, b) {
    var c = {};
    for (var i in a) {
        c[i] = a[i];
    }
    for (var i in b) {
        c[i] = b[i];
    }
    return c;
}
function obj_merge_with(a, b) {
    for (var i in b) {
        a[i] = b[i];
    }
}

function objs_merge() {
    var r = {};
    for (var i = 0;i<arguments.length;i++) {
        obj_merge_with(r, arguments[i]);
    }
    return r;
}
