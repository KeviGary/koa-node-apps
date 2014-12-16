//LINQ

//重组字段
function fieldsSplit(list, fields, begin, end) {
	begin = begin || '';
	var alias = null, field = null;
	if (isString(fields)) {
		fields = fields.split(',');
		for(var i in fields) {
			field = fields[i]; alias = field.split('.');
			alias = end ? (end + ' ' + (field === '*' ? 'count' : alias[alias.length-1])) : '';
			list.push(begin + field + alias);
		}
	} else if (isArray(fields)) {
		for(var i in fields) {
			field = fields[i]; alias = field.split('.');
			alias = end ? (end + ' ' + (field === '*' ? 'count' : alias[alias.length-1])) : '';
			list.push(begin + fields + alias);
		}
	}
	alias = null; field = null; begin = null; end = null; fields = null;
	delete alias; delete field; delete begin; delete end; delete fields;
	return list;
};
//合并where
function whereJoin(params, list) {
	var val = null, where = '';
	for(var i in list) {
		val = list[i];
		if (val.value) {
			where += '{0}{1}{2}{3}?{4}'.format(val.type, val.begin, val.key, val.op, val.end);
			params.push(val.value);
		} else where += '{0}{1}{2}{3}'.format(val.type, val.begin, val.key, val.end);
	}
	val = null; list = null;
	delete val; delete list;
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
					val.op = ' ' + key2 + ' '; val.key = key; val.value = where[key2];
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
	val = null, index1 = null, index2 = null;
	delete val; delete index1; delete index2;
	return list;
};

