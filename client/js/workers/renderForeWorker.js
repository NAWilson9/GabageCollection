importScripts(
	'../fx/fxHelpers.js'
);

var width = 0;
var height = 0;
function initValues(e){
	var d = e.data;
	width = d.width;
	height = d.height;
	// grab first, then delegate to permanent handler
	self.onmessage = handleLogic;
}

function handleLogic(e){
	var message = messageDecode(e.data);

	var pkg = new RenderPackage();

	pkg.add('translate', -message.camera.x+width/2, -message.camera.y+height/2);
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

	pkg.add('translate', message.camera.x-width/2, message.camera.y-height/2);

	self.postMessage(pkg.seal());
}
self.onmessage = initValues;
