'use strict';

//加载使用什么日志
var config = appRequire('/config/app');

//加载日志
function mail() {
	if (!config.mail) return null;
	return libRequire('mail/' + config.mail);
};

module.exports = new mail();
