//memory cache
'use strict';

var promise = require('bluebird');

var mem = require('../../data/metedata').memoryCache;
var config = require('../../config').mcache;
var tool = require('../../lib/tool');

var index = 0;

function mcache() { };

function _get(key, cb) {
	var result = null;
	if (mem[key]) {
		var end = mem[key].end;
		var now = tool.unixTime();
		if (end >= now) result = mem[key].data; else delete mem[key];
	}
	cb(result);
};
//取数据
mcache.prototype.get = function (key) {
	var p = promise.defer();
	_get(config.prefix + key, function(result) { p.resolve(result); });
	return p.promise;
};

function _set(key, value, lifetime, cb) {
	var now = tool.unixTime();
	mem[key] = { end: now + lifetime, data: value };
	cb(true);
};
//存数据
mcache.prototype.set = function (key, value, lifetime) {
	var p = promise.defer();
	_set(config.prefix + key, value, lifetime || (86400 * 30), function(result) {
		p.resolve(result);
		if (index > config.clear) _clear();
		index++;
	});
	return p.promise;
};

function _delete (key, cb){
	delete mem[key];
	cb(true);
};
//删除数据
mcache.prototype.delete = function (key) {
	var p = promise.defer();
	_delete(config.prefix + key, function(result) { p.resolve(result); });
	return p.promise;
};

function _keys (key, cb){
	var now = tool.unixTime();
	var keys = [];
	for (var k in mem) {
		if (tool.test(key, k))
			if (mem[k].end >= now) keys.push(k); else delete mem[k];
	}
	cb(keys);
};
//匹配所有keys
mcache.prototype.keys = function (key) {
	var p = promise.defer();
	_keys(config.prefix + key, function(result) { p.resolve(result); });
	return p.promise;
};

function _flushall(cb) {
	for (var k in mem) delete mem[k];
	cb(true);
};
//清空数据
mcache.prototype.flushall = function () {
	var p = promise.defer();
	_flushall(function(result) { p.resolve(result); });
	return p.promise;
};

function _clear() {
	var now = tool.unixTime();
	for (var k in mem) if (mem[k].end < now) delete mem[k];
	index = 0;
};

module.exports = new mcache();