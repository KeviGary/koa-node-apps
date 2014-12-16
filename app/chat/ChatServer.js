var config = appConfig('app');
var server = require('socket.io').listen(config.port);

log.info('server listening at port '+config.port);

var users = {};

server.on('connection', function(client){
	log.info('connection');

	client.on('login', function(data) {
		log.info('login');
		log.info(data);
		client.emit('login', {message:'login success!'});
	});

	client.on('chat', function(data) {
		log.info('chat');
		log.info(data);
		client.emit('chat', data);
	});

	client.on('disconnect', function () {
		log.info('disconnect');
		delete users[socket.username];
	});

});
