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
		from("User").toPage(1, 2, function(err, result){
			log.info(result);
		});
	},
	sql_like: function(){
		log.info(from("User").where({ UserName: { like: '张%' } }).toList(function(err, result){
			log.info(err);
			log.info(result);
		}));
	},
	sql_in: function(){
		log.info(from("User").where({ UserID: { in: [3, 4, 5] } }).toList(function(err, result){
			log.info(err);
			log.info(result);
		}));
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
		Cache.getUser(1, function(err, result){
			log.info(err);
			log.info(result);
		});
	},
	cache_del: function(){
		Cache.removeUser(1, function(err, result){
			log.info(err);
			log.info(result);
		});
	},
	cache: function(){
		console.time("cache");
		//串行执行
		async.series([
			function(callback) { cache.set('testtest', '1111111', 0, callback); },
			function(callback) { cache.get('testtest', callback); }
		], function(err, results) {
			log.info(results);
			console.timeEnd("cache");
		});
	},
	async_times: function(){
		console.time("async_times");
		async.times(5, function (n, callback) {
			User.getUser(n + 1, callback);
		}, function (err, result) {
			log.info(result);
			console.timeEnd("async_times");
		});
	},
	async_waterfall: function(){
		console.time("waterfall");
		//瀑布
		async.waterfall([
			function(callback){
				Cache.getUsers(callback);
			},
			function(result, callback){
				log.info(result);
				Cache.getUser(3, callback);
			}
		], function(err, results) {
			//log.info(err);
			log.info(results);
			console.timeEnd("waterfall");
		});
	},
	async_series2: function(){
		console.time("series2");
		//串行执行
		async.series([
			async.apply(User.getUsers),
			async.apply(User.getUser, 3),
			async.apply(User.getUser, 4),
			async.apply(User.getUser, 5)
		], function(err, results) {
			log.info(results);
			console.timeEnd("series2");
		});
	},
	async_series1: function(){
		console.time("series");
		//串行执行
		async.series([
			function(callback){
				//from('User').set({UserName: '熊哥'}).insert(callback);
				//from('User').set({UserName: '熊华春'}).where({UserID: 1}).update(callback);
				//log.info(from('User').where({UserID: 2}).delete(callback));
				from('User').toList(callback);
			},
			function(callback){
				from('User').where({UserID: 3}).first(callback);
			},
			function(callback){
				from('User').where({UserID: 4}).first(callback);
			},
			function(callback){
				User.getUser(5, callback);
			}
		], function(err, results) {
			//log.Info(err);
			log.info(results);
			console.timeEnd("series");
		});
	},
	async_parallel2: function(){
		console.time("parallel2");
		//并行执行
		async.parallel([
			async.apply(User.getUsers),
			async.apply(User.getUser, 3),
			async.apply(User.getUser, 4),
			async.apply(User.getUser, 5)
		], function(err, results) {
			log.info(results);
			console.timeEnd("parallel2");
		});
	},
	async_parallel1: function(){
		console.time("parallel");
		//并行执行
		async.parallel([
			function(callback){
				//from('User').set({UserName: '熊哥'}).insert(callback);
				//from('User').set({UserName: '熊华春'}).where({UserID: 1}).update(callback);
				//log.info(from('User').where({UserID: 2}).delete(callback));
				from('User').toList(callback);
			},
			function(callback){
				from('User').where({UserID: 3}).first(callback);
			},
			function(callback){
				from('User').where({UserID: 4}).first(callback);
			},
			function(callback){
				User.getUser(5, callback);
			}
		], function(err, results) {
			log.info(results);
			console.timeEnd("parallel");
		});
	},
	date: function(){
		log.info('2014-12-13 00:00:00'.isDateTime());
		log.info('2014-12-13'.isDate());
		log.info('2014-12-13'.toDateTime());
		log.info(new Date().format('yyyy-MM-dd'));
	},
	linq: function() {
		log.info(from('User').set({ UserID: 1, UserName: 'test' }).insert());
		log.info(from('User').where({ UserID: 1 }).delete());
		log.info(from('User').where('UserID=1').delete());
		log.info(from('User').where({ UserID: { 'in': [1,2,3] } }).delete());
		log.info(from('User').where({ UserName: { 'like': '%cexo%' } }).delete());
		log.info(from('User').where({ UserID: { '>': 1, '<': 1000 } }).delete());
		log.info(from('User').where({ UserID: 1 }).and({ UserName: 'cexo' }).delete());
		log.info(from('User').where({ UserID: 1 }).or({ UserID: 2 }).delete());
		log.info(from('User').where({ UserID: 1 }).andBegin({ UserName: 'cexo1' }).orEnd({ UserName: 'cexo2' }).delete());
		log.info(from('User').where({ UserID: 1 }).set({ UserName: 'cexo' }).update());
		log.info(from('User').where({ UserID: 1 }).toList());
		log.info(from('User').where({ UserID: { 'in': [1,2,3] } }).toList());
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
		log.info(linq.toList(null, false));
		//log.info(linq.first(null, false));
		//log.info(linq.count());
	},
	time_destory3: function(){
		var linq = from("User").where({UserID:3}).first();
		linq = null;
		delete linq;
	},
	time_destory2: function(){
		var linq = from("User").where({UserID:3});
		linq = null;
		delete linq;
	},
	time_destory1: function(){
		from("User").where({UserID:3}).destroy();
	},
	linq_destroy: function(){
		log.info('destroy1');
		var ss = from("User").where({UserID:3});
		ss.first();
		ss = null;
		delete ss;
		log.info(ss);

		log.info('destroy2');
		var ss = from("User").where({UserID:3});
		ss.first(function(err, result){
			log.info(result);
			log.info(ss);
		});
		ss = null;
		delete ss;
		log.info(ss);
	},
	db_select3: function() {
		console.time("db_select3");
		db.select('select * from User where UserID=3', function(err, result) {
			log.info(result);
			console.timeEnd("db_select3");
		});
	},
	db_select2: function() {
		console.time("db_select2");
		var cb = function(err, result){
			log.info(result);
			console.timeEnd("db_select2");
		};
		db.select('select * from User where UserID=2', cb);
	},
	db_select1: function() {
		console.time("db_select1");
		log.info(User.getUser(1, function(err, result) {
			log.info(result);
			console.timeEnd("db_select1");
		}));
	},
	requireModel: function() { require('./../app/model/User'); },
	appModel: function() { appModel('User'); },
	log: function() { log.info('test1'); },
	test: function(){ },
	all: function() {
		for(var key in this) if (key != 'all') this[key]();
	}
};

module.exports = LibTest;