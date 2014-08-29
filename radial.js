/* This file extends underscore with some functions
 * relating to composing function to form radial functions. */

// so it works without requiring underscore.js
var _=_||{};

/* takes a function of 1 variable and returns a function
 * which is the positive domain part of the origin function
 * rotated about the origin. */
_.rotate_pos_to_radial = function(f) {
    return function(theta, radius) {
        return f(radius);
    };
}
