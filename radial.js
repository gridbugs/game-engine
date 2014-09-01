var Radial = function(f) {
    this._f = f;
}
var R = function(f) {
    return new Radial(f);
}
R.rotate = function(f) {
    return R(function(theta, radius) {
        return f(radius);
    });
}
R.strip = function(x, y, width, height, value) {
    value = value == undefined ? 1 : value;
    return R(function(theta, dist) {
        var a = dist * Math.sin(theta);
        var b = dist * Math.cos(theta);
        if (y >= a && a >= y - height && x <= b && b <= x + width) {
            return value;
        } else {
            return 0;
        }
    });
}

Radial.prototype.rotate = function(radians) {
    var _this = this;
    return R(function(theta, dist) {
        return _this._f(theta - radians, dist);
    });
}

Radial.prototype.f = function() {return this._f}

Radial.prototype.restrict_range_block = function(mid, width) {
    var min = -width/2;
    var max = width/2;
    
    return this.multiply_relative(mid, function(x) {
        return min <= x && x <= max;
    });

}

Radial.prototype.restrict_range_linear = function(mid, width) {
    return this.multiply_relative(mid, function(x) {
        return Math.max(0, 1 - Math.abs(x));
    });
}

Radial.prototype.restrict_range_quadratic = function(mid, width) {
    return this.multiply_relative(mid, function(x) {
        return Math.max(0, 1 - x*x);
    });
}

Radial.prototype.multiply_relative = function(mid, f) {
    var _this = this;
    return this.angle_multiplier(function(angle) {
        return f(angle_normalize(mid - angle));
    });
}

Radial.prototype.angle_multiplier = function(f) {
    var _this = this;
    return R(function(theta, radius) {
        return f(theta)*_this._f(theta, radius);
    });
}

/* f is of the form f(angle, distance, time)
 * where angle is in radians, distance is the distance
 * of a point from the origin, and time is in seconds
 */
var TemporalRadial = function(f) {
    this._f = f;
}
TemporalRadial.prototype.f = function(){return this._f}
var TR = function(f) {
    return new TemporalRadial(f);
}
TR.by_rotating_radial = function(r, rads_per_second) {
    return TR(function(theta, dist, time) {
        return r._f(time + theta, dist);
    });
}
