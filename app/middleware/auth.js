//auth受权中间件
'use strict';

var tool = require('../../lib/tool');
var config = require('../../config');
var crypto = require('../../lib/crypto');

module.exports = function* (next) {
	if (this.user && this.user.UserID) return yield* next;
	this.user = {};

	var body = this.request.body || {};
	if (!body.auth) return yield* next;

	var user = crypto.decryptAuth(config.secret, body.auth);
	if (!user) return yield* next;

	this.user = tool.extend(this.user, user);

	yield* next;
};
