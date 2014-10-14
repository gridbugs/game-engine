function Async() {}

Async.do_all = function(tasks, then) {
    var done_count = 0;
    for (var i = 0;i<tasks.length;i++) {
        var callback = function() {
            done_count++;
            if (done_count == tasks.length) {
                then(tasks.map(function(t){return t.val()}));
            }
        }
        tasks[i].run(callback);
    }
}

function AsyncGroup(tasks) {
    this.tasks = tasks;
}
AsyncGroup.prototype.run = function(then) {
    Async.do_all(this.tasks, function(results) {
        this.results = results;
        then();
    }.bind(this));
}
AsyncGroup.prototype.val = function() {
    return this.results;
}
