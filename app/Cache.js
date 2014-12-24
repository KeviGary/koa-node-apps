'use strict';

//cache
var Cache = {
	hour: 3600,
	day: this.hour * 24,

	getUsers: function() {
		return this.cacheGet(User, 'getUsers', [], this.day);
	},
	removeUsers: function() {
		return this.cacheDelete(User, 'getUsers', []);
	},

	getUser: function(id) {
		return this.cacheGet(User, 'getUser', [id], this.day);
	},
	removeUser: function(id) {
		return this.cacheDelete(User, 'getUser', [id]);
	},

	get: cache.get,
	set: cache.set,
	delete: cache.delete,
	cacheDelete: function(model, func, params) {
		var key = model.model + '_' + func + '_' + params.join('_');
		return cache.delete(key);
	},
	cacheGet: function(model, func, params, lifetime) {
		var key = model.model + '_' + func + '_' + params.join('_');
		var cacheData = true;
		return cache.get(key).then(function(list) {
			if (list) return list;
			cacheData = false;
			return model[func].apply(this, params);
		}).then(function(result) {
			if (!cacheData) { cacheData = result; return cache.set(key, result, lifetime); }
			return result;
		}).then(function(result) {
			if (result === true) return cacheData;
			return result;
		});
	}
};

module.exports = Cache;