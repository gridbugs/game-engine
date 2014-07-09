function element_call(fn, vec) {
    switch (vec.length) {
        case 0: return fn();
        case 1: return fn(vec[0]);
        case 2: return fn(vec[0], vec[1]);
        case 3: return fn(vec[0], vec[2], vec[3]);
        default: alert("not supported");
    }

}

function element_array_call(fn, vec) {
    switch (vec.length) {
        case 0: return fn();
        case 1: return fn([vec[0]]);
        case 2: return fn([vec[0]], [vec[1]]);
        case 3: return fn([vec[0]], [vec[2]], [vec[3]]);
        default: alert("not supported");
    }
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
