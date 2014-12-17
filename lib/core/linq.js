//LINQ

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
	alias = null; field = null; begin = null; end = null; fields = null;
	delete alias; delete field; delete begin; delete end; delete fields;
	return list;
};
//合并where
function whereJoin(params, list) {
	var val = null, where = '';
	for(var i = 0, len = list.length; i < len; i++) {
		val = list[i];
		if (val.value) {
			if (val.op === ' in ')
				where += '{0}{1}{2}{3}(?){4}'.format(val.type, val.begin, val.key, val.op, val.end);
			else
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
	val = null; index1 = null; index2 = null;
	delete val; delete index1; delete index2;
};

//LINQ解析
function linqParse(tableName) {
	var me = this;
	this.fieldList = [];
	this.groupList = [];
	this.orderList = [];
	this.joinList = [];
	this.setList = [];
	this.whereList = [];
	this.onwhereList = {};
	this.hvwhereList = [];
	this.operate = 0;
	this.distinctFlag = false;
	this.whereFlag = 0;
	this.onFlag = 0;
	this.limits = '';

	//生成SQL
	this.toSql = function (cb, destroy) {
		var sql = null, params = [], val = null, set = '', where = '';
		switch (this.operate) {
			case 1:
				if (this.setList.length === 0) break;
				params.push(tableName);
				for(var i = 0, len = this.setList.length; i < len; i++) {
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
				params.push(tableName);
				where = whereJoin(params, this.whereList);
				sql = 'delete from {0} where {1}'.format('??', where);
				if (!cb) break;
				db.delete(sql, params, function(err, result) { cb(err, result); });
				break;
			case 3:
				if (this.setList.length === 0 || this.whereList.length === 0) break;
				params.push(tableName);
				for(var i = 0, len = this.setList.length; i < len; i++) {
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
				if (this.distinctFlag) sql += 'distinct ';
				if (this.fieldList.length === 0) {
					if (this.operate === 4) fieldsSplit(this.fieldList, '*', 'count(', ')');
					else fieldsSplit(this.fieldList, '*');
				}
				for(var i in this.fieldList) sql += this.fieldList[i] + ',';
				sql = sql.rtrim(',') + ' from ?? ';
				params.push(tableName);
				if (this.joinList.length > 0) {
					for(var i = 0, len = this.joinList.length; i < len; i++) {
						sql += this.joinList[i];
						sql += ' on ' + whereJoin(params, this.onwhereList[i]);
					}
				}
				if (this.whereList.length > 0) sql += ' where ' + whereJoin(params, this.whereList);

				if (this.groupList.length > 0) {
					sql += ' group by ';
					for(var i = 0, len = this.groupList.length; i < len; i++) sql += this.groupList[i] + ','
					sql = sql.rtrim(',');
					if (this.hvwhereList.length > 0) sql += ' having ' + whereJoin(params, this.hvwhereList);
				}
				if (this.orderList.length > 0) {
					sql += ' order by ';
					for(var i = 0, len = this.orderList.length; i < len; i++) sql += this.orderList[i] + ','
					sql = sql.rtrim(',');
				}
				if (this.limits != '' && this.operate != 4) sql += this.limits;

				if (!cb) break;
				if (this.operate === 4 || this.operate === 6) db.select(sql, params, function(err, result) { cb(err, (!err && result.length > 0) ? result[0] : null); });
				else db.select(sql, params, function(err, result) { cb(err, result); });
				break;
		};
		sql = sql ? { sql: sql, 'params': params } : null;
		params = null; val = null, set = null, where = null;
		delete params; delete val, delete set, delete where;
		if (destroy) this.destroy();
		return sql;
	};
	//释放
	this.destroy = function() { for(var key in this) delete this[key]; };
	//选择字段
	this.select = function () { if (arguments.length === 0) fieldsSplit(this.fieldList, '*'); else for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this.fieldList, arguments[i]); return this; };
	//分组
	this.groupBy = function() { for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this.groupList, arguments[i]); return this; };
	//排序
	this.orderBy = function() { for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this.orderList, arguments[i]); return this; };
	//求和
	this.sum = function() { for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this.fieldList, arguments[i], 'sum(', ')'); return this; };
	//平均值
	this.avg = function() { for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this.fieldList, arguments[i], 'avg(', ')'); return this; };
	//分页
	this.limit = function(limit, offset) { if (limit && limit>0) { this.limits = ' limit ' + limit; if (offset) this.limits += ' offset ' + offset; }; return this; };
	//求记录数
	this.count = function(){
		if (arguments.length === 0 || arguments.length === 1) {
			this.fieldList.splice(0, this.fieldList.length);
			fieldsSplit(this.fieldList, '*', 'count(', ')');
			this.operate = 4;
			return this.toSql(arguments.length === 1 && isFunction(arguments[0]) ? arguments[0] : null, true);
		} else for(var i = 0, len = arguments.length; i < len; i++) fieldsSplit(this.fieldList, arguments[i]);
		return this;
	};
	//去重复
	this.distinct = function(){ this.distinctFlag = true; return this; };
	//添加
	this.insert = function(cb, destroy) { this.operate = 1; return this.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
	//删除
	this.delete = function(cb, destroy) { this.operate = 2; return this.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
	//更新
	this.update = function(cb, destroy) { this.operate = 3; return this.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
	//取记录集
	this.toList = function(cb, destroy) { this.operate = 5; return this.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
	//只取第一条记录
	this.first = function(cb, destroy) { this.operate = 6;	return this.toSql(cb, typeof destroy == 'boolean' ? destroy : true); };
	//分页
	this.toPage = function(page, pageSize, cb) { this.operate = 7; this.limit(pageSize, (page - 1) * pageSize); return this.toSql(cb); };
	//inner join
	this.innerJoin = function(table) { fieldsSplit(this.joinList, ' inner join ' + table); this.onFlag++; return this; };
	//left join
	this.leftJoin = function(table) { fieldsSplit(this.joinList, ' left join ' + table); this.onFlag++; return this; };
	//right join
	this.rightJoin = function(table) { fieldsSplit(this.joinList, ' right join ' + table); this.onFlag++; return this; };
	//修改数据
	this.set = function() {
		var arg = null;
		for(var i = 0, len = arguments.length; i < len; i++) {
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
	this.where = function() { this.whereFlag = 0; for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this.whereList, arguments[i], 0); return this; };
	//链接条件
	this.on = function() { this.whereFlag = 1; for(var i = 0, len = arguments.length; i < len; i++) { this.onwhereList[this.onFlag-1] = []; whereSplit(this.onwhereList[this.onFlag-1], arguments[i], 0); }; return this; };
	//分组条件
	this.having = function() { this.whereFlag = 2; for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this.hvwhereList, arguments[i], 0); return this; };
	//and条件
	this.and = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this.whereFlag === 1 ? this.onwhereList[this.onFlag-1] : (this.whereFlag === 2 ? this.hvwhereList : this.whereList), arguments[i], 1); return this; };
	//and条件开始
	this.andBegin = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this.whereFlag === 1 ? this.onwhereList[this.onFlag-1] : (this.whereFlag === 2 ? this.hvwhereList : this.whereList), arguments[i], 2); return this; };
	//and条件结束
	this.andEnd = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this.whereFlag === 1 ? this.onwhereList[this.onFlag-1] : (this.whereFlag === 2 ? this.hvwhereList : this.whereList), arguments[i], 3); return this; };
	//or条件
	this.or = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this.whereFlag === 1 ? this.onwhereList[this.onFlag-1] : (this.whereFlag === 2 ? this.hvwhereList : this.whereList), arguments[i], 4); return this; };
	//or条件开始
	this.orBegin = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this.whereFlag === 1 ? this.onwhereList[this.onFlag-1] : (this.whereFlag === 2 ? this.hvwhereList : this.whereList), arguments[i], 5); return this; };
	//or条件结束
	this.orEnd = function() { for(var i = 0, len = arguments.length; i < len; i++) whereSplit(this.whereFlag === 1 ? this.onwhereList[this.onFlag-1] : (this.whereFlag === 2 ? this.hvwhereList : this.whereList), arguments[i], 6); return this; };

};

module.exports = linqParse;