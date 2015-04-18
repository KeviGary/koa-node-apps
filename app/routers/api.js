//后端路由
"use strict";

var apiControllers = require('../controllers/api');
var jsonp = require('../../middleware/jsonp');
var login = require('../../middleware/loginJsonp');

function routers(app) {
	app.post('/api/login', jsonp, apiControllers.login);
	app.post('/api/bgcolor', login, jsonp, apiControllers.bgcolor);
}

module.exports = routers;
