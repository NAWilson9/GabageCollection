var specialKeyCodes=[
	{key:8,name:"BACKSPACE"},
	{key:9,name:"TAB"},
	{key:13,name:"ENTER"},
	{key:16,name:"SHIFT"},
	{key:17,name:"CTRL"},
	{key:18,name:"ALT"},
	{key:20,name:"CAPS LOCK"},
	{key:192,name:"TILDE"}

];
function keyEvent(e,bool){
	var key;
	if(window.event){
		key=window.event.keyCode;
	}
	else if(e){
		key=e.which;
	}
	else{
		return false;
	}
	var flag=0;
	specialKeyCodes.forEach(function(k){
		if(key==k.key){
			flag=1;
			key=k.name;
		}
	});
	if(!flag){
		key=String.fromCharCode(key);
	}
	for(var i=0;i<IO.keys.length;i++){
		if(IO.keys[i]==key){
			IO.keys.splice(i,1);
			break;
		}
	}
	if(bool){
		IO.keys.push(key);
	}
}

var Point = function(x,y){return {x:x,y:y};};
var IO={
	commands:[],
	keys:[],
	binds:[],
	compileCommands:function(){
		IO.commands=[];
		for(var i=0;i<IO.keys.length;i++){
			var key=IO.keys[i];
			for(var ii=0;ii<IO.binds.length;ii++){
				var bind=IO.binds[ii];
				if(bind.key==key&&bind.condition()){
					var d=new Date();
					var t=d.getTime();
					if(t-bind.lastHit>bind.rt){
						bind.lastHit=t;
						IO.commands.push(bind.command);
					}
				}
			}
		}
	},
	mouse: {
		offset: Point(10,10),
		location: Point(0, 0),
		handler:function(coords){},
		update:(function(){
			var timeout = 0;
			return function (event){
				this.location.x = event.clientX-this.offset.x;
				this.location.y = event.clientY-this.offset.y;
				if(!timeout){
					// send data to worker
					this.handler(this.location);
					// don't spam the worker
					timeout = window.setTimeout(function(){
						timeout = 0;
					},20);
				}
			};
		})()
	},
	'gamepad': (function(){
		var GamepadController = new PxGamepad();
		GamepadController.start();
		return {
			'getState': function(){
				GamepadController.update();
				return GamepadController;
			}
		};
	})(),
	'bind':function(key,command,resetTimer,condition){
		this.unbind(key);
		if(!resetTimer){
			resetTimer=0;
		}
		if(!condition){
			condition=function(){return 1;};
		}
		IO.binds.push({key:key,command:command,rt:resetTimer,lastHit:0,condition:condition});
	},
	'unbind':function(key){
		for(var i=0;i<IO.binds.length;i++){
			if(IO.binds[i].key==key){
				IO.binds.splice(i,1);
				break;
			}
		}
	},
	'unbindall':function(){
		IO.binds=[];
	},
	handleMouse:function(cb){
		this.mouse.handler = cb;
	}
};

window.onkeydown=function(event){keyEvent(event,1);};
window.onkeyup=function(event){keyEvent(event,0);};
window.onmousemove=function(event){IO.mouse.update(event);};