//LINQ解析
function linqParse(tableName) {
	this.tableName = tableName;
	this.fieldList = [];
	this.groupList = [];
	this.orderList = [];
	this.joinList = [];
	this.onList = {};
	this.setList = [];
	this.whereList = [];
	this.onwhereList = [];
	this.hvwhereList = [];
	this.op = 0;
	this.bdistinct = false;
	this.iwhere = 0;
	this.ion = 0;
	this.limits = '';
};
//生成SQL
linqParse.prototype.toSql = function (cb, destroy) {
	var sql = null, params = [], val = null, set = '', where = '';
	switch (this.op) {
		case 1:
			if (this.setList.length === 0) break;
			params.push(this.tableName);
			for(var i in this.setList) {
				val = this.setList[i];
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
			if (this.whereList.length === 0) break;
			params.push(this.tableName);
			where = whereJoin(params, this.whereList);
			sql = 'delete from {0} where {1}'.format('??', where);
			if (!cb) break;
			db.delete(sql, params, function(err, result) { cb(err, result); });
			break;
		case 3:
			if (this.setList.length === 0 || this.whereList.length === 0) break;
			params.push(this.tableName);
			for(var i in this.setList) {
				val = this.setList[i];
				if (val.value) {
					set += '{0}=?,'.format(val.key);
					params.push(val.value);
				} else set += '{0},'.format(val.key);
			}
			where = whereJoin(params, this.whereList);
			sql = 'update {0} set {1} where {2}'.format('??', set.rtrim(','), where);
			if (!cb) break;
			db.update(sql, params, function(err, result) { cb(err, result); });
			break;
		default:
			sql = 'select ';
			if (this.bdistinct) sql += 'distinct ';
			if (this.fieldList.length === 0) {
				if (this.op === 4) fieldsSplit(this.fieldList, '*', 'count(', ')');
				else fieldsSplit(this.fieldList, '*');
			}
			for(var i in this.fieldList) sql += this.fieldList[i] + ',';
			sql = sql.rtrim(',') + ' from ?? ';
			params.push(this.tableName);
			if (this.joinList.length > 0) {
				for(var i in this.joinList) {
					sql += this.joinList[i];
					sql += ' on ' + whereJoin(params, this.onwhereList[i]);
				}
			}
			if (this.whereList.length > 0) {
				sql += ' where ' + whereJoin(params, this.whereList);
				if (this.groupList.length > 0) {
					sql += ' group by ';
					for(var i in this.groupList) sql += this.groupList[i] + ','
					sql = sql.rtrim(',');
					if (this.hvwhereList.length > 0) sql += ' having ' + whereJoin(params, this.hvwhereList);
				}
				if (this.orderList.length > 0) {
					sql += ' order by ';
					for(var i in this.orderList) sql += this.orderList[i] + ','
					sql = sql.rtrim(',');
				}
				if (this.limits != '') sql += this.limits;
			};
			if (!cb) break;
			if (this.op === 4 || this.op === 6)
				db.select(sql, params, function(err, result) { cb(err, (!err && result.length > 0) ? result[0] : null); });
			else db.select(sql, params, function(err, result) { cb(err, result); });
			break;
	};
	sql = sql ? { sql: sql, 'params': params } : null;
	params = null, val = null, set = null, where = null;
	delete params; delete val, delete set, delete where;
	if (destroy) this.destroy();
	return sql;
};
//释放
linqParse.prototype.destroy = function() {
	this.fieldList = null; this.groupList = null; this.orderList = null; this.joinList = null; this.setList = null; this.whereList = null;
	this.onwhereList = null; this.hvwhereList = null; this.limits = null; this.op = null; this.bdistinct = null;
	this.iwhere = null; this.ion = null; this.tableName = null; this.onList = null;
	this.select = null; this.groupBy = null; this.orderBy = null; this.sum = null; this.avg = null; this.limit = null;
	this.count = null; this.distinct = null; this.insert = null; this.delete = null; this.update = null; this.toList = null;
	this.first = null; this.innerJoin = null; this.leftJoin = null; this.rightJoin = null; this.set = null; this.where = null;
	this.on = null; this.having = null; this.and = null; this.andBegin = null; this.andEnd = null; this.or = null;
	this.orBegin = null; this.orEnd = null;

	delete this.fieldList; delete this.groupList; delete this.orderList; delete this.joinList; delete this.setList; delete this.whereList;
	delete this.onwhereList; delete this.hvwhereList; delete this.limits; delete this.op; delete this.bdistinct;
	delete this.iwhere; delete this.ion; delete this.tableName; delete this.onList;
	delete this.select; delete this.groupBy; delete this.orderBy; delete this.sum; delete this.avg; delete this.limit;
	delete this.count; delete this.distinct; delete this.insert; delete this.delete; delete this.update; delete this.toList;
	delete this.first; delete this.innerJoin; delete this.leftJoin; delete this.rightJoin; delete this.set; delete this.where;
	delete this.on; delete this.having; delete this.and; delete this.andBegin; delete this.andEnd; delete this.or;
	delete this.orBegin; delete this.orEnd; delete this;
};
//选择字段
linqParse.prototype.select = function () { if (arguments.length === 0) fieldsSplit(this.fieldList, '*'); else for(var i in arguments) fieldsSplit(this.fieldList, arguments[i]); return this; };
//分组
linqParse.prototype.groupBy = function() { for(var i in arguments) fieldsSplit(this.groupList, arguments[i]); return this; };
//排序
linqParse.prototype.orderBy = function() { for(var i in arguments) fieldsSplit(this.orderList, arguments[i]); return this; };
//求和
linqParse.prototype.sum = function() { for(var i in arguments) fieldsSplit(this.fieldList, arguments[i], 'sum(', ')'); return this; };
//平均值
linqParse.prototype.avg = function() { for(var i in arguments) fieldsSplit(this.fieldList, arguments[i], 'avg(', ')'); return this; };
//分页
linqParse.prototype.limit = function(limit, offset) { if (limit && limit>0) { this.limits = ' limit ' + limit; if (offset) this.limits += ' offset ' + offset; }; return this; };
//求记录数
linqParse.prototype.count = function(){
	if (arguments.length === 0) {
		this.fieldList.splice(0, this.fieldList.length);
		fieldsSplit(this.fieldList, '*', 'count(', ')');
		this.op = 4;
		return this.toSql(null, true);
	} else if (arguments.length === 1 && isFunction(arguments[0])) {
		this.fieldList.splice(0, this.fieldList.length);
		fieldsSplit(this.fieldList, '*', 'count(', ')');
		this.op = 4;
		return this.toSql(arguments[0], true);
	} else for(var i in arguments) fieldsSplit(this.fieldList, arguments[i]);
	return this;
};
//去重复
linqParse.prototype.distinct = function(){ this.bdistinct = true; return this; };
//添加
linqParse.prototype.insert = function(cb, destroy) { this.op = 1; return this.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
//删除
linqParse.prototype.delete = function(cb, destroy) { this.op = 2; return this.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
//更新
linqParse.prototype.update = function(cb, destroy) { this.op = 3; return this.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
//取记录集
linqParse.prototype.toList = function(cb, destroy) { this.op = 5; return this.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
//只取第一条记录
linqParse.prototype.first = function(cb, destroy) { this.op = 6;	return this.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
//inner join
linqParse.prototype.innerJoin = function(table) { fieldsSplit(this.joinList, ' inner join ' + table); this.ion++; return this; };
//left join
linqParse.prototype.leftJoin = function(table) { fieldsSplit(this.joinList, ' left join ' + table); this.ion++; return this; };
//right join
linqParse.prototype.rightJoin = function(table) { fieldsSplit(this.joinList, ' right join ' + table); this.ion++; return this; };
//修改数据
linqParse.prototype.set = function() {
	var arg = null;
	for(var i in arguments) {
		arg = arguments[i];
		if (isString(arg)) {
			this.setList.push({key: arg});
		} else if (isObject(arg)) {
			for(var key in arg) this.setList.push({key: key, value: arg[key]});
		}
	}
	return this;
};
//条件
linqParse.prototype.where = function() { this.iwhere = 0; for(var i in arguments) whereSplit(this.whereList, arguments[i], 0); return this; };
//链接条件
linqParse.prototype.on = function() { this.iwhere = 1; for(var i in arguments) { this.onwhereList[this.ion-1] = []; whereSplit(this.onwhereList[this.ion-1], arguments[i], 0); }; return this; };
//分组条件
linqParse.prototype.having = function() { this.iwhere = 2; for(var i in arguments) whereSplit(this.hvwhereList, arguments[i], 0); return this; };
//and条件
linqParse.prototype.and = function() { for(var i in arguments) whereSplit(this.iwhere === 1 ? this.onwhereList[this.ion-1] : (this.iwhere === 2 ? this.hvwhereList : this.whereList), arguments[i], 1); return this; };
//and条件开始
linqParse.prototype.andBegin = function() { for(var i in arguments) whereSplit(this.iwhere === 1 ? this.onwhereList[this.ion-1] : (this.iwhere === 2 ? this.hvwhereList : this.whereList), arguments[i], 2); return this; };
//and条件结束
linqParse.prototype.andEnd = function() { for(var i in arguments) whereSplit(this.iwhere === 1 ? this.onwhereList[this.ion-1] : (this.iwhere === 2 ? this.hvwhereList : this.whereList), arguments[i], 3); return this; };
//or条件
linqParse.prototype.or = function() { for(var i in arguments) whereSplit(this.iwhere === 1 ? this.onwhereList[this.ion-1] : (this.iwhere === 2 ? this.hvwhereList : this.whereList), arguments[i], 4); return this; };
//or条件开始
linqParse.prototype.orBegin = function() { for(var i in arguments) whereSplit(this.iwhere === 1 ? this.onwhereList[this.ion-1] : (this.iwhere === 2 ? this.hvwhereList : this.whereList), arguments[i], 5); return this; };
//or条件结束
linqParse.prototype.orEnd = function() { for(var i in arguments) whereSplit(this.iwhere === 1 ? this.onwhereList[this.ion-1] : (this.iwhere === 2 ? this.hvwhereList : this.whereList), arguments[i], 6); return this; };

module.exports = linqParse;