function SingleImageLoader(source) {
    this.source = source;
    this.image = document.createElement('img');
}
SingleImageLoader.prototype.run = function(then) {
    this.image.onload = then;
    this.image.src = this.source;
    if (this.image.complete) {
        then();
    }
}
SingleImageLoader.prototype.val = function() {
    return this.image;
}

function ImageLoader(root, sources) {
    this.sources = sources.map(function(s){return root + s});
    this.group = new AsyncGroup(this.sources.map(function(s){return new SingleImageLoader(s)}));
}

ImageLoader.prototype.load_async = function(then) {
    this.group.run(function() {
        then(this.group.val());
    }.bind(this));
}
