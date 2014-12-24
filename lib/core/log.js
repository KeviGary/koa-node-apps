'use strict';

//加载使用什么日志
var config = appConfig('app');

//加载日志
function log() {
	return libRequire('log/' + (config.log || 'empty'));
};

module.exports = new log();
