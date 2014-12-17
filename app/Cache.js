//cache
var Cache = {
	hour: 3600,
	day: this.hour * 24,

	getUsers: function(cb) {
		this.cacheGet(User, 'getUsers', [], this.day, cb);
	},
	removeUser: function(cb) {
		this.cacheDelete(User, 'getUsers', [], cb);
	},

	getUser: function(id, cb) {
		this.cacheGet(User, 'getUser', [id], this.day, cb);
	},
	removeUser: function(id, cb) {
		this.cacheDelete(User, 'getUser', [id], cb);
	},

	get: function(key, cb) {
		cache.get(key, function(err, result){
			if (cb) cb(err, result);
		});
	},
	set: function(key, value, lifetime, cb) {
		cache.set(key, value, lifetime, function(err, result){
			if (cb) cb(err, result);
		});
	},
	delete: function(key, cb) {
		cache.delete(key, function(err, result){
			if (cb) cb(err, result);
		});
	},
	cacheDelete: function(model, func, params, cb) {
		var key = model.model + '_' + func + '_' + params.join('_');
		cache.delete(key, function(err, result){
			if (cb) cb(err, result);
		});
	},
	cacheGet: function(model, func, params, lifetime, cb) {
		var key = model.model + '_' + func + '_' + params.join('_');

		async.waterfall([
			function(callback){ cache.get(key, function(err, result) { callback(null, result); }); }, //先从Cache中取
			function(result, callback) {
				if (result) { callback(null, result); return false; } //Cache中存在时返回

				async.waterfall([
					function(callback){ //Cache不存在时从数据库中取
						params.push(function(err, result) { callback(null, result); });
						model[func].apply(this, params);
					},
					function(result, callback) {
						if (!result) { callback(null, result); return false; }; //null直接返回不存Cache

						cache.set(key, result, lifetime, function(err, result) { callback(null, result); }); //存入Cache
					}
				], function (err, result) {
					callback(null, result);
				});
			}
		], function (err, result) {
			cb(err, result);
		});
	}
};

module.exports = Cache;