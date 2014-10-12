function ImageClosure(image, translate, size, clip_start, clip_size) {
    this.image = image;
    this.translate = d(translate, [0, 0]);
    this.size = d(size, [image.width, image.height]);
    this.clip_start = d(clip_start, [0, 0]);
    this.clip_size = d(clip_size, [image.width, image.height]);
}

ImageClosure.prototype.draw = function(ctx) {
    ctx.drawImage(
        this.image,
        this.clip_start[0],
        this.clip_start[1],
        this.clip_size[0],
        this.clip_size[1],
        this.translate[0],
        this.translate[1],
        this.size[0],
        this.size[1]
    );
}
