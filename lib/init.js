'use strict';

//Debug模式
global.AppDebug		= true;

//根路径
global.RootPath		= __dirname + "/..";

//库路径
global.LibPath		= '/lib/';

//App路径
if (!global.AppPath) global.AppPath = '/app/';

//版本
global.AppVersion = '0.0.1';

//初始化内核
require(global.RootPath + global.LibPath + 'core/core.js');
