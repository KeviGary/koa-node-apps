'use strict';

//加载常用类
loadAppLib('Util', 'Cache');

//加载Model
loadModel('User');

//启动单进程ChatServer
appRequire('chat/OneChatServer');

//启动多进程ChatServer
//appRequire('chat/MultChatServer');
