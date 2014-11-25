var drawer;
$(function() {
    
    drawer = new CanvasDrawer(document.getElementById('canvas'));
    
    drawer.canvas.width = 640;
    drawer.canvas.height = 480;

//    Math.seedrandom(0);

    var centre = [drawer.canvas.width/2, drawer.canvas.height/2];

    for (var i = 0;i<400000;i++) {
        var t = mat3.create();
        //console.debug(centre);
        mat3.translate(t, t, centre);
        mat3.rotate(t, t, rand_centred(-Math.PI, Math.PI));
        mat3.translate(t, t, [rand_in_range(-10, 400), rand_in_range(-20, 20)]);
        mat3.scale(t, t, [0.3, 0.3]);
        var red = rand_in_range(0.3, 0.4);
        var green = red - rand_in_range(0.1, 0.2);
        var blue = rand_in_range(0, 0.1);
        var line = drawer.rect([0, 0], [rand_in_range(30, 80), rand_in_range(5, 10)], [red, green, blue, 0.5], t);
        line.draw();
    }
/*
    var image = drawer.canvas.toDataURL("image/png");


    document.write('<img src="'+image+'"/>');
    */
})

function rand_in_range(lo, hi) {
    return lo + Math.random()*(hi-lo)
}

function rand_centred(centre, variance) {
    return centre - variance + Math.random() * 2 * variance;
}
