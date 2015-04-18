//config-production
"use strict";

var os = require('os');
var path = require('path');
var code = 'app';

var config = {
	appCode: code,
	appName: 'app',
	appKeywords: '',
	appDescription:'',

	debug: true,
	enableCompress: false,
	viewCache: false,

	enableCluster: false,
	numCPUs: os.cpus().length,

	webPort: 3000,
	bindingHost: '127.0.0.1'

};

module.exports = config;