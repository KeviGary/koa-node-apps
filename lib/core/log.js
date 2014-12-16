//加载使用什么日志
var config = appConfig('app');

//加载日志
function log() {
	if (!config.log) config.log = 'Empty';
	return appRequire('/lib/Log/' + config.log);
};

module.exports = new log();
