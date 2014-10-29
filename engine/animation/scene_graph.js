function SceneGraph(drawer, m, root_idx, before, after) {
    this.sequence_manager = m;
    this.drawer = drawer;
    this.root = new SceneGraph.Node(
        drawer,
        m.g(root_idx+'_i'),
        m.g(root_idx+'_t'),
        m.g(root_idx+'_r'),
        m.g(root_idx+'_s'),
        SceneGraph.parse(drawer, m, before),
        SceneGraph.parse(drawer, m, after)
    );
    this.root.idx = root_idx;
}
SceneGraph.parse = function(drawer, m, arr) {
    var nodes = [];
    var i = 0;
    while (i < arr.length) {
        var element = arr[i];
        var before_nodes = [];
        var after_nodes = [];
        if (element.constructor == String) {
            var before = arr[i+1];
            var after = arr[i+2];
            if (before && before.constructor == Array) {
                before_nodes = SceneGraph.parse(drawer, m, before);
                ++i;
                if (after && after.constructor == Array) {
                    after_nodes = SceneGraph.parse(drawer, m, after);
                    ++i;
                }
            }
            nodes.push(SceneGraph.Node.from_sequence(drawer, m, element, before_nodes, after_nodes));
        } else if (element.constructor == Object) {
            var connect_idx = element.connect_to;
            var connect_img;// = element.with;
            if (element.with_seq) {
                connect_img = m.g(element.with_seq+'_i');
            } else if (element.with_img) {
                connect_img = new ConstantValue(new ImageWrapper(element.with_img));
            }
            var body_part = m.g(connect_idx+'_t').connect(connect_img);
            nodes.push(SceneGraph.Node.from_body_part(drawer, body_part, [], []));
        }

        ++i;
    }

    return nodes;
}

SceneGraph.Node = function(drawer, image, translate, rotate, scale, before, after) {
    this.drawer = drawer;
    this.image = image;
    this.translate = translate;
    this.rotate = rotate;
    this.scale = scale;
    this.before = before;
    this.after = after;
}

SceneGraph.Node.prototype.draw = function() {
    var t = this.translate.get_value();
    var r = this.rotate.get_value();
    var s = this.scale.get_value();

    var drawer = this.drawer;
    drawer.save();

    drawer.translate(t);
    drawer.rotate(r);
    drawer.scale(s);
    
    var before = this.before;
    for (var i = 0,len = before.length;i!=len;++i) {
        before[i].draw();
    }
  
    var i = this.image;
    if (i) {
        i = i.get_value();
        i.draw();
    }

    var after = this.after;
    for (var i = 0,len = after.length;i!=len;++i) {
        after[i].draw();
    }

    drawer.restore();
}

SceneGraph.prototype.draw = function() {
    this.root.draw();
}

SceneGraph.prototype.draw_at = function(translate, rotate, scale) {
    var drawer = this.drawer;
    drawer.save();
    translate && drawer.translate(translate);
    rotate && drawer.rotate(rotate);
    scale && drawer.scale(scale);
    this.root.draw();
    drawer.restore();
}

SceneGraph.Node.from_body_part = function(drawer, b, before, after) {
    return new SceneGraph.Node(
        drawer,
        b.image,
        b.translate,
        b.rotate,
        b.scale,
        before,
        after
    );
}

SceneGraph.Node.from_sequence = function(drawer, m, idx, before, after) {
    var node = new SceneGraph.Node(
        drawer, 
        m.g(idx+'_i'),
        m.g(idx+'_t'),
        m.g(idx+'_r'),
        m.g(idx+'_s'),
        before,
        after
    );
    node.idx = idx;
    return node;
}
