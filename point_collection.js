function PointCollection() {
}

extend(PointCollection, 'clone', function() {
    var ret = new PointCollection();
    for (var i in this) {
        ret[i] = this[i];
    }
    return ret;
});

extend(PointCollection, 'rotate', function(rads) {
    var ret = new PointCollection();
    for (var i in this) {
        ret[i] = this[i].v2_rotate(rads);
    }
    return ret;
});

extend(PointCollection, 'scale', function(amount) {
    var ret = new PointCollection();
    for (var i in this) {
        ret[i] = this[i].v2_smult(amount);
    }
    return ret;
});

extend(PointCollection, 'translate', function(pt) {
    var ret = new PointCollection();
    for (var i in this) {
        ret[i] = this[i].v2_add(pt);
    }
    return ret;
});

extend(PointCollection, 'humanoid_draw_circles', function(cu, size) {
    size = d(size, 5);

    cu.draw_circle([this.left_foot, size], 'blue');
    cu.draw_circle([this.left_knee, size], 'red');
    cu.draw_circle([this.left_hip, size], 'green');
    cu.draw_circle([this.left_shoulder, size], 'cyan');
    cu.draw_circle([this.left_elbow, size], 'orange');
    cu.draw_circle([this.left_hand, size], 'yellow');
    
    cu.draw_circle([this.right_foot, size], 'blue');
    cu.draw_circle([this.right_knee, size], 'red');
    cu.draw_circle([this.right_hip, size], 'green');
    cu.draw_circle([this.right_shoulder, size], 'cyan');
    cu.draw_circle([this.right_elbow, size], 'orange');
    cu.draw_circle([this.right_hand, size], 'yellow');
});
