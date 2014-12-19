'use strict';

var requireCache = {}; //加载组件缓存

//加载库中组件 不生成global对像实例
global.libRequire = function(libFile) {
	if (libFile[0] != '/') libFile = global.LibPath + libFile;
	if (!requireCache[libFile]) requireCache[libFile] = require(global.RootPath + libFile);
	return requireCache[libFile];
};

//加载项目中的组件 不生成global对像实例
global.appRequire = function(appFile) {
	if (appFile[0] != '/') appFile = global.AppPath + appFile;
	if (!requireCache[appFile]) requireCache[appFile] = require(global.RootPath + appFile);
	return requireCache[appFile];
};

//加载配置文件 不生成global对像实例
global.appConfig = function(config) {
	config = '/config/' + config;
	if (!requireCache[config]) requireCache[config] = require(global.RootPath + config);
	return requireCache[config];
};

//加载系统常用库 生成global对像实例
global.loadSysLib = function() { for(var i in arguments) global[arguments[i]] = require(arguments[i]); };

//加载App常用库 生成global对像实例
global.loadAppLib = function() {
	var names = null;
	for(var i in arguments) {
		names = arguments[i].split('/');
		global[names[names.length - 1]] = appRequire(global.AppPath + arguments[i]);
	}
};

//加载Core常用库 生成global对像实例
global.loadCoreLib = function() {
	var names = null;
	for(var i in arguments) {
		names = arguments[i].split('/');
		global[names[names.length - 1]] = libRequire(global.LibPath + 'core/' + arguments[i]);
	}
};

//加载Model 生成global对像实例
global.appModel = function() {
	var names = null;
	for(var i in arguments) {
		names = arguments[i].split('/');
		global[names[names.length - 1]] = appRequire(global.AppPath + 'model/' + arguments[i]);
	}
	return global[arguments.length - 1];
};

//加载测试 生成global对像实例
global.appTest = function(testFile) {
	if (testFile[0] != '/') testFile = global.TestPath + testFile;
	return require(global.RootPath + testFile);
};

//简单的ORM
global.from = function(tableName, alias) { return new linq(tableName, alias); };

//是否字符串
global.isString = function(obj) { return Object.prototype.toString.call(obj) === '[object String]'; };
//是否数组
global.isArray = function(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; };
//是否函数
global.isFunction = function(obj) { return typeof obj === 'function'; };
//是否对像
global.isObject = function(obj) { return typeof obj === 'object'; };
//是否空
global.isEmpty = function(obj){ if(!obj) return true; if(typeof obj=='object') { for(var s in obj) return false; return true; } return false; };

//字符串格式化扩展
String.prototype.format = function () {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function () { return args[arguments[1]]; });
};
//右截取字符
String.prototype.rtrim = function (char) {
	if (this[this.length-1] === char) {
		return this.substr(0, this.length-1);
	}
	return this;
};
//是否日期时间字符串
String.prototype.isDateTime = function() {
	var r = this.replace(/(^\s*)|(\s*$)/g, "").match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/);
	if (r == null) return false;
	var d = new Date(r[1], r[3] - 1, r[4], r[5], r[6], r[7]);
	return (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[3] && d.getDate() == r[4] && d.getHours() == r[5] && d.getMinutes() == r[6] && d.getSeconds() == r[7]);
};
//是否日期字符串
String.prototype.isDate = function() {
	var r = this.replace(/(^\s*)|(\s*$)/g, "").match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
	if (r == null) return false;
	var d = new Date(r[1], r[3] - 1, r[4]);
	return (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[3] && d.getDate() == r[4]);
};
//字符串转日期
String.prototype.toDateTime = function () {
	if (!this) return null;
	var val = this.replace(/[-]/g, "/");
	if (val.isDate() || val.isDateTime()) return new Date(Date.parse(val));
	var r = this.match(/(\d+)/);
	if (r) return new Date(parseInt(r));
	return new Date(val);
};
//日期格式化
Date.prototype.format = function (fmt) { //日期format參數 yyyy-MM-dd HH:mm:ss
	var o = { "M+": this.getMonth() + 1, "d+": this.getDate(), "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, "H+": this.getHours(), "m+": this.getMinutes(), "s+": this.getSeconds(), "q+": Math.floor((this.getMonth() + 3) / 3), "S": this.getMilliseconds() };
	var week = { "0": "\u65e5", "1": "\u4e00", "2": "\u4e8c", "3": "\u4e09", "4": "\u56db", "5": "\u4e94", "6": "\u516d" };
	if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length)); };
	if (/(E+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]); };
	for (var k in o) { if (new RegExp("(" + k + ")").test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length))); }; };
	return fmt;
};