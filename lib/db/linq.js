//linq orm
'use strict';

var util = require('util');
var promise = require('bluebird');

var db = require('./database');
var tool = require('../../lib/tool');

//重组字段
function fieldsSplit(list, fields, begin, end) {
	begin = begin || '';
	var alias = null, field = null;
	if (tool.isString(fields)) {
		fields = fields.split(',');
		for(var i = 0, len = fields.length; i < len; i++) {
			field = fields[i]; alias = field.split('.');
			alias = end ? (end + ' ' + (field === '*' ? 'count' : alias[alias.length-1])) : '';
			list.push(begin + field + alias);
		}
	} else if (util.isArray(fields)) {
		for(var i = 0, len = fields.length; i < len; i++) {
			field = fields[i]; alias = field.split('.');
			alias = end ? (end + ' ' + (field === '*' ? 'count' : alias[alias.length-1])) : '';
			list.push(begin + fields + alias);
		}
	}
	return list;
};
//合并where
function whereJoin(params, list) {
	var val = null, where = '';
	for(var i = 0, len = list.length; i < len; i++) {
		val = list[i];
		if (val.value) {
			if (val.op.indexOf(' in ') != -1)
				where += util.format('%s%s%s%s(?)%s', val.type, val.begin, val.key, val.op, val.end);
			else
				where += util.format('%s%s%s%s?%s', val.type, val.begin, val.key, val.op, val.end);
			params.push(val.value);
		} else where += util.format('%s%s%s%s', val.type, val.begin, val.key, val.end);
	}
	return where;
};
//重组where
function whereObject(type) {
	var val = { begin: '', end: '', type: '' };
	switch (type) {
		case 1: val.type = ' and '; break;
		case 2: val.type = ' and '; val.begin = ' ('; break;
		case 3: val.type = ' and '; val.end = ') '; break;
		case 4: val.type = ' or '; break;
		case 5: val.type = ' or '; val.begin = ' ('; break;
		case 6: val.type = ' or '; val.end = ') '; break;
	}
	return val;
};
//分解where
function whereSplit(list, wheres, type) {
	if (!list) list = [];
	var where = null, val = null, index1 = 0, index2 = 0;
	if (tool.isObject(wheres)) {
		for(var key in wheres) {
			where = wheres[key];
			if (tool.isObject(where)) {
				index2 = 0;
				for(var key2 in where) {
					val = whereObject(index2 == 0 ? type : 1);
					val.op = ' ' + key2 + ' '; val.value = where[key2]; val.key = key;
					list.push(val);
					index2++;
				}
			} else {
				val = whereObject(index1 == 0 ? type : 1);
				val.op = ' = '; val.key = key; val.value = where;
				list.push(val);
			}
			index1++;
		}
	} else if (tool.isString(wheres)) {
		val = whereObject(type);
		val.key = wheres;
		list.push(val);
	}
};

//LINQ解析
function linq(tableName, alias) {
	this._fieldList = [];
	this._groupList = [];
	this._orderList = [];
	this._joinList = [];
	this._setList = [];
	this._whereList = [];
	this._onwhereList = {};
	this._hvwhereList = [];
	this._operate = 0;
	this._distinctFlag = false;
	this._whereFlag = 0;
	this._onFlag = 0;
	this._limit = '';
	this._tableName = tableName;
	if (alias) this._tableName += ' as ' + alias;
};

//生成SQL
linq.prototype.toSql = function (code) {
	var sql = null, params = [], val = null, set = '', where = '';
	switch (this._operate) {
		case 1:
			if (this._setList.length === 0) break;
			//params.push(this._tableName);
			for(var i = 0, len = this._setList.length; i < len; i++) {
				val = this._setList[i];
				if (val.value) {
					set += util.format('%s=?,', val.key);
					params.push(val.value);
				} else set += util.format('%s,', val.key);
			}
			sql = util.format('insert into %s set %s', this._tableName, tool.rtrim(set, ','));
			if (code) return { sql: sql, params: params };
			return db.insert(sql, params);
		case 2:
			if (this._whereList.length === 0) break;
			//params.push(this._tableName);
			where = whereJoin(params, this._whereList);
			sql = util.format('delete from %s where %s', this._tableName, where);
			if (code) return { sql: sql, params: params };
			return db.delete(sql, params);
		case 3:
			if (this._setList.length === 0 || this._whereList.length === 0) break;
			//params.push(this._tableName);
			for(var i = 0, len = this._setList.length; i < len; i++) {
				val = this._setList[i];
				if (val.value) {
					set += util.format('%s=?,', val.key);
					params.push(val.value);
				} else set += util.format('%s,', val.key);
			}
			where = whereJoin(params, this._whereList);
			sql = util.format('update %s set %s where %s', this._tableName, tool.rtrim(set, ','), where);
			if (code) return { sql: sql, params: params };
			return db.update(sql, params);
		case 7:
			if (code) return { list: this.toList(code), count: this.count(code) };
			return promise.props({ list: this.toList(), count: this.count() });
			break;
		default:
			sql = 'select ';
			if (this._distinctFlag) sql += 'distinct ';
			if (this._fieldList.length === 0) {
				if (this._operate === 4) fieldsSplit(this._fieldList, '*', 'count(', ')');
				else fieldsSplit(this._fieldList, '*');
			}
			for(var i in this._fieldList) sql += this._fieldList[i] + ',';
			sql = tool.rtrim(sql, ',') + ' from ' + this._tableName + ' ';
			//params.push(this._tableName);
			if (this._joinList.length > 0) {
				for(var i = 0, len = this._joinList.length; i < len; i++) {
					sql += this._joinList[i];
					sql += ' on ' + whereJoin(params, this._onwhereList[i]);
				}
			}
			if (this._whereList.length > 0) sql += ' where ' + whereJoin(params, this._whereList);

			if (this._groupList.length > 0) {
				sql += ' group by ';
				for(var i = 0, len = this._groupList.length; i < len; i++) sql += this._groupList[i] + ','
				sql = tool.rtrim(sql, ',');
				if (this._hvwhereList.length > 0) sql += ' having ' + whereJoin(params, this._hvwhereList);
			}
			if (this._orderList.length > 0) {
				sql += ' order by ';
				for(var i = 0, len = this._orderList.length; i < len; i++) sql += this._orderList[i] + ','
				sql = tool.rtrim(sql, ',');
			}
			if (this._limit != '' && this._operate != 4) sql += this._limit;
			if (code) return { sql: sql, params: params };
			if (this._operate === 4 || this._operate === 6) return db.first(sql, params);
			else return db.query(sql, params);
	};
};
//选择字段
linq.prototype.select = function () { if (arguments.length === 0) fieldsSplit(this._fieldList, '*'); else for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this._fieldList, arguments[i]); return this; };
//分组
linq.prototype.groupBy = function() { for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this._groupList, arguments[i]); return this; };
//排序
linq.prototype.orderBy = function() { for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this._orderList, arguments[i]); return this; };
//求和
linq.prototype.sum = function() { for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this._fieldList, arguments[i], 'sum(', ')'); return this; };
//平均值
linq.prototype.avg = function() { for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this._fieldList, arguments[i], 'avg(', ')'); return this; };
//分页
linq.prototype.limit = function(limit, offset) { if (limit && limit>0) { this._limit = ' limit ' + limit; if (offset) this._limit += ' offset ' + offset; }; return this; };
//去重复
linq.prototype.distinct = function(){ this._distinctFlag = true; return this; };

