//sqlite3 db
'use strict';

//加载sqlite数据库
var sqlite = require('sqlite3');
var promise = require('bluebird');
//加载sqlite数据库配置文件
var config = require('../../config');
var logger = require('../logger');

//sqlite数据库
function sqliteDb() {
	this.db = new sqlite.Database(config.sqlite3);
};

//查询记录集
sqliteDb.prototype.query = function(sql, values) {
	var p = promise.defer();
	this.db.all(sql, values, function(err, results) {
		if (err) logger.error(err.stack);
		p.resolve(results);
	});
	return p.promise;
};
//查询单条记录
sqliteDb.prototype.first = function(sql, values) {
	var p = promise.defer();
	this.db.all(sql, values, function(err, result) {
		if (err) logger.error(err.stack);
		p.resolve(result && result[0] ? result[0] : null);
	});
	return p.promise;
};
//更新
sqliteDb.prototype.update = function(sql, values) {
	var p = promise.defer();
	this.db.run(sql, values, function(err, result) {
		if (err) logger.error(err.stack);
		p.resolve(this && this.changes > 0 ? { rows: this.changes } : false);
	});
	return p.promise;
};
//删除
sqliteDb.prototype.delete = function(sql, values) {
	var p = promise.defer();
	this.db.run(sql, values, function(err) {
		if (err) logger.error(err.stack);
		p.resolve(this && this.changes > 0 ? { rows: this.changes } : false);
	});
	return p.promise;
};
//添加
sqliteDb.prototype.insert = function(sql, values) {
	var p = promise.defer();
	this.db.run(sql, values, function(err) {
		if (err) logger.error(err.stack);
		p.resolve(this && this.changes > 0 ? { rows: this.changes, id: this.lastID } : false);
	});
	return p.promise;
};

module.exports = new sqliteDb();