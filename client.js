var cu;
$(function() {
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
        var prev_time = Date.now();
        function t() {
            var curr_time = Date.now();
            var time_delta = curr_time - prev_time;
            prev_time = curr_time;

            cu.clear();
       
            if (state == 0 && agent.absolute_control_tick()) {
                state = 1;
                demo.update('walk', 100, -100);
            } else if (state == 1 && !agent.absolute_control_tick()) {
                state = 0;
                demo.update('still');
            }
 
            demo.draw(agent.pos, agent.facing + Math.PI/2);
            demo.tick(time_delta);
            segs.map(function(s){cu.draw_segment(s)});
            
            requestAnimationFrame(t);
        }
        t();

    });
});
