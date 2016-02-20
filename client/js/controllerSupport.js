/**
 * Created by nick on 2/20/16.
 */

const pollInterval = 1000;

window.addEventListener("gamepadconnected", function(e) { alert('Game pad connected!'); }, false);
window.addEventListener("gamepaddisconnected", function(e) { alert('Game pad disconnected!'); }, false);

var previousState = {//todo populate in the window event listeners
    'buttons': [],
    'axes': []
};

var pollGamepads = function() {
    var gamepads = (navigator.getGamepads) ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

    //All the controllers
    for (var i = 0; i < gamepads.length; i++) {
        var pad = gamepads[i];
        if(!pad) {
            continue;
        } else {
            console.log(pad);
            for(var j = 0; j < pad.buttons.length; j++){
                if(pad.buttons[j].pressed){

                    //Todo store button stuff
                }
            }
            for(var k = 0; k < pad.axes.length; k++){
                //todo store axes info
            }
        }
    }
};

setInterval(pollGamepads, pollInterval);