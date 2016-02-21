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

function renderShip(s, pkg){
	pkg.add('setFillStyle', s.color);
	var k = 20;
	pkg.add('beginPath');
	pkg.add('rect', s.pt.x-k/2, s.pt.y-k/2, k, k);
	pkg.add('fill');
	k = 8;
	pkg.add('setFillStyle', 'rgb(200,0,250)');
	pkg.add('beginPath');
	pkg.add('rect', s.pt.x+s.dir.w-k/2, s.pt.y+s.dir.h-k/2, k, k);
	pkg.add('fill');

	renderBar(s.pt.x-25, s.pt.y-20, 50, 5, s.energy.max, s.energy.current, 'rgba(0,0,0,0.2)', 'green', pkg);

	pkg.add('setFillStyle', 'white');
	pkg.add('setFont', '15px Courier New');
	pkg.add('setTextAlign', 'center');
	pkg.add('beginPath');
	pkg.add('fillText', s.name, s.pt.x, s.pt.y-22);
}

function renderProjectile(p, pkg){
	var k = 20;
	var a = Math.atan(p.v.h/ p.v.w);
	if(p.v.w<0){
		a+=Math.PI;
	}
	pkg.add('setFillStyle','rgb(100,0,250)');
	pkg.add('beginPath');
	pkg.add('moveTo',
		p.x+Math.cos(a-Math.PI*2/3)*k/2,
		p.y+Math.sin(a-Math.PI*2/3)*k/2
	);
	pkg.add('lineTo',
		p.x+Math.cos(a+Math.PI*2/3)*k/2,
		p.y+Math.sin(a+Math.PI*2/3)*k/2
	);
	pkg.add('lineTo',
		p.x+Math.cos(a)*k,
		p.y+Math.sin(a)*k
	);
	pkg.add('closePath');
	pkg.add('fill');
}

function renderIndicator(ox, oy, dx, dy, pkg, r, g, b){
	var a = Math.atan(dy/dx);
	if(dx<0){
		a+=Math.PI;
	}

	var baseR = Math.min(width, height)*2/5;
	var dist = Math.sqrt(dx*dx+dy*dy);
	if(dist < Math.min(width,height)/2){
		return;
	}
	var distRt = Math.sqrt(dist);
	var size = Math.min(5 + 1000/distRt, 100);
	var da = Math.PI*size/800;
	pkg.add('setFillStyle', 'rgba('+r+','+g+','+b+','+Math.floor((.2 +.8/Math.pow(distRt,.5))*100)/100+')');
	pkg.add('beginPath');
	pkg.add('moveTo',
		Math.round(ox + baseR*Math.cos(a-da)),
		Math.round(oy + baseR*Math.sin(a-da))
	);
	pkg.add('lineTo',
		Math.round(ox + (baseR+size)*Math.cos(a)),
		Math.round(oy + (baseR+size)*Math.sin(a))
	);
	pkg.add('lineTo',
		Math.round(ox + baseR*Math.cos(a+da)),
		Math.round(oy + baseR*Math.sin(a+da))
	);
	pkg.add('closePath');
	pkg.add('fill');
}

function renderBar(x,y,w,h,max,cur,c1,c2,pkg){
	pkg.add('setStrokeStyle', 'white');
	pkg.add('setFillStyle', c1);
	pkg.add('beginPath');
	pkg.add('rect', x, y, w, h);
	pkg.add('fill');
	pkg.add('stroke');
	pkg.add('setFillStyle', c2);
	pkg.add('beginPath');
	pkg.add('rect', x, y, Math.floor(w*cur/max), h);
	pkg.add('fill');
	pkg.add('stroke');
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
	message.players.forEach(function(p){
		renderShip(p, pkg);
	});

	// THIS player stuff
	renderShip(message.ship, pkg);

	// projectiles
	message.ship.projectiles.forEach(function(p){
		renderProjectile(p, pkg);
	});
	message.players.forEach(function(pl){
		pl.projectiles.forEach(function(p){
			renderProjectile(p, pkg);
		});
	});

	// HUD stuff
	message.trash.forEach(function(trash){
		var dx = trash.x-message.ship.pt.x;
		var dy = trash.y-message.ship.pt.y;
		renderIndicator(message.ship.pt.x, message.ship.pt.y, dx, dy, pkg, 250, 0, 0);
	});
	message.players.forEach(function(pl){
		var dx = pl.pt.x-message.ship.pt.x;
		var dy = pl.pt.y-message.ship.pt.y;
		renderIndicator(message.ship.pt.x, message.ship.pt.y, dx, dy, pkg, 100, 100, 255);
	});


	pkg.add('translate', message.camera.x-width/2, message.camera.y-height/2);


	// HUD text
	pkg.add('setFillStyle', 'white');
	pkg.add('setFont', '30px Courier New');
	pkg.add('setTextAlign', 'left');
	pkg.add('beginPath');
	pkg.add('fillText','Trash: '+message.ship.trash, 10, 40);


	self.postMessage(pkg.seal());
}
self.onmessage = initValues;
