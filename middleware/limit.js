//限制访问中间件 var config = { limit:1000, interval:1000 * 60 * 60 * 24, whiteList:[], blackList:[], token:'', message:'请求频率限制' }
'use strict';

var limit = require('koa-limit');

module.exports = function (config) {
	if (config) return function* (next) {
		yield limit(config);
	}; else return function* (next) {
		yield *next;
	};
};
