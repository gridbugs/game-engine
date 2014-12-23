function Level(drawer, regions, visible_segs, floor) {
    this.drawer = drawer;
    this.regions = regions;
    this.visibility_context = VisibilityContext.from_segs(
        visible_segs,
        []
    );
    this.lights = [];

    this.floor = drawer.sliding_window(floor, [0, 0], [canvas.width, canvas.height], [0, 0]);
    this.floor = drawer.phong_illuminated_sliding_window(floor, [0, 0], [canvas.width, canvas.height], [0, 0]);
}

Level.prototype.add_light = function(position, radius, colour) {
    var light = this.drawer.light(this.visibility_context, position, radius, colour);
    this.lights.push(light);
}

Level.prototype.update_lights = function() {
    this.lights.map(function(l){l.update()});
}

Level.prototype.draw_floor = function() {
    this.floor.draw();
}
Level.prototype.draw_floor_flat = function(level) {
    this.floor.draw_flat(level);
}
