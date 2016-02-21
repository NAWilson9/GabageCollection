/**
 * Created by Chris on 4/19/2015.
 */

var canvases = {};
var ctxs = {};

function initCanvas(parent, name, w, h){
	var canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	canvas.style.position = 'absolute';
	canvas.style.top = '10px';
	canvas.style.left = '10px';
	parent.appendChild(canvas);
	var ctx=canvas.getContext('2d');
    // extension of normal context to include setters and getters
    // these are needed in order to pass method calls from webworkers back to the main thread to be directly invoked
    //ctx.setFillStyle = function(style){ctx.fillStyle = style;};
    //ctx.setStrokeStyle = function(style){ctx.strokeStyle = style;};
    //ctx.setLineWidth = function(style){ctx.lineWidth = style;};

	if(Preloader){
		ctx.drawPreloadedImage = function(name, x, y, w, h){
			Preloader.drawImage(ctx, name, x, y, w, h);
		}
	}
    if(ImageBaker) {
        ctx.drawBakedImage = function (id, x, y) {
            ImageBaker.drawImage(ctx, id, x, y);
        }
    }
    canvas.clear =function clearCanvas(){
		ctx.clearRect(0,0,canvas.width,canvas.height);
	};
    // TODO add any additional render methods here


	canvases[name] = canvas;
	ctxs[name] = ctx;
}

function get(id){return document.getElementById(id);}
var rand = function(min,max){
	if(min==undefined){return Math.random();}
	if(max==undefined){return Math.floor(Math.random()*min);}
	if(max<min){var temp=max;max=min;min=temp;}
	return Math.floor(Math.random()*(max-min)+min);
};


// TODO update all sources with old basic inclusion, add engineBasic to them

// http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function ab2str(buf) {
    var bufView = new Uint16Array(buf);
    //const k = 65535,
    const k = 4096,
        len = bufView.length,
        lenMinK = len-k;

    //len = buf.prototype.length;

    var str = "",
        i = 0;

    for(;i < lenMinK; i+=k){
        str += String.fromCharCode.apply(
            null,
            bufView.subarray(i, i+k)
        );
    }
    str += String.fromCharCode.apply(
        null,
        bufView.subarray(i, len)
    );
    return str;
}
function str2ab(str) {
	var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
	var bufView = new Uint16Array(buf);
	for (var i=0, strLen=str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}
// end
function messageEncode(obj){
    return str2ab(JSON.stringify(obj));
}
function messageDecode(arr){
    return JSON.parse(ab2str(arr));
}