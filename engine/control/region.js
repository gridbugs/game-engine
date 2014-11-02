/*
 * A collection of colliding walls
 */
function Region(segs) {
    this.segs = segs;
    this.neighbours = [];
    this.border_detectors = [];
}

Region.prototype.connect = function(region, segment) {
    var detector = new DetectorSegment(
        segment,
        function(path, agent) {
            agent.enter_region(this);    
        }.bind(this),
        function(path, agent) {
            agent.enter_region(region);
        }
    );

    this.neighbours.push(region);
    this.border_detectors.push(detector);
    region.neighbours.push(this);
    region.border_detectors.push(detector);
}

Region.prototype.detect = function(agent) {
    
    var path = agent.last_move_seg();

    this.border_detectors.map(function(d) {
        d.detect(path, agent);    
    });
}

Region.prototype.create_collision_processor = function(rad) {
    var segs = this.segs;
    for (var i = 0;i<this.neighbours.length;++i) {
        segs = segs.concat(this.neighbours[i].segs);
    }
    this.collision_processor = new CollisionProcessor(rad, segs);
}
