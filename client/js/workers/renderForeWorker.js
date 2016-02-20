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

	// actual trash
	pkg.add('setFillStyle', 'red');
	message.trash.forEach(function(trash){
		var r = 10;
		pkg.add('beginPath');
		pkg.add('rect', trash.x-r, trash.y-r, r*2, r*2);
		pkg.add('fill');
	});

	// other player stuff
	// TODO

	// THIS player stuff
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

	// HUD stuff
	message.trash.forEach(function(trash){
		var dx = trash.x-message.ship.pt.x;
		var dy = trash.y-message.ship.pt.y;

		var a = Math.atan(dy/dx);
		if(dx<0){
			a+=Math.PI;
		}

		var baseR = Math.min(width, height)*2/5;
		var dist = Math.sqrt(dx*dx+dy*dy);
		var distRt = Math.sqrt(dist);
		var size = Math.min(5 + 1000/distRt, 100);
		var da = Math.PI*size/500;
		pkg.add('setFillStyle', 'rgba(250,0,0,'+Math.floor((.1 +.9/distRt)*100)/100+')');
		pkg.add('beginPath');
		//console.log(message.ship.pt.x ,message.ship.pt.y);
		//console.log((message.ship.pt.x + baseR*Math.cos(a-da)),(message.ship.pt.y + baseR*Math.sin(a-da)));
		pkg.add('moveTo',
			Math.round(message.ship.pt.x + baseR*Math.cos(a-da)),
			Math.round(message.ship.pt.y + baseR*Math.sin(a-da))
		);
		pkg.add('lineTo',
			Math.round(message.ship.pt.x + (baseR+size)*Math.cos(a)),
			Math.round(message.ship.pt.y + (baseR+size)*Math.sin(a))
		);
		pkg.add('lineTo',
			Math.round(message.ship.pt.x + baseR*Math.cos(a+da)),
			Math.round(message.ship.pt.y + baseR*Math.sin(a+da))
		);
		pkg.add('closePath');
		pkg.add('fill');
	});


	pkg.add('translate', message.camera.x-width/2, message.camera.y-height/2);

	self.postMessage(pkg.seal());
}
self.onmessage = initValues;
