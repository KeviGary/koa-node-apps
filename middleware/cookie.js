//cookie中间件
'use strict';

var crypto = require('../lib/crypto');
var tool = require('../lib/tool');

module.exports = function(key, options) {
	options = options || {};

	return function* (next) {
		var cookie = this.cookies;

		this.cookie = {
			get: function(name) {
				if(!name) return;
				name = crypto.md5(name).substr(8, 16);

				var value = cookie.get(name);
				if (tool.isString(value) && value.length > 0) value = crypto.decryptAES(value, key);
				return value;
			},
			set: function(name, value) {
				if(!name) return;
				name = crypto.md5(name).substr(8, 16);

				value = crypto.encryptAES(String(value), key);
				cookie.set(name, value, options);
			},
			delete: function(name) {
				if(!name) return;
				name = crypto.md5(name).substr(8, 16);

				cookie.set(name, '', { expires: new Date(1) });
			}
		};

		yield* next;
	}
};