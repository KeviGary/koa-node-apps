//静态资源中间件
'use strict';

var path = require('path');
var middlewares = require('koa-middlewares');

var config = require('../config');

var staticPath = path.join(path.dirname(__dirname), 'static');

module.exports = middlewares.staticCache(staticPath, {
	buffer: config.debug ? false : true,
	maxAge: config.debug ? 0 : 60 * 60 * 24 * 7,
	alas: {
		'/favicon.ico': '/favicon.png'
	}
});
