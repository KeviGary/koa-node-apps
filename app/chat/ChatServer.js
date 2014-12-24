'use strict';

var config = appConfig('app');
var server = require('socket.io').listen(config.port);

logger.info('server listening at port '+config.port);

var users = {};

server.on('connection', function(client){
	logger.info('connection');

	client.on('login', function(data) {
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
		delete users[socket.username];
	});

});
