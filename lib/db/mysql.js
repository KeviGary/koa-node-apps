//mysql db
'use strict';

//加载mysql数据库
var mysql = require('mysql');
var promise = require('bluebird');
//加载mysql数据库配置文件
var config = require('../../config');
var logger = require('../logger');

//mysql数据库
function mysqlDb() {
	//使用pool
	this.pool  = mysql.createPool(config.mysql);
};

//查询记录集
mysqlDb.prototype.query = function(sql, values) {
	var p = promise.defer();
	this.pool.query(sql, values, function(err, results) {
		if (err) logger.error(err.stack);
		p.resolve(results);
	});
	return p.promise;
};
//查询单条记录
mysqlDb.prototype.first = function(sql, values) {
	var p = promise.defer();
	this.pool.query(sql, values, function(err, result) {
		if (err) logger.error(err.stack);
		p.resolve(result && result[0] ? result[0] : null);
	});
	return p.promise;
};
//更新
mysqlDb.prototype.update = function(sql, values) {
	var p = promise.defer();
	this.pool.query(sql, values, function(err, result) {
		if (err) logger.error(err.stack);
		p.resolve(result && result.affectedRows > 0 ? { rows: result.changedRows } : false);
	});
	return p.promise;
};
//删除
mysqlDb.prototype.delete = function(sql, values) {
	var p = promise.defer();
	this.pool.query(sql, values, function(err, result) {
		if (err) logger.error(err.stack);
		p.resolve(result ? { rows: result.affectedRows } : false);
	});
	return p.promise;
};
//添加
mysqlDb.prototype.insert = function(sql, values) {
	var p = promise.defer();
	this.pool.query(sql, values, function(err, result) {
		if (err) logger.error(err.stack);
		p.resolve(result && result.affectedRows > 0 ? { rows: result.affectedRows, id: result.insertId } : false);
	});
	return p.promise;
};

module.exports = new mysqlDb();