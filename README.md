游戏服务器架构
==========
## 使用开源组件：
* socket.io
* socket.io-client
* bluebird
* log4js
* memcache
* mysql
* sticky-session

## 文件目录：
* /app.js app主启动文件
* /app/ app目录
* /app/app.js app加载数据文件
* /app/chat/ 聊天服务器目录
* /app/chat/ChatServer.js 
* /app/chat/ChatSocketIO.js 
* /app/chat/OneChatServer.js 启动单进程ChatServer
* /app/chat/MultChatServer.js 启动多进程ChatServer
* /app/model/ 数据库操作目录
* /app/model/User.js 用户数据库操作
* /app/Cache.js 缓存操作文件
* /app/Util.js 函数库
* /config 配置目录
* /config/app.js app配置
* /config/log4.js log4日志配置
* /config/memcache.js memcache配置
* /config/mysql.js mysql配置
* /lib/ 核心库
* /lib/init.js 初始化
* /lib/cache/ 缓存：可实现memcache，redis等等
* /lib/core/ 核心代码：缓存加载，数据库加载，锁加载，日志加载，linq的实现，核心函数等等
* /lib/db/ 数据库：可实现mysql，mongodb等等
* /lib/lock/ 锁：可实现内存锁，文件锁，cache锁等等
* /lib/log/ 日志：可实现log4日志，console等等
* test.js 测试主启动文件
* /test/ 测试代码目录
* /test/app.js 测试配置
* /test/lib.js 测试代码

## promise支持：
```javascript
db.query('select * from User').then(function(results) {
	logger.info(results);
});
User.getUsers().then(function(results) {
	logger.info(results);
});
promise.all([
	cache.set('testtest1', '1111111'),
	cache.set('testtest2', '222222')
]).then(function(results){
	logger.info(results);
});
promise.props({
	'test1': cache.set('testtest1', '1111111'),
	'test2': cache.set('testtest2', '222222')
}).then(function(results){
	logger.info(results);
});
promise.props({
	'users': User.getUsers(),
	'user1': User.getUser(1),
	'user2': User.getUser(2)
}).then(function(results){
	logger.info(results);
});
```
## linq支持：
```javascript
from("User").where({ UserID: { in: [3, 4, 5] } }).toList().then(function(result){
	logger.info(result);
});
from("User").where({ UserName: { like: '张%' } }).toList().then(function(result){
	logger.info(result);
});
from("User").toPage(1, 2).then(function(result){
	logger.info(result);
});
from('User').set({ UserID: 1, UserName: 'test' }).insert()
from('User').where({ UserID: 1 }).delete();
from('User').where('UserID=1').delete();
from('User').where({ UserID: { 'in': [1,2,3] } }).delete();
from('User').where({ UserName: { 'like': '%cexo%' } }).delete();
from('User').where({ UserID: { '>': 1, '<': 1000 } }).delete();
from('User').where({ UserID: 1 }).and({ UserName: 'cexo' }).delete();
from('User').where({ UserID: 1 }).or({ UserID: 2 }).delete();
from('User').where({ UserID: 1 }).andBegin({ UserName: 'cexo1' }).orEnd({ UserName: 'cexo2' }).delete();
from('User').where({ UserID: 1 }).set({ UserName: 'cexo' }).update();
from('User').where({ UserID: 1 }).toList();
from('User').where({ UserID: { 'in': [1,2,3] } }).toList();
var linq = from('User', 'a')
	.distinct()
	.select('a.UserID', 'b.OrderID', 'c.GiftID')
	.sum('b.Money')
	.innerJoin('Order', 'b').on('a.UserID=b.UserID').and({'b.Status': 1})
	.innerJoin('Gift', 'c').on('b.GiftID=c.GiftID')
	.where({ 'a.UserID': { 'in': [1,2,3] } })
	.groupBy('a.UserID')
	.orderBy('a.UserID', 'b.OrderID desc')
	.limit(10);
linq.toList();
linq.first();
linq.count();
```
