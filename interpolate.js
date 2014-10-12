function ScalarWrapper(v) {
    this.v = v;
}
function VectorWrapper(v) {
    this.v = v;
}
function AngleWrapper(v) {
    this.v = v;
}
VectorWrapper.prototype.toString = function() {
    return "#"+this.v.toString();
}
ScalarWrapper.prototype.toString = function() {
    return "_"+this.v;
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
ScalarWrapper.prototype.flip_x = function() {
    return new ScalarWrapper(-this.v);
}
AngleWrapper.prototype.toString = function() {
    return "~"+this.v;
}
AngleWrapper.from_arr = function(arr) {
    return arr.map(function(x){return new AngleWrapper(x)});
}
AngleWrapper.from_seq = function(seq) {
    return seq.map(function(x){return [x[0], new AngleWrapper(x[1])]});
}
AngleWrapper.prototype.add = function(o) {
    return new AngleWrapper(angle_normalize(this.v + o.v));
}
AngleWrapper.prototype.sub = function(o) {
    var v = this.v - o.v;
    if (Math.abs(v) <= Math.PI) {
        return new AngleWrapper(v);
    } else if (v >= 0) {
        return new AngleWrapper(v - Math.PI*2);
    } else {
        return new AngleWrapper(v + Math.PI*2);
    }
}
AngleWrapper.prototype.smult = function(s) {
    return new AngleWrapper(this.v*s);
}
AngleWrapper.prototype.val = function() {
    return this.v;
}
AngleWrapper.prototype.flip_x = function() {
    return new AngleWrapper(-this.v);
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
VectorWrapper.prototype.flip_x = function() {
    return new VectorWrapper([-this.v[0], this.v[1]]);
}
ScalarWrapper.prototype.val = function() {
    return this.v;
}

function SimpleValue(v, a) {
    if (a != undefined) {
        v = [v, a];
    }
    this.v = v;
}
SimpleValue.prototype.get_value = function() {
    return this.v;
}
SimpleValue.prototype.get_value_discrete = function() {
    return this.v;
}
SimpleValue.prototype.set_value = function(v, a) {
    if (a != undefined) {
        v = [v, a];
    }
    this.v = v;
}
function SV(v, a) {
    return new SimpleValue(v, a);
}

function ConstantValue(v) {
    this.v = v;
}
ConstantValue.prototype.interpolate = function() {
    return this.v;
}
ConstantValue.prototype.get_value = function() {
    return this.v.val();
}
ConstantValue.prototype.flip_x = function() {
    return new ConstantValue(this.v.flip_x());
}
ConstantValue.prototype.clone_with_offset = function() {
    return new ConstantValue(this.v);
}
ConstantValue.prototype.map = function(f) {
    return new ContsantValue(f(this.v));
}

function IA() {
    var arr = new Array(arguments.length);
    for (var i = 0;i<arguments.length;i++) {
        arr[i] = arguments[i];
    }
    return new Interpolator(AngleWrapper.from_seq(arr));
}
function IV() {
    var arr = new Array(arguments.length);
    for (var i = 0;i<arguments.length;i++) {
        arr[i] = arguments[i];
    }
    return new Interpolator(VectorWrapper.from_seq(arr));
}
function IS() {
    var arr = new Array(arguments.length);
    for (var i = 0;i<arguments.length;i++) {
        arr[i] = arguments[i];
    }
    return new Interpolator(ScalarWrapper.from_seq(arr));
}
function ID() {
    var arr = new Array(arguments.length);
    for (var i = 0;i<arguments.length;i++) {
        arr[i] = arguments[i];
    }
    return new Interpolator(arr);
}
function CV(v, a) {
    if (typeof v == 'number') {
        v = [v, a];
    }
    return new ConstantValue(new VectorWrapper(v));
}
function CS(v) {
    return new ConstantValue(new ScalarWrapper(v));
}
function CA(v) {
    return new ConstantValue(new AngleWrapper(v));
}

function Interpolator(seq) {
    // seq is of the form [[t0, x0], [t1, x1], ..., [tn, x0]]
    this.seq = seq;
    this.length = seq.length;
    this.max_t = this.seq[this.length-1][0];
}

Interpolator.prototype.map = function(f) {
    return new Interpolator(this.seq.map(function(x){return [x[0], f(x[1])]}));
}

Interpolator.prototype.flip_x = function() {
    var seq = this.seq.map(function(x){return [x[0], x[1].flip_x()]});
    return new Interpolator(seq);
}


Interpolator.prototype.clone_with_offset = function(offset) {
    var seq = this.seq.map(function(x){return [x[0]+offset, x[1]]});

    // the index of the last element of the new sequence
    var end_i = Interpolator.binary_search(this.max_t, seq);
    var last = seq[end_i];

    var new_tail = seq.slice(0, end_i+1);
    var new_head = seq.slice(end_i+1, seq.length-1).map(function(x){
        return [x[0]-this.max_t, x[1]]
    }.bind(this));
    console.debug(seq.length-end_i);
    console.debug(new_head.toString());
    console.debug(new_tail.toString());

    if (last[0] != this.max_t) {
        var new_end = this.interpolate(this.max_t - offset);
        new_tail.push([this.max_t, new_end]);
    }
    
    new_head.unshift([0, new_tail[new_tail.length-1][1]]);

    return new Interpolator(new_head.concat(new_tail));

}

Interpolator.binary_search = function(t, seq) {
    return Interpolator.binary_search_rec(t, seq, 0, seq.length-1);
}

// returns the index in seq of the highest value <= t
Interpolator.binary_search_rec = function(t, seq, lo, hi) {
    if (lo == hi) {
        return lo;
    } else if (hi - lo == 1) {
        if (t < seq[hi][0]) {
            return lo;
        } else {
            return hi;
        }
    } else {
        var i = Math.floor((hi+lo)/2);
        var val = seq[i][0];
        if (val == t) {
            return i;
        } else if (t < val) {
            return Interpolator.binary_search_rec(t, seq, lo, i-1);
        } else {
            return Interpolator.binary_search_rec(t, seq, i, hi);
        }
    }
}

Interpolator.prototype.binary_search = function(t) {
    return Interpolator.binary_search(t, this.seq);
}

Interpolator.find_surrounding = function(t, seq) {
    var i = Interpolator.binary_search(t, seq);
    return [seq[i], seq[i+1]];
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

Interpolator.prototype.get_value_discrete = function(t) {
    t = rem(t, this.max_t);
    var s = this.find_surrounding(t);
    return s[0][1];
}

function SequenceInterpolator(interpolator) {
    this.current = interpolator;
}


SequenceInterpolator.prototype.set_interpolator = function(i) {
    this.current = i;
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

SequenceInterpolator.prototype.get_value = function() {
    return this.get().val();
}

SequenceInterpolator.prototype.get_value_discrete = function() {
    return this.current.get_value_discrete(this.time);
}

function SequenceManager(model) {
    this.seqs = {};
    for (var name in model) {
        if (model[name]) {
            this.seqs[name] = new SequenceInterpolator(model[name]);
        }
    }
}

SequenceManager.prototype.start = function(interval) {
    for (var name in this.seqs) {
        this.seqs[name].start(interval);
    }
    return this;
}

SequenceManager.prototype.g = function(name) {
    return this.seqs[name];
}

SequenceManager.prototype.update = function(model, duration, offset) {
    for (var name in this.seqs) {
        this.seqs[name].switch_to(model[name], duration, offset);
    }
}

SequenceManager.prototype.tick = function() {
    for (var name in this.seqs) {
        this.seqs[name].tick();
    }
}
