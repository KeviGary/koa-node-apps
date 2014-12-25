'use strict';

var config = appConfig('app');
var server = appRequire('chat/ChatServer');
var io = appRequire('chat/ChatSocketIO');
io.listen(server);

server.listen(config.port, function() {
	logger.info('聊天服务器启动成功！端口：{0}，进程：{1}'.format(config.port, process.pid));
});

