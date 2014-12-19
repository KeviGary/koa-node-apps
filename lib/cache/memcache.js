'use strict';

//加载memcache缓存库
var memcache = require('memcache');
//加载memcache缓存配置文件
var config = appConfig('memcache');

//memcache缓存
function memcacheCache() {
	this.client = new memcache.Client(config.memcache_port, config.memcache_host);
	this.client.connect();
};

//取数据
memcacheCache.prototype.get = function (key, cb) {
	this.client.get(config.prefix + key, function (err, result) {
		cb(err, JSON.parse(result));
	});
};

//存数据
memcacheCache.prototype.set = function (key, value, lifetime, cb) {
	this.client.set(config.prefix + key, JSON.stringify(value), function (err, result) {
		cb(err, result);
	}, lifetime);
};

//删除数据
memcacheCache.prototype.delete = function (key, cb) {
	this.client.delete(config.prefix + key, function (err, result) {
		cb(err, result);
	});
};

module.exports = new memcacheCache();