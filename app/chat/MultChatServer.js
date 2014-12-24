'use strict';

var sticky = require('sticky-session');
var config = appConfig('app');
var server = appRequire('chat/ChatServer');
var io = appRequire('chat/ChatSocketIO');
io.listen(server);

sticky(server).listen(config.port, function() {
	logger.info('server started on {0} port, pid:{1}'.format(config.port, process.pid));
});

