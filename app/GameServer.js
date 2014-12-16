var net = require('net');

var server = net.createServer(function (socket) {
	socket.on('data', function (msg) {
		//socket.write(msg);
		console.log('1->', msg);
		console.log('2->', msg.toString());

		var buffer = new Buffer(msg);
		console.log('3->', buffer.toJSON());
		console.log('4->', buffer.toString());
		console.log('5->', buffer);

		socket.write({name:"熊华春", value:"test"});
	});
});

server.listen(6007);
console.log('>> server start listening:6007');

