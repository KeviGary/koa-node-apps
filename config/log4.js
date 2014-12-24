//log4js配置
module.exports = {
	appenders: [
		{ type: 'file', filename: 'logs/info.log', category: 'info' },
		{ type: 'file', filename: 'logs/warn.log', category: 'warn' },
		{ type: 'file', filename: 'logs/error.log', category: 'error' }
	]
};