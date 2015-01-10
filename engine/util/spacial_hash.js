function SpacialHashTable(cell_size, dimensions) {
    this.cell_size = cell_size;
    this.cell_width = cell_size[0];
    this.cell_height = cell_size[1];

    this.dimensions = dimensions;

    this.dimensions_cells = [Math.ceil(dimensions[0]/cell_size[0]), Math.ceil(dimensions[1]/cell_size[1])];
    this.width_cells = this.dimensions_cells[0];
    this.height_cells = this.dimensions_cells[1];

    this.length = this.dimensions_cells[0]*this.dimensions_cells[1];
    this.arr = new Array(this.length);
}

SpacialHashTable.prototype.loop_indices = function(f) {
    for (var i = 0;i<this.height_cells;i++) {
        for (var j = 0;j<this.width_cells;j++) {
            f(j, i);
        }
    }
}

SpacialHashTable.prototype.position_to_index = function(x, y) {
    return this.index(Math.floor(x/this.cell_width), Math.floor(y/this.cell_height));
}
SpacialHashTable.prototype.index = function(i, j) {
    return i + j * this.width_cells;
}

SpacialHashTable.prototype.get_v2 = function(v) {
    return this.get(v[0], v[1]);
}

SpacialHashTable.prototype.put_v2 = function(v, val) {
    this.put(v[0], v[1], val);
}

SpacialHashTable.prototype.get = function(x, y) {
    return this.arr[this.position_to_index(x, y)];
}

SpacialHashTable.prototype.put = function(x, y, val) {
    this.arr[this.position_to_index(x, y)] = val;
}

SpacialHashTable.prototype.get_idx = function(i, j) {
    return this.arr[this.index(i, j)];
}

SpacialHashTable.prototype.put_idx = function(i, j, val) {
    this.arr[this.index(i, j)] = val;
}
