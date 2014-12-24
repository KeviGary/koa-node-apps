'use strict';

//控制台日志
function consoleLog() { };

//log
consoleLog.prototype.info = console.info;

//消息
consoleLog.prototype.warn = console.warn;

//出错
consoleLog.prototype.error = console.error;

module.exports = new consoleLog();