'use strict';

//加载常用类
loadAppLib('Cache');

//加载用户Model
loadModel('User');

//启动测试
var test = appTest('lib');

//测试代码
//test.all();
test.linq();
