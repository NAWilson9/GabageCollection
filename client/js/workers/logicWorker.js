
importScripts(
	'../fx/fxObjects.js',
	'../fx/fxHelpers.js',
	'../core/metrics.js',
	'../core/xhr.js'
);
var TIMER = 'timer';
metrics.createTimer(TIMER);


var clock = {
	'radius':50,
	'minutes':0,
	'hours':0,
	'factor':0,
	'x':50,
	'y':0
};


var asteroids = [];
xhr.get('/get/debris', function(rawData){
    var data = JSON.parse(rawData);
    asteroids = data.asteroids;
});
xhr.listen('/listen/debris', function(rawData){
    var data = JSON.parse(rawData);
    asteroids = data.asteroids;
});


var mouse = new Point(0, 0),
    gamepad = null;

var width,
    height;

function handleKeys(data) {
    data.forEach(function (o) {
        switch (o.cmd) {
            case 'time':
                clock.factor = o.factor;
                break;
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
        clock.factor = 1;

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

    env = (function(){
        var k = 20;
        return [
            new Rectangle2D(-k,-k,width+2*k,k), //   -------
            new Rectangle2D(-k,-k,k,height+2*k),//   v
            new Rectangle2D(-k,height,width+2*k,k),// ------
            new Rectangle2D(width,-k,k,height+2*k)//       v
        ];
    })();

    loop();
};

var origin = new Point(0, 0, 0);
var box = {
    hitbox: new Rectangle2D(350, 50, 20, 20),
    v: new Vector(8, 8)
};
var ship = {
    pt: new Point(50, 50),
    dir: new Vector(0, 0)
};

var env;


function loop(){
	metrics.markTimer(TIMER);
	var speed = 4;
	var deltaT = metrics.getDeltaTime(TIMER)/1000*speed;

	var displaceTime = deltaT*clock.factor;
    clock.y = height - clock.radius;
	clock.minutes += displaceTime%60;
	if(clock.minutes > 60){
		clock.minutes %= 60;
	}
	clock.hours += displaceTime/60;
	clock.hours %= 12;

    var count = 0;
    var mod = 0;
    env.forEach(function(b){
        if(b.intersects(box.hitbox)){
            mod += (count % 2)+1
        }
        count++;
    });
    switch(mod){
        case 1:// top or bottom, flip y
            box.v.h*=-1;
            break;
        case 2:// left or right
            box.v.w*=-1;
            break;
        case 3:// corner
            box.v.w*=-1;
            box.v.h*=-1;
            break;
    }
    if(!mod){
        box.hitbox.translate(box.v);
    }
    else{
        box.v.multiply(-1);
        box.hitbox.translate(box.v);
        box.v.multiply(-1);
    }

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
		'clock':clock,
		'mouse':mouse,
        'box':box,
        'ship': ship,
        'env':env,
        'asteroids':asteroids
	};

	self.postMessage(messageEncode(message));

	setTimeout(loop,15);// 60 fps - prod deploy
	//setTimeout(loop,33);// 30 fps - test deploy
	//setTimeout(loop,50);// 20 fps - debug deploy
}
