//语言中间件
'use strict';

var path = require('path');

var tool = require('../lib/tool');

module.exports = function (langPath) {
	return function* (next) {
		var lang = this.user && this.user.Lang ? this.user.Lang : null;
		if (!lang) lang = this.cookie.get('lang');
		if (!lang) lang = this.acceptsLanguages().join(', ');
		lang = tool.getBrowserLang(lang);
		this.lang = require(path.join(langPath, lang));

		yield* next;
	};
};