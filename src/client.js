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
   
    var drawer = new CanvasDrawer(canvas);

    new AsyncGroup(
        new WalkDemo(drawer)
    ).run(function(characters) {
        var walk_demo = characters[0];

        var demo = walk_demo.instance('still');
        var walls = segs.map(function(s){return drawer.line_segment(s[0], s[1], 2)});

        demo.draw();
        console.debug(demo);

        agent.facing = -Math.PI/2;
        agent.move_speed = 8;
        var state = 1;
        var fps_box = $("#fps");
        var tm = new TimeManager();
        function t() {
            drawer.clear();

            if (state == 0 && agent.absolute_control_tick()) {
                state = 1;
                demo.update('walk', 100, -100);
            } else if (state == 1 && !agent.absolute_control_tick()) {
                state = 0;
                demo.update('still');
            }
 
            demo.draw(agent.pos, agent.facing + Math.PI/2);
            demo.tick(tm.get_delta());
            walls.map(function(w){w.draw()});
            
            requestAnimationFrame(t);
        }
        t();

        function fps_t() {
            fps_box.text("FPS: " + Math.floor(tm.last_rate));
            setTimeout(fps_t, 100);
        }
        fps_t();

    });
});
