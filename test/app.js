//require('v8-profiler');

//加载常用类
loadAppLib('CacheManager');

//启动测试
var test = appTest('lib');

//测试代码
//setInterval(test.time_destory1, 10);
test.all();
//test.db_select1();

