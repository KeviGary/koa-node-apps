
"use strict";

var model = require('./models/');
var cache = require('../lib/cache');

module.exports = {
	hour: 3600,
	day: this.hour * 24,

	getAppUser: function(id) { return cache.cacheGet(model.User, 'getAppUser', [id], this.day); },
	removeAppUser: function(id) { return cache.cacheDelete(model.User, 'getAppUser', [id]); },

	get: cache.get,
	set: cache.set,
	delete: cache.delete,
	keys: cache.keys,
	flushall: cache.flushall
}