//求记录数
linq.prototype.count = function(code) {
	if (arguments.length === 0 || arguments.length === 1) {
		this._fieldList.splice(0, this._fieldList.length);
		fieldsSplit(this._fieldList, '*', 'count(', ')');
		this._operate = 4;
		return this.toSql(arguments.length === 1 && code ? code : null);
	} else for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this._fieldList, arguments[i]);
	return this;
};
//添加
linq.prototype.insert = function (code) { this._operate = 1; return this.toSql(code); };
//删除
linq.prototype.delete = function (code) { this._operate = 2; return this.toSql(code); };
//更新
linq.prototype.update = function (code) { this._operate = 3; return this.toSql(code); };
//取记录集
linq.prototype.toList = function (code) { this._operate = 5; return this.toSql(code); };
//只取第一条记录
linq.prototype.first = function (code) { this._operate = 6;	return this.toSql(code); };
//分页
linq.prototype.toPage = function (page, pageSize, code) { this._operate = 7; this.limit(pageSize, (page - 1) * pageSize); return this.toSql(code); };
//inner join
linq.prototype.innerJoin = function(table, alias) { fieldsSplit(this._joinList, ' inner join ' + table + (alias ? (' as ' + alias) : '')); this._onFlag++; return this; };
//left join
linq.prototype.leftJoin = function(table, alias) { fieldsSplit(this._joinList, ' left join ' + table + (alias ? (' as ' + alias) : '')); this._onFlag++; return this; };
//right join
linq.prototype.rightJoin = function(table, alias) { fieldsSplit(this._joinList, ' right join ' + table + (alias ? (' as ' + alias) : '')); this._onFlag++; return this; };
//修改数据
linq.prototype.set = function() {
	var arg = null;
	for(var i = 0, len = arguments.length; i < len; i++) {
		arg = arguments[i];
		if (tool.isString(arg)) {
			this._setList.push({key: arg});
		} else if (tool.isObject(arg)) {
			for(var key in arg) this._setList.push({key: key, value: arg[key]});
		}
	}
	return this;
};
//条件
linq.prototype.where = function() { this._whereFlag = 0; for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereList, arguments[i], 0); return this; };
//链接条件
linq.prototype.on = function() { this._whereFlag = 1; for(var i = 0, len = arguments.length; i < len; i++) { this._onwhereList[this._onFlag-1] = []; whereSplit(this._onwhereList[this._onFlag-1], arguments[i], 0); }; return this; };
//分组条件
linq.prototype.having = function() { this._whereFlag = 2; for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._hvwhereList, arguments[i], 0); return this; };
//and条件
linq.prototype.and = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereFlag === 1 ? this._onwhereList[this._onFlag-1] : (this._whereFlag === 2 ? this._hvwhereList : this._whereList), arguments[i], 1); return this; };
//and条件开始
linq.prototype.andBegin = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereFlag === 1 ? this._onwhereList[this._onFlag-1] : (this._whereFlag === 2 ? this._hvwhereList : this._whereList), arguments[i], 2); return this; };
//and条件结束
linq.prototype.andEnd = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereFlag === 1 ? this._onwhereList[this._onFlag-1] : (this._whereFlag === 2 ? this._hvwhereList : this._whereList), arguments[i], 3); return this; };
//or条件
linq.prototype.or = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereFlag === 1 ? this._onwhereList[this._onFlag-1] : (this._whereFlag === 2 ? this._hvwhereList : this._whereList), arguments[i], 4); return this; };
//or条件开始
linq.prototype.orBegin = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereFlag === 1 ? this._onwhereList[this._onFlag-1] : (this._whereFlag === 2 ? this._hvwhereList : this._whereList), arguments[i], 5); return this; };
//or条件结束
linq.prototype.orEnd = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereFlag === 1 ? this._onwhereList[this._onFlag-1] : (this._whereFlag === 2 ? this._hvwhereList : this._whereList), arguments[i], 6); return this; };

module.exports = linq;