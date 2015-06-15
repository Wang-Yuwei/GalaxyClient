var entities = [
];
var globals = {
    playground: {
        width: 1000,
        height: 800
    },
    wallThickness: 20,
    ejectInitSpeed: 17,
    ejectForce: 0.5,
    frameRate: 12,
    img_radius: 59.5,
    serverHost: "192.168.1.2",
    serverPort: 3014,
    updateInterval: 10000
};

var ASTERPROPERTY = {
    NEUTRAL: 0,
    YIN: 1,
    YANG: 2
};

var quadtreeArgs = {
    minX : 0,
    minY : 0,
    maxX : 1000,
    maxY : 800
};
var connection = null;