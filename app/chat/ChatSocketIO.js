'use strict';

appModel('User');

var io = require('socket.io')();
io.on('connection', function(client){
	logger.info('connection pid:' + process.pid);

	client.on('login', function(data) {
		client.username = { u:1, m:1, t:0, l:'zh_TW' };

		Cache.getUser(client.username.u).then(function(result) {
			if (!result) client.disconnect();
			logger.info('login');
			logger.info(result);
			client.emit('login', { message:'login success!' });
		});
	});

	client.on('chat', function(data) {
		if (!client.username) client.disconnect();

		logger.info('chat');
		logger.info(data);
		client.emit('chat', data);
	});

	client.on('disconnect', function () {
		logger.info('disconnect');
	});

	//client.room = '';
	//client.join('room1');
	//client.leave('room1');
	//client.broadcast.to('room1').emit('function', 'data1', 'data2');
	//server.sockets.in('room1').emit('function', 'data1', 'data2');
});

module.exports = io;

