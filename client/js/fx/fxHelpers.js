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

function sin(a){return Math.sin(a*Math.PI/180);}
function cos(a){return Math.cos(a*Math.PI/180);}
function atan(k){
	return Math.atan(k)*180/Math.PI;
}

var rand = function(min,max){
	max = max ? max : 1;
	min = min ? min : 0;
	return Math.floor(Math.random()*(max-min+1)+min);
};

function RenderPackage(){
    var list = [];
    this.seal = function(){
        var encoded = messageEncode(list);
        list = [];
        return encoded;
    };
    this.add = function(){
        var args = Array.prototype.slice.apply(arguments);
        list.push(args);
    }
}

function messageEncode(obj){
    return str2ab(JSON.stringify(obj));
}
function messageDecode(arr){
    return JSON.parse(ab2str(arr));
}
