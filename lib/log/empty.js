'use strict';

//不记录日志
function emptyLog() { };

//log
emptyLog.prototype.log = function() { };

//消息
emptyLog.prototype.info = function() { };

//出错
emptyLog.prototype.error = function() { };

module.exports = new emptyLog();