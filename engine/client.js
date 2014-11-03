var circle;
var t;
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

    agent = new Agent([384, 444], 0);

    var room1 = new Region([
        [[100, 100], [100, 300]],
        [[100, 300], [400, 300]],
        [[550, 300], [600, 300]],
        [[600, 300], [600, 250]],
        [[600, 150], [600, 100]],
        [[600, 100], [100, 100]]
    ]);
    var room2 = new Region([
        [[400, 300], [400, 350]],
        [[400, 350], [350, 400]],
        [[350, 400], [300, 350]],
        [[550, 300], [550, 350]],
        [[550, 350], [350, 550]],
        [[350, 550], [150, 350]],
        
    ]);
    var room3 = new Region([
        [[150, 350], [150, 50]],
        [[300, 350], [300, 250]],
        [[150, 50], [500, 50]],
        [[500, 50], [500, 250]],
        [[500, 250], [300, 250]]
    ]);
    
    var room4 = new Region([
        [[600, 150], [600, 50]],
        [[600, 50], [1200, 50]],
        [[1200, 50], [1200, 400]],
        [[1200, 400], [1600, 400]],
        [[1600, 400], [1600, 600]],
        [[1600, 600], [800, 600]],
        [[700, 600], [600, 600]],
        [[600, 600], [600, 250]]
    ]);

    var room5 = new Region([
        [[700, 600], [700, 750]],
        [[800, 600], [800, 750]]
    ]);

    var room6 = new Region([
        [[700, 750], [400, 750]],
        [[400, 750], [400, 1000]],
        [[400, 1000], [1000, 1000]],
        [[1000, 1000], [1000, 750]],
        [[1000, 750], [800, 750]]
    ]);

    room2.connect(room1, [[400, 300], [550, 300]]);
    room2.connect(room3, [[150, 350], [300, 350]]);
    room4.connect(room1, [[600, 250], [600, 150]]);
    room5.connect(room4, [[700, 600], [800, 600]]);
    room6.connect(room5, [[700, 750], [800, 750]]);

    room1.create_collision_processor(agent.rad);
    room2.create_collision_processor(agent.rad);
    room3.create_collision_processor(agent.rad);
    room4.create_collision_processor(agent.rad);
    room5.create_collision_processor(agent.rad);
    room6.create_collision_processor(agent.rad);

    agent.enter_region(room2);
    
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
    ).run(function(shaders, images) {
        
        drawer.standard_shaders(shaders[0], shaders[1]);
        drawer.init_uniforms();
        drawer.update_resolution();
        
        drawer.sync_buffers();

        var demo = Content.characters.walk_demo.instance('still');
        
        var walls1 = drawer.group(room1.segs.map(function(s){return drawer.line_segment(s[0], s[1], 1)}));
        var walls2 = drawer.group(room2.segs.map(function(s){return drawer.line_segment(s[0], s[1], 1)}));
        var walls3 = drawer.group(room3.segs.map(function(s){return drawer.line_segment(s[0], s[1], 1)})).hide();
        var walls4 = drawer.group(room4.segs.map(function(s){return drawer.line_segment(s[0], s[1], 1)}));
        var walls5 = drawer.group(room5.segs.map(function(s){return drawer.line_segment(s[0], s[1], 1)}));
        var walls6 = drawer.group(room6.segs.map(function(s){return drawer.line_segment(s[0], s[1], 1)})).hide();

        room2.add_display_detector(walls3, [walls1, walls4, walls5], [[350, 400], [350, 550]]);
        room5.add_display_detector(walls6, [walls1, walls4, walls2], [[700, 675], [800, 675]]);

        var filterer = drawer.filter_pipeline([0, 0], [canvas.width, canvas.height]).set_filters();
        
        circle = drawer.circle([0, 0], agent.rad, [0,0,0,0.5]);

        drawer.sync_buffers();
        
        agent.facing = -Math.PI/2;
        agent.move_speed = 400;
        var state = 1;
        var tm = new TimeManager();
       
        t = function() {
            fps_stats.begin();
            ms_stats.begin();
            
            var time_delta = tm.get_delta();
            drawer.clear();
            
            filterer.begin();
            drawer.remove_filters();

            if (state == 0 && agent.absolute_control_tick(time_delta)) {
                state = 1;
                demo.update('walk', 100, -100);
            } else if (state == 1 && !agent.absolute_control_tick(time_delta)) {
                state = 0;
                demo.update('still');
                agent.stop();
            }
     

            drawer.save();
            drawer.translate(agent.pos).rotate(agent.facing+Math.PI/2);
            
            circle.draw();
            drawer.draw_point(agent.pos, tc('black'), 4);
            
            if (!agent.last_pos.v2_equals(agent.pos)) {
                console.debug(agent.last_move_seg().toString());
            }
            
            agent.border_detect();
            agent.display_detect();


            //demo.draw();
            drawer.restore();
            walls1.draw();
            walls2.draw();
            walls3.draw();
            walls4.draw();
            walls5.draw();
            walls6.draw();
            
            filterer.draw();
            
            
            drawer.save();
            drawer.scale([5,5]);
            drawer.restore();

            drawer.sync_gpu();
            
            demo.tick(time_delta);
            
            requestAnimationFrame(t);

            fps_stats.end();
            ms_stats.end();
        }
        t();

    }.arr_args());
});
