/* Adds shortand for some javascript language features
 */
Object.defineProperty(Function.prototype, 'add_method', {
        value: function(fn_name, fn) {
            Object.defineProperty(this.prototype, fn_name, {
                value: fn,
                enumerable: false
            });
        },
        enumerable: false
    }
);

Function.add_method('inherit', function(p) {
    this.prototype = new p();
    this.prototype.constructor = this;
    return this;
});

