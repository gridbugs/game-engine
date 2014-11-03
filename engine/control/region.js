/*
 * A collection of colliding walls
 */
function Region(segs) {
    this.segs = segs;
    this.neighbours = [];
    this.border_detectors = [];
    this.display_detectors = [];
}

Region.prototype.connect = function(region, segment) {
    var detector = new DetectorSegment(
        segment,
        function(path, agent) {
            agent.enter_region(region);    
        }.bind(this),
        function(path, agent) {
            agent.enter_region(this);
        }.bind(this)
    );

    this.neighbours.push(region);
    this.border_detectors.push(detector);
    region.neighbours.push(this);
    region.border_detectors.push(detector);
}

Region.prototype.border_detect = function(agent) {
    
    var path = agent.last_move_seg();

    this.border_detectors.map(function(d) {
        d.detect(path, agent);    
    });

}

Region.prototype.add_display_detector = function(left, right, segment) {
    if (left.constructor != Array) {
        left = [left];
    }
    if (right.constructor != Array) {
        right = [right];
    }

    this.display_detectors.push(new DetectorSegment(segment, 
        function() {
            left.map(function(d){d.hide()});
            right.map(function(d){d.show()});
        },
        function() {
            left.map(function(d){d.show()});
            right.map(function(d){d.hide()});
        }
    ));
}

Region.prototype.display_detect = function(agent) {
    var path = agent.last_move_seg();

    this.display_detectors.map(function(d) {
        d.detect(path);
    });
}

Region.prototype.create_collision_processor = function(rad) {
    var segs = this.segs;
    for (var i = 0;i<this.neighbours.length;++i) {
        segs = segs.concat(this.neighbours[i].segs);
    }
    this.collision_processor = new CollisionProcessor(rad, segs);
}

