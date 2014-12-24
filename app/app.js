'use strict';

var config = appConfig('app');

//加载常用类
loadAppLib('Util', 'Cache');

//启动单个ChatServer
appRequire('chat/OneChatServer');

//启动多个ChatServer
//appRequire('chat/MultChatServer');
