//数据库操作
'use strict';

var linq = require('./db/linq');
var database = require('./db/database');

//linq
exports.from = function(tableName, alias) { return new linq(tableName, alias); };

//查询记录集
exports.query = function (sql, values) { return database.query(sql, values); };
//查询单条记录
exports.first = function (sql, values) { return database.first(sql, values); };
//更新
exports.update = function (sql, values) { return database.update(sql, values); };
//删除
exports.delete = function (sql, values) { return database.delete(sql, values); };
//添加
exports.insert = function (sql, values) { return database.insert(sql, values); };
