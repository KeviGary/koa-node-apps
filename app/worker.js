//worker
'use strict';

var graceful = require('graceful');

var config = require('./config');
var app = require('./app');
var logger = require('../lib/logger');

app.listen(config.webPort, config.bindingHost);

console.log('[%s] %s [worker:%d] 启动, 监听%s:%d, 集群: %s', new Date().format('yyyy-MM-dd HH:mm:ss'), config.appName, process.pid, config.bindingHost, config.webPort, config.enableCluster);

graceful({
	server: [app],
	killTimeout: '30s',
	error: function (err, throwErrorCount) {
		if (err.message) err.message += config.appName + ' (uncaughtException throw ' + throwErrorCount + ' times on pid:' + process.pid + ')';
		console.error(err.stack);
		logger.error(err.stack);
	}
});
