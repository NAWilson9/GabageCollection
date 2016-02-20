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
	var arr = e.data;
	var str = ab2str(arr);
	var message = JSON.parse(str);
	var pkg = new RenderPackage();

	self.postMessage(pkg.seal());
}
self.onmessage = initValues;
