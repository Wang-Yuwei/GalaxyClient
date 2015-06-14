var AsterSprite = function(aster, layer) {
    this.aster = aster;
    this.layer = layer;
    this.shell = new cc.Sprite(res.OvariumParticleSmall_tga);
    this.shell.attr(this.logicalPositionToActualPosition(aster.position));

    this.sprite = new cc.Sprite(res.Ovarium_tga);
    this.sprite.attr(this.logicalPositionToActualPosition(aster.position));

    this.auroraClock = new cc.Sprite(res.OvariumAurora_tga);
    this.auroraClock.attr(this.logicalPositionToActualPosition(aster.position));

    var spinAction = cc.RepeatForever(cc.rotateBy(40, 360));
    this.auroraClock.runAction(spinAction);
    this.auroraAnticlock = new cc.Sprite(res.OvariumAurora_tga);
    this.auroraAnticlock.attr(this.logicalPositionToActualPosition(aster.position));
    var reverseSpinAction = cc.RepeatForever(cc.rotateBy(40, -360));
    this.auroraAnticlock.runAction(reverseSpinAction);

    this.nucleus = new cc.Sprite(res.OvariumNucleus_tga);
    this.nucleus.attr(this.logicalPositionToActualPosition(aster.position));
    var halfPeriod = 3;
    this.nucleus.runAction(cc.RepeatForever(cc.sequence(cc.fadeTo(halfPeriod, 125), cc.fadeTo(halfPeriod, 200))));

    this.nucleus.runAction(cc.RepeatForever(cc.sequence(
        cc.scaleTo(halfPeriod, 0.8), cc.scaleTo(halfPeriod, 1.3)
    )));
    this.nucleus.runAction(cc.RepeatForever(cc.sequence(
        cc.tintTo(halfPeriod, 63, 126, 176), cc.tintTo(halfPeriod, 255, 255, 255)
    )));

    this.emergencePS = cc.ParticleSystem(res.EmergenceEffect_plist);
    this.emergencePS.setPositionType(cc.ParticleSystem.TYPE_FREE);
    this.emergencePS.attr(this.logicalPositionToActualPosition(aster.position));
    this.emergencePS.setScale(0.1);
    this.resetScale();
    this.addSpritesToLayer();
};

AsterSprite.prototype = {
    logicalPositionToActualPosition: function(position) {
        var self = this;
        return {
            x: position.x - self.layer.viewCenter.x + self.layer.windowSize.width / 2,
            y: position.y - self.layer.viewCenter.y + self.layer.windowSize.height / 2
        }
    },
    addSpritesToLayer: function() {

        this.layer.addChild(this.shell, 1);
        this.layer.addChild(this.sprite, 1);
        this.layer.addChild(this.auroraClock, 1);
        this.layer.addChild(this.auroraAnticlock, 1);
        this.layer.addChild(this.emergencePS, 1);
    },

    resetScale: function() {
        this.shell.setScale(this.aster.radius / globals.img_radius);
        this.sprite.setScale(this.aster.radius / globals.img_radius);
        this.auroraClock.setScale(this.aster.radius / globals.img_radius);
        this.auroraAnticlock.setScale(this.aster.radius / globals.img_radius);
        this.nucleus.setScale(this.aster.radius / globals.img_radius);
        this.emergencePS.setScale(this.aster.radius / globals.img_radius * 0.1);
    },
    updatePosition: function() {
        this.shell.runAction(cc.place(this.logicalPositionToActualPosition(this.aster.position)));
        this.sprite.runAction(cc.place(this.logicalPositionToActualPosition(this.aster.position)));
        this.auroraClock.runAction(cc.place(this.logicalPositionToActualPosition(this.aster.position)));
        this.auroraAnticlock.runAction(cc.place(this.logicalPositionToActualPosition(this.aster.position)));
        this.nucleus.runAction(cc.place(this.logicalPositionToActualPosition(this.aster.position)));
        this.emergencePS.runAction(cc.place(this.logicalPositionToActualPosition(this.aster.position)));
    },
    deleteSprites: function() {
        this.layer.removeChild(this.shell);
        this.layer.removeChild(this.sprite);
        this.layer.removeChild(this.auroraClock);
        this.layer.removeChild(this.auroraAnticlock);
        this.layer.removeChild(this.nucleus);
        this.layer.removeChild(this.emergencePS);
    }
};

