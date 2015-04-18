//工具类
'use strict';

//是否字符串
exports.isString = function(obj) { return Object.prototype.toString.call(obj) === '[object String]'; };
//是否函数
exports.isFunction = function(obj) { return typeof obj === 'function'; };
//是否对像
exports.isObject = function(obj) { return typeof obj === 'object'; };
//是否空
exports.isEmpty = function(obj){ if(!obj) return true; if(typeof obj=='object') { for(var s in obj) return false; return true; } return false; };
//右截取字符
exports.rtrim = function (str, char) { if (str[str.length-1] === char) return str.substr(0, str.length-1); return str; };
//验证正则
exports.test = function (reg, str) { return (new RegExp(reg, 'i')).test(str); };
//前导字符
exports.leftPad = function(nr, n, str) { return Array(n-String(nr).length+1).join(str||'0')+nr; };
//unix time
exports.unixTime = function (date) { date = date || new Date(); return Math.round(+date/1000); };
//扩展
exports.extend = function (defaults, options) {
	if (!options || typeof options !== 'object') return defaults;
	var keys = Object.keys(options);
	var i = keys.length;
	while (i--) defaults[keys[i]] = options[keys[i]];
	return defaults;
};
//过滤浏览器语言
exports.getBrowserLang = function (langs) {
	if (exports.test('zh-c', langs) || exports.test('zh_c', langs)) return 'zh_CN';
	if (exports.test('zh', langs)) return 'zh_TW';
	return 'en_US';
};
//ejs模版
exports.render = function* (view, me, page, options) {
	options = options || {};
	if (page.bg) options['bg'] = page.bg;
	options['title'] = page.title || '';
	options['script'] = page.script;
	options['langCode'] = me.lang.langCode;
	options['lang'] = me.lang;
	options['device'] = me.Device;
	options['user'] = me.user;
	yield me.render(me.Device + '/' + view, options);
};
//失败json结构
exports.errorJson = function (me, msg) {
	me.body = { ret: 0, msg: msg };
	var len = arguments.length;
	if (len > 2) for (var i = 2; i < len; i++) exports.extend(me.body, obj);
	return true;
};
//成功json结构
exports.successJson = function (me, obj) {
	me.body = { ret: 1 };
	var len = arguments.length;
	if (len > 2) for (var i = 2; i < len; i++) exports.extend(me.body, obj);
	return true;
};


