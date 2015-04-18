//前端路由
"use strict";

var webControllers = require('../controllers/web');
var login = require('../../middleware/login');
var settingControllers = require('../controllers/setting');

function routers(app) {
	app.get('/', login, webControllers.index);
	app.get('/login', webControllers.login);

	app.get('/setting/profile', login, settingControllers.profile);
	app.get('/setting/user', login, settingControllers.user);
	app.get('/setting/deparment', login, settingControllers.deparment);
	app.get('/setting/job', login, settingControllers.job);
	app.get('/setting/app', login, settingControllers.app);
	app.get('/setting/role', login, settingControllers.role);

	app.get('/logout', webControllers.logout);
}

module.exports = routers;
