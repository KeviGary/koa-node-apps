//加载函数库
require(global.RootPath + global.LibPath + 'core/function.js');

//加载异步处理库
loadSysLib('async');

//加载常用类（缓存，数据库操作，日志操作，linq）
loadCoreLib('cache', 'db', 'log', 'linq');

//加载主APP文件
if (global.TestPath) appTest('app'); else appRequire('app');
