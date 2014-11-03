function Map() {}

Map.prototype.regions = function(o) {
    this.region_hash = {};
    this.region_arr = [];
    for (var name in o) {
        var r = new Region(o[name]);
        this.region_hash[name] = r;
        this.region_arr.push(r);
    }
}

Map.prototype.connect = function() {
    var lines = Array.arguments_array(arguments);
    for (var i = 0;i<lines.length;i++) {
        var line = lines[i];
        var left = line[0];
        var right = line[1];
        var seg = line[2];
        this.region_hash[left].connect(this.region_hash[right], seg);
    }
}

Map.prototype.create_collision_processors = function(rad) {
    this.region_arr.map(function(r){r.create_collision_processor(rad)});
    return this;
}

Map.prototype.visible = function(o) {
    this.visible_obj = o;
}

Map.prototype.load_visible = function() {
    var o = this.visible_obj;
    this.group_hash = {};
    this.group_arr = [];
    var drawer = this.drawer;
    for (var name in o) {
        var group = drawer.group(this.region_hash[name].segs.map(function(s) {
            return drawer.line_segment(s[0], s[1], 1)
        }));
        this.group_hash[name] = group;
        this.group_arr.push(group);

        if (!o[name]) {
            group.hide();
        }
    }
}

Map.prototype.display_detectors = function() {
    this.display_detectors_arr = Array.arguments_array(arguments);
}
Map.prototype.load_display_detectors = function() {
    var lines = this.display_detectors_arr;
    for (var i = 0;i<lines.length;i++) {
        var line = lines[i];
        
        var region = this.region_hash[line[0]];
        var left_names = line[1].constructor == Array ? line[1] : [line[1]];
        var right_names = line[2].constructor == Array ? line[2] : [line[2]];
        var seg = line[3];

        var left = left_names.map(function(n){return this.group_hash[n]}.bind(this));
        var right = right_names.map(function(n){return this.group_hash[n]}.bind(this));

        region.add_display_detector(left, right, seg);
    }
}

Map.prototype.draw = function() {
    this.group_arr.map(function(g) {g.draw()}); 
}

Map.prototype.run = function(then) {
    this.load_visible();
    this.load_display_detectors();
    then();
}

Map.prototype.set_drawer = function(drawer) {
    this.drawer = drawer;
}
