//验证登陆中间件
'use strict';

var config = require('../config');

module.exports = function *(next) {
	if (this.user && this.user.UserID) return yield* next;
	this.redirect(config.loginUrl);
};