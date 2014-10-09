function SceneGraph(name, image, translate, scale, rotate, before, after) {
    this.name = name;
    this.image = image;

    // relative transformation to parent
    this.translate = d(translate, [0, 0]);
    this.scale = d(scale, [1, 1]);
    this.rotate = d(degrees_to_radians(rotate), 0);
    
    this.before = d(before, []);
    //console.debug(before);
    console.debug(after);
    this.after = d(after, []);
}

function SG(name, image, translate, scale, rotate, before, after) {
    return new SceneGraph(name, image, translate, scale, rotate, before, after);
}

SceneGraph.prototype.draw = function(ctx) {
    ctx.save();
    ctx.translate(this.translate[0], this.translate[1]);
    ctx.scale(this.scale[0], this.scale[1]);
    ctx.rotate(this.rotate);

    this.before.map(function(b){b.draw(ctx)});
    
    this.image.draw(ctx);

    this.after.map(function(a){a.draw(ctx)});

    ctx.restore();
}
