var vis;
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
    var pos = [200, 200];
    agent = new Agent(pos, 0);

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
        
        var v1 = VisibilityContext.from_regions([
            map_demo.region_hash.r1,
            map_demo.region_hash.r2,
            map_demo.region_hash.r4,
            map_demo.region_hash.r5,
            map_demo.region_hash.r6
        ], [
            [[300, 350], [150, 350]]
        ]);

        var v2 = VisibilityContext.from_regions([
            map_demo.region_hash.r2,
            map_demo.region_hash.r3
        ], [
            [[400, 350], [550, 350]]
        ]);

        var visibility_context = v1;

        var vis_det = new DetectorSegment([[350, 400], [350, 550]],
            function(){
                visibility_context = v2;
            },
            function(){
                visibility_context = v1;
            }
        );
        
        var filterer = drawer.filter_pipeline([0, 0], [canvas.width, canvas.height]).set_filters();
        
        circle = drawer.circle([0, 0], agent.rad, [0,0,0,0.5]);

        var radial = drawer.radial([100, 100], [[200, 200], [50, 120], [60, 20], [120, 40], [200, 0]]);

        var dradial = drawer.dynamic_radial([100, 100], [[200, 200], [50, 120], [60, 20], [120, 40]], 512);
        dradial.update([100, 100], [[300, 200], [50, 120], [20, 20], [120, 40]]);

        drawer.sync_buffers();
        
        drawer.save();
        drawer.translate([100, 100]);
        dradial.draw();
        drawer.draw_point([100, 100], tc('black'), 4);

        drawer.restore();

        agent.facing = -Math.PI/2;
        agent.move_speed = 400;
        var state = 1;
        var tm = new TimeManager();
       
        scroll = new ScrollContext([0, 0], 200, [$(window).width(), $(window).height()]);

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

            vis_det.detect(agent.last_move_seg());

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
            //circle.draw();
            demo.draw();
            
            // get the position of the player character on screen
            var centre = drawer.global_centre();
            scroll.update(centre);

            drawer.restore();
            
            // draw the map
            map_demo.draw();

            //vis = agent.region.visibility_context.visible_polygon(agent.pos.v2_floor());
            vis = visibility_context.visible_polygon(agent.pos.v2_floor());
            //vis.polygon_to_segments().map(function(s){drawer.draw_line_segment(s, tc('black'), 2)});
            
            dradial.update(agent.pos, vis);
            dradial.draw();
            //drawer.draw_point(agent.pos, tc('black'), 4);
            
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
