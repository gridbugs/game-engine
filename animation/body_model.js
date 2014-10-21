function BodyPart(image, translate, rotate, scale) {
    this.image = image;
    this.translate = translate || CV(0, 0);
    this.rotate = rotate || CS(0);
    this.scale = scale || CV(1, 1);
}

BodyPart.prototype.i = function() {return this.image}
BodyPart.prototype.t = function() {return this.translate}
BodyPart.prototype.r = function() {return this.rotate}
BodyPart.prototype.s = function() {return this.scale}

BodyPart.prototype.flip_x = function() {
    return new BodyPart(
        this.image,
        this.translate.flip_x(),
        this.rotate.flip_x(),
        this.scale.flip_x()
    );
}

BodyPart.prototype.clone_with_offset = function(offset) {
    return new BodyPart(
        this.image,
        this.translate.clone_with_offset(offset),
        this.rotate.clone_with_offset(offset),
        this.scale.clone_with_offset(offset)
    );
}

BodyPart.prototype.connect = function(image) {
    return new BodyPart(
        image,
        CV(0, 0),
        new RotateReference(this.translate),
        new ScaleReference(this.translate, image.get_value().size[1])
    );
}


BodyPart.prototype.to_seq = function(name) {
    var o = {};
    o[name+'_i'] = this.i();
    o[name+'_t'] = this.t();
    o[name+'_r'] = this.r();
    o[name+'_s'] = this.s();

    return o;
}

function HumanoidModel() {
    this.args = [
        'left_foot',
        'right_foot', 
        'head', 
        'left_knee', 
        'right_knee', 
        'left_hip', 
        'right_hip', 
        'left_shoulder',
        'right_shoulder',
        'left_elbow',
        'right_elbow',
        'left_hand',
        'right_hand',
    ];

    for (var i = 0;i<this.args.length;i++) {
        this[this.args[i]] = arguments[i];
    }
}

HumanoidModel.prototype.part_seq = function(name) {
    return this[name].to_seq(name);
}
HumanoidModel.prototype.part_seqs = function() {
    var objs = [];
    for (var i = 0;i<arguments.length;i++) {
        objs.push(this.part_seq(arguments[i]));
    }
    return objs_merge.apply(window, objs);
}

HumanoidModel.prototype.to_seq = function() {
    return HumanoidModel.prototype.part_seqs.apply(this, this.args);
}
