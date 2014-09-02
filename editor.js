function Editor() {
    this.click = null;
    this.segments = [];
    this.point_buffer = null;
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

Editor.prototype.point_near_cursor = function() {
    if (this.segments.length == 0) {
        return null;
    }

    var cursor = Input.get_mouse_pos();
    var all_points = this.segments.segs_to_vectors();
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

    var point = this.get_snap_point();
    var seg = [point, this.point_buffer];
    this.cu.draw_segment(seg, 'grey', 1);
}

Editor.modes = {
    create_segments: {
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
            this.draw_segments();
            this.draw_partial_segment();
        }
    }
};


