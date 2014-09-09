function Editor(cu) {
    this.cu = cu;
    this.click = null;
    this.segments = [];
    this.point_buffer = null;
    this.polygons = [];
    this.current_polygon = [];
    this.selection = null;
    this.mouse_is_down = false;

    this.field_width = 100;
    this.field_height = 20;

    this.field = $("<input/>");
    this.field.css('position', 'absolute');
    this.field.css('width', this.field_width + 'px');
    this.field.css('height', this.field_height + 'px');
    this.field.hide();
    $('body').append(this.field);

}

Editor.events = ['click', 'mousedown', 'mouseup', 'mousemove', 'keydown', 'keypress', 'keyup', 'dblclick'];

Editor.prototype.clear_events = function() {
    // stop capturing the events
    Editor.events.map(function(e){$(window).off(e)});

    // remove any methods for handling events
    Editor.events.map(function(e){this[e]=undefined}.bind(this));
}

Editor.prototype.show_field = function(content) {
    content = content == undefined ? "" : content;
    var pos = Input.get_mouse_pos();

    var x = Math.min(this.cu.canvas.width - this.field_width, pos[0]);
    var y = Math.min(this.cu.canvas.height - this.field_height, pos[1]);

    this.field.css('left', x + 'px');
    this.field.css('top', y + 'px');
    this.field.val(content);
    this.field.show();
    this.field.focus();
    this.field.select();
}

Editor.prototype.hide_field = function() {
    this.field.val('');
    this.field.hide();
}

Editor.prototype.save_field = function() {
    
    this.selection.name = this.field.val();
}


Editor.prototype.snap_distance = 8;

Editor.prototype.label_segment = function(s) {
    if (s.name) {
        cu.text(s.name, s.polygon_average().v2_add([0, -5]), "16px Monospace", "center");
    }
}

Editor.prototype.label_segments = function() {
    this.segments.map(function(s){this.label_segment(s)}.bind(this));
}

Editor.prototype.label_polygon = function(p) {
    if (p.name) {
        cu.text(p.name, p.polygon_average(), "16px Monospace", "center");
    }
}

Editor.prototype.label_polygons = function() {
    this.polygons.map(function(p){this.label_polygon(p)}.bind(this));
}

Editor.prototype.show_labels = function() {
    this.label_polygons();
    this.label_segments();
}

Editor.prototype.buffer_mouse = function(ignore_selected) {
    this.point_buffer = this.get_snap_point(ignore_selected);
}

Editor.prototype.select_near_cursor = function() {
    this.selection = this.object_near_cursor();
}
    

Editor.prototype.highlight_selection = function() {
    this.highlight(this.selection);
}

Editor.prototype.highlight_mouseover = function(obj) {
    this.highlight(obj, ['black', 'black', 'rgba(0, 0, 0, 0.5)']);
}

Editor.prototype.highlight = function(obj, colours) {

    colours = colours || ['orange', 'yellow', 'rgba(255,255,0,1)'];

    if (obj == null) {
        return;
    }
    
    switch(obj.algebra_type()) {
    case 'vector':
        this.highlight_vertex(obj, colours);
        break;
    case 'segment':
        this.highlight_segment(obj, colours);
        break;
    case 'polygon':
        this.highlight_polygon(obj, colours);
        break;
    }

}


Editor.prototype.highlight_movement = function() {
    var move_vector = this.buffer_to_mouse();
    var clone = this.selection.deep_clone();
    clone.move_by(move_vector);
    this.highlight(clone, 
        ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']
    );
}

Editor.prototype.highlight_vertex = function(v, colours) {
    this.cu.draw_point(v, colours[0], 8);
}
Editor.prototype.highlight_segment = function(s, colours) {
    this.cu.draw_segment(s, colours[1], 4);
    this.highlight_vertex(s[0], colours);
    this.highlight_vertex(s[1], colours);
}
Editor.prototype.highlight_polygon = function(p, colours) {
    this.cu.draw_polygon(p, 'black', colours[2], 0);
    var segs = p.polygon_to_segments();
    segs.map(function(s){this.cu.draw_segment(s, colours[1], 4)}.bind(this));
    p.map(function(v){this.highlight_vertex(v, colours)}.bind(this));
}

Editor.prototype.init_events = function() {

    Editor.events.map(function(e) {
        $(window)[e](function(x) {
            if (this[e]) {
                this[e](x);
            }
        }.bind(this));
    }.bind(this));

}

Editor.prototype.draw_segments = function() {
    this.segments.map(function(seg) {this.cu.draw_segment(seg, 'black', 2)}.bind(this));
}

Editor.prototype.draw_polygons = function() {
    this.polygons.map(function(p) {this.cu.draw_polygon(p, 'black', 'rgba(0, 0, 0, 0.1)', 2)}.bind(this));
}

Editor.prototype.draw_complete = function() {
    this.draw_polygons();
    this.draw_segments();
    this.show_labels();
}

