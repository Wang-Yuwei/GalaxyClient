var StartLayer = cc.Layer.extend({
    gamePanel: null,
    playerId: 1,
    backgroundSparkles: [],
    walls: [],
    ovariumHaloTexture: null,
    peerTexture: null,
    windowSize: null,

    viewCenter: {
        x: 0,
        y: 0
    },

    ctor: function() {
        this._super();
        this.initLayer();
        this.startGame();
        return true;
    },

    initLayer: function() {
        this.setScale(1);
        this.windowSize = cc.winSize;
        this.cacheTextures();
        this.setupBackground();
        this.setupWalls();
        this.gamePanel = new gamePanel(this);
    },

    cacheTextures: function () {
        this.ovariumHaloTexture = cc.textureCache.addImage(res.OvariumHalo_png);
        this.peerTexture = cc.textureCache.addImage(res.PeerSmall_tga);
    },

    startGame: function() {
        this.gamePanel.start();
        this.addTouchListener();
    },

    convertToViewpointSpace: function (coor) {
        return {
            x: coor.x - this.viewCenter.x,
            y: coor.y - this.viewCenter.y
        }
    },

    generateRandomAnchorPointInWorldSpace: function () {
        return cc.p(Math.random() * globals.playground.width, Math.random() * globals.playground.height);
    },

    generateRandomAnchorPointInViewSpace: function () {
        return this.convertToViewpointSpace(this.generateRandomAnchorPointInWorldSpace());
    },

    setupWalls: function () {
        var wallTexture = cc.textureCache.addImage(res.WallPiece_tga);
        var wallPieceCorner = cc.textureCache.addImage(res.WallPieceCorner_tga);
        var scales = [
            // up, down, left, right
            globals.playground.width,
            globals.playground.width,
            globals.playground.height,
            globals.playground.height
        ]; // [x, y]
        var rotations = [90, 270, 0, 180, 90, 180, 270, 0];
        var locations = [
            // up, down, left, right
            {
                x: globals.playground.width / 2,
                y: globals.playground.height + globals.wallThickness / 2
        }, {
            x: globals.playground.width / 2,
                y: - globals.wallThickness / 2
        }, {
            x: - globals.wallThickness / 2,
                y: globals.playground.height / 2
        }, {
            x: globals.wallThickness / 2 + globals.playground.width,
                y: globals.playground.height / 2
        },
        // up-left, up-right, down-right, down-left
        {
            x: - globals.wallThickness / 2,
                y: globals.playground.height + globals.wallThickness / 2
        }, {
            x: globals.wallThickness / 2 + globals.playground.width,
                y: globals.playground.height + globals.wallThickness / 2
        }, {
            x: globals.wallThickness / 2 + globals.playground.width,
                y: - globals.wallThickness / 2
        }, {
            x: - globals.wallThickness / 2,
                y: - globals.wallThickness / 2
        }
        ];
        console.log(locations);
        for (var i = 0; i < 8; i ++) {
            var wall = null;
            var s = globals.wallThickness / 128;

            if (i < 4) {
                wall = new cc.Sprite(wallTexture);
                wall.setScaleX(s);
                wall.setScaleY(scales[i] / 128);
            } else {
                wall = new cc.Sprite(wallPieceCorner);
                wall.setScale(s, s);
            }
            wall.setRotation(rotations[i]);
            wall.attr(locations[i]);
            this.addChild(wall);
        }
    },

    setupBackground: function () {
        var sparkleTexture = cc.textureCache.addImage(res.BlobSparkles_tga);
        this.backgroundSparkles = [];
        for (var i = 0; i < 100; i++) {
            var array = [];
            for (var j = 0; j < 5; j++) array.push(this.generateRandomAnchorPointInViewSpace());

            // shift action
            var action = cc.cardinalSplineBy(500, array, 0);
            var reverse = action.reverse();
            var sparkle = new cc.Sprite(sparkleTexture);
            var seq = cc.sequence(action, reverse);

            // scaling action
            var initScale = Math.max(Math.random() * 1.2, 0.5);
            sparkle.setScale(initScale);
            var scaleAction = cc.scaleBy(300, 0.9);
            var scaleBackAction = scaleAction.reverse();
            var seq1 = cc.sequence(scaleAction, scaleBackAction);

            // spin action
            var rotation = cc.rotateBy(100, 250 * (Math.random() + 0.1));
            if (Math.random() > 0.5) rotation = rotation.reverse();

            sparkle.runAction(cc.RepeatForever(rotation));
            sparkle.runAction(cc.RepeatForever(seq));
            sparkle.runAction(cc.RepeatForever(seq1));
            this.addChild(sparkle);
            this.backgroundSparkles.push(sparkle);
        }
    },
    addTouchListener: function() {
        var self = this;
        var touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) {
                var pos = touch.getLocation();
                var angleVector = {
                    x: pos.x - self.windowSize.width / 2,
                    y: pos.y - self.windowSize.height / 2
                };
                var r = Math.sqrt(angleVector.x * angleVector.x + angleVector.y * angleVector.y);
                if (r == 0) r = 1;
                angleVector = {
                    x: angleVector.x / r,
                    y: angleVector.y / r
                };
                console.log(angleVector);
                self.gamePanel.eject(angleVector);
                return true;
            }
        });
        cc.eventManager.addListener(touchListener, self);
    }
});

var StartScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new StartLayer();
        this.addChild(layer);
    }
});

