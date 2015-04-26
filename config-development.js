//config-development
"use strict";

var os = require('os');
var path = require('path');
var protocol = 'http://';
var domain = 'test.com';

var config = {
	protocol: protocol,
	domain: domain,
	cdnUrl: protocol + 'static.' + domain,
	appUrl: protocol + 'app.' + domain + '/',
	loginUrl: protocol + 'app.' + domain + '/login',

	//加密密钥
	secret: 'test1',
	//企业key
	enterpriseKey: '',

	cookieOption: { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 * 1000 },

	database: 'sqlite3', //mysql,sqlite3
	mysql: {
		host: '192.168.1.168',
		database: 'test',
		user: 'root',
		password: 'newlife',
		port: 3306,
		debug: false,
		connectionLimit: 10
	},
	sqlite3: path.join(__dirname, 'data', 'db.sqlite3'),

	cache: 'mcache', //mcache,memcache,redis
	redis: {
		prefix: 'Test_',
		redis_host: '192.168.1.168',
		redis_port: 6379
	},
	memcache: {
		prefix: 'Test_',
		memcache_host: '192.168.1.168',
		memcache_port: 11211
	},
	mcache: { prefix: 'Test_', clear: 100 },

	logger: 'console', //console,log4
	log4: {
		appenders: [
			{ type: 'file', filename: path.join(__dirname, 'logs', 'info.log'), category: 'info' },
			{ type: 'file', filename: path.join(__dirname, 'logs', 'warn.log'), category: 'warn' },
			{ type: 'file', filename: path.join(__dirname, 'logs', 'error.log'), category: 'error' }
		]
	},

	admins: ['cexo255@163.com'],
	errorSendEmail: false,
	mail: {
		from: 'test <cexo255@163.com>',
		service: 'gmail',
		auth: {
			user: 'cexo255@163.com.com',
			pass: '123456'
		}
	},

	bgcolors: ['#446998','#563d7c','#76300a','#540711','#0e4018','#843535','#db6623','#aa9e5c','#35a541','#3e5eb3','#f16261','#89c978','#4d4f54','#fcc95d','#95a696']

};

module.exports = config;