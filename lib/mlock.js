//内存锁
'use strict';

var cache = require('./cache/mcache');

function mlock(key) { this.key = key; };

//锁结束
mlock.prototype.end = function () { cache.delete(this.key).done(); };

//锁开始
exports.start = function (key, lifetime) {
	return cache.get(key).then(function(result) {
		if (result === 1) return false;

		cache.set(key, 1, lifetime || 10).done();
		return new mlock(key);
	});
};