//应用model
"use strict";

var db = require('../../lib/db');

module.exports = {
	name: 'App'

	//应用
	, getApps: function() {
		return db.from("App").order('Order').toList().then(function (results) {
			var list = {};
			for (var i = 0, len = results.length; i < len; i++) {
				results[i].AppName = results[i].AppName ? JSON.parse(results[i].AppName) : null;
				list[results[i].AppCode] = results[i];
			}
			return list;
		});
	}
	, deleteApp: function(code) { return db.from("App").where({ AppCode: code }).delete(); }
	, insertApp: function(data) { return db.from("App").set(data).insert(); }
	, updateApp: function(code, data) { return db.from("App").set(data).where({ AppCode: code }).update(); }

	//功能
	, getAppFunction: function(code) {
		return db.from("AppFunction").order('Order').toList().then(function (results) {
			var list = {}, key = null;
			for (var i = 0, len = results.length; i < len; i++) {
				key = results[i].AppCode + '-' + results[i].FunctionCode;
				results[i].FunctionName = results[i].FunctionName ? JSON.parse(results[i].FunctionName) : null;
				list[key] = results[i];
			}
			return list;
		});
	}
	, deleteAppFunction: function(appCode, funcCode) { return db.from("AppFunction").where({ AppCode: appCode, FunctionCode: funcCode }).delete(); }
	, insertAppFunction: function(data) { return db.from("AppFunction").set(data).insert(); }
	, updateAppFunction: function(appCode, funcCode) { return db.from("AppFunction").set(data).where({ AppCode: appCode, FunctionCode: funcCode }).update(); }
};