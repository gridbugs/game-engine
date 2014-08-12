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

function angle_to_unit_vector(angle) {
    return [
        Math.cos(angle),
        Math.sin(angle)
    ];
}

function angle_between(start, end) {
    return element_array_call(
                swap_args2(numeric.atan2), 
                numeric['-'](end, start)
    )[0];
}

function angle_normalize(angle) {
    if (angle > -Math.PI && angle <= Math.PI) {
        return angle;
    }
    if (angle <= -Math.PI) {
        return angle_normalize(angle + Math.PI*2);
    }
    if (angle > Math.PI) {
        return angle_normalize(angle - Math.PI*2);
    }
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

function arr_left_half(arr) {
    return arr.slice(0, arr.length/2);
}

function arr_right_half(arr) {
    return arr.slice(arr.length/2, arr.length);
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

/* returns the value x in arr that maximizes the value
 * of fn(x). e.g. function(arr){return arr_most(arr, id)}
 * is a function that returns the maximum value in an array
 */
function arr_most(arr, fn, scores) {
    var most = arr[0];
    var best = fn(arr[0]);

    var rest = arr.slice(1);
    for (var i in rest) {
        var val = fn(rest[i]);
        if (scores) {
            scores[i] = val;
        }
        if (val > best) {
            best = val;
            most = rest[i];
        }
    }

    return most;
}

/* fns is an array of functions that map elements
 * from arr to real numbers. This function returns
 * an array of elements from arr corresponding to 
 * the elements maximizing the fn value for each fn
 * in fns.
 */
function arr_mosts(arr, fns) {
    // initialize with first element of array
    var mosts = fns.map(tofn(arr[0]));
    var bests = fns.map(function(fn){return fn(arr[0])});

    // for all the other elements
    var rest = arr.slice(1);
    for (var i in rest) {
        var el = rest[i];
        for (var j in mosts) {
            var val = fns[j](el);
            if (val > bests[j]) {
                mosts[j] = el;
                bests[j] = val;
            }       
        }
    }

    return mosts;
}

function arr_proxy_filter(arr_to_filter, arr_to_filter_by, filter_fn) {
    var filtered = [];
    for (var i in arr_to_filter_by) {
        if (filter_fn(arr_to_filter_by[i])) {
            filtered.push(arr_to_filter[i]);
        }
    }
    return filtered;
}
