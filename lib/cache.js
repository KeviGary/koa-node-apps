//加载配置文件中的cache
'use strict';

var cache = require('./cache/' + require('../config').cache);

//取数据
exports.get = function (key) { return cache.get(key); };

//存数据
exports.set = function (key, value, lifetime) { return cache.set(key, value, lifetime); };

//删除数据
exports.delete = function (key) { return cache.delete(key); };

//匹配所有keys
exports.keys = function (key) { return cache.keys(key); };

//清空数据
exports.flushall = function () { return cache.flushall(); };

//删除数据
exports.cacheDelete = function(model, func, params) {
	var key = model.name + '_' + func + '_' + params.join('_');
	return cache.delete(key);
};

//取数据
exports.cacheGet = function(model, func, params, lifetime) {
	var key = model.name + '_' + func + '_' + params.join('_');
	var cacheData = true;
	return cache.get(key).then(function(list) {
		if (list) return list;
		cacheData = false;
		return model[func].apply(null, params);
	}).then(function(result) {
		if (!cacheData) { cacheData = result; return cache.set(key, result, lifetime); }
		return result;
	}).then(function(result) {
		if (result === true) return cacheData;
		return result;
	});
};

