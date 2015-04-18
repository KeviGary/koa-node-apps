//前端控制器
'use strict';

var config = require('../../config');
var model = require('../models/');
var cache = require('../cache');
var tool = require('../../lib/tool');

exports.profile = function* () {
	yield tool.render('setting/profile', this, this.lang.setting.profile);
};
exports.user = function* () {
	yield tool.render('setting/user', this, this.lang.setting.profile);
};
exports.deparment = function* () {
	yield tool.render('setting/deparment', this, this.lang.setting.profile);
};
exports.job = function* () {
	yield tool.render('setting/job', this, this.lang.setting.profile);
};
exports.app = function* () {
	yield tool.render('setting/app', this, this.lang.setting.profile);
};
exports.role = function* () {
	yield tool.render('setting/role', this, this.lang.setting.profile);
};