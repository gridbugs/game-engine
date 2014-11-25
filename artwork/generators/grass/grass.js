var drawer;
$(function() {
    
    drawer = new CanvasDrawer(document.getElementById('canvas'));
    
    drawer.canvas.width = 1920;
    drawer.canvas.height = 1080;


    var grass = [];

    Math.seedrandom(1);

    var bg_brown = [125/255, 77/255, 24/255, 1];
    var bg_green = [0, 0.5, 0, 1];

    //drawer.rect([0, 0], [drawer.canvas.width, drawer.canvas.height], bg_green).draw();

    for (var i = 0;i<1000000;i++) {
        var t = mat3.create();
        mat3.translate(t, t, [rand_in_range(0, drawer.canvas.width+20), rand_in_range(0, drawer.canvas.height+20)]);
        mat3.rotate(t, t, rand_centred(Math.PI, Math.PI/12));
        mat3.scale(t, t, [0.3, 0.3]);
        var red = rand_in_range(0, 0.5);
        var green = rand_in_range(0.5, 0.7);
        var blue = rand_in_range(0, 0.2);
        var blade = drawer.rect([0, 0], [rand_in_range(3,10), rand_in_range(30,50)], [red, green, blue, 0.05], t);
        blade.draw();
    }

    var image = drawer.canvas.toDataURL("image/png");


    document.write('<img src="'+image+'"/>');
})

function rand_in_range(lo, hi) {
    return lo + Math.random()*(hi-lo)
}

function rand_centred(centre, variance) {
    return centre - variance + Math.random() * 2 * variance;
}
