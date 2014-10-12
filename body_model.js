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
        this.translate.map(function(vw) {
            var v = vw.val();
            return new AngleWrapper(Math.PI/2-[v[0], -v[1]].v2_angle());
        }),
        this.translate.map(function(vw) {
            var v = vw.val();
            return new VectorWrapper([1, v.v2_len()/image.get_value().size[1]]);
        })

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
        'left_upper_leg', 
        'right_upper_leg', 
        'left_knee', 
        'right_knee', 
        'left_hip', 
        'right_hip', 
        'left_lower_leg', 
        'right_lower_leg',
        'left_shoulder',
        'right_shoulder',
        'left_elbow',
        'right_elbow',
        'left_hand',
        'right_hand',
        'left_upper_arm',
        'right_upper_arm',
        'left_lower_arm',
        'right_lower_arm'
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
