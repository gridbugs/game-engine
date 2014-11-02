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

    agent = new Agent([200, 200], 0);

    var room1 = new Region([
        [[100, 100], [100, 300]],
        [[100, 300], [400, 300]],
        [[550, 300], [600, 300]],
        [[600, 300], [600, 100]],
        [[600, 100], [100, 100]]
    ]);
    var room2 = new Region([
        [[400, 300], [400, 350]],
        [[400, 350], [350, 400]],
        [[350, 400], [300, 350]],
        [[550, 300], [550, 350]],
        [[550, 350], [350, 550]],
        [[350, 550], [150, 350]]
    ]);
    var room3 = new Region([
        [[150, 350], [150, 50]],
        [[300, 350], [300, 250]],
        [[150, 50], [500, 50]],
        [[500, 50], [500, 250]],
        [[500, 250], [300, 250]]
    ]);
    
    var detector1 = new DetectorSegment([[400, 300], [550, 300]], 
        function() {
            agent.enter_region(room2);
        }, 
        function() {
            agent.enter_region(room1);
        }
    );

    var detector2 = new DetectorSegment([[150, 350], [300, 350]],
        function() {
            agent.enter_region(room2);
        }, 
        function() {
            agent.enter_region(room3);
        }
    );


 
    //console.debug(room1.polygon_to_segments().concat(room2.polygon_to_segments()));

    agent.enter_region(room1);
    
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

        var walls = room1.segs.concat(room2.segs).concat(room3.segs).map(function(s){return drawer.line_segment(s[0], s[1], 1)});

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
            
            circle.outline();
            drawer.draw_point(agent.pos, tc('black'), 4);
            detector1.draw(drawer);
            detector2.draw(drawer);
            detector1.detect(agent.last_move_seg());
            detector2.detect(agent.last_move_seg());
            
            demo.draw();
            drawer.restore();
            walls.map(function(w){w.draw()});
            
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
