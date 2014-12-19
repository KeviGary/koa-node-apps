'use strict';

//重组字段
function fieldsSplit(list, fields, begin, end) {
	begin = begin || '';
	var alias = null, field = null;
	if (isString(fields)) {
		fields = fields.split(',');
		for(var i = 0, len = fields.length; i < len; i++) {
			field = fields[i]; alias = field.split('.');
			alias = end ? (end + ' ' + (field === '*' ? 'count' : alias[alias.length-1])) : '';
			list.push(begin + field + alias);
		}
	} else if (isArray(fields)) {
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
				where += '{0}{1}{2}{3}(?){4}'.format(val.type, val.begin, val.key, val.op, val.end);
			else
				where += '{0}{1}{2}{3}?{4}'.format(val.type, val.begin, val.key, val.op, val.end);
			params.push(val.value);
		} else where += '{0}{1}{2}{3}'.format(val.type, val.begin, val.key, val.end);
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
	if (isObject(wheres)) {
		for(var key in wheres) {
			where = wheres[key];
			if (isObject(where)) {
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
	} else if (isString(wheres)) {
		val = whereObject(type);
		val.key = wheres;
		list.push(val);
	}
};

//LINQ解析
function linqParse(tableName, alias) {
	var me = this;
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
	if (alias) tableName += ' as ' + alias;

	//生成SQL
	this.toSql = function (cb, destroy) {
		var sql = null, params = [], val = null, set = '', where = '';
		switch (this._operate) {
			case 1:
				if (this._setList.length === 0) break;
				params.push(tableName);
				for(var i = 0, len = this._setList.length; i < len; i++) {
					val = this._setList[i];
					if (val.value) {
						set += '{0}=?,'.format(val.key);
						params.push(val.value);
					} else set += '{0},'.format(val.key);
				}
				sql = 'insert into {0} set {1}'.format('??', set.rtrim(','));
				if (!cb) break;
				db.insert(sql, params, function(err, result) { cb(err, result); });
				break;
			case 2:
				if (this._whereList.length === 0) break;
				params.push(tableName);
				where = whereJoin(params, this._whereList);
				sql = 'delete from {0} where {1}'.format('??', where);
				if (!cb) break;
				db.delete(sql, params, function(err, result) { cb(err, result); });
				break;
			case 3:
				if (this._setList.length === 0 || this._whereList.length === 0) break;
				params.push(tableName);
				for(var i = 0, len = this._setList.length; i < len; i++) {
					val = this._setList[i];
					if (val.value) {
						set += '{0}=?,'.format(val.key);
						params.push(val.value);
					} else set += '{0},'.format(val.key);
				}
				where = whereJoin(params, this._whereList);
				sql = 'update {0} set {1} where {2}'.format('??', set.rtrim(','), where);
				if (!cb) break;
				db.update(sql, params, function(err, result) { cb(err, result); });
				break;
			case 7:
				async.waterfall([
					function(callback){
						me.toList(function(err, result){ callback(null, err, result); }, false);
					},
					function(err, list, callback) {
						if (err) { callback(null, null, null); return false; };
						me.count(function(err, result){ callback(null, list, result); });
					}
				], function (err, l, c) {
					if (err || !l || !c) { cb(err, null); return false; };
					cb(err, { count: c.count, list: l });
				});
				break;
			default:
				sql = 'select ';
				if (this._distinctFlag) sql += 'distinct ';
				if (this._fieldList.length === 0) {
					if (this._operate === 4) fieldsSplit(this._fieldList, '*', 'count(', ')');
					else fieldsSplit(this._fieldList, '*');
				}
				for(var i in this._fieldList) sql += this._fieldList[i] + ',';
				sql = sql.rtrim(',') + ' from ?? ';
				params.push(tableName);
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
					sql = sql.rtrim(',');
					if (this._hvwhereList.length > 0) sql += ' having ' + whereJoin(params, this._hvwhereList);
				}
				if (this._orderList.length > 0) {
					sql += ' order by ';
					for(var i = 0, len = this._orderList.length; i < len; i++) sql += this._orderList[i] + ','
					sql = sql.rtrim(',');
				}
				if (this._limit != '' && this._operate != 4) sql += this._limit;

				if (!cb) break;
				if (this._operate === 4 || this._operate === 6) db.select(sql, params, function(err, result) { cb(err, (!err && result.length > 0) ? result[0] : null); });
				else db.select(sql, params, function(err, result) { cb(err, result); });
				break;
		};
		sql = sql ? { sql: sql, 'params': params } : null;
		if (destroy) this.destroy();
		return sql;
	};
	//释放
	this.destroy = function() { for(var key in this) delete this[key]; };
	//选择字段
	this.select = function () { if (arguments.length === 0) fieldsSplit(this._fieldList, '*'); else for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this._fieldList, arguments[i]); return me; };
	//分组
	this.groupBy = function() { for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this._groupList, arguments[i]); return me; };
	//排序
	this.orderBy = function() { for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this._orderList, arguments[i]); return me; };
	//求和
	this.sum = function() { for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this._fieldList, arguments[i], 'sum(', ')'); return me; };
	//平均值
	this.avg = function() { for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this._fieldList, arguments[i], 'avg(', ')'); return me; };
	//分页
	this.limit = function(limit, offset) { if (limit && limit>0) { this._limit = ' limit ' + limit; if (offset) this._limit += ' offset ' + offset; }; return me; };
	//求记录数
	this.count = function(){
		if (arguments.length === 0 || arguments.length === 1) {
			this._fieldList.splice(0, this._fieldList.length);
			fieldsSplit(this._fieldList, '*', 'count(', ')');
			this._operate = 4;
			return me.toSql(arguments.length === 1 && isFunction(arguments[0]) ? arguments[0] : null, true);
		} else for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this._fieldList, arguments[i]);
		return me;
	};
	//去重复
	this.distinct = function(){ this._distinctFlag = true; return me; };
	//添加
	this.insert = function(cb, destroy) { this._operate = 1; return me.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
	//删除
	this.delete = function(cb, destroy) { this._operate = 2; return me.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
	//更新
	this.update = function(cb, destroy) { this._operate = 3; return me.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
	//取记录集
	this.toList = function(cb, destroy) { this._operate = 5; return me.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
	//只取第一条记录
	this.first = function(cb, destroy) { this._operate = 6;	return me.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
	//分页
	this.toPage = function(page, pageSize, cb) { this._operate = 7; this.limit(pageSize, (page - 1) * pageSize); return me.toSql(cb); };
	//inner join
	this.innerJoin = function(table, alias) { fieldsSplit(this._joinList, ' inner join ' + table + (alias ? (' as ' + alias) : '')); this._onFlag++; return me; };
	//left join
	this.leftJoin = function(table, alias) { fieldsSplit(this._joinList, ' left join ' + table + (alias ? (' as ' + alias) : '')); this._onFlag++; return me; };
	//right join
	this.rightJoin = function(table, alias) { fieldsSplit(this._joinList, ' right join ' + table + (alias ? (' as ' + alias) : '')); this._onFlag++; return me; };
	//修改数据
	this.set = function() {
		var arg = null;
		for(var i = 0, len = arguments.length; i < len; i++) {
			arg = arguments[i];
			if (isString(arg)) {
				this._setList.push({key: arg});
			} else if (isObject(arg)) {
				for(var key in arg) this._setList.push({key: key, value: arg[key]});
			}
		}
		return me;
	};
	//条件
	this.where = function() { this._whereFlag = 0; for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereList, arguments[i], 0); return me; };
	//链接条件
	this.on = function() { this._whereFlag = 1; for(var i = 0, len = arguments.length; i < len; i++) { this._onwhereList[this._onFlag-1] = []; whereSplit(this._onwhereList[this._onFlag-1], arguments[i], 0); }; return me; };
	//分组条件
	this.having = function() { this._whereFlag = 2; for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._hvwhereList, arguments[i], 0); return me; };
	//and条件
	this.and = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereFlag === 1 ? this._onwhereList[this._onFlag-1] : (this._whereFlag === 2 ? this._hvwhereList : this._whereList), arguments[i], 1); return me; };
	//and条件开始
	this.andBegin = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereFlag === 1 ? this._onwhereList[this._onFlag-1] : (this._whereFlag === 2 ? this._hvwhereList : this._whereList), arguments[i], 2); return me; };
	//and条件结束
	this.andEnd = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereFlag === 1 ? this._onwhereList[this._onFlag-1] : (this._whereFlag === 2 ? this._hvwhereList : this._whereList), arguments[i], 3); return me; };
	//or条件
	this.or = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereFlag === 1 ? this._onwhereList[this._onFlag-1] : (this._whereFlag === 2 ? this._hvwhereList : this._whereList), arguments[i], 4); return me; };
	//or条件开始
	this.orBegin = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereFlag === 1 ? this._onwhereList[this._onFlag-1] : (this._whereFlag === 2 ? this._hvwhereList : this._whereList), arguments[i], 5); return me; };
	//or条件结束
	this.orEnd = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this._whereFlag === 1 ? this._onwhereList[this._onFlag-1] : (this._whereFlag === 2 ? this._hvwhereList : this._whereList), arguments[i], 6); return me; };

};

module.exports = linqParse;