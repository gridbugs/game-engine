function SceneGraph(name, image, translate, rotate, scale, before, after) {
    this.name = name;
    this.image = image;

    // relative transformation to parent
    this.translate = d(translate, SV(0, 0));
    this.rotate = d(rotate, SV(0));
    this.scale = d(scale, SV(1, 1));
    
    this.before = d(before, []);
    //console.debug(before);
    console.debug(after);
    this.after = d(after, []);
}

function SG(name, image, translate, scale, rotate, before, after) {
    return new SceneGraph(name, image, translate, scale, rotate, before, after);
}

SceneGraph.prototype.global_transform = function(translate, rotate, scale) {
    translate != undefined && this.translate.set_value(translate);
    scale != undefined && this.scale.set_value(scale);
    rotate != undefined && this.rotate.set_value(rotate);
}

SceneGraph.prototype.draw = function(ctx) {
    ctx.save();
    var t = this.translate.get_value();
    console.debug(this.rotate);
    var r = this.rotate.get_value();
    var s = this.scale.get_value();
    ctx.translate(t[0], t[1]);
    ctx.rotate(r);
    ctx.scale(s[0], s[1]);

    this.before.map(function(b){b.draw(ctx)});
    
    this.image.draw(ctx);

    this.after.map(function(a){a.draw(ctx)});

    ctx.restore();
}
