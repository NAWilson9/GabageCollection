
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

var gamepad = null;

var width,
    height,
    boardSize,
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
    boardSize = e.data.boardSize;
    DebugSpawnTrash();

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

function Player(x, y, name, color){
    return {
        pt: new Point(x, y),
        dir: new Vector(0, 0),
        name: name,
        color: color,
        trash: 0
    };
}

var ship = Player(50, 50, 'alain', 'rgb(255,150,190)');
var camera = new Point(0, 0);
function handleCamera(){
    var dx = ship.pt.x-camera.x,
        dy = ship.pt.y-camera.y;
    camera.x += dx*dx*dx/8e3;
    camera.y += dy*dy*dy/8e3;
}
var players = [Player(200, 100, 'the noob', 'rgb(0,240,250)')];
var projectiles = [];
var trash = [];// literally

var launchProjectile = (function(){
    var cooldown = false;
    return function(){
        var ts = (new Date()).getTime();
        if(cooldown){
            if(ts > cooldown){
                cooldown = false;
            }
            else{
                return;
            }
        }
        cooldown = ts + 600;
        var d = Math.sqrt(ship.dir.w*ship.dir.w+ship.dir.h*ship.dir.h);
        var speed = 15;
        var p = {
            x:ship.pt.x,
            y:ship.pt.y,
            v: new Vector(ship.dir.w/d*speed, ship.dir.h/d*speed)
        };
        p.x+= p.v.w;
        p.y+= p.v.h;
        projectiles.push(p);
        setTimeout(function(){projectiles.splice(projectiles.indexOf(p), 1);}, 2000);
    }
})();

function DebugSpawnTrash() {
    var k = 100;
    trash.push(new Point(
        rand(boardSize / k, boardSize * (k - 1) / k),
        rand(boardSize / k, boardSize * (k - 1) / k)
    ));
    setTimeout(DebugSpawnTrash, rand(5, 10) * 1000);
}

function loop(){
	metrics.markTimer(TIMER);
	var deltaT = metrics.getDeltaTime(TIMER)/1000;

    if(gamepad){
        const left = gamepad.leftStick,
            right = gamepad.rightStick;
        ship.pt.x += Math.round(Math.cos(left.angle)*left.distance*left.distance*10);
        ship.pt.y += Math.round(Math.sin(left.angle)*left.distance*left.distance*10);

        ship.dir.w = Math.round(Math.cos(right.angle)*right.distance*20);
        ship.dir.h = Math.round(Math.sin(right.angle)*right.distance*20);

        if(gamepad.buttons.a){
            joinRoom('hype');
        }
        if(gamepad.buttons.b){
            leaveRoom();
        }
        if(gamepad.buttons.x){
            updateStatus('a');
        }
        if(gamepad.buttons.rightTrigger){
            launchProjectile();
        }
    }
    handleCamera();

    // update projectiles
    projectiles.forEach(function(p){
        p.x += p.v.w;
        p.y += p.v.h;
    });

    // update player positions


    // check collisions
    var collisionRadius = 40;
    for(var i=0;i<trash.length;i++){
        var t = trash[i];
        var dx = t.x - ship.pt.x;
        var dy = t.y - ship.pt.y;
        var dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < collisionRadius){
            trash.splice(i,1);
            i--;
            ship.trash++;
        }
    }

	var message = {
        'ship': ship,
        'camera': camera,
        'players': players,
        'projectiles': projectiles,
        'trash': trash
	};

	self.postMessage(messageEncode(message));

	setTimeout(loop,15);// 60 fps - prod deploy
	//setTimeout(loop,33);// 30 fps - test deploy
	//setTimeout(loop,50);// 20 fps - debug deploy
};