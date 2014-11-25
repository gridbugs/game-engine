var drawer;
$(function() {
 
    new ImageLoader('/artwork/images/', ['leaf00.png', 'leaf01.png', 'leaf02.png']).run(
    function(leaf00_img, leaf01_img, leaf02_img) {
        
        drawer = new CanvasDrawer(document.getElementById('canvas'));
        
        drawer.canvas.width = 640;//$(window).width();
        drawer.canvas.height = 480;//$(window).height();

        Math.seedrandom(1);

        var bg_brown = [125/255, 77/255, 24/255, 1];
        var bg_green = [0, 0.5, 0, 1];

        
        var leaf00 = drawer.image(leaf00_img, [-30, 0], [64, 64]);
        var leaf01 = drawer.image(leaf01_img, [-30, 0], [64, 64]);
        var leaf02 = drawer.image(leaf02_img, [-29, 0], [64, 64]);
        
        var treebranches00 = drawer.image(treebranches00_img);


        var leaves = [
            leaf00, 
            leaf01, 
            leaf02
        ];

        for (var i = 0;i<100000;i++) {
            drawer.save();

            drawer.translate([rand_in_range(0, drawer.canvas.width+20), rand_in_range(0, drawer.canvas.height+20)]);
            drawer.rotate(rand_centred(-Math.PI, Math.PI));
            drawer.scale([rand_in_range(0.05, 0.3), rand_in_range(0.05, 0.3)]);
            
            var leaf = leaves[parseInt(rand_in_range(0, 3))];
            leaf.draw();

            drawer.restore();
        }
        
        var image = drawer.canvas.toDataURL("image/png");


        document.write('<img src="'+image+'"/>');
    }.arr_args());
})

function rand_in_range(lo, hi) {
    return lo + Math.random()*(hi-lo)
}

function rand_centred(centre, variance) {
    return centre - variance + Math.random() * 2 * variance;
}
