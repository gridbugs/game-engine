/*
 * A fan of triangles with a central point forming a polygon.
 * It is initialized with a centre and list of outer points, as
 * well as a size specifying the maximum number of outer points.
 */
WebGLDrawer.DynamicRadial = function(centre, points, size, transform, drawer) {
    if (!drawer) {
        return;
    }
    
    this.drawer = drawer;

    this.offset = drawer.dynamic_vertex_buffer.data.length;

    this.v_offset = this.offset/2;
    this.i_offset = drawer.index_buffer.data.length*2;
 
    drawer.dynamic_vertex_buffer.allocate(size);

    var indices = [];
    for (var i = 0;i<size;i++) {
        indices.push(0);
        indices.push(i+1);
        indices.push(i+2);
    }

    drawer.index_buffer.add(indices.map(function(i){return i + this.v_offset}.bind(this)));
    
    this.slice = drawer.glm.slice(this.i_offset, 0);
    
    this.update(centre, points);

    Transformable.call(this, transform);
}
WebGLDrawer.DynamicRadial.inherits_from(WebGLDrawer.Drawable);

WebGLDrawer.prototype.dynamic_radial = function(centre, points, size, transform) {
    return new WebGLDrawer.DynamicRadial(centre, points, size, transform, this);
}

WebGLDrawer.DynamicRadial.prototype.update = function(centre, points) {
    var drawer = this.drawer;
    drawer.select_attribute(drawer.vertex_position_attribute, drawer.dynamic_vertex_buffer);
    
    var vertices = [centre[0], centre[1]];
    for (var i = 0;i<points.length;i++) {
        vertices.push(points[i][0]);
        vertices.push(points[i][1]);
    }
    vertices.push(points[0][0]);
    vertices.push(points[0][1]);

    var buffer = drawer.dynamic_vertex_buffer;
    
    buffer.update(this.offset, vertices);
    
    this.slice.set_length(points.length*3);
    drawer.select_attribute(drawer.vertex_position_attribute, drawer.vertex_buffer);
}

WebGLDrawer.DynamicRadial.prototype.draw = function() {
    var drawer = this.before_draw();
    drawer.select_attribute(drawer.vertex_position_attribute, drawer.dynamic_vertex_buffer);

    drawer.u_colour.set([0,0,0,0.3]);
    drawer.no_texture();

    this.slice.draw_triangles();

    drawer.select_attribute(drawer.vertex_position_attribute, drawer.vertex_buffer);

    this.after_draw();
}
