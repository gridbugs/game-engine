function CharacterLoader(classes) {
    this.classes = classes;
    this.loader = new AsyncGroup(this.classes.map(function(c) {
        return c.init;
    }));
}

CharacterLoader.prototype.load_async = function(then) {
    this.loader.run(function() {
        then();
    });
}
