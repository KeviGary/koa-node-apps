'use strict';

var io = require('socket.io')();
io.on('connection', function(client){
	logger.info('客户端连接成功！进程：', process.pid);

	client.on('login', function(data, callback) {
		Cache.getUser(data.u).then(function(result) {
			if (!result) {
				if (callback) callback({ code: 0, msg: '客户端登陆失败，用户不存在！' });
				client.disconnect();
				return false;
			};
			logger.info('客户端登陆成功：', data, '，用户：', result);
			client.username = data;
			if (callback) callback({ code: 1, msg: '客户端登陆成功！' });
		});
	});

	client.on('chat', function(data, callback) {
		if (!client.username) {
			if (callback) callback({ code: 0, msg: '非法用户请求！' });
			client.disconnect();
			return false;
		}
		logger.info('接收客户端聊天消息：', data);
		client.emit('chat', { msg: '服务端收到消息！' }, function(result) {
			console.log('收到聊天发送结果：', result);
		});
		if (callback) callback({ code: 1, msg: '客户端发送成功！' });
	});

	client.on('disconnect', function () {
		logger.info('客户端断开连接：', client.username);
	});

	//client.room = 'room1';
	//client.join('room1');
	//client.leave('room1');
	//client.broadcast.to('room1').emit('chat', '房间群聊！');
	//server.sockets.in('room1').emit('function', '房间群聊！');
});

module.exports = io;

