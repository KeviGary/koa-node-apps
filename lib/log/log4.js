'use strict';

//加载log4js
var log4js = require('log4js');
//加载配置文件
log4js.configure(appConfig('log4'));


//log4日志
function log4() {
	this.infoLogger = log4js.getLogger('info');
	this.warnLogger = log4js.getLogger('warn');
	this.errorLogger = log4js.getLogger('error');
};

//log
log4.prototype.info = function(msg) { this.infoLogger.info(msg); };

//消息
log4.prototype.warn = function(msg) { this.warnLogger.warn(msg); };

//出错
log4.prototype.error = function(msg) { this.errorLogger.error(msg); };

module.exports = new log4();