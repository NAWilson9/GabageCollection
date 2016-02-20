/**
 * Created by Chris on 4/20/2015.
 */

/**
 * @param {number} x
 * @param {number} y
 * @param {number} [z]
 * @returns {*}
 * @constructor
 */
var Point = function(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;
};
/**
 * @param {Vector} v
 */
Point.prototype.translate = function(v){
	this.x += v.w;
	this.y += v.h;
	this.z += v.d;
};
/**
 * @returns {Point}
 */
Point.prototype.clone = function(){
    return new Point(this.x, this.y, this.z);
};

/**
 * @param {number} start
 * @param {number} end
 * @constructor
 */
var Range = function(start, end){
	this.start = start;
	this.end = end;
};
/**
 * @param {number} value
 * @returns {boolean}
 */
Range.prototype.contains = function(value){
	return (
		this.start <= value &&
		value <= this.end
	);
};

/**
 * @param {number} m
 * @param {number} b
 * @param {number} xmin
 * @param {number} xmax
 * @constructor
 */
var Line = function(m, b, xmin, xmax){
    this.m = m;
    this.b = b;
    this.xRange = new Range(xmin, xmax);
    this.yRange = new Range(b+m*xmin, b+m*xmax);
};

/**
 * @param y
 * @returns {number | null}
 */
Line.prototype.getX = function(y){
    if(this.yRange.contains(y)){
        return (y - b) / m;
    }
    return null;
};

/**
 * @param x
 * @returns {number | null}
 */
Line.prototype.getY = function(x){
    if(this.xRange.contains(x)){
        return b + m * x;
    }
    return null;
};

Line.fromPointVector = function(pt, v){
    var m = v.h / v.w;
    var b = pt.y - m * pt.x;
    var min = Math.min(pt.x, pt.x + v.w);
    var max = Math.max(pt.x, pt.x + v.w);
    return new Line(m, b, min, max);
};

/**
 * @param {number | Point} one
 * @param {number | Point} two
 * @param {number} [three=0]
 * @constructor
 */
var Vector = function(one, two, three){
	var w, h, d;
	if(typeof one == 'number' && typeof two == 'number'){
		w = one;
		h = two;
		d = three;
	}
	else if(one instanceof Point && one instanceof Point){
		w = two.x- one.x;
		h = two.y- one.y;
		d = two.z- one.z;
	}
	else{
		console.error("Illegal constructor");
		return;
	}
	this.w = w;
	this.h = h;
	this.d = d ? d : 0;
};

/**
 * @param {Vector} v
 * @returns {Vector}
 */
Vector.copy = function(v){
    return new Vector(v.w, v.h, v.d);
};

/**
 * @returns {number}
 */
Vector.prototype.magnitude = function(){
	return Math.sqrt(this.w*this.w + this.h*this.h);
};
/**
 * @returns {Vector | boolean}
 */
Vector.prototype.unitify = function(){
	var v = this;
	var d = getMagnitude(v);
	if(d == 0){
		console.error("Cannot unit-ify a distance-less vector.");
		return false;
	}
	return scaleVector(v,1/d);
};
/**
 * @param {number} scalar
 * @returns {Vector}
 */
Vector.prototype.multiply = function(scalar){
	var v = this;
	return Vector(v.w*scalar, v.h*scalar, v.d*scalar);
};
/**
 * @param {Vector} u
 * @returns {Vector}
 */
