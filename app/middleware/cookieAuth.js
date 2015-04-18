//cookie受权中间件
'use strict';

var tool = require('../../lib/tool');
var cache = require('../cache');

module.exports = function* (next) {
	this.user = {};

	var uid = parseInt(this.cookie.get('uid')) || 0;
	if (uid < 1) return yield* next;

	var user = yield cache.getAppUser(uid);
	if (!user) return yield* next;

	this.user = tool.extend(this.user, user);

	yield* next;
};

