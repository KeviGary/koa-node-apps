'use strict';

//加载函数库
require(global.RootPath + global.LibPath + 'core/function.js');

//加载异步处理库
loadSysLibEx('bluebird', 'promise');

//加载常用类（缓存，数据库操作，日志操作，linq, 锁）
loadCoreLib('cache', 'db', 'logger', 'linq', 'lock');

//加载主APP文件
if (global.TestPath) appTest('app'); else appRequire('app');
