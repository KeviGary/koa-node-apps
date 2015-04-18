//验证登陆jsonp中间件
'use strict';

module.exports = function *(next) {
	if (this.user && this.user.UserID) return yield* next;
	this.body = { ret: 0, msg: this.lang.notLogin };
};