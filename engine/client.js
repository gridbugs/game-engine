var drawer;
var game_console;
var agent;
$(function() {
    game_console = new Console(
        document.getElementById("console-input"),
        document.getElementById("console-output"),
        new Echoer()
    );
    game_console.setup_keys();
    $("#console-container").hide();
    $("#info-overlay").hide();

    var fps_stats = new Stats();
    fps_stats.setMode(0);
    fps_stats.domElement.style.position = 'relative';
    fps_stats.domElement.style.float = 'left';
    document.getElementById('info-overlay').appendChild(fps_stats.domElement);
    var ms_stats = new Stats();
    ms_stats.setMode(1);
    ms_stats.domElement.style.position = 'relative';
    document.getElementById('info-overlay').appendChild(ms_stats.domElement);


    Input.set_canvas_offset(parseInt($("#screen").css("left")), parseInt($("#screen").css("top")));
    Input.init();

    agent = new Agent([200, 200], 0);

    //var room1 = [[100, 100], [100, 300], [300, 300], [300, 100]];
    //var room2 = [[300, 100], [300, 300], [600, 300], [600, 100]];

    //console.debug(room1.polygon_to_segments().concat(room2.polygon_to_segments()));

    var segs = [[[100, 100], [500, 0]], [[100, 100], [100, 500]]];
    agent.set_segs(segs);
    
    var canvas = document.getElementById('screen');
    
    $(document).resize(function() {
        canvas.width = $(window).width();
        canvas.height = $(window).height();
    });

    canvas.width = $(window).width();
    canvas.height = $(window).height();
    if (window.location.hash == '#canvas') {
        drawer = new CanvasDrawer(canvas);
    } else {
        drawer = new WebGLDrawer(canvas);
    }

    var walk_demo = new WalkDemo().set_drawer(drawer);
    Content.load();
    Content.set_drawer(drawer);

    new AsyncGroup(
        new FileLoader('shaders/', ['standard_vertex_shader.glsl', 'standard_fragment_shader.glsl']),
        Content
    ).run(function(shaders) {
        
        drawer.standard_shaders(shaders[0], shaders[1]);
        drawer.init_uniforms();
        drawer.update_resolution();

        var demo = Content.characters.walk_demo.instance('still');

        var walls = segs.map(function(s){return drawer.line_segment(s[0], s[1], 1)});

        var filterer = drawer.filter_pipeline([0, 0], [canvas.width, canvas.height]).set_filters();

        var circle = drawer.circle([0, 0], agent.rad, [0,0,0,0.5]);

        drawer.sync_buffers();
        
        agent.facing = -Math.PI/2;
        agent.move_speed = 400;
        var state = 1;
        var tm = new TimeManager();
            
        
        function t() {
            fps_stats.begin();
            ms_stats.begin();
            
            var time_delta = tm.get_delta();
            drawer.clear();

            if (state == 0 && agent.absolute_control_tick(time_delta)) {
                state = 1;
                demo.update('walk', 100, -100);
            } else if (state == 1 && !agent.absolute_control_tick(time_delta)) {
                state = 0;
                demo.update('still');
            }
     
            filterer.begin();

            drawer.remove_filters();
            drawer.save();
            drawer.translate(agent.pos).rotate(agent.facing+Math.PI/2);
            circle.draw();
            demo.draw();
            drawer.restore();
            walls.map(function(w){w.draw()});
            
            filterer.draw();

            drawer.draw_point([20, 30], tinycolor('blue').toGL(), 10);
            drawer.draw_point([40, 30], tinycolor('pink').toGL(), 10);
            drawer.draw_line_segment([[10, 50], [100, 100]], tinycolor('red').toGL(), 4);
            drawer.draw_line_segment([[50, 50], [10, 100]], tinycolor('green').toGL(), 4);
            
            drawer.sync_gpu();
            
            demo.tick(time_delta);
            
            requestAnimationFrame(t);

            fps_stats.end();
            ms_stats.end();
        }
        t();

    }.arr_args());
});
