function ScalarWrapper(v) {
    this.v = v;
}
function VectorWrapper(v) {
    this.v = v;
}
ScalarWrapper.from_arr = function(arr) {
    return arr.map(function(x){return new ScalarWrapper(x)});
}
ScalarWrapper.from_seq = function(seq) {
    return seq.map(function(x){return [x[0], new ScalarWrapper(x[1])]});
}
ScalarWrapper.prototype.add = function(o) {
    return new ScalarWrapper(o.v+this.v);
}
ScalarWrapper.prototype.sub = function(o) {
    return new ScalarWrapper(this.v-o.v);
}
ScalarWrapper.prototype.smult = function(v) {
    return new ScalarWrapper(v*this.v);
}
VectorWrapper.from_arr = function(arr) {
    return arr.map(function(x){return new VectorWrapper(x)});
}
VectorWrapper.from_seq = function(seq) {
    return seq.map(function(x){return [x[0], new VectorWrapper(x[1])]});
}
VectorWrapper.prototype.add = function(o) {
    return new VectorWrapper(this.v.v2_add(o.v));
}
VectorWrapper.prototype.sub = function(o) {
    return new VectorWrapper(this.v.v2_sub(o.v));
}
VectorWrapper.prototype.smult = function(v) {
    return new VectorWrapper(this.v.v2_smult(v));
}
VectorWrapper.prototype.val = function() {
    return this.v;
}
ScalarWrapper.prototype.val = function() {
    return this.v;
}

function Interpolator(seq) {
    // seq is of the form [[t0, x0], [t1, x1], ..., [tn, x0]]
    this.seq = seq;
    this.length = seq.length;
    this.max_t = this.seq[this.length-1][0];
}

// assume seq[0][0] <= t < seq[n][0]
Interpolator.find_surrounding = function(t, seq) {
    if (seq.length < 2) {
        console.error('error');
    } else if (seq.length == 2) {
        return seq;
    } else {
        var mid_i = Math.floor(seq.length / 2);
        if (t < seq[mid_i][0]) {
            return Interpolator.find_surrounding(t, seq.slice(0, mid_i+1));
        } else {
            return Interpolator.find_surrounding(t, seq.slice(mid_i));
        }
    }
}
Interpolator.create_static = function(v) {
    if (typeof v == 'number') {
        v = new ScalarWrapper(v);
    } else if (typeof v == 'object') {
        v = new VectorWrapper(v);
    }
    return new Interpolator([0, v], [1, v]);
}

Interpolator.prototype.find_surrounding = function(t) {
    return Interpolator.find_surrounding(t, this.seq);   
}

Interpolator.simple_interpolate = function(num_start, num_end, num_current, start, end) {
    return end.sub(start).smult((num_current - num_start)/(num_end - num_start)).add(start);
}

Interpolator.prototype.interpolate = function(t) {
    t = rem(t, this.max_t);
    var s = this.find_surrounding(t);
    return Interpolator.simple_interpolate(s[0][0], s[1][0], t, s[0][1], s[1][1]);
}

function SequenceInterpolator(interpolator) {
    this.current = interpolator;
}

SequenceInterpolator.prototype.start = function(interval) {
    this.interval = d(interval, 1);
    this.time = 0;
}

SequenceInterpolator.prototype.switch_to = function(interpolator, duration, offset) {
    this.next = interpolator;

    this.switch_duration = d(duration, 1);
    this.switch_progress = 0;
    this.switch_offset = d(offset, 0);
}

SequenceInterpolator.prototype.tick = function() {
    if (this.next) {
        this.switch_progress += this.interval;
        if (this.switch_progress >= this.switch_duration) {
            this.current = this.next;
            this.next = null;

            this.time = this.switch_progress + this.switch_offset;
        }
    } else {
        this.time += this.interval;
    }

    return this;
}

SequenceInterpolator.prototype.get = function() {
    var current_value = this.current.interpolate(this.time);
    if (this.next) {
        var next_value = this.next.interpolate(this.switch_progress + this.switch_offset);
        return Interpolator.simple_interpolate(
            0, this.switch_duration, this.switch_progress, current_value, next_value
        );
    } else {
        return current_value;
    }
}