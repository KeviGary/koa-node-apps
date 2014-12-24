'use strict';

var users = {};

var io = require('socket.io')();
io.on('connection', function(client){
	logger.info('connection pid:' + process.pid);

	client.on('login', function(data) {
		client.username = '';
		client.room = '';
		client.join(client.room);

		logger.info('login');
		logger.info(data);
		client.emit('login', {message:'login success!'});
	});

	client.on('chat', function(data) {
		logger.info('chat');
		logger.info(data);
		client.emit('chat', data);
	});

	client.on('disconnect', function () {
		logger.info('disconnect');
		delete users[client.username];
		client.leave(client.room);
	});

	//client.join('room1');
	//client.leave('room1');
	//client.broadcast.to('room1').emit('function', 'data1', 'data2');
	//server.sockets.in('room1').emit('function', 'data1', 'data2');
});

module.exports = io;