Vector.prototype.add = function(u){
	var v = this;
	return Vector(v.w+u.w, v.h+u.h, v.d+u.d);
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @constructor
 */
var Rectangle2D = function(x, y, w, h){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};

/**
 * @param {Rectangle2D} r
 * @returns {Rectangle2D}
 */
Rectangle2D.copy = function(r){
    return new Rectangle2D(r.x, r.y, r.w, r.h);
};

/**
 * @param {Point} pt
 * @returns {boolean}
 */
Rectangle2D.prototype.contains = function(pt){
	var xr = new Range(this.x, this.x+this.w);
	var yr = new Range(this.y, this.y+this.h);
	return xr.contains(pt.x) && yr.contains(pt.y);
};

Rectangle2D.prototype.translate = function(v){
    this.x += v.w;
    this.y += v.h;
};

/**
 * @param {Rectangle2D} r
 * @returns {boolean}
 */
Rectangle2D.prototype.intersects = function(r){
    var xr1 = new Range(this.x, this.x + this.w);
    var yr1 = new Range(this.y, this.y + this.h);

    var xr2 = new Range(r.x, r.x + r.w);
    var yr2 = new Range(r.y, r.y + r.h);

    var xOver = (
        xr1.contains(xr2.start) ||
        xr1.contains(xr2.end) ||
        xr2.contains(xr1.start) ||
        xr2.contains(xr1.end)
    );

    var yOver = (
        yr1.contains(yr2.start) ||
        yr1.contains(yr2.end) ||
        yr2.contains(yr1.start) ||
        yr2.contains(yr1.end)
    );

    return xOver && yOver;
};

/**
 * @param {number} x
 * @param {number} w
 * @param {number} y
 * @param {number} h
 * @param {number} [z=0]
 * @param {number} [d=0]
 * @constructor
 */
var RectanglePrism = function(x, y, z, w, h, d){
	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w;
	this.h = h;
	this.d = d;
};
/**
 * @param {Point} pt
 * @returns {boolean}
 */
RectanglePrism.prototype.contains = function(pt){
	var xr = new Range(this.x, this.x+this.w);
	var yr = new Range(this.y, this.y+this.h);
	var zr = new Range(this.z, this.z+this.d);
	return (
		xr.contains(pt.x) &&
		yr.contains(pt.y) &&
		zr.contains(pt.z)
	);
};
/**
 * @param {RectanglePrism} rp
 * @returns {boolean}
 */
RectanglePrism.prototype.intersects = function(rp){
	var t = this;
	var ret = false;
	[
		new Point(rp.x, rp.y),
		new Point(rp.x, rp.y+rp.h),
		new Point(rp.x+rp.w, rp.y),
		new Point(rp.x+rp.w, rp.y+rp.h)
	].forEach(function(pt){
		if(t.contains(pt)){
			ret = true;
		}
	});
	if(ret){
		return ret;
	}

	[
		new Point(this.x, this.y),
		new Point(this.x, this.y+this.h),
		new Point(this.x+this.w, this.y),
		new Point(this.x+this.w, this.y+this.h)
	].forEach(function(pt) {
		if (rp.contains(pt)) {
			ret = true;
		}
	});
	return ret;
};

/**
 * @param {Point | Camera} location
 * @param {number} [yawAngle=0]
 * @param {number} [pitchAngle=0]
 * @constructor
 */
var Camera = function(location, yawAngle, pitchAngle){
    if(location instanceof Camera){
        var c = location;
        return new Camera(c.location, c.yaw, c.pitch);
    }

	this.location = location;
	//     000
	// 270  -  090
	//     180
	this.yaw = yawAngle ? yawAngle : 0;
	//     090
	// 180  -  000
	//     270
	this.pitch = pitchAngle ? pitchAngle : 0;

    /**
     * @param {Array} instrList
     * @param {Scene} scene
     */
    this.render = function(instrList, scene){
        scene.render(instrList, this);
    };
};

var Scene = function(){
	var renderList = [];
	/**
	 * @param {Renderable} r
	 */
	this.addRenderable = function(r){
		renderList.push(r);
	};
	/**
	 * @param {Camera} camera
	 */
	this.render = function(instrList, camera){
		renderList.forEach(function(r){
			r.render(instrList, camera);
		});
	};
};

/**
 * @param {*} obj
 * @param {function} render
 * @constructor
 */
var Renderable = function(obj, render){
	// clone obj
	for(var key in obj){
		if(obj.hasOwnProperty(key)){
			this[key] = obj[key];
		}
	}
	// decorate
	/**
	 * @param {Camera} camera
	 */
	this.render = function(ctx, camera){
		render(ctx, camera);
	}
};
