'use strict';

//不记录日志
function emptyLog() { };

//log
emptyLog.prototype.info = function() { };

//消息
emptyLog.prototype.warn = function() { };

//出错
emptyLog.prototype.error = function() { };

module.exports = new emptyLog();