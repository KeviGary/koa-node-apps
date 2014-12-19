'use strict';

//加载常用类
loadAppLib('Util', 'Cache');

//启动ChatServer
appRequire('chat/ChatServer');

setTimeout(function() {
	//启动ChatClient
	appRequire('chat/ChatClient');
}, 1000);