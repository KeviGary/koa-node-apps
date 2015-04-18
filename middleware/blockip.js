//屏蔽IP中间件
'use strict';

module.exports = function (ips) {
	return function* (next) {
		var ip = this.ip;
    	var pass = !ips ? true : false;
		if (!pass && Array.isArray(ips)) pass = !ips.some(function (item) { return RegExp(item).test(ip); });
		if (!pass) return false;
		yield next;
	};
};
