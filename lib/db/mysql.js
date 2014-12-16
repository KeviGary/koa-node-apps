//加载mysql数据库
var mysql = require('mysql');
//加载mysql数据库配置文件
var config = appConfig('mysql');

//mysql数据库
function mysqlDb() {
	//使用pool
	this.pool  = mysql.createPool(config);
};

//查询
mysqlDb.prototype.select = function(sql, values, cb) { return this.pool.query(sql, values, cb); };
//更新
mysqlDb.prototype.update = function(sql, values, cb) { return this.pool.query(sql, values, cb); };
//删除
mysqlDb.prototype.delete = function(sql, values, cb) { return this.pool.query(sql, values, cb); };
//添加
mysqlDb.prototype.insert = function(sql, values, cb) { return this.pool.query(sql, values, cb); };

module.exports = new mysqlDb();