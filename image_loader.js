function ImageLoader(sources) {
    this.sources = sources;
    this.number_to_load = sources.length;
    this.number_loaded = 0;
    this.images = create_undefined_array(this.number_to_load).map(function(){return document.createElement('img')});
}

ImageLoader.prototype.load_async = function(then) {
    for (var i = 0;i<this.number_to_load;i++) {
        var load_callback = function(){
            this.number_loaded++;
            if (this.number_to_load == this.number_loaded) {
                then(this.images);
            }
        }.bind(this);
        this.images[i].onload = load_callback;

        this.images[i].src = this.sources[i];
        if (this.images[i].complete) {
            load_callback();
        }
    }
}
