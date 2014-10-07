function Sequence(frames) {
    this.frames = new Array();

    var i = 0;
    var time = 0;
    for (var k in frames) {
        time = parseFloat(k);
        this.frames[i] = {time: time, frame: frames[k]};
        ++i;
    }
    this.frames.sort(function(a, b) {return a.time - b.time});
    this.max_time = this.frames[this.frames.length-1].time;
}

Sequence.prototype.surrounding_points = function(t) {
    t = rem(t, this.max_time);
    this.last_time_relative = t;
    var last;
    for (var i = 0;i<this.frames.length;++i) {
        if (this.frames[i].time > t) {
            return [last, this.frames[i]];
        }
        last = this.frames[i];
    }
}

function SequenceInterpolator() {}

SequenceInterpolator.prototype.start = function(seq, interval) {
    this.seq = seq;
    this.time = 0;
    this.interval = interval;
}

SequenceInterpolator.prototype.next = function() {
    var ret = this.current();
    this.time += this.interval;
    return ret;
}

SequenceInterpolator.prototype.current = function() {
    return this.at_time(this.time);
}

SequenceInterpolator.prototype.at_time = function(t) {
    var surrounding = this.seq.surrounding_points(t);
    var seq_relative_time = this.seq.last_time_relative;
    var time_between = surrounding[1].time - surrounding[0].time;
    var frame_relative_time = seq_relative_time - surrounding[0].time;
    var ratio = frame_relative_time / time_between;
    return surrounding[0].frame.v2_interpolate(surrounding[1].frame, ratio);
}

function SequenceManager(initial) {
    this.seq = initial;
}
SequenceManager.prototype.start_with_initial = function(interval) {
    this.interval = interval;
    this.time = 0;
    this.current_si = new SequenceInterpolator();
    this.current_si.start(this.seq, interval);
}
SequenceManager.prototype.start = function(seq, interval) {
    this.seq = seq;
    this.start_with_initial(interval);
}

SequenceManager.prototype.switch_to = function(seq, duration, offset) {
    duration = d(duration, 1);
    offset = d(offset, 0);
    this.next_si = new SequenceInterpolator();
    this.next_si.start(seq, this.interval);
    this.next_si.time = offset;
    this.switch_duration = duration;
    this.switch_time = 0;
}

SequenceManager.prototype.next = function() {
    if (this.next_si == null) {
        return this.current_si.next();
    }
    
    var current = this.current_si.current();
    var next = this.next_si.next();
    var ret = current.v2_interpolate(next, this.switch_time/this.switch_duration);
    this.switch_time += this.interval;
    if (this.switch_time >= this.switch_duration) {
        this.current_si = this.next_si;
        this.next_si = null;
    }
    return ret;
}

SequenceManager.prototype.at_time = function(t) {
    var current = this.current_si.at_time(t);

    if (this.next_si == null) {
        return current;
    }

    var next = this.next_si.at_time(this.next_si.time);
    
    var ret = current.v2_interpolate(next, Math.min(this.switch_time/this.switch_duration, 1));
    this.switch_time += this.interval;
    this.next_si.time += this.interval;
    if (this.switch_time >= this.switch_duration) {
        this.current_si = this.next_si;
        this.time = this.next_si.time;
        this.next_si = null;
    }
    return ret;
}

function SequenceCollection(description) {
    this.seq_arr = [];
    this.name_arr = [];
    for (var seq_name in description) {
        var seq = new Sequence(description[seq_name]);
        this.seq_arr.push(seq);
        this.name_arr.push(seq_name);
    }
 
}

function SequenceCollectionManager(sc){
    this.sm_arr = [];
    this.seqs = sc;

    for (var i = 0;i<sc.seq_arr.length;++i) {
        var sm = new SequenceManager(sc.seq_arr[i]);
        this.sm_arr.push(sm);
    }

    this.offset = [0, 0];
}

SequenceCollectionManager.prototype.set_offset = function(offset) {
    this.offset = offset;
}

SequenceCollectionManager.prototype.start = function(interval) {
    this.sm_arr.map(function(s){s.start_with_initial(interval)});
    this.time = 0;
    this.interval = interval;
}

SequenceCollectionManager.prototype.next = function() {
    var ret = {};
    for (var i = 0;i<this.sm_arr.length;++i) {
        ret[this.seqs.name_arr[i]] = 
            this.sm_arr[i].next().v2_add(this.offset);
    }
    return ret;

}

SequenceCollectionManager.prototype.switch_to = function(sc, duration, offset) {
    for (var i = 0;i<sc.seq_arr.length;++i) {
        this.sm_arr[i].switch_to(sc.seq_arr[i], duration, offset);
    }
}
