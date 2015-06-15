var Aster = function(options) {
    this.position = options.position;
    this.velocity = options.velocity;
    this.radius = options.radius;
    this.property = options.property;
    this.asterId = options.asterId;
    this.asterSprite = null;
};

Aster.prototype = {
    move: function() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    },
    reverseVelocityX: function () {
        this.velocity.x = - this.velocity.x;
    },
    reverseVelocityY: function () {
        this.velocity.y = - this.velocity.y;
    },
    createSprites: function(layer) {
        this.layer = layer;
        this.asterSprite = new AsterSprite(this, this.layer);
    },
    updateView: function() {
        this.asterSprite.updatePosition();
        this.asterSprite.resetScale();
    },
    deleteAster: function() {
        this.asterSprite.deleteSprites();
    }
};