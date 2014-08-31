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

