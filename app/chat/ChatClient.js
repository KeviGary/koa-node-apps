'use strict';

var config = appConfig('app');
var client = require('socket.io-client').connect('http://127.0.0.1:'+config.port);

client.on('connect', function () {
	client.emit('login', { userid: 10 });
});

client.on('login', function(data) {
	log.info('login');
	log.info(data);
	client.emit('chat', data);
});

client.on('chat', function(data) {
	log.info('chat');
	log.info(data);
	//client.emit('chat', data);
});

