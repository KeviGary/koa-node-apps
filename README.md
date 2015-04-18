koa-node-apps
==========

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
###效果
![图片](https://github.com/hcxiong/koa-node-apps/blob/master/20150418.png?raw=true)
