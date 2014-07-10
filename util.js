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

