
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
        projectiles: [],
        energy: {
            current: 100,
            max: 100
        },
        vel: new Vector(0, 0),
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
var players = [];//Player(200, 100, 'the noob', 'rgb(0,240,250)')];
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
        cooldown = ts + 500;
        var d = Math.sqrt(ship.dir.w*ship.dir.w+ship.dir.h*ship.dir.h);
        var speed = 15;
        var p = {
            x: ship.pt.x,
            y: ship.pt.y,
            v: new Vector(ship.dir.w/d*speed, ship.dir.h/d*speed)
        };
        //p.x+= p.v.w;// not necessary anymore since projectiles are tied to their owner
        //p.y+= p.v.h;
        ship.projectiles.push(p);
        setTimeout(function(){ship.projectiles.splice(ship.projectiles.indexOf(p), 1);}, 2000);
    }
})();

function getHit(){
    // TODO do something more here, signal server to drop trash here for other people
    ship.trash--;
}

function energyAction(action, cost){
    if(ship.energy.current > cost){
        action();
        ship.energy.current -= cost;
    }
}

function loop(){
	metrics.markTimer(TIMER);
	var deltaT = metrics.getDeltaTime(TIMER)/1000;

    if(gamepad){
        const left = gamepad.leftStick,
            right = gamepad.rightStick;

        ship.projectiles.forEach(function(p){
            p.x += p.v.w;
            p.y += p.v.h;
        });
        ship.energy.current = Math.min(ship.energy.current+deltaT*70, ship.energy.max);

        if(gamepad.buttons.a){
            joinRoom('hype');
        }
        if(gamepad.buttons.b){
            leaveRoom();
        }
        if(gamepad.buttons.x){
            updateStatus('a');
        }
        if(gamepad.buttons.y){
            setUsername('Nerd' + Math.floor(Math.random()*10000));
        }
        if(gamepad.buttons.rightTrigger){
            launchProjectile();
        }
        var speedRacer = 5;
        if(gamepad.buttons.leftTrigger){
            energyAction(function(){
                speedRacer = 15;
            }, 2);
        }

        var actualSpeed = left.distance*left.distance*speedRacer;
        ship.vel.w = Math.round(Math.cos(left.angle)*actualSpeed);
        ship.vel.h = Math.round(Math.sin(left.angle)*actualSpeed);
        ship.pt.x += ship.vel.w;
        ship.pt.y += ship.vel.h;

        ship.dir.w = Math.round(Math.cos(right.angle)*right.distance*20);
        ship.dir.h = Math.round(Math.sin(right.angle)*right.distance*20);

    }
    handleCamera();

    // update player positions
    // ehhhhh works without it kinda

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
    players.forEach(function(pl){
        pl.projectiles.forEach(function(p){
            var dx = p.x - ship.pt.x;
            var dy = p.y - ship.pt.y;
            var dist = Math.sqrt(dx*dx+dy*dy);
            if(dist < collisionRadius){
                getHit();
            }
        });
    });

	var message = {
        'ship': ship,
        'camera': camera,
        'players': players,
        'trash': trash
	};

    updateStatus({
        event: 'playerUpdate',
        data: ship
    });

	self.postMessage(messageEncode(message));

	setTimeout(loop,15);// 60 fps - prod deploy
	//setTimeout(loop,33);// 30 fps - test deploy
	//setTimeout(loop,50);// 20 fps - debug deploy
}



socket.on('userJoined', function(data){
    console.log('A user joined your room: ' + data);
    // TODO add more shtuff into this data block more than just name
    players.push(Player(50, 50, data, 'blue'));
});

socket.on('userLeft', function(data){
    console.log('A user left your room: ' + data);
    // TODO add more shtuff into this data block more than just name
    for(var i=0;i<players.length;i++){
        var p = players[i];
        if(p.name == data){
            players.splice(i, 1);
        }
    }
});

socket.on('dumpingTrash', function(data){
    trash.push(data);
    //console.log('trashDump: ' + JSON.stringify(data));
});

socket.on('updateGlobalStatus', function(data){
    //console.log('New global status: ' + data);
    // TODO grab updates to other players
    switch(data.event){
        case 'projectile':
            projectiles.push(data.data);
            break;
        case 'playerUpdate':
            players.forEach(function(p){
                if(p.name == data.data.name){
                    players.splice(players.indexOf(p), 1, data.data);
                }
            });
            break;
    }
});
