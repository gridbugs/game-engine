function SingleFileLoader(path) {
    this.path = path;
}
SingleFileLoader.prototype.run = function(then) {
    $.get(this.path, function(r) {
        then(r);
    }.bind(this));
}

function PathManager(){}
PathManager.get_paths = function(path, names) {
    if (names == undefined) {
        names = [path];
        path = "";
    }
    if (names.constructor != Array) {
        var _names = new Array(arguments.length);
        for (var i = 0;i<arguments.length;++i) {
            _names[i] = arguments[i];
        }
        path = "";
        names = _names;
    }
    return names.map(function(n){return path + n});
}

function FileLoader(path, names) {
    var paths = PathManager.get_paths(path, names);
    AsyncGroup.call(this, paths.map(function(p){return new SingleFileLoader(p)}));
}
FileLoader.inherit_from(AsyncGroup);

FileLoader.load = function(path, names) {
    var fl = new FileLoader(path, names);
    return function(f) {
        fl.run(f.arr_args());
    };
}
