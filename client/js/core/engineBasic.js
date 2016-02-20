/**
 * Created by Chris on 11/21/2015.
 */





function runLogic(){
    handleKeys();
    metrics.markTimer('Logic');
    setTimeout(runLogic, 10);
}
function handleKeys(){
    IO.compileCommands();
    var msg = [],
        mem = {};

    mem = keyMapHandler('initialize', mem, msg);

    for (var i = 0; i < IO.commands.length; i++){
        mem = keyMapHandler(IO.commands[i], mem, msg);
    }
    var data = {
        type:'key',
        data: msg
    };
    sendLogicWorkerMessage(data);
    IO.commands = [];
}

var renderQueues = {};
function renderCommands(name, ctx){
    renderQueues[name].forEach(function(params){
        //console.error(params);
        var methodName = params.shift();
        if(methodName.indexOf("set") == 0 && params.length == 1){
            var property =
                methodName.slice(3, 4).toLowerCase() +
                methodName.slice(4);
            ctx[property] = params[0];
        }
        else {
            ctx[methodName].apply(ctx, params);
        }
    });
    renderQueues[name] = null;
}



function setLoadingBar(renderFunction){}
(function(){
    function renderLoadingBar(description, percent){}

    setLoadingBar = function(renderFunction){
        renderLoadingBar = renderFunction;
    };

    function imagePreloadLoadBar(percent){
        renderLoadingBar('Pre-loading image assets', percent);
    }

    function renderBakeLoadBar(percent){
        renderLoadingBar('Baking pre-rendered images', percent);
    }

    window.onload = function(){
        var imageMap = imagePreloadMap || {};
        var initFunc = initRecurLoop || init || function(){};
        if(Preloader) {
            Preloader.preloadImages(imageMap, imagePreloadLoadBar, initFunc);
            return;
        }
        initFunc();
    };

    function initRecurLoop(i) {
        if(i == undefined){
            i = 0;
        }
        if(!bakeRendering(i, renderBakeLoadBar)){
            ImageBaker.setTimer(function () {
                init();
                ImageBaker.setTimer(function(){});
            });
            return;
        }

        function putABowOnIt(i){
            return function(){initRecurLoop(i);}
        }
        setTimeout(putABowOnIt(i+1), 0);
    }
})();

