function WebGLDrawer(canvas, stack_size) {
    this.canvas = canvas;
    this.glm = new WebGLManager(canvas).init_2d();

    // initialize buffers
    this.vertex_buffer = this.glm.array_buffer(2);
    this.index_buffer = this.glm.element_buffer();
    this.texture_buffer = this.glm.array_buffer(2);

    TransformStack.call(this, stack_size);
}
WebGLDrawer.inherits_from(TransformStack);

WebGLDrawer.prototype.init_uniforms = function() {
    this.u_resolution = this.shader_program.uniform2fv('u_resolution');
    this.u_colour = this.shader_program.uniform4fv('u_colour');
    this.u_model_view = this.shader_program.uniformMatrix3fv('u_model_view');
    this.u_tex_size = this.shader_program.uniform2fv('u_tex_size');
    this.u_has_texture = this.shader_program.uniform1i('u_has_texture');
}

WebGLDrawer.prototype.use_texture = function(width, height) {
    this.u_has_texture.set(1);
    this.u_tex_size.set([width, height]);
}
WebGLDrawer.prototype.no_texture = function() {
    this.u_has_texture.set(0);
}

WebGLDrawer.prototype.standard_shaders = function(vertex, fragment) {
    this.shader_program = this.glm.shader_program(vertex, fragment).use();
    return this;
}
WebGLDrawer.prototype.update_resolution = function() {
    this.u_resolution.set([this.canvas.width, this.canvas.height]);
}
WebGLDrawer.prototype.sync_buffers = function() {
    this.vertex_buffer.bind().upload();
    this.shader_program.attribute('a_position').set(this.vertex_buffer);

    this.texture_buffer.bind().upload();
    this.shader_program.attribute('a_tex_coord').set(this.texture_buffer);

    this.index_buffer.bind().upload();

}

WebGLDrawer.prototype.clear = function() {
    this.glm.clear();
}

WebGLDrawer.Drawable = function(transform, drawer) {
    if (!drawer) {
        return;
    }
    this.drawer = drawer;

    // halved since each point is represented by 2 values
    this.v_offset = drawer.vertex_buffer.data.length/2;
    this.i_offset = drawer.index_buffer.data.length*2;
    Transformable.call(this, transform);
}
WebGLDrawer.Drawable.inherits_from(Transformable);

WebGLDrawer.Drawable.prototype.before_draw = function() {
    var drawer = this.drawer;
    drawer.save();
    var mv_transform = drawer.mv_transform;
    mat3.multiply(mv_transform, mv_transform, this.mv_transform);
    drawer.u_model_view.set(mv_transform);
    return drawer;
}

WebGLDrawer.Drawable.prototype.after_draw = function() {
    this.drawer.restore();
}

WebGLDrawer.Drawable.prototype.plus_v_offset = function(arr) {
    return arr.map(function(i){return i+this.v_offset}.bind(this));
}

WebGLDrawer.Rect = function(top_left, size, colour, transform, drawer) {
    WebGLDrawer.Drawable.call(this, transform, drawer);
    
    drawer.index_buffer.add(this.plus_v_offset(WebGLDrawer.Rect.indices));

    drawer.vertex_buffer.add([
        top_left[0], top_left[1],
        top_left[0] + size[0], top_left[1],
        top_left[0] + size[0], top_left[1] + size[1],
        top_left[0], top_left[1] + size[1],
    ]);

    drawer.texture_buffer.add([0,0,0,0,0,0,0,0]);

    this.slice = drawer.glm.slice(this.i_offset, 6);

    this.colour = colour;
}
WebGLDrawer.Rect.inherits_from(WebGLDrawer.Drawable);

WebGLDrawer.Rect.indices = [0,1,2,0,2,3];

WebGLDrawer.Rect.prototype.draw = function() {
    var drawer = this.before_draw();

    drawer.u_colour.set(this.colour);
    drawer.no_texture();

    drawer.index_buffer.bind();
    this.slice.draw_triangles();

    this.after_draw();
}

WebGLDrawer.prototype.rect = function(top_left, size, colour, transform) {
    return new WebGLDrawer.Rect(top_left, size, colour, transform, this);
}

WebGLDrawer.Image = function(image, position, size, clip_start, clip_size, transform, drawer) {
    WebGLDrawer.Drawable.call(this, transform, drawer);
    this.image = image;
    this.position = position != undefined ? position : [0, 0];
    this.size = size != undefined ? size : [image.width, image.height];
    this.clip_start = clip_start != undefined ? clip_start : [0, 0];
    this.clip_size = clip_size != undefined ? clip_size : [image.width, image.height];
 
    drawer.index_buffer.add(this.plus_v_offset(WebGLDrawer.Rect.indices));
    
    position = this.position;
    size = this.size;
    drawer.vertex_buffer.add([
        position[0], position[1],
        position[0] + size[0], position[1],
        position[0] + size[0], position[1] + size[1],
        position[0], position[1] + size[1],
    ]);
    
    drawer.texture_buffer.add(WebGLDrawer.Image.texture_coords);

    this.texture = drawer.glm.texture(image);

    this.slice = drawer.glm.slice(this.i_offset, 6);
}
WebGLDrawer.Image.inherits_from(WebGLDrawer.Drawable);
WebGLDrawer.Image.texture_coords = [0,0,1,0,1,1,0,1];

WebGLDrawer.Image.prototype.draw = function() {
    var drawer = this.before_draw();
 
    drawer.use_texture(this.image.width, this.image.height);

    drawer.index_buffer.bind();
    this.slice.draw_triangles();

    this.after_draw();
}
WebGLDrawer.prototype.image = function(image, position, size, clip_start, clip_size, transform) {
    return new WebGLDrawer.Image(image, position, size, clip_start, clip_size, transform, this);
}
