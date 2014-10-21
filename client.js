var cu;
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
    cu = new CanvasUtil($("#screen")[0]);

    cu.canvas.width = $(window).width();
    cu.canvas.height = $(window).height();

    $(document).resize(function() {
        cu.canvas.width = $(window).width();
        cu.canvas.height = $(window).height();
    });

    var agent = new Agent([200, 200], 0);

    var segs = [[[100, 100], [200, 400]], [[100, 100], [400, 50]], [[400, 50], [600, 50]]];
    agent.set_segs(segs);

    new CharacterLoader([
        WalkDemo
    ]).run(function() {
        var demo = new WalkDemo('still', cu.ctx);

        agent.facing = -Math.PI/2;
        agent.move_speed = 8;
        var state = 1;
        var fps_box = $("#fps");
        var tm = new TimeManager();
        function t() {

            cu.clear();
       
            if (state == 0 && agent.absolute_control_tick()) {
                state = 1;
                demo.update('walk', 100, -100);
            } else if (state == 1 && !agent.absolute_control_tick()) {
                state = 0;
                demo.update('still');
            }
 
            demo.draw(agent.pos, agent.facing + Math.PI/2);
            demo.tick(tm.get_delta());
            segs.map(function(s){cu.draw_segment(s)});
            
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
