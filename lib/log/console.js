//控制台日志
function consoleLog() { };

//log
consoleLog.prototype.log = function(message) { console.log(message); };

//消息
consoleLog.prototype.info = function(message) { console.info(message); };

//出错
consoleLog.prototype.error = function(message) { console.error(message); };

module.exports = new consoleLog();