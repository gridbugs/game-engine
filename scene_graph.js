function SceneGraph(name, image, translate, scale, rotate, before, after) {
    this.name = name;
    this.image = image;

    // relative transformation to parent
    this.translate = d(translate, CV(0, 0));
    this.rotate = d(rotate, CS(0));
    this.scale = d(scale, CV(1, 1));
    
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
