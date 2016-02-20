/**
 * Created by Chris on 4/19/2015.
 */

var metrics = (function(){
	var maxRates = 20;

	function getTimeStamp(){
		var nd = new Date();
		return nd.getTime();
	}

	var timeStamps = {};
	var rates = {};

	var ratePerSecond = {};
	var deltaTime = {};
	var counters = {};

	return {
		overwriteMaxRates:function(max){
			maxRates = max;
		},
		createTimer:function(name){
			ratePerSecond[name] = 0;
			deltaTime[name] = 0;
			rates[name] = [];
			timeStamps[name] = getTimeStamp();
		},
		markTimer:function(name){
			var ts = getTimeStamp();
			var dt = (ts - timeStamps[name]);
			timeStamps[name] = ts;
			var ratesArr = rates[name];
			var len = ratesArr.length;
			ratesArr.push(dt);
			var offset = dt;
			if(len >= maxRates){
				// cut off the end
				ratesArr.splice(0,len-maxRates+1);
			}
			var total = 0;
			ratesArr.forEach(function(r){
				total += r;
			});
			var avg = total / ratesArr.length;
			deltaTime[name] = avg;

			ratePerSecond[name] = Math.floor(1000 / avg);
		},
		getRate:function(name){
			return ratePerSecond[name];
		},
		getDeltaTime:function(name){
			return deltaTime[name];
		},
		createCounter:function(name){
			counters[name] = 0;
		},
		markCounter:function(name){
			counters[name]++;
		},
		getCounter:function(name){
			return counters[name];
		}
	};
})();