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
