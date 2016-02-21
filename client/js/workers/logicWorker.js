
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
    socketInfo,
    inputs = {
        direction: null,
        aim: null,
        speed: false,
        shoot: false
    };

function handleMouse(to){
    var from = new Point(
        width/2+(ship.pt.x-camera.x),
        height/2+(ship.pt.y-camera.y)
    );
    var dx = to.x-from.x;
    var dy = to.y-from.y;
    var d = Math.sqrt(dx*dx+dy*dy);
    inputs.aim = new Vector(dx/d, dy/d);
}

function handleKeys(data) {
    inputs.shoot = false;
    inputs.speed = false;

    var direction = new Vector(0, 0);
    data.forEach(function (o) {
        switch (o.cmd) {
            case "up":
                direction.h-=1;
                break;
            case "down":
                direction.h+=1;
                break;
            case "left":
                direction.w-=1;
                break;
            case "right":
                direction.w+=1;
                break;
            case "shoot":
            case "speed":
                inputs[o.cmd] = true;
                break;
        }
    });
    inputs.direction = direction;
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

var tempName = rnGeezeus();
var ship = Player(50, 50, tempName, 'rgb(255,150,190)');
setUsername(tempName);
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
        ship.projectiles.push(p);
        setTimeout(function(){ship.projectiles.splice(ship.projectiles.indexOf(p), 1);}, 2000);
    }
})();

function getHit(){
    // TODO do something more here, signal server to drop ` here for other people
    ship.trash--;
}

function pickupTrash(t){
    trash.forEach(function(tr){
        if(tr.id == t.id){
            trash.splice(trash.indexOf(tr), 1);
            updateStatus({
                event: 'garbageDay',
                id: tr.id
            });
        }
    });
    ship.trash++;
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

    ship.energy.current = Math.min(ship.energy.current+deltaT*70, ship.energy.max);

    ship.projectiles.forEach(function(p){
        p.x += p.v.w;
        p.y += p.v.h;
    });


    if(gamepad){// TODO ??? does this work
        const left = gamepad.leftStick,
            right = gamepad.rightStick;

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
        if(gamepad.buttons.y){
            setUsername(rnGeezeus());
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

    }
    else{
        if(inputs.shoot){
            launchProjectile();
        }
        var speedRacer = 5;
        if(inputs.speed){
            energyAction(function(){
                speedRacer = 15;
            }, 2);
        }
        if(inputs.direction) {
            ship.vel.w = inputs.direction.w*speedRacer*1.5;
            ship.vel.h = inputs.direction.h*speedRacer*1.5;
            ship.pt.x += ship.vel.w;
            ship.pt.y += ship.vel.h;
        }
        if(inputs.aim) {
            ship.dir.w = inputs.aim.w*20;
            ship.dir.h = inputs.aim.h*20;
        }
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
            pickupTrash(t);
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

	setTimeout(loop, 15);// 60 fps - prod deploy
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
            break;
        }
    }
});

socket.on('dumpingTrash', function(data){
    trash.push(data);
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
        case 'garbageDay':
            trash.forEach(function(t){
                if(t.id == data.id){
                    trash.splice(trash.indexOf(t), 1);
                }
            });
            break;
    }
});

function rnGeezeus(){
    var list = [
        'Nerd',
        'Noob',
        'Robot',
        'Pirate',
        'Scout',
        'Hobo',
        'Munchkin',
        'Pterodactyl',
        'Saquan',
        'Geek',
        'Acrobat',
        'Ace',
        'Maverick',
        'Stealth',
        'Doc',
        'Happy',
        'Sneezy',
        'Sleepy',
        'Bashful',
        'Dopey',
        'Grumpy',
        'Troll',
        'Trashcan',
        'Dunkey',
        'Lizard Squad',
        'HISSSSSSSSS',
        'Cy',
        'Hacker',
        'HAX',
        'Uber Micro',
        'Boom Headshot',
        'God Zilla',
        'bacon',
        'REKT',
        '#REKT',
        'Owned',
        'Pwned',
        'Actually a trashcan',
        'Probably 10 years old',
        'Actually 10 years old',
        'Not 10 years old',
        'GG',
        'PCMR',
        'Bic Boi',
        'Biccer Boi',
        'Biccest Boi',
        'Rickles',
        'Christles',
        'Nickles',
        'Kale',
        'Spud',
        'Doot Gloop',
        'Scooty Doots',
        'Denko',
        'Lil D-Wayne',
        'Alpha',
        'Beta',
        'Playa',
        'WHAT IT ISSSSS',
        'KnG',
        "JJ's",
        'Traesh',
        'Tru Playa',
        'Sweg'
    ];
    return list[Math.floor(Math.random() * list.length)];
}