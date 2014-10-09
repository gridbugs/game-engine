function Matrix(){}

Matrix.v2_identity = function() {
    return [[1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]];
}

Matrix.v2_translate = function(vec, a) {
    if (typeof(vec) == 'number') {
        vec = [vec, a];
    }
    return [[1, 0, vec[0]],
            [0, 1, vec[1]],
            [0, 0, 1]];
}

Matrix.v2_rotate = function(rad) {
    return [[Math.cos(rad), -Math.sin(rad), 0],
            [Math.sin(rad), Math.cos(rad), 0],
            [0, 0, 1]];
}

Matrix.v2_scale = function(vec) {
    if (typeof(vec) == 'number') {
        vec = [vec, vec];
    }
    return [[vec[0], 0, 0],
            [0, vec[1], 0],
            [0, 0, 1]];
}

extend(Array, 'v2_tr', function(vec, a) {
    return numeric.dot(this, Matrix.v2_translate(vec, a));
});
extend(Array, 'v2_sc', function(vec) {
    return numeric.dot(this, Matrix.v2_scale(vec));
});
extend(Array, 'v2_ro', function(rad) {
    return numeric.dot(this, Matrix.v2_rotate(rad));
});
extend(Array, 'v2_dro', function(deg) {
    return numeric.dot(this, Matrix.v2_rotate(degrees_to_radians(deg)));
});

extend(Array, 'mmult', function(m) {
    return numeric.dot(this, m);
});

extend(Array, 'apply', function(v) {
    var result = numeric.dot(this, [v[0], v[1], 1]);
    return [result[0], result[1]];
});

extend(Array, 'apply_origin', function() {
    var result = numeric.dot(this, [0, 0, 1]);
    return [result[0], result[1]];
});

extend(Array, 'set_canvas_transform', function(ctx) {
    ctx.setTransform(this[0][0], this[1][0], this[0][1], this[1][1], this[0][2], this[1][2]);
});


