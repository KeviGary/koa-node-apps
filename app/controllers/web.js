//前端控制器
'use strict';

var config = require('../../config');
var model = require('../models/');
var cache = require('../cache');
var tool = require('../../lib/tool');
var crypto = require('../../lib/crypto');

//主页
exports.index = function* () {
	yield tool.render('index', this, this.lang.index, {
		bg: this.user.BgColor,
		auth: crypto.encryptAuth(config.secret, this.user.UserID, this.user.Lang, this.user.IsMobile)
	});
};

//登陆页
exports.login = function* () {
	var uid = parseInt(this.cookie.get('uid')) || 0;
	if (uid > 0) this.redirect('/');

	yield tool.render('login', this, this.lang.login);
};

//退出页
exports.logout = function* () {
	this.cookie.delete('uid');
	this.redirect('/login');
};