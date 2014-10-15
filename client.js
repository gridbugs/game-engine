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
    ]).load_async(function() {
        var demo = new WalkDemo('still', 0.3, cu.ctx);

        agent.facing = -Math.PI/2;
        agent.move_speed = 8;
        var state = 1;
        function t() {
            cu.clear();
       
            if (state == 0 && agent.absolute_control_tick()) {
                state = 1;
                demo.update('walk', 1, -1);
            } else if (state == 1 && !agent.absolute_control_tick()) {
                state = 0;
                demo.update('still');
            }
 
            demo.draw(agent.pos, agent.facing + Math.PI/2);
            demo.tick();
       //     agent.draw();
            segs.map(function(s){cu.draw_segment(s)});
            setTimeout(t, 33);
        }
        t();

    });
});
