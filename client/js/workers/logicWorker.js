
importScripts(
	'../fx/fxObjects.js',
	'../fx/fxHelpers.js',
	'../core/metrics.js',
	'../core/xhr.js'
);
var TIMER = 'timer';
metrics.createTimer(TIMER);

var gamepad = null;

var width,
    height;

function handleKeys(data) {
    data.forEach(function (o) {
        switch (o.cmd) {

        }
    });
}

function handleMouse(data) {
    mouse = data;
}

function handleGamepad(data){
    gamepad = data;
}

self.onmessage = function(e) {
    width = e.data.width;
    height = e.data.height;

    self.onmessage = function (e) {

        var arr = e.data;
        var msg = ab2str(arr);
        var obj = JSON.parse(msg);

        var action;
        switch (obj.type) {
            case 'key':
                action = handleKeys;
                break;
            case 'mouse':
                action = handleMouse;
                break;
            case 'gamepad':
                action = handleGamepad;
                break;
            default:
                action = function () {
                };
                break;
        }
        action(obj.data);

    };

    loop();
};

//var origin = new Point(0, 0, 0);
//var box = {
//    hitbox: new Rectangle2D(350, 50, 20, 20),
//    v: new Vector(8, 8)
//};

var ship = {
    pt: new Point(50, 50),
    dir: new Vector(0, 0)
};

function loop(){
	metrics.markTimer(TIMER);
	var speed = 4;
	var deltaT = metrics.getDeltaTime(TIMER)/1000*speed;


    if(gamepad){
        const left = gamepad.leftStick,
            right = gamepad.rightStick;
        ship.pt.x += Math.round(Math.cos(left.angle)*left.distance*5);
        ship.pt.y += Math.round(Math.sin(left.angle)*left.distance*5);
        ship.dir.w = Math.round(Math.cos(right.angle)*right.distance*20);
        ship.dir.h = Math.round(Math.sin(right.angle)*right.distance*20);
    }

    console.log(ship.pt);

	var message = {
        'ship': ship
	};

	self.postMessage(messageEncode(message));

	setTimeout(loop,15);// 60 fps - prod deploy
	//setTimeout(loop,33);// 30 fps - test deploy
	//setTimeout(loop,50);// 20 fps - debug deploy
}
