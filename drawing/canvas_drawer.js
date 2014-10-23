function CanvasDrawer(canvas, stack_size) {
    stack_size = stack_size != undefined ? stack_size : 32;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.stack = new Array(stack_size);
    for (var i = 0;i<stack_size;++i) {
        this.stack[i] = mat3.create();
    }
    this.idx = 0;
    this.mv_transform = this.stack[this.idx];
}

CanvasDrawer.prototype.save = function() {
    ++this.idx;
    var current = this.mv_transform;
    var next = this.stack[this.idx];
    
    mat3.copy(next, current);

    this.mv_transform = next;
}
CanvasDrawer.prototype.restore = function() {
    --this.idx;
    this.mv_transform = this.stack[this.idx];
}

CanvasDrawer.prototype.image = function(image, clip_start, clip_size, transform) {
    return new CanvasDrawer.Image(image, clip_start, clip_size, transform, this);
}

CanvasDrawer.Image = function(image, clip_start, clip_size, transform, drawer) {
    arguments.default(null, [0, 0], [image.width, image.height], [1,0,0,0,1,0,0,0,1]);
    this.drawer = drawer;
    this.ctx = drawer.ctx;
    this.image = image;
    this.clip_start = clip_start;
    this.clip_size = clip_size;
    this.mv_transform = transform;
}
Array.add_method('canvas_transform', function(ctx) {
    ctx.transform(this[0], this[1], this[3], this[4], this[6], this[7]);
});
Float32Array.add_method('canvas_transform', function(ctx) {
    ctx.transform(this[0], this[1], this[3], this[4], this[6], this[7]);
});

CanvasDrawer.Image.prototype.draw = function() {
    var ctx = this.ctx;
    ctx.save();
    this.drawer.mv_transform.canvas_transform(ctx);
    this.mv_transform.canvas_transform(ctx);
    ctx.drawImage(this.image, 
            this.clip_start[0], this.clip_start[1], 
            this.clip_size[0], this.clip_size[1],
            0, 0, this.image.width, this.image.height
    );
    ctx.restore();
}
CanvasDrawer.translate = function(v) {
    var transform = this.mv_transform;
    mat3.translate(transform, transform, v);
    return this;
}
CanvasDrawer.rotate = function(r) {
    var transform = this.mv_transform;
    mat3.rotate(transform, transform, r);
    return this;
}
CanvasDrawer.rotate_degrees = function(d) {
    var transform = this.mv_transform;
    mat3.rotate(transform, transform, d*Math.PI/180);
    return this;
}
CanvasDrawer.scale = function(v) {
    var transform = this.mv_transform;
    mat3.scale(transform, transform, v);
    return this;
}
CanvasDrawer.transform = function(t) {
    var transform = this.mv_transform;
    mat3.multiply(transform, transform, t);
    return this;
}
CanvasDrawer.prototype.translate = CanvasDrawer.translate;
CanvasDrawer.prototype.rotate = CanvasDrawer.rotate;
CanvasDrawer.prototype.rotate_degrees = CanvasDrawer.rotate_degrees;
CanvasDrawer.prototype.scale = CanvasDrawer.scale;
CanvasDrawer.prototype.transform = CanvasDrawer.transform;
CanvasDrawer.Image.prototype.translate = CanvasDrawer.translate;
CanvasDrawer.Image.prototype.rotate = CanvasDrawer.rotate;
CanvasDrawer.Image.prototype.rotate_degrees = CanvasDrawer.rotate_degrees;
CanvasDrawer.Image.prototype.scale = CanvasDrawer.scale;
CanvasDrawer.Image.prototype.transform = CanvasDrawer.transform;
