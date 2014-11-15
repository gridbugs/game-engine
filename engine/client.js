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
    pos = [720.799999999999, 200];
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
        Content,
        new ImageLoader('images/earth.jpg')
    ).run(function(shaders, images, test_images) {
        
        var test_texture;
        if (test_images) {
            test_texture = drawer.glm.texture(test_images[0]);
        }

        drawer.standard_shaders(shaders[0], shaders[1]);
        drawer.init_uniforms();
        drawer.update_resolution();
        
        drawer.sync_buffers();

        var demo = Content.characters.walk_demo.instance('still');

        var map_demo = Content.maps.map_demo;
        agent.enter_region(map_demo.region_hash.r4);
        
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
        var capture = drawer.capture([0, 0], [canvas.width, canvas.height]);
        var capture2 = drawer.capture([0, 0], [canvas.width, canvas.height]);
        var capture3 = drawer.capture([0, 0], [canvas.width, canvas.height]);
        circle = drawer.circle([0, 0], agent.rad, [0,0,0,0.5]);

        var radial = drawer.radial([100, 100], [[200, 200], [50, 120], [60, 20], [120, 40], [200, 0]]);

        var dradial = drawer.dynamic_radial([100, 100], [], 128, canvas.width, canvas.height);

        
        agent.facing = -Math.PI/2;
        agent.move_speed = 400;
        var state = 1;
        var tm = new TimeManager();
       
        scroll = new ScrollContext([0, 0], 200, [$(window).width(), $(window).height()]);

        var l1 = drawer.light(v1, [1000, 100], 800, [1,1,1,1]);
        var l2 = drawer.light(v1, [1500, 500], 1500, [1,0.9,0.5,1]);
        var l3 = drawer.light(v2, [400, 110], 500, [1,0.5,0.5,1]);
        var l4 = drawer.light(150, [0.6,0.6,1,1]);

        drawer.sync_buffers();

        t = function() {
            fps_stats.begin();
            ms_stats.begin();
            
            var time_delta = tm.get_delta();
            
            var original_position = agent.pos.slice();

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
            drawer.glm.set_clear_colour([0,0,0,1]);
            drawer.clear();
            drawer.glm.set_clear_colour([1,1,1,1]);
            drawer.remove_filters();
            
            // set up gl to draw to a framebuffer
            capture.begin();
 
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
            
            // back to the scroll transformation
            drawer.restore();
            
            // draw the map line segments
            map_demo.draw();

            //vis = agent.region.visibility_context.visible_polygon(agent.pos.v2_floor());
            //vis.polygon_to_segments().map(function(s){drawer.draw_line_segment(s, tc('black'), 2)});
            
            // remove all transformations
            drawer.restore();
            
            // capture contains all the line segments and the character
            capture.end();

            // draw the line segments and character
            drawer.u_opacity.set(0.2);
            capture.draw();
            drawer.u_opacity.set(1);
            
            drawer.glm.set_clear_colour([0,0,0,0]);
            // fill a buffer with all the lit areas
            capture2.begin();
            drawer.u_opacity.set(0.4);
            capture.draw();
            drawer.u_opacity.set(1);
            
            // translate back to the scroll position
            drawer.save();
            drawer.translate(scroll.translate);
            
            vis = visibility_context.visible_polygon(agent.pos.v2_floor());
            dradial.update(agent.pos, vis);


            // draw lit areas to a buffer
            
            if (visibility_context == v1) {
                
                l1.draw(capture.texture);
                l2.draw(capture.texture);
            
            } else {
                
                l3.draw(capture.texture);
            
            }

            drawer.glm.disable_blend();
            l4.draw_to_buffer_with(capture.texture, agent.pos, dradial);
            drawer.glm.enable_blend();

            // remove all transformations
            drawer.restore();
            
            l4.draw_buffer();
            
            capture2.end();

            //capture2.draw();
           
            capture3.begin();
            // translate back to the scroll position
            drawer.save();
            drawer.translate(scroll.translate);
            
            drawer.u_opacity.set(1);

            dradial.draw_no_blend(capture2.texture);
            
            drawer.draw_point(agent.pos, tc('black'), 4);
            

            drawer.restore();

            capture3.end();
            capture3.draw();
            // draw the buffered session with any filters applied
            //capture.begin();
            //filterer.draw();
            
            scroll.update(centre);

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
