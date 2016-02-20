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


    pkg.add('translate', -message.camera.x+width/2, -message.camera.y+height/2);
    //circleCount++;
    //circleCount%=100;
    //pkg.add('drawBakedImage', 'debug'+circleCount, 0, 0);
    pkg.add('drawBakedImage', 'starfield2', 0, 0);
    pkg.add('translate', -message.camera.x/4, -message.camera.y/4);
    pkg.add('drawBakedImage', 'starfield1', 0, 0);

    pkg.add('translate', -message.camera.x/4, -message.camera.y/4);
    pkg.add('drawBakedImage', 'starfield0', 0, 0);
    pkg.add('translate', message.camera.x/4, message.camera.y/4);

    pkg.add('translate', message.camera.x/4, message.camera.y/4);
    //pkg.add('drawBakedImage', 'starfield2', 0, 0);
    //pkg.add('drawBakedImage', 'starfield3', 0, 0);

    pkg.add('translate', message.camera.x-width/2, message.camera.y-height/2);


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
