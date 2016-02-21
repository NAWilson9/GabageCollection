/**
 * Created by Chris on 9/26/2015.
 */


// preload iamges

var Preloader = (function(){

    var images = {};
    /**
     * @param {Object} nameUrlPairs
     * @param {Function} loadingCallback
     * @param {Function} callback
     */
    var preloadImages = function(nameUrlPairs, loadingCallback, callback) {
        var loadCount = 0;
        var numNames = 0;
        for(var blah in nameUrlPairs){
            if(nameUrlPairs.hasOwnProperty(blah)) {
                numNames++;
            }
        }
        for(var name in nameUrlPairs){
            if(nameUrlPairs.hasOwnProperty(name)) {
                (function (name, url) {
                    var img = new Image();
                    img.onload = function () {
                        images[name] = img;
                        loadCount++;
                        loadingCallback(loadCount/numNames);
                        if (loadCount >= numNames) {
                            callback();
                        }
                    };
                    img.src = url;
                })(name, nameUrlPairs[name]);
            }
        }
        if(numNames == 0){
            callback();
        }
    };

    /**
     * @param {String} id
     * @returns {Image}
     */
    var getImage = function(id){
        if(!images.hasOwnProperty(id)){
            console.error("Attempted to use an image before the preloading finished");
            return null;
        }
        return images[id];
    };

    return {
        preloadImages: preloadImages,
        getImage: getImage,
        drawImage: function(ctx, name, x, y, w, h){
            if(!images.hasOwnProperty(name)){
                console.error('Unknown name for preloaded image', name);
                return null;
            }
            var img = images[name];
            ctx.drawImage(img, x, y, w, h);
        }
    };
})();





// bake generated images
var ImageBaker = (function(){

    var images = [],
        imageCount = 0,
        bakeCount = 0,
        ovenTimer = function(){},
        w,
        h,
        canvas,
        ctx;

    /**
     * @param {Number} width - Width of canvas
     * @param {Number} height - Height of canvas
     */
    function initialize(width, height){
        if(!canvas) {
            canvas = document.createElement('canvas');
            ctx = canvas.getContext('2d');
            canvas.style.display = 'none';
        }
        w = width;
        h = height;
        canvas.style.width = (canvas.width = w)+'px';
        canvas.style.height = (canvas.height = h)+'px';
    }

    /**
     * @param {String} name
     * @param {Function} renderFunction - gets a context injection
     */
    function bakeImage(name, renderFunction){
        ctx.clearRect(0, 0, w, h);
        renderFunction(ctx);
        var img = new Image();
        bakeCount++;
        img.onload = function(){
            images[name] = img;
            imageCount++;
            setTimer(ovenTimer);
        };
        img.src = canvas.toDataURL();
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {String} id
     * @param {Number} x
     * @param {Number} y
     * @returns {ImageData} bakedImage
     */
    function drawImage(ctx, id, x, y){
        if(!images.hasOwnProperty(id)){
            console.error('Unknown id for baked image', id);
            return null;
        }
        var img = images[id];
        ctx.drawImage(img, x, y);
    }

    /**
     * Sets a callback function to be called every time the baker finishes baking all of the current jobs
     * @param callback
     */
    function setTimer(callback){
        ovenTimer = callback || ovenTimer;
        if(imageCount>=bakeCount){
            ovenTimer();
        }
    }

    return {
        initialize: initialize,
        bakeImage: bakeImage,
        drawImage: drawImage,
        setTimer: setTimer
    };
})();







