var scroll;
var circle;
var t;
var drawer;
var game_console;
var agent;
var cu;

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

    var canvas = document.getElementById('screen');
    
    $(document).resize(function() {
        canvas.width = $(window).width();
        canvas.height = $(window).height();
    });

    canvas.width = $(window).width();
    canvas.height = $(window).height();
    if (window.location.hash == '#canvas') {
        drawer = new CanvasDrawer(canvas);
        cu = new CanvasUtil(canvas);
    } else {
        drawer = new WebGLDrawer(canvas);
    }

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
    
        var map_demo = Content.maps.map_demo;
        agent.enter_region(map_demo.region_hash.r1);
        
        
        var filterer = drawer.filter_pipeline([0, 0], [canvas.width, canvas.height]).set_filters();
        
        circle = drawer.circle([0, 0], agent.rad, [0,0,0,0.5]);

        drawer.sync_buffers();
        
        agent.facing = -Math.PI/2;
        agent.move_speed = 400;
        var state = 1;
        var tm = new TimeManager();
       
        scroll = new ScrollContext([0, 0], 0, [$(window).width(), $(window).height()]);

        t = function() {
            fps_stats.begin();
            ms_stats.begin();
            
            var time_delta = tm.get_delta();

            if (state == 0 && agent.absolute_control_tick(time_delta)) {
                state = 1;
                demo.update('walk', 100, -100);
            } else if (state == 1 && !agent.absolute_control_tick(time_delta)) {
                state = 0;
                demo.update('still');
                agent.stop();
            }
     
            // switch current region if necessary
            agent.border_detect();

            // show/hide regions if necessary
            agent.display_detect();

            // reset the drawer
            drawer.clear();
            drawer.remove_filters();
            
            // set up gl to draw to a framebuffer
            filterer.begin();
 
            // apply global translation (for scrolling)
            drawer.save();
            drawer.translate(scroll.translate);
            //drawer.translate([-100, 0]);
           
            // apply local transformation (for moving the character)
            drawer.save();
            drawer.translate(agent.pos).rotate(agent.facing+Math.PI/2);
 
            // draw the character
            circle.draw();
            //demo.draw();
            drawer.draw_point([0, 0], tc('black'), 4);
            
            // get the position of the player character on screen
            var centre = drawer.global_centre();
            scroll.update(centre);

            drawer.restore();
            
            // draw the map
            map_demo.draw();

            agent.region.visibility_context.visible_polygon(agent.pos);

            drawer.restore();

            // draw the buffered session with any filters applied
            filterer.draw();

            // sync the cpu for smooth animation
            drawer.sync_gpu();
            
            // progress the time
            demo.tick(time_delta);
            
            // repeat on the next frame
            requestAnimationFrame(t);

            // record some stats
            fps_stats.end();
            ms_stats.end();
        }
        t();

    }.arr_args());
});
