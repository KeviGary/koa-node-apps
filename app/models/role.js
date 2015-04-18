//角色model
"use strict";

var db = require('../../lib/db');

module.exports = {
	name: 'Role'

	//角色
	, getAppRoles: function() {
		return db.from("AppRole").order('Order').toList().then(function (results) {
			var list = {};
			for (var i = 0, len = results.length; i < len; i++) {
				results[i].RoleName = results[i].RoleName ? JSON.parse(results[i].RoleName) : null;
				list[results[i].RoleCode] = results[i];
			}
			return list;
		});
	}
	, deleteAppRole: function(code) { return db.from("AppRole").where({ RoleCode: code }).delete(); }
	, insertAppRole: function(data) { return db.from("AppRole").set(data).insert(); }
	, updateAppRole: function(code, data) { return db.from("AppRole").set(data).where({ RoleCode: code }).update(); }

	//角色功能
	, getAppRoleFunction: function() {
		return db.from("AppRoleFunction").toList().then(function (results) {
			var list = {};
			for (var i = 0, len = results.length; i < len; i++) {
				if (!list[results[i].RoleCode]) list[results[i].RoleCode] = [];
				list[results[i].RoleCode].push(results[i]);
			}
			return list;
		});
	}
	, deleteAppRoleFunction: function(roleCode, appCode, funcCode) {
		if (!appCode && !funcCode) return db.from("AppRoleFunction").where({ RoleCode: roleCode }).delete();
		if (!funcCode) return db.from("AppRoleFunction").where({ RoleCode: roleCode, AppCode: appCode }).delete();
		return db.from("AppRoleFunction").where({ RoleCode: roleCode, AppCode: appCode, FunctionCode: funcCode }).delete();
	}
	, insertAppRoleFunction: function(data) { return db.from("AppRoleFunction").set(data).insert(); }
};