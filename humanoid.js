function Humanoid() {
    PointCollection.call(this);
}
//Humanoid.prototype = new PointCollection();
Humanoid.prototype.constructor = Humanoid;

Humanoid.prototype.draw_circles = function(cu, size) {
    size = d(size, 5);

    cu.draw_circle([this.left_foot, size], 'blue');
    cu.draw_circle([this.left_knee, size], 'red');
    cu.draw_circle([this.left_hip, size], 'green');
    cu.draw_circle([this.left_shoulder, size], 'cyan');
    cu.draw_circle([this.left_elbow, size], 'orange');
    cu.draw_circle([this.left_hand, size], 'yellow');
    
    cu.draw_circle([this.right_foot, size], 'blue');
    cu.draw_circle([this.right_knee, size], 'red');
    cu.draw_circle([this.right_hip, size], 'green');
    cu.draw_circle([this.right_shoulder, size], 'cyan');
    cu.draw_circle([this.right_elbow, size], 'orange');
    cu.draw_circle([this.right_hand, size], 'yellow');
}
