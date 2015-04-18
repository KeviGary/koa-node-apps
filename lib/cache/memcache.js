//memcache
'use strict';

//加载memcache缓存库
var memcache = require('memcache');
var promise = require('bluebird');
//加载memcache缓存配置文件
var config = require('../../config').memcache;
var logger = require('../logger');

//memcache缓存
function memcacheCache() {
	this.client = new memcache.Client(config.memcache_port, config.memcache_host);
	this.client.connect();
};

//取数据
memcacheCache.prototype.get = function (key) {
	var p = promise.defer();
	this.client.get(config.prefix + key, function (err, result) {
		if (err) logger.error(err.stack);
		p.resolve(JSON.parse(result));
	});
	return p.promise;
};

//存数据
memcacheCache.prototype.set = function (key, value, lifetime) {
	var p = promise.defer();
	this.client.set(config.prefix + key, JSON.stringify(value), function (err, result) {
		if (err) logger.error(err.stack);
		p.resolve(result === 'STORED' ? true : false);
	}, lifetime);
	return p.promise;
};

//删除数据
memcacheCache.prototype.delete = function (key) {
	var p = promise.defer();
	this.client.delete(config.prefix + key, function (err, result) {
		p.resolve(result);
	});
	return p.promise;
};

//匹配所有keys
memcacheCache.prototype.keys = function (key) {
	var p = promise.defer();
	return p.promise;
};

//清空数据
memcacheCache.prototype.flushall = function () {
	var p = promise.defer();
	return p.promise;
};

module.exports = new memcacheCache();