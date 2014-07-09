var cu;
$(function() {
    Info.register("info");
    Info.run();
    Input.set_canvas_offset(parseInt($("#screen").css("left")), parseInt($("#screen").css("top")));
    Input.init();
    cu = new CanvasUtil();
    cu.register_canvas($("#screen")[0]);

    Player.set_controlled_player(new Player([200, 200], 0));

    function display_loop() {
        cu.clear();
        Player.controlled_player.draw();
        setTimeout(display_loop, 50);
    }

    function control_loop() {
        Player.controlled_player.control_tick();
        setTimeout(control_loop, 50);
    }

    display_loop();
    control_loop();
});
