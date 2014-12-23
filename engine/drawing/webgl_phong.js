WebGLDrawer.PhongMap = function(image, bump_map, light_map, shine_map, drawer) {
    this.image = image;
    this.bump_map = bump_map;
    this.light_map = light_map;
    this.shine_map = shine_map;
    this.image_texture = drawer.glm.texture(this.image);
    this.bump_map_texture = drawer.glm.texture(this.bump_map);
    this.light_map_texture = drawer.glm.texture(this.light_map);
    this.shine_map_texture = drawer.glm.texture(this.shine_map);
}

WebGLDrawer.PhongMap.prototype.bind = function() {
    this.image_texture.bind(drawer.TEXTURE_IDX);
    this.bump_map_texture.bind(drawer.BUMP_MAP_IDX);
    this.light_map_texture.bind(drawer.LIGHT_MAP_IDX);
    this.shine_map_texture.bind(drawer.SHINE_MAP_IDX);
}

WebGLDrawer.prototype.phong_map = function(image, bump_map, light_map, shine_map) {
    return new WebGLDrawer.PhongMap(image, bump_map, light_map, shine_map, this);
}