Editor.prototype.draw_partial_polygon = function() {
    if (this.current_polygon.length > 0) {
        var segs = this.current_polygon.polygon_to_segments();
        var drawn_segs = segs.slice(0, segs.length-1);
        drawn_segs.map(function(seg){this.cu.draw_segment(seg, 'grey', 1)}.bind(this));

        this.draw_mouse_to(this.current_polygon[0], 'rgba(0,0,0,0.1)');
        this.draw_mouse_to(this.current_polygon[this.current_polygon.length-1]);
    }
}

Editor.prototype.all_points = function(ignore_selected) {
    if (ignore_selected) {
        return this.segments.segs_to_vectors().concat(
            this.polygons.polygons_to_vectors().concat(
            this.current_polygon))
            .filter(function(p) {
                return p != this.selection
            }.bind(this));
    }
    return this.segments.segs_to_vectors().concat(
        this.polygons.polygons_to_vectors().concat(
        this.current_polygon));
}

Editor.prototype.point_near_cursor = function(ignore_selected) {
    var all_points = this.all_points(ignore_selected)
        .map(function(p){p.ignore=true;return p});
    if (all_points.length == 0) {
        return null;
    }

    var cursor = Input.get_mouse_pos();

    return all_points.most_over_threshold(-this.snap_distance, function(v) {
        return -v.v2_dist(cursor);
    });
}

Editor.prototype.segment_near_cursor = function() {
    var all_segments = this.segments;
    for (var i = 0,len=this.polygons.length;i<len;++i) {
        all_segments = all_segments.concat(this.polygons[i].polygon_to_segments()
            .map(function(seg){seg.ignore = true;return seg}));
    }

    if (all_segments.length == 0) {
        return null;
    }
    
    var cursor = Input.get_mouse_pos();

    return all_segments.most_over_threshold(-this.snap_distance, function(s) {
        return -s.seg_shortest_dist_to_just(cursor);
    });
}

Editor.prototype.polygon_near_cursor = function() {
    var cursor = Input.get_mouse_pos();
    for (var i = 0,len=this.polygons.length;i<len;++i) {
        if (this.polygons[i].polygon_contains(cursor)) {
            return this.polygons[i];
        }
    }
    return null;
}

Editor.prototype.buffer_to_mouse = function(ignore_selected) {
    return this.get_snap_point(ignore_selected).v2_sub(this.point_buffer);
}

Editor.prototype.object_near_cursor = function() {
    var obj = this.point_near_cursor();
    if (obj != null) {
        return obj;
    }
    obj = this.segment_near_cursor();
    if (obj != null) {
        return obj;
    }

    obj = this.polygon_near_cursor();
    if (obj != null) {
        return obj;
    }

    return null;
}

Editor.prototype.highlight_point_near_cursor = function() {
    var pt = this.point_near_cursor();
    maybe_function(function(p) {this.cu.draw_point(p, 'yellow', 8)}.bind(this), pt);
}

Editor.prototype.set_mode = function(mode) {
    
    this.clear_events();
    this.init_events();

    for (m in Editor.modes[mode]) {
        this[m] = Editor.modes[mode][m];
    }
}

Editor.prototype.get_snap_point = function(ignore_selected) {
    return this.point_near_cursor(ignore_selected) || Input.get_mouse_pos();
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
    click: function() {
        this.selection = this.object_near_cursor();
    },
    draw: function() {
        this.highlight(this.selection);
        this.highlight_mouseover(this.object_near_cursor());
        this.draw_complete();
    }
};

Editor.modes.move = {
    draw: function() {
        if (!this.mouse_is_down) {
            this.highlight(this.selection);
            this.highlight_mouseover(this.object_near_cursor());
        }
        this.draw_complete();
    },
    mousedown: function() {
        this.select_near_cursor();
        this.buffer_mouse();
        this.mouse_is_down = true;
    },
    mouseup: function() {
        this.mouse_is_down = false;
    },
    mousemove: function() {
        if (this.mouse_is_down && this.selection) {
            this.selection.move_by(this.buffer_to_mouse(true));
            this.buffer_mouse(true);
        }
    }
};

Editor.modes.label = {
    click: function() {
        this.select_near_cursor();
        if (this.selection == null || this.selection.ignore) {
            this.hide_field();
        } else {
            this.show_field(this.selection.name);
        }
    },
    draw: function() {
        if (this.selection != null) {
            this.save_field();
        }
        Editor.modes.select.draw.call(this);
    },
    keydown: function(e) {
        switch (e.keyCode) {
        case 13: // enter
            if (this.selection != null) {
                this.save_field();
            }
            this.hide_field();
            break;
        case 27: // escape
            this.hide_field();
            break;
        }
    }
}

Editor.modes.smart = {
    draw: function() {
        if (!this.mouse_is_down) {
            this.highlight(this.selection);
            this.highlight_mouseover(this.object_near_cursor());
        }
        this.draw_complete();
    },
    dblclick: Editor.modes.label.click,
    keydown: Editor.modes.label.keydown,
    mousedown: Editor.modes.move.mousedown,
    mouseup: Editor.modes.move.mouseup,
    mousemove: Editor.modes.move.mousemove,
    click: function() {
        this.selection = this.object_near_cursor();
        if (this.selection == null) {
            this.hide_field();
        }
    }
}
