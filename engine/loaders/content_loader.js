function Content(){}
Content.characters = {};

Content.load = function() {
    Content.to_load = [];
    for (var name in Content.characters) {
        var c = new Content.characters[name]();
        Content.to_load.push(c);
        Content.characters[name] = c;
    }
}

Content.set_drawer = function(drawer) {
    Content.to_load.map(function(c){c.set_drawer(drawer)});
}

Content.run = function(then) {
    new AsyncGroup(Content.to_load).run(then);
}
