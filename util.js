function extend(cl, fn_name, fn) {
    Object.defineProperty(cl.prototype, fn_name, {
            value: fn,
            enumerable: false,
        }
    );
}

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

extend(Array, 'left_half', function() {
    return this.slice(0, this.length/2);
});
extend(Array, 'right_half', function() {
    return this.slice(this.length/2, this.length);
});

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

extend(Array, 'most_idx', function(fn, scores) {
    fn=fn||id;
    var most_i = 0;
    var best = fn(this[0]);

    var rest = this.slice(1);
    for (var i = 0, len=rest.length;i<len;++i) {
        var val = fn(rest[i]);
        if (scores) {
            scores[i] = val;
        }
        if (val > best) {
            best = val;
            most_i = i+1;
        }
    }

    return most_i;

});

/* returns the value x in arr that maximizes the value
 * of fn(x). e.g. function(arr){return arr_most(arr, id)}
 * is a function that returns the maximum value in an array
 */
extend(Array, 'most', function(fn, scores) {
    return this[this.most_idx(fn, scores)];
});

extend(Array, 'rotate', function(idx) {
    return this.slice(idx).concat(this.slice(0, idx));
});

function arr_rotate(arr, idx) {
    return arr.slice(idx).concat(arr.slice(0, idx));
}

extend(Array, 'rotate_most', function(fn) {
    return this.rotate(this.most_idx(fn));
});

extend(Array, 'rotate_until', function(fn) {
    for (var i = 0,len=this.length;i<len;++i) {
        if (fn(this[i])) {
            return this.rotate(this, i);
        }
    }
    return null;

});

extend(Array, 'mosts_heap', function(k, fn) {
    fn=fn||id;
    var h = new ConstrainedHeap(k, function(a, b) {
        return fn(a) <= fn(b);
    });
    return this.reduce(function(acc, x) {acc.insert(x);return acc}, h);
});

// returns the k highest elements in arr
extend(Array, 'mosts', function(k, fn) {
    return this.mosts_heap(k, fn).to_array();
});

// returns the k highest elements in arr sorted in order from lowest value of fn(x)
extend(Array, 'mosts_sorted', function(k, fn) {
    return this.mosts_heap(k, fn).to_sorted_array();
});

// returns the kth fn-est element in this
extend(Array, 'kth', function(k, fn) {
    fn=fn||id;
    return this.mosts(k, fn).most(function(x){return -fn(x)});
});

extend(Array, 'proxy_filter', function(arr_to_filter_by, filter_fn) {
    var filtered = [];
    for (var i = 0,len=this.length;i<len;++i) {
        if (filter_fn(arr_to_filter_by[i])) {
            filtered.push(this[i]);
        }
    }
    return filtered;
});

// treat an array like a ring buffer
extend(Array, 'ring', function(idx, value) {
    var i = (idx % this.length + this.length) % this.length;
    if (value == undefined) {
        return this[i];
    } else {
        this[i] = value;
    }
});

extend(Array, 'find', function(fn) {
    for (var i = 0,len=this.length;i<len;++i) {
        if (fn(this[i])) {
            return this[i];
        }
    }
    return null;
});

extend(Array, 'get_reverse', function() {
    return this.slice(0).reverse();
});



