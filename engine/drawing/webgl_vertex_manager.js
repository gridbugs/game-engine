function WebGLVertexManager(glm, stack_size) {
    this.glm = glm;
    
    // initialize static buffers
    this.vertex_buffer = this.glm.array_buffer(2);
    this.index_buffer = this.glm.element_buffer();
    this.texture_buffer = this.glm.array_buffer(2);

    // initialize dynamic buffers and allocate memory
    this.dynamic_vertex_buffer = this.glm.array_buffer(2).bind().allocate_dynamic(8192);
    this.dynamic_texture_buffer = this.glm.array_buffer(2).bind().allocate_dynamic(8192);
    this.dynamic_index_buffer = this.glm.element_buffer();

    // allocate memory for line segment
    var line_segment_offset = 4;
    this.dynamic_vertex_buffer.allocate(line_segment_offset);
    this.dynamic_texture_buffer.allocate(line_segment_offset);

    // small buffer used for syncing gpu
    this.pixels = new Uint8Array(4);

    TransformStack.call(this, stack_size);
}
WebGLVertexManager.inherits_from(TransformStack);

// add a vertex at 0, 0 to use when drawing points
WebGLVertexManager.prototype.init_presets = function() {
    this.vertex_buffer.add([0,0]);
    this.texture_buffer.add([0,0]);
    this.index_buffer.add([0]);

    this.point_slice = this.glm.slice(0, 1);
}

/*
 * Sync the cpu to the gpu
 */
WebGLVertexManager.prototype.sync_gpu = function() {
    /* read one pixel value from the screen into an array,
     * forcing the cpu to wait until the gpu has drawn the
     * image before proceeding
     */
    var gl = this.glm.gl;
    gl.readPixels( 0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pixels);
}

WebGLVertexManager.prototype.sync_buffers = function() {
    this.vertex_buffer.bind().upload_static();
    this.texture_buffer.bind().upload_static();
    this.index_buffer.bind().upload_static();
}

WebGLVertexManager.prototype.enable_vertex_attribute = function(attr) {
    attr.set(this.vertex_buffer.bind());
}
WebGLVertexManager.prototype.enable_texture_attribute = function(attr) {
    attr.set(this.texture_buffer.bind());
}

WebGLVertexManager.Drawable = function(transform, vertex_manager) {
    // this line allows this class to be instantiated as a prototype
    if (!vertex_manager) {return}

    this.vertex_manager = vertex_manager;

    Transformable.call(this, transform);
}
WebGLVertexManager.Drawable.inherits_from(Transformable);


/* 
 * returns the index of the first vertex of this drawable
 * suitable for insertion into the index buffer
 */
WebGLVertexManager.Drawable.prototype.vertex_index_base = function() {
    /* halved since in the index buffer, each index refers to
     * a pair of numbers (which form one vertex)
     */
    return this.vertex_manager.vertex_buffer.data.length/2;
}

/*
 * returns the index of the first index of this drawable
 * in the index buffer. Suitable for finding the index argument
 * to draw_triangles
 */
WebGLVertexManager.Drawable.prototype.index_index_base = function() {
    /* doubled as this is a byte address, and each index
     * is represented with 2 bytes
     */
    return this.vertex_manager.index_buffer.data.length*2;
}

/*
 * Inserts values into the index buffer, first adding the
 * vertex index base.
 */
WebGLVertexManager.Drawable.prototype.insert_indices = function(idxs) {
    var i_offset = this.index_index_base();
    
    idxs = Array.array_or_arguments(idxs, arguments);
    var v_offset = this.vertex_index_base();
    this.vertex_manager.index_buffer.add(
        idxs.map(function(i){return i + v_offset})
    );

    this.slice = this.vertex_manager.glm.slice(i_offset, idxs.length);
}


/*
 * Inserts an array of numbers into the vertex buffer
 */
WebGLVertexManager.Drawable.prototype.insert_vertices = function(vs) {
    vs = Array.array_or_arguments(vs, arguments);
    this.vertex_manager.vertex_buffer.add(vs);
}

/*
 * Inserts an array of numbers into the texture coord buffer
 */
WebGLVertexManager.Drawable.prototype.insert_texture_coords = function(vs) {
    vs = Array.array_or_arguments(vs, arguments);
    this.vertex_manager.texture_buffer.add(vs);
}

/* Draws applying the static local transform first. */
WebGLVertexManager.Drawable.prototype.draw_with_static_transform = function(u_model_view) {
    var vtxmgr = this.vertex_manager;
    
    vtxmgr.save();
    
    var base_mv_transform = vtxmgr.mv_transform;
    mat3.multiply(base_mv_transform, base_mv_transform, this.mv_transform);
    u_model_view.set(base_mv_transform);
    
    vtxmgr.index_buffer.bind();
    
    this.slice.draw_triangles();

    vtxmgr.restore();
}

/* Draws ignoring the static local transform,
 * saving some computation. Use this when the local
 * transform is the identity.
 */
WebGLVertexManager.Drawable.prototype.draw_without_static_transform = function() {
    this.vertex_manager.index_buffer.bind();
    this.slice.draw_triangles();
}

WebGLVertexManager.prototype.rectangle = function(position, size, transform) {
    return new WebGLVertexManager.Rectangle(position, size, transform, this);
}
WebGLVertexManager.Rectangle = function(position, size, transform, vertex_manager) {
    WebGLVertexManager.Drawable.call(this, transform, vertex_manager);
    
    this.insert_rectangle_indices();
    this.insert_rectangle_vertices(position, size);
    this.insert_rectangle_texture_coords();
}
WebGLVertexManager.Rectangle.inherits_from(WebGLVertexManager.Drawable);

WebGLVertexManager.Rectangle.prototype.insert_rectangle_vertices = function(position, size) {
    this.insert_vertices(
        position[0], position[1],
        position[0] + size[0], position[1],
        position[0] + size[0], position[1] + size[1],
        position[0], position[1] + size[1]
    );
}

WebGLVertexManager.Rectangle.prototype.insert_rectangle_indices = function() {
    this.insert_indices(0, 1, 2, 0, 2, 3);
}

WebGLVertexManager.Rectangle.prototype.insert_rectangle_texture_coords = function() {
    this.insert_texture_coords(0, 0, 1, 0, 1, 1, 0, 1);
}
