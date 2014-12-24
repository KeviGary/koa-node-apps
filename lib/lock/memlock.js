'use strict';

//内存锁
function memlock() {
	this.cache = {};
};

//锁开始
memlock.prototype.start = function(key, lifetime) {
	lifetime = lifetime || 10;
	var now = Math.round(+new Date()/1000);
	if (this.cache[key] && (this.cache[key] + lifetime > now)) return true;
	this.cache[key] = now;
	return false;
};

//锁结束
memlock.prototype.end = function(key) {
	delete this.cache[key];
};

module.exports = new memlock();