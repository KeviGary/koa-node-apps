'use strict';

//加载使用什么锁
var config = appConfig('app');

//加载锁
function lock() {
	return libRequire('lock/' + (config.lock || 'memlock'));
};

module.exports = new lock();
