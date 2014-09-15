function CanvasUtil(){
    this.strokestyle_stack = [];
    this.linewidth_stack = [];
    this.fillstyle_stack = [];
    this.textalign_stack = [];
    this.font_stack = [];
}
CanvasUtil.prototype.register_canvas = function(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
}


CanvasUtil.prototype.with_fillstyle = function(style, fn) {
    this.push_fillstyle(style);
    fn();
    this.pop_fillstyle();
}

CanvasUtil.prototype.with_linewidth = function(width ,fn) {
    this.push_linewidth(width);
    fn();
    this.pop_linewidth();
}

CanvasUtil.prototype.with_strokestyle = function(style, fn) {
    this.push_strokestyle(style);
    fn();
    this.pop_strokestyle();
}

CanvasUtil.prototype.with_line = function(style, width, fn) {
    this.push_strokestyle(style);
    this.push_linewidth(width);
    fn();
    this.pop_linewidth();
    this.pop_strokestyle();
}

CanvasUtil.prototype.push_fillstyle = function(style) {
    this.fillstyle_stack.push(this.ctx.fillStyle);
    this.ctx.fillStyle = style;
}

CanvasUtil.prototype.pop_fillstyle = function() {
    this.ctx.fillStyle = this.fillstyle_stack.pop();
}
CanvasUtil.prototype.push_strokestyle = function(style) {
    this.strokestyle_stack.push(this.ctx.strokeStyle);
    this.ctx.strokeStyle = style;
}

CanvasUtil.prototype.pop_strokestyle = function() {
    this.ctx.strokeStyle = this.strokestyle_stack.pop();
}

CanvasUtil.prototype.push_linewidth = function(width) {
    this.linewidth_stack.push(this.ctx.lineWidth);
    this.ctx.lineWidth = width;
}

CanvasUtil.prototype.pop_linewidth = function() {
    this.ctx.lineWidth = this.linewidth_stack.pop();
}

CanvasUtil.prototype.draw_circle = function(circle, colour, width) {
    this.circle(circle[0], circle[1], false, colour, width);
}

CanvasUtil.prototype.circle = function(centre, radius, filled, colour, width) {
    filled = default_value(filled, false);
    colour = default_value(colour, "black");
    width = default_value(width, 1);

    if (filled) {
        this.push_fillstyle(colour);
    } else {
        this.push_linewidth(width);
        this.push_strokestyle(colour);
    }

    this.ctx.beginPath();
    var _this = this;
    element_call(function(x, y){_this.ctx.arc(x, y, radius, 0, Math.PI*2)}, centre);

    if (filled) {
        this.ctx.fill();
        this.pop_fillstyle();
    } else {
        this.ctx.stroke();
        this.pop_linewidth();
        this.pop_strokestyle();
    }
}

CanvasUtil.prototype.move_to = function(pos) {
    this.ctx.moveTo(pos[0], pos[1]);
}
CanvasUtil.prototype.line_to = function(pos) {
    this.ctx.lineTo(pos[0], pos[1]);
}

CanvasUtil.prototype.line_at_angle = function(start, angle, length) {
    this.ctx.beginPath();
    var end = numeric['+'](numeric['*'](length, angle_to_unit_vector(angle)), start);
    this.move_to(start);
    this.line_to(end);
    this.ctx.stroke();
}

CanvasUtil.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

CanvasUtil.prototype.draw_point = function(pt, colour, size) {
    size = default_value(size, 4);
    colour = default_value(colour, "black");

    this.circle(pt, size/2, true, colour, 0);

}

CanvasUtil.prototype.draw_segment = function(segment, colour, size) {
    size = default_value(size, 1);
    colour = default_value(colour, "black");
    this.with_line(colour, size, function() {
        this.ctx.beginPath();
        this.move_to(segment[0]);
        this.line_to(segment[1]);
        this.ctx.stroke();
    }.bind(this));
}

CanvasUtil.prototype.draw_line = function(line, colour, size) {
    if (line[1][0] == 0) {
        this.draw_segment([[line[0][0], 0], [line[0][0], this.canvas.height]], colour, size);
        return;
    }
    var left_line = [[0, 0], [0, 1]];
    var right_line = [[this.canvas.width, 0], [0, 1]];
    var left_point = line.line_intersection(left_line);
    var right_point = line.line_intersection(right_line);
    this.draw_segment([left_point, right_point], colour, size);
}

CanvasUtil.prototype.draw_polygon = function(polygon, strokecolour, fillcolour, strokewidth) {
    strokewidth = default_value(strokewidth, 1);
    strokecolour = default_value(strokecolour, "black");
    fillcolour = default_value(fillcolour, "rgba(0, 0, 0, 0.2)");
    this.ctx.beginPath();
    this.move_to(polygon[polygon.length-1]);
    this.with_line(strokecolour, strokewidth, (function() {
        for (var i = 0,len=polygon.length;i!=len;++i) {
            this.line_to(polygon[i]);
        }
        this.line_to(polygon[0]); // this removes the jaggedness on the last corner
        this.ctx.stroke();
    }).bind(this));
    
    this.with_fillstyle(fillcolour, (function() {
        this.ctx.fill();
    }).bind(this));
}

CanvasUtil.prototype.push_align = function(align) {
    this.textalign_stack.push(this.ctx.textAlign);
    this.ctx.textAlign = align;
}

CanvasUtil.prototype.pop_align = function() {
    this.ctx.textAlign = this.textalign_stack.pop();
}

CanvasUtil.prototype.with_align = function(align, fn) {
    this.push_align(align);
    fn();
    this.pop_align();
}

CanvasUtil.prototype.push_font = function(font) {
    this.font_stack.push(this.ctx.font);
    this.ctx.font = font;
}

CanvasUtil.prototype.pop_font = function() {
    this.ctx.font = this.font_stack.pop();
}

CanvasUtil.prototype.with_font = function(font, fn) {
    this.push_font(font);
    fn();
    this.pop_font();
}

CanvasUtil.prototype.with_text = function(font, align, fn) {
    this.with_font(font, function() {
        this.with_align(align, fn);
    }.bind(this));
}

CanvasUtil.prototype.text = function(text, pos, font, align) {
    font = font || "12px Monospace";
    align = align || "left";
    this.with_text(font, align, function() {
        this.ctx.fillText(text, pos[0], pos[1])
    }.bind(this));
}
