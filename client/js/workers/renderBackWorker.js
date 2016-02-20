importScripts(
	'../fx/fxHelpers.js',
    '../fx/fxObjects.js'
);

var width = 0,
    height = 0;

var circleCount = 0;

function handleLogic(e){
	var arr = e.data,
        str = ab2str(arr),
        message = JSON.parse(str),
        pkg = new RenderPackage();

    pkg.add('setStrokeStyle', 'white');
    pkg.add('setLineWidth', 1);
    message.asteroids.forEach(function(arr){
        pkg.add('beginPath');
        var type = 'moveTo';
        arr.forEach(function(pt){
            pkg.add(type, pt.x, pt.y);
            type = 'lineTo';
        });
        pkg.add('closePath');
        pkg.add('stroke');
    });


	var mouse = message.mouse;

    var box = message.box;

    function renderBox(box, oolor) {
        pkg.add('setFillStyle', oolor);
        pkg.add('beginPath');
        pkg.add('rect', box.x, box.y, box.w, box.h);
        pkg.add('fill');
    }
    renderBox(box.hitbox, 'red');
    message.env.forEach(function(b){
        renderBox(b, 'blue');
    });

	pkg.add('setFillStyle','green');
	pkg.add('beginPath');
	var k = 10;
	pkg.add('rect',mouse.x-k,mouse.y-k,k*2,k*2);
	pkg.add('fill');


    (function(s){
        pkg.add('setFillStyle', 'rgb(255,150,190)');
        var k = 20;
        pkg.add('beginPath');
        pkg.add('rect', s.pt.x-k/2, s.pt.y-k/2, k, k);
        pkg.add('fill');
        k = 8;
        pkg.add('setFillStyle', 'rgb(200,0,250)');
        pkg.add('beginPath');
        pkg.add('rect', s.pt.x+s.dir.w-k/2, s.pt.y+s.dir.h-k/2, k, k);
        pkg.add('fill');
    })(message.ship);


    circleCount++;
    circleCount%=100;
    pkg.add('drawBakedImage', 'debug'+circleCount, 0, 0);

	self.postMessage(pkg.seal());
}

// init values passed on first message
self.onmessage = function(e){
    var d = e.data;
    width = d.width;
    height = d.height;
    // then delegate to permanent handler
    self.onmessage = handleLogic;
};
