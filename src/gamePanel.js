/**
 * Created by 王宇炜 on 2015/6/13.
 */

gamePanel = function(layer) {
    this.asterList = {};
    this.playerList = {};
    this.layer = layer;
    for (var i in this.asterList) {
        cc.log("asterList: " + i);
    }
    this.connection = new Connection(this, globals.serverHost, globals.serverPort);
};

gamePanel.prototype = {
    start: function() {
        var self = this;
        this.connection.connect(function() {
            self.connection.startGame(function() {
                for (var i in self.asterList) {
                    self.asterList[i].createSprites(self.layer);
                }
                self.layer.viewCenter = self.asterList[self.playerList[self.layer.playerId]].position;
                self.layer.schedule(function() {self.update();}, 1 / globals.frameRate);
            });
        });
        //this.layer.schedule(function() {self.update();}, 1 / globals.frameRate);
    },

    update: function() {
        for (var asterId in this.asterList) {
            this.asterList[asterId].move();
        }
        this.handleAstersCollision();

        var selfPlayer = this.asterList[this.playerList[this.layer.playerId]];
        if (selfPlayer == undefined) {
            this.layer.endGame();
        } else {
            this.layer.viewCenter = selfPlayer.position;
        }

        this.handleWallsCollision();

        this.layer.updateWalls();
        for (var asterId in this.asterList) {
            this.asterList[asterId].updateView();
        }
    },

    createRandomAster: function() {
        for (var i = 1; i <= 10; i++) {
            var aster = new Aster({
                position: {
                    x: Math.random() * globals.playground.width,
                    y: Math.random() * globals.playground.height
                },
                velocity: {
                    x: Math.random() * 3,
                    y: Math.random() * 3
                },
                radius: Math.random() * 50 + 10,
                property: ASTERPROPERTY.NEUTRAL,
                asterId: i,
                layer: this.layer
            });
            this.playerList[i] = i;
            this.asterList[i] = aster;
            this.asterList[i].createSprites(this.layer);
        }
    },

    handleWallsCollision: function () {
        for (var i in this.asterList) {
            var aster = this.asterList[i];
            var x = aster.position.x, y = aster.position.y;
            var v = aster.velocity;
            var r = aster.radius;
            if (x < r && v.x < 0) {
                aster.position.x = 2 * r - x;
                aster.reverseVelocityX();
            } else if (x + r > globals.playground.width && v.x > 0) {
                aster.position.x = 2 * globals.playground.width - aster.position.x - 2 * r;
                aster.reverseVelocityX();
            } else if (y < r && v.y < 0) {
                aster.position.y = 2 * r - y;
                aster.reverseVelocityY();
            } else if (y + r > globals.playground.height && v.y > 0) {
                aster.position.y = 2 * globals.playground.height - aster.position.y - 2 * r;
                aster.reverseVelocityY();
            }
        }
    },

    handleAstersCollision: function() {
        for (var i in this.asterList) {
            for (var j in this.asterList) {
                if (i == j) continue;
                var aster1 = this.asterList[i];
                var aster2 = this.asterList[j];
                if (aster1 == undefined || aster2 == undefined) return;
                if (this.checkCollision(aster1, aster2)) {
                    if (aster1.radius < aster2.radius) {
                        this.absorbAster(aster2, aster1)
                    } else {
                        this.absorbAster(aster1, aster2)
                    }
                }
            }
        }
    },
    eject: function(angleVector) {
        var self = this;
        this.connection.eject(angleVector, function (asterId) {
            self.playerEject(self.layer.playerId, angleVector, asterId);
        })
    },
    playerEject: function(playerId, angleVector, asterId) {
        var aster = this.asterList[this.playerList[playerId]];
//        console.log(aster.radius);
        var ejectVelocity = {
            x: aster.velocity.x + angleVector.x * globals.ejectInitSpeed,
            y: aster.velocity.y + angleVector.y * globals.ejectInitSpeed
        };
        var m1 = this.cube(aster.radius) * 0.99;
        var m2 = this.cube(aster.radius) * 0.01;
        var newAster = new Aster({
            position: {
                x: aster.position.x + aster.radius * angleVector.x,
                y: aster.position.y + aster.radius * angleVector.y
            },
            velocity: ejectVelocity,
            radius: Math.pow(m2, 1/3),
            property: aster.property,
            asterId: asterId,
            layer: this.layer
        });
        aster.radius = Math.pow(m1, 1 / 3);

        aster.velocity = {
            x: ((m1 + m2) * aster.velocity.x - m2 * ejectVelocity.x) / m1,
            y: ((m1 + m2) * aster.velocity.y - m2 * ejectVelocity.y) / m1
        };
        newAster.createSprites(this.layer);
        this.asterList[newAster.asterId] = newAster;
    },
    absorbAster: function(aster1, aster2) {
        var v = aster1.radius * aster1.radius * aster1.radius + aster2.radius * aster2.radius * aster2.radius;
        var d = this.getDistance(aster1.position, aster2.position);
        var x1;
        if (aster1.radius > d) {
            x1 = 0;
        } else {
            x1 = (3 * d * d - Math.sqrt(12 * d * v - 3 * d * d * d * d)) / (6 * d);
        }
        if (x1 < 0.01) x1 = 0;
        var mx = this.cube(aster1.radius) * aster1.velocity.x + (this.cube(aster2.radius) - this.cube(x1)) * aster2.velocity.x;
        var my = this.cube(aster1.radius) * aster1.velocity.y + (this.cube(aster2.radius) - this.cube(x1)) * aster2.velocity.y;
        var totalMass = v - this.cube(x1);
        aster1.velocity = {
            x: mx / totalMass,
            y: my / totalMass
        };
        aster1.radius = Math.pow(totalMass, 1 / 3);
        aster2.radius = x1;
        if (aster2.radius == 0) {
            delete this.asterList[aster2.asterId];
            aster2.deleteAster();
        }
    },
    checkCollision: function (aster1, aster2) {
        var distance = (aster1.position.x - aster2.position.x) * (aster1.position.x - aster2.position.x) +
            (aster1.position.y - aster2.position.y) * (aster1.position.y - aster2.position.y);
        return distance < (aster1.radius + aster2.radius - 1) * (aster1.radius + aster2.radius - 1);
    },
    getDistance: function(point1, point2) {
        return Math.sqrt((point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y));
    },
    cube: function(x) {
        return x * x * x;
    }
};