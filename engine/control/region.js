/*
 * A collection of colliding walls
 */
function Region(segs) {
    this.segs = segs;
    this.neighbours = [];
    this.detectors = [];
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
    this.detectors.push(detector);
    region.neighbours.push(this);
    region.detectors.push(detector);
}

Region.prototype.detect = function(agent) {
    
    var path = agent.last_move_seg();

    this.detectors.map(function(d) {
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
