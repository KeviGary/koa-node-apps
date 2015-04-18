//dispatch
'use strict';

var path = require('path');
var util = require('util');
var cfork = require('cfork');

require('../lib/extend');

var config = require('./config');
var logger = require('../lib/logger');

var workerPath = path.join(__dirname, 'worker.js');

function forkWorker() {
	cfork({
		exec: workerPath,
		count: config.numCPUs,
	}).on('fork', function (worker) {
		console.log('[%s] %s [worker:%d] 新 worker 启动', new Date().format('yyyy-MM-dd HH:mm:ss'), config.appName, worker.process.pid);
	}).on('disconnect', function (worker) {
		var msg = util.format('[%s] %s [master:%s] wroker:%s 断开连接, suicide: %s, state: %s.', new Date().format('yyyy-MM-dd HH:mm:ss'), config.appName, process.pid, worker.process.pid, worker.suicide, worker.state);
		console.error(msg);
		logger.error(msg);
	}).on('exit', function (worker, code, signal) {
		var exitCode = worker.process.exitCode;
		var err = new Error(util.format('%s worker %s 退出 (code: %s, signal: %s, suicide: %s, state: %s)', config.appName, worker.process.pid, exitCode, signal, worker.suicide, worker.state));
		err.name = 'WorkerDiedError';
		console.error('[%s] %s [master:%s] wroker 退出: %s', new Date().format('yyyy-MM-dd HH:mm:ss'), config.appName, process.pid, err.stack);
		logger.error(err.stack);
	});
};

if (config.enableCluster) {
	forkWorker();
} else {
	require(workerPath);
}
