//后端控制器
'use strict';

var config = require('../config');
var model = require('../models/');
var tool = require('../../lib/tool');
var crypto = require('../../lib/crypto');
var cache = require('../cache');

//登陆
exports.login = function* () {
	var body = this.request.body || {};
	if (!body.account || !body.password || body.account.indexOf('@') === -1 || body.password.length < 6)
		return tool.errorJson(this, this.lang.login.messages[0]);

	var key = 'Login-' + body.account;
	var loginCount = yield cache.get(key);
	if (!loginCount) loginCount = 5;
	if (loginCount <= 2) return tool.errorJson(this, this.lang.login.messages[2]);

	yield cache.set(key, loginCount - 1, 60);

	var user = yield model.User.getAppUserByEmail(body.account);
	if (!user) return tool.errorJson(this, this.lang.login.messages[0] + this.lang.login.messages[1].format(loginCount - 2));
	if (!crypto.checkPassword(user.Password, user.Salt, body.password))
		return tool.errorJson(this, this.lang.login.messages[0] + this.lang.login.messages[1].format(loginCount - 2));

	this.cookie.set('uid', user.UserID);
	yield cache.delete(key);

	return tool.successJson(this);
};
exports.bgcolor = function* () {
	var body = this.request.body || {};
	if (!body.color || body.color.length != 7) return tool.errorJson(this, 'color error!');

	var result = yield model.User.updateAppUser(this.user.UserID, { BgColor: body.color });
	if (result) {
		yield cache.removeAppUser(this.user.UserID);
		return tool.successJson(this);
	}
	return tool.errorJson(this, 'error!');
};
