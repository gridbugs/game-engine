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



    TransformStack.call(this, stack_size);
}

// add a vertex at 0, 0 to use when drawing points
WebGLVertexManager.prototype.init_presets = function() {
    this.vertex_buffer.add([0,0]);
    this.texture_buffer.add([0,0]);
    this.index_buffer.add([0]);

    this.point_slice = this.glm.slice(0, 1);
}

WebGLVertexManager.Drawable = function(transform, vertex_manager) {
    if (!drawer) {return}

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
    var v_offset = this.vertex_index_base();
    this.vertex_manager.index_buffer.add(
        idxs.map(function(i){return i + v_offset})
    );

    var i_offset = this.index_index_offset()
    this.slice = this.vertex_manager.glm.slice(
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
    this.vertex_manager.vertex_buffer.add(vs);
}

