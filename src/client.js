var game_console;
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
    document.getElementById('info-overlay').appendChild(fps_stats.domElement);
    var ms_stats = new Stats();
    ms_stats.setMode(1);
    ms_stats.domElement.style.position = 'relative';
    document.getElementById('info-overlay').appendChild(ms_stats.domElement);


    Input.set_canvas_offset(parseInt($("#screen").css("left")), parseInt($("#screen").css("top")));
    Input.init();

    var agent = new Agent([200, 200], 0);

    var segs = [[[100, 100], [200, 400]], [[100, 100], [400, 50]], [[400, 50], [600, 50]]];
    agent.set_segs(segs);
    
    var canvas = document.getElementById('screen');
    
    $(document).resize(function() {
        canvas.width = $(window).width();
        canvas.height = $(window).height();
    });

    canvas.width = $(window).width();
    canvas.height = $(window).height();
    var drawer;
    if (window.location.hash == '#canvas') {
        drawer = new CanvasDrawer(canvas);
    } else {
        drawer = new WebGLDrawer(canvas);
    }

    new AsyncGroup(
        new WalkDemo(drawer),
        new FileLoader('shaders/', ['standard_vertex_shader.glsl', 'standard_fragment_shader.glsl'])
    ).run(function(walk_demo, shaders) {
        
        drawer.standard_shaders(shaders[0], shaders[1]);
        drawer.init_uniforms();
        drawer.update_resolution();


        var demo = walk_demo.instance('still');
        var walls = segs.map(function(s){return drawer.line_segment(s[0], s[1], 1)});

        var capture = drawer.capture([0, 0], [canvas.width, canvas.height]);
        var circle = drawer.circle([0, 0], agent.rad, [0,0,0,0.75]);

        drawer.sync_buffers();
        
        agent.facing = -Math.PI/2;
        agent.move_speed = 8;
        var state = 1;
        var fps_box = $("#fps");
        var frame_time_box = $("#frame_time");
        var cpu_time_box = $("#cpu_time");
        var cpu_delta = 0;
        var tm = new TimeManager();
        
        function t() {
            fps_stats.begin();
            ms_stats.begin();
            var start_frame = Date.now();
            
            drawer.clear();

            if (state == 0 && agent.absolute_control_tick()) {
                state = 1;
                demo.update('walk', 100, -100);
            } else if (state == 1 && !agent.absolute_control_tick()) {
                state = 0;
                demo.update('still');
            }
            
            capture.begin();

            drawer.remove_filters();
            drawer.save();
            drawer.translate(agent.pos).rotate(agent.facing+Math.PI/2);
//            circle.draw();
            demo.draw();
            drawer.restore();
            walls.map(function(w){w.draw()});
            capture.end();

            capture.draw();
            
            demo.tick(tm.get_delta());
            
            
            requestAnimationFrame(t);

            var end_frame = Date.now();
            cpu_delta = end_frame - start_frame;
            fps_stats.end();
            ms_stats.end();
        }
        t();

        function fps_t() {
            fps_box.text("FPS: " + Math.floor(tm.last_rate));
            frame_time_box.text("Frame Time (MS): " + Math.floor(1000/tm.last_rate));
            cpu_time_box.text("CPU Time (MS): " + (cpu_delta));
            setTimeout(fps_t, 100);
        }
        fps_t();

    }.arr_args());
});
