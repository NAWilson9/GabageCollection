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

function renderClock(clock, pkg){
	var x = clock.x;
	var y = clock.y;
	var r = clock.radius;
	function afix(x){
		return Math.pow(x%1,10)+Math.floor(x);
	}
	var hp = afix(clock.hours)/12 * 360 - 90;
	var mp = afix(clock.minutes)/60 * 360 - 90;

	var hFactor = .4;
	var mFactor = .8;
	var cFactor = .1;

	pkg.add('setFillStyle', 'white');
	pkg.add('setStrokeStyle', 'rgb(0,60,120)');
	pkg.add('setLineWidth', r*cFactor);
	pkg.add('beginPath');
	pkg.add('moveTo', x+r, y);
	pkg.add('arc', x, y, r, 0, Math.PI * 2, true);
	pkg.add('fill');
	pkg.add('stroke');

	pkg.add('setStrokeStyle', 'rgb(150,10,0)');
	pkg.add('beginPath');
	pkg.add('moveTo', x, y);
	pkg.add('lineTo', x + cos(mp) * r * mFactor, y + sin(mp) * r * mFactor);
	pkg.add('stroke');

	pkg.add('setStrokeStyle', 'rgb(0,60,120)');
	pkg.add('beginPath');
	pkg.add('moveTo', x, y);
	pkg.add('lineTo', x + cos(hp) * r * hFactor, y + sin(hp) * r * hFactor);
	pkg.add('stroke');

	pkg.add('setFillStyle', 'rgb(0,60,120)');
	pkg.add('beginPath');
	pkg.add('moveTo', x+r*cFactor/2, y);
	pkg.add('arc', x, y, r*cFactor/2, 0, Math.PI * 2, true);
	pkg.add('fill');
}

function handleLogic(e){
	var arr = e.data;
	var str = ab2str(arr);
	var message = JSON.parse(str);
	var pkg = new RenderPackage();

	renderClock(message.clock, pkg);

	self.postMessage(pkg.seal());
}
self.onmessage = initValues;
