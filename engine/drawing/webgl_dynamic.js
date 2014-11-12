WebGLDrawer.DynamicDrawable = function(size, transform, drawer) {
    if (!drawer) {
        return;
    }
    
    this.drawer = drawer;
    this.v_offset = drawer.dynamic_vertex_buffer.data.length/2;
    this.i_offset = drawer.index_buffer.data.length*2;
    
    Transformable.call(this, transform);
}
WebGLDrawer.DynamicDrawable.inherits_from(WebGLDrawer.Drawable);

WebGLDrawer.DynamicDrawable.prototype.before_draw = function() {

}
