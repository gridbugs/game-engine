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
Radial.prototype.restrict_range = function(mid, width) {
    var min = angle_normalize(mid - width/2);
    var _this = this;
    return R(function(theta, radius) {
        if (radians_between(min, theta) < width) {
            return _this._f(theta, radius);
        } else {
            return 0;
        }
    });

}
