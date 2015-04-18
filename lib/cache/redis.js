//redis
'use strict';

//加载redis缓存库
var redis = require('redis');
//加载redis缓存配置文件
var config = require('../../config').redis;
var logger = require('../logger');

//redis缓存
function redisCache() {
	this.client = redis.createClient(config.redis_port, config.redis_host);
	this.client.on("error", function (err) { logger.error(err.stack); });
};

//取数据
redisCache.prototype.get = function (key) {
	var p = promise.defer();
	this.client.get(config.prefix + key, function (err, result) {
		if (err) logger.error(err.stack);
		p.resolve(JSON.parse(result));
	});
	return p.promise;
};

//存数据
redisCache.prototype.set = function (key, value, lifetime) {
	var p = promise.defer();
	this.client.set(config.prefix + key, JSON.stringify(value), function (err, result) {
		if (err) logger.error(err.stack);
		p.resolve(true);
	}, lifetime);
	return p.promise;
};

//删除数据
redisCache.prototype.delete = function (key) {
	var p = promise.defer();
	this.client.del(config.prefix + key, function (err, result) {
		if (err) logger.error(err.stack);
		p.resolve(true);
	});
	return p.promise;
};

//匹配所有keys
redisCache.prototype.keys = function (key) {
	var p = promise.defer();
	this.client.keys(config.prefix + key, function (err, result) {
		if (err) logger.error(err.stack);
		p.resolve(result);
	});
	return p.promise;
};

//清空数据
redisCache.prototype.flushall = function () {
	var p = promise.defer();
	this.client.flushall(function (err, result) {
		if (err) logger.error(err.stack);
		p.resolve(true);
	});
	return p.promise;
};

module.exports = new redisCache();