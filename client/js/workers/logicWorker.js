
importScripts(
	'../fx/fxObjects.js',
	'../fx/fxHelpers.js',
	'../core/metrics.js',
	'../core/xhr.js',
    '../../socket.io/socket.io.js',
    '../socket.js'
);
var TIMER = 'timer';
metrics.createTimer(TIMER);
var socket = io.connect('noobnoob.no-ip.org:1337');

var gamepad = null;

var width,
    height,
    socketInfo;

function handleKeys(data) {
    data.forEach(function (o) {
        switch (o.cmd) {

        }
    });
}

function handleGamepad(data){
    gamepad = data;
}

self.onmessage = function(e) {
    width = e.data.width;
    height = e.data.height;
    socketInfo = e.data.socketInfo;

    self.onmessage = function (e) {
        var obj = messageDecode(e.data);

        var action;
        switch (obj.type) {
            case 'key':
                action = handleKeys;
                break;
            //case 'mouse':
            //    action = handleMouse;
            //    break;
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
    v: new Vector(0, 0),
    dir: new Vector(0, 0)
};
var camera = new Point(0, 0);
function handleCamera(){
    var dx = ship.pt.x-camera.x,
        dy = ship.pt.y-camera.y;
    camera.x += dx*dx*dx/8e3;
    camera.y += dy*dy*dy/8e3;
}
var players = [];
var trash = [];// literally

function loop(){
	metrics.markTimer(TIMER);
	var deltaT = metrics.getDeltaTime(TIMER)/1000;

    if(gamepad){
        const left = gamepad.leftStick,
            right = gamepad.rightStick;
        ship.v.w += Math.round(Math.cos(left.angle)*left.distance*1);//deltaT*100);
        ship.v.h += Math.round(Math.sin(left.angle)*left.distance*1);//deltaT*100);
        var factor = .9;//Math.pow(.9, 1+deltaT/100);
        ship.v.w *= factor;
        ship.v.h *= factor;
        ship.pt.x += ship.v.w;
        ship.pt.y += ship.v.h;
        ship.dir.w = Math.round(Math.cos(right.angle)*right.distance*20);
        ship.dir.h = Math.round(Math.sin(right.angle)*right.distance*20);

        //console.log(gamepad.buttons);
        if(gamepad.buttons.a){
            //console.log('BUTTON PRESSED');
            joinRoom('hype');
        }
        if(gamepad.buttons.b){
            //console.log('BUTTON PRESSED');
            leaveRoom();
        }
        if(gamepad.buttons.x){
            //console.log('BUTTON PRESSED');
            updateStatus('a');
        }
    }
    handleCamera();

	var message = {
        'ship': ship,
        'camera': camera
	};

	self.postMessage(messageEncode(message));

	setTimeout(loop,15);// 60 fps - prod deploy
	//setTimeout(loop,33);// 30 fps - test deploy
	//setTimeout(loop,50);// 20 fps - debug deploy
};