
function redraw() {
    var pos = Input.get_mouse_pos();
    var x = pos[0]/1000 - 0.5;
    var y = pos[1]/1000 + x;
    g.plot_2vars(function(x, y) {return Math.pow(x*x+y*y-1,3)-x*x*y*y*y}, [x, y])
}

$(window).mousemove(redraw);
$(window).click(redraw);

function Graph(cu, left, top, width, height, origin_left, origin_top, h_scale, v_scale) {
    this.cu = cu;
    this.ctx = cu.ctx;
    this.left = left == undefined ? 0 : left;
    this.top = top == undefined ? 0 : top;
    this.width = width == undefined ? this.ctx.canvas.width : width;
    this.height = height == undefined ? this.ctx.canvas.height : height;
    this.origin_left = origin_left == undefined ? this.width / 2 : origin_left;
    this.origin_top = origin_top == undefined ? this.height / 2 : origin_top;
    this.h_scale = h_scale == undefined ? 1 : h_scale;
    this.v_scale = v_scale == undefined ? 1 : v_scale;
}

Graph.prototype.clear = function(colour) {
    this.cu.clear(colour);
}

function set_pixel_rgba(pixarr, base_i, r, g, b, a) {
    pixarr[base_i] = r;
    pixarr[base_i+1] = g;
    pixarr[base_i+2] = b;
    pixarr[base_i+3] = a;
}

/* fn is a function which takes an x and y value
 * and returns a z value
 */
Graph.prototype.plot_2vars = function(fn, range) {
    range = range || [-1, 1];

    var image = this.ctx.getImageData(this.left, this.top, this.width, this.height);
    var data = image.data;
    var data_i = 0;
    for (var j = 0;j!=this.height;++j) {
        var y = -(j - this.origin_top)/this.v_scale;
        for (var i = 0;i!=this.width;++i) {
            var x = (i - this.origin_left)/this.h_scale;

            var z = fn(x, y);

            var in_range = (Math.min(Math.max(range[0], z), range[1])); 
            var zero_shift = in_range - range[0];
            var one_scale = zero_shift / (range[1] - range[0]);
            var byte_scale = Math.floor(255 * one_scale);


            var plot_value = 255*(Math.min(Math.max(range[0], z), range[1]) - range[0])/(range[1]-range[0])
            set_pixel_rgba(data, data_i, byte_scale, byte_scale, byte_scale, 255);
            data_i+=4;
        }
    }


    this.ctx.putImageData(image, this.left, this.top);
}


