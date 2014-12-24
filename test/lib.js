'use strict';

//加载用户Model
appModel('User');

var arr = [];
function someFn(i) {
	return i * 3 * 8;
}
function init_array(){
	for (var i = 0; i < 1000000; i++) {
		arr[i] = i;
	}
}
init_array();

var LibTest = {
	sql_page: function(){
		console.time("sql_page");
		from("User").toPage(1, 2).then(function(result){
			logger.info(result);
			console.timeEnd("sql_page");
		});
	},
	sql_like: function(){
		console.time("sql_like");
		from("User").where({ UserName: { like: '张%' } }).toList().then(function(result){
			logger.info(result);
			console.timeEnd("sql_like");
		});
	},
	sql_in: function(){
		console.time("sql_in");
		from("User").where({ UserID: { in: [3, 4, 5] } }).toList().then(function(result){
			logger.info(result);
			console.timeEnd("sql_in");
		});
	},
	array_foreach: function() {
		console.time("array");
		arr.forEach(someFn);
		console.timeEnd("array");
	},
	array_forin: function() {
		console.time("array");
		for (var i in arr) someFn(arr[i]);
		console.timeEnd("array");
	},
	array_for: function() {
		console.time("array");
		for (var i= 0, len = arr.length; i < len; i++) someFn(arr[i]);
		console.timeEnd("array");
	},
	cache_get: function(){
		console.time("cache_get");
		Cache.getUser(5).then(function(result){
			logger.info(result);
			console.timeEnd("cache_get");
		});
	},
	cache_del: function(){
		console.time("cache_del");
		Cache.removeUser(1).then(function(result){
			logger.info(result);
			console.timeEnd("cache_del");
		});
	},
	cache: function(){
		cache.get('test').then(function(result) {
			logger.info(result);
		});
		cache.set('test', 1).then(function(result) {
			logger.info(result);
		});
		cache.delete('test').done();

		console.time("promise.all");
		promise.all([
			cache.set('testtest1', '1111111'),
			cache.set('testtest2', '222222')
		]).then(function(results){
			logger.info(results);
			console.timeEnd("promise.all");
		});
		console.time("promise.props");
		promise.props({
			'test1': cache.set('testtest1', '1111111'),
			'test2': cache.set('testtest2', '222222')
		}).then(function(results){
			logger.info(results);
			console.timeEnd("promise.props");
		});
	},
	date: function(){
		logger.info('2014-12-13 00:00:00'.isDateTime());
		logger.info('2014-12-13'.isDate());
		logger.info('2014-12-13'.toDateTime());
		logger.info(new Date().format('yyyy-MM-dd'));
	},
	linq: function() {
		logger.info(from('User').set({ UserID: 1, UserName: 'test' }).insert(true));
		logger.info(from('User').where({ UserID: 1 }).delete(true));
		logger.info(from('User').where('UserID=1').delete(true));
		logger.info(from('User').where({ UserID: { 'in': [1,2,3] } }).delete(true));
		logger.info(from('User').where({ UserName: { 'like': '%cexo%' } }).delete(true));
		logger.info(from('User').where({ UserID: { '>': 1, '<': 1000 } }).delete(true));
		logger.info(from('User').where({ UserID: 1 }).and({ UserName: 'cexo' }).delete(true));
		logger.info(from('User').where({ UserID: 1 }).or({ UserID: 2 }).delete(true));
		logger.info(from('User').where({ UserID: 1 }).andBegin({ UserName: 'cexo1' }).orEnd({ UserName: 'cexo2' }).delete(true));
		logger.info(from('User').where({ UserID: 1 }).set({ UserName: 'cexo' }).update(true));
		logger.info(from('User').where({ UserID: 1 }).toList(true));
		logger.info(from('User').where({ UserID: { 'in': [1,2,3] } }).toList(true));
		var linq = from('User as a')
			.distinct()
			.select('a.UserID', 'b.OrderID', 'c.GiftID')
			.sum('b.Money')
			.innerJoin('Order as b').on('a.UserID=b.UserID').and({'b.Status': 1})
			.innerJoin('Gift as c').on('b.GiftID=c.GiftID')
			.where({ 'a.UserID': { 'in': [1,2,3] } })
			.groupBy('a.UserID')
			.orderBy('a.UserID', 'b.OrderID desc')
			.limit(10);
		logger.info(linq.toList(true));
		logger.info(linq.first(true));
		logger.info(linq.count(true));

		logger.info(from("User").toPage(1, 2, true));
	},
	db_select2: function() {
		console.time("db_select3");
		db.first('select * from User where UserID=3').then(function(result) {
			logger.info(result);
			console.timeEnd("db_select3");
		});
		console.time("db_select4");
		db.query('select * from User').then(function(results) {
			logger.info(results);
			console.timeEnd("db_select4");
		});

		/*db.update('update User set UserName=? where UserID=1', ['中国']).then(function(result) {
			logger.info(result);
		});
		db.insert('insert into User(UserName) values(?),(?)', ['中国1','中国2']).then(function(result) {
			logger.info(result);
		});
		db.delete('delete from User where UserID=?', [8]).then(function(result) {
			logger.info(result);
		});*/
	},
	db_select1: function() {
		console.time("db_select1");
		User.getUser(1).then(function(result) {
			logger.info(result);
			console.timeEnd("db_select1");
		});
		console.time("db_select2");
		User.getUsers().then(function(results) {
			logger.info(results);
			console.timeEnd("db_select2");
		});
	},
	requireModel: function() { require('./../app/model/User'); },
	appModel: function() { appModel('User'); },
	log: function() { logger.info('test1'); },
	test: function(){ },
	all: function() {
		for(var key in this) if (key != 'all') this[key]();
	}
};

module.exports = LibTest;