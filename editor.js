function Editor() {
    this.click = null;
    this.segments = [];
    this.point_buffer = null;
    this.polygons = [];
    this.current_polygon = [];
    this.selection = null;
}

Editor.prototype.highlight_selection = function() {
    if (this.selection == null) {
        return;
    }

    switch(this.selection.algebra_type()) {
    case 'vector':
        this.highlight_vertex(this.selection);
        break;
    case 'segment':
        this.highlight_segment(this.selection);
        break;
    case 'polygon':
        this.highlight_polygon(this.selection);
        break;
    }

}

Editor.prototype.highlight_vertex = function(v, colour) {
    colour = colour || 'yellow';
    this.cu.draw_point(v, colour, 8);
}
Editor.prototype.highlight_segment = function(s, colour) {
    colour = colour || 'yellow';
    this.cu.draw_segment(s, colour, 8);
    this.highlight_vertex(s[0], 'orange');
    this.highlight_vertex(s[1], 'orange');
}
Editor.prototype.highlight_polygon = function(p, colour) {
    this.cu.draw_polygon(p, 'black', 'rgba(255,255,0,1)', 0);
    var segs = p.polygon_to_segments();
    segs.map((function(s){this.cu.draw_segment(s, 'yellow', 8)}).bind(this));
    p.map((function(v){this.highlight_vertex(v, 'orange')}).bind(this));
}

Editor.prototype.init = function(cu) {
    this.cu = cu;

    $(window).click(function() {
        if (this.click) {
            this.click();
        }
    }.bind(this));

}

Editor.prototype.draw_segments = function() {
    this.segments.map((function(seg) {this.cu.draw_segment(seg, 'black', 2)}).bind(this));
}

Editor.prototype.draw_polygons = function() {
    this.polygons.map((function(p) {this.cu.draw_polygon(p)}).bind(this));
}

Editor.prototype.draw_complete = function() {
    this.draw_polygons();
    this.draw_segments();
}

Editor.prototype.draw_partial_polygon = function() {
    if (this.current_polygon.length > 0) {
        var segs = this.current_polygon.polygon_to_segments();
        var drawn_segs = segs.slice(0, segs.length-1);
        drawn_segs.map((function(seg){this.cu.draw_segment(seg, 'grey', 1)}).bind(this));

        this.draw_mouse_to(this.current_polygon[0], 'rgba(0,0,0,0.1)');
        this.draw_mouse_to(this.current_polygon[this.current_polygon.length-1]);
    }
}

Editor.prototype.all_points = function() {
    return this.segments.segs_to_vectors().concat(
        this.polygons.polygons_to_vectors().concat(
        this.current_polygon));
}

Editor.prototype.point_near_cursor = function() {
    var all_points = this.all_points();
    if (all_points.length == 0) {
        return null;
    }

    var cursor = Input.get_mouse_pos();
    var closest = all_points.most(function(pt) {
        return -pt.v2_dist(cursor);
    });

    if (closest.v2_dist(cursor) < 8) {
        return closest;
    } else {
        return null;
    }
}

Editor.prototype.highlight_point_near_cursor = function() {
    var pt = this.point_near_cursor();
    maybe_function((function(p) {this.cu.draw_point(p, 'yellow', 8)}).bind(this), pt);
}

Editor.prototype.set_mode = function(mode) {
    for (m in Editor.modes[mode]) {
        this[m] = Editor.modes[mode][m];
    }
}

Editor.prototype.get_snap_point = function() {
    return this.point_near_cursor() || Input.get_mouse_pos();
}


Editor.prototype.draw_partial_segment = function() {
    if (this.point_buffer == null) {
        return;
    }
    this.draw_mouse_to(this.point_buffer);
}
Editor.prototype.draw_mouse_to = function(pt, colour) {
    colour = colour || 'grey';
    var mouse = this.get_snap_point();
    var seg = [mouse, pt];
    this.cu.draw_segment(seg, colour, 1);
}

Editor.modes = {};

Editor.modes.create_segments = {
    click: function() {
        var point = this.get_snap_point();
        if (this.point_buffer == null) {
            this.point_buffer = point;
        } else {
            var seg = [this.point_buffer, point];
            this.segments.push(seg);
            this.point_buffer = null;
        }
    },
    draw: function() {
        this.highlight_point_near_cursor();
        this.draw_complete();
        this.draw_partial_segment();
    }
};

Editor.modes.chain_segments = {
    click: function() {
        var point = this.get_snap_point();
        if (this.point_buffer == null) {
            this.point_buffer = point;
        } else {
            var seg = [this.point_buffer, point];
            this.segments.push(seg);
            this.point_buffer = point;
        }
    },
    draw: Editor.modes.create_segments.draw
};

Editor.modes.create_polygons = {
    click: function() {
        var point = this.get_snap_point();

        // if the polygon was just closed off
        if (this.current_polygon.length > 0 && this.current_polygon[0].v2_equals(point)) {
            this.polygons.push(this.current_polygon);
            this.current_polygon = [];
        } else {
            this.current_polygon.push(point);
        }
    },
    draw: function() {
        this.highlight_point_near_cursor();
        this.highlight_selection();
        this.draw_complete();
        this.draw_partial_polygon();
    }
};

Editor.modes.select = {
       
};
