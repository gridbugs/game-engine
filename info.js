function Info() {
}
Info.fields = [];
Info.add_field = function(name) {
    Info.fields[name] = "";
}
Info.set = function(name, value) {
    Info.fields[name] = value;
}
Info.get = function(name) {
    return Info.fields[name];
}
Info.register = function(id) {
    Info.element_id = id;
}
Info.update = function() {
    var output = "";
    for (var field in Info.fields) {
        output += (field + ": " + Info.fields[field] + "<br/>");
    }
    $("#"+Info.element_id).html(output);
}
Info.run = function() {
    Info.update();
    setTimeout(Info.run, 20);
}
Info.clear = function(name) {
    delete Info.fields[name];
}
Info.clear_all = function() {
    for (var field in Info.fields) {
        Info.clear(field);
    }
}
