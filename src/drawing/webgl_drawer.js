function WebGLDrawer(canvas, stack_size) {
    this.canvas = canvas;
    this.glm = new WebGLManager(canvas).init_2d();

    // initialize buffers
    this.vertex_buffer = this.glm.array_buffer(2);
    this.index_buffer = this.glm.element_buffer();

    TransformStack.call(this, stack_size);
}
WebGLDrawer.inherits_from(TransformStack);

WebGLDrawer.prototype.init_uniforms = function() {
    this.u_resolution = this.shader_program.uniform2fv('u_resolution');
    this.u_colour = this.shader_program.uniform4fv('u_colour');
    this.u_model_view = this.shader_program.uniformMatrix3fv('u_model_view');
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

    this.index_buffer.bind().upload();

}

WebGLDrawer.prototype.clear = function() {
    this.glm.clear();
}

WebGLDrawer.Rect = function(top_left, size, colour, transform, drawer) {
    this.drawer = drawer;
    
    // halved since each point is represented by 2 values
    var v_offset = drawer.vertex_buffer.data.length/2;
    var i_offset = drawer.index_buffer.data.length*2;
    
    drawer.index_buffer.add(
        WebGLDrawer.Rect.indices.map(function(i){return i+v_offset})
    );

    drawer.vertex_buffer.add([
        top_left[0], top_left[1],
        top_left[0] + size[0], top_left[1],
        top_left[0] + size[0], top_left[1] + size[1],
        top_left[0], top_left[1] + size[1],
    ]);

    this.slice = drawer.glm.slice(i_offset, 6);

    this.colour = colour;
    Transformable.call(this, transform);
}
WebGLDrawer.Rect.inherits_from(Transformable);

WebGLDrawer.Rect.indices = [0,1,2,0,2,3];

WebGLDrawer.Rect.prototype.draw = function() {
    var drawer = this.drawer;

    drawer.save();
    var mv_transform = drawer.mv_transform;
    mat3.multiply(mv_transform, mv_transform, this.mv_transform);
    console.debug(mv_transform);
    console.debug(this.mv_transform);
    drawer.u_model_view.set(mv_transform);

    drawer.u_colour.set(this.colour);
    drawer.index_buffer.bind();
    this.slice.draw_triangles();

    drawer.restore();
}

WebGLDrawer.prototype.rect = function(top_left, size, colour, transform) {
    return new WebGLDrawer.Rect(top_left, size, colour, transform, this);
}
