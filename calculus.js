
const WAVE_DEFAULT_PERIOD = Math.PI*2;

function Wave() {}
Wave.PERIOD = Math.PI*2;
Wave.HALF_PERIOD = Math.PI;

Wave.saw_wave = function() {
    return function(x) {
        x-=(Wave.PERIOD/2);
        return (x-Math.floor(x/Wave.PERIOD)*Wave.PERIOD)/(Wave.HALF_PERIOD)-1;
    }
}

Wave.triangle_wave = function() {
    return function(x) {
        return Math.abs(saw_wave(x+Wave.PERIOD/4))*2-1;
    }
}

Wave.in_range = function(lo, hi, period) {
    period = d(period, Wave.PERIOD);
    return function(x) {
        var a = x - Math.floor(x/(period))*period;
        if (a >= lo && a < hi) {
            return 1;
        } else {
            return 0;
        }
    }
}
Wave.in_lowest = function(x, period) {
    period = d(period, Wave.PERIOD);
    return x - Math.floor(x/(period))*period;
}

Function.through_pts = function(a, b) {
    var m = (b[1]-a[1])/(b[0]-a[0]); // rise over run
    var c = a[1] - m*a[0];
    return function(x) {
        return m*x+c;
    }
}

Function.add_method('sin_to_cos', function() {
    return function(x) {
        return this(x+Wave.PERIOD/4);
    }.bind(this);
});
Function.add_method('slide_x', function(offset) {
    return function(x) {
        return this(x-offset);
    }.bind(this);
});

Function.add_method('divide', function(x) {
    return function(y) {
        return this(y)/x;
    }.bind(this);
});

function rem(a, b) {
    var div = a/b;
    return (div - Math.floor(div)) * b;
}
