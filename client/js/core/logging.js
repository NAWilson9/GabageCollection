/**
 * Created by Chris on 4/19/2015.
 */

var logger = (function(){
	var logStack = [];
	var ctx;

	function stringify(obj){
		if(typeof obj == 'string'){
			return obj;// removes the quotes around strings being logged
		}
		else{
			return JSON.stringify(obj);
		}
	}

	return {
		setCtx:function(context){
			ctx = context;
		},
		log:function(str){
			var len = arguments.length;
			str = stringify(str);
			if(len > 1){
				for(var i=1;i<len;i++){
					str+=" "+stringify(arguments[i]);
				}
			}
			logStack.push(str);
		},
		output:function(){
			var x = 5;
			var y = 15;
			var yOff = 20;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            ctx.rect(0,0,10000,yOff*logStack.length);
            ctx.fill();

			ctx.fillStyle = "white";
			ctx.font = "bold 20px monospace";
			logStack.forEach(function(str){
				ctx.fillText(str, x, y);
				y += yOff;
			});
		},
		clear:function(){
			logStack = [];
		}
	};
})();