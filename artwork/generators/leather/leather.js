var drawer;
$(function() {
    
    drawer = new CanvasDrawer(document.getElementById('canvas'));
    
    drawer.canvas.width = 640;
    drawer.canvas.height = 480;

    const N_POINTS = 100;
    const PADDING = 500;
    var points = new Array(N_POINTS);

    
    points[0] = [0, 0].v2_add([-parseInt(Math.random()*PADDING), -parseInt(Math.random()*PADDING)]);
    points[1] = [drawer.canvas.width, 0].v2_add([parseInt(Math.random()*PADDING), -parseInt(Math.random()*PADDING)]);
    points[2] = [drawer.canvas.width, drawer.canvas.height].v2_add([parseInt(Math.random()*PADDING), parseInt(Math.random()*PADDING)]);
    points[3] = [0, drawer.canvas.height].v2_add([-parseInt(Math.random()*PADDING), parseInt(Math.random()*PADDING)]);

    for (var i = 4;i<N_POINTS;i++) {
        points[i] = [parseInt(Math.random()*drawer.canvas.width), parseInt(Math.random()*drawer.canvas.height)];
    }

//    points.map(function(p){drawer.draw_point(p, tc('blue'), 4)});


    var segs = triangulate(points);
    segs.map(function(s){drawer.draw_line_segment(s, tc('blue'), 1)});

    var vertices = Vertex.vertices_from_segs(segs);
    console.debug(vertices);
})

function rand_in_range(lo, hi) {
    return lo + Math.random()*(hi-lo)
}

function rand_centred(centre, variance) {
    return centre - variance + Math.random() * 2 * variance;
}
