function CharacterLoader(classes) {
    AsyncGroup.call(this, classes.map(function(c){return c.init}));
}
CharacterLoader.inherit(AsyncGroup);
