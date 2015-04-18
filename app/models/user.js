//用户model
"use strict";

var db = require('../../lib/db');

module.exports = {
	name: 'User'

	//用户
	, getAppUsers: function(id) { return db.from("AppUser").toList(); }
	, getAppUser: function(id) { return db.from("AppUser").where({ UserID: id }).first(); }
	, getAppUserByEmail: function(email) { return db.from("AppUser").where({ Email: email }).first(); }
	, deleteAppUser: function(id) { return db.from("AppUser").where({ UserID: id }).delete(); }
	, insertAppUser: function(data) { return db.from("AppUser").set(data).insert(); }
	, updateAppUser: function(id, data) { return db.from("AppUser").set(data).where({ UserID: id }).update(); }

	//管理员
	, getAppAdmin: function(userID) {
		return db.from("AppAdmin").where({ UserID: userID }).toList().then(function (results) {
			var list = {};
			for (var i = 0, len = results.length; i < len; i++) {
				list[results[i].RoleCode] = 1;
			}
			return list;
		});
	}
	, deleteAppAdmin: function(userID, roleCode) {
		if (!roleCode) return db.from("AppAdmin").where({ UserID: userID }).delete();
		return db.from("AppAdmin").where({ UserID: userID, RoleCode: roleCode }).delete();
	}
	, insertAppAdmin: function(data) { return db.from("AppAdmin").set(data).insert(); }

	//部门
	, getAppDepartments: function() {
		return db.from("AppDepartment").order('Order').toList().then(function (results) {
			var list = {};
			for (var i = 0, len = results.length; i < len; i++) {
				results[i].DepartmentName = results[i].DepartmentName ? JSON.parse(results[i].DepartmentName) : null;
				list[results[i].DepartmentID] = results[i];
			}
			return list;
		});
	}
	, deleteAppDepartment: function(id) { return db.from("AppDepartment").where({ DepartmentID: id }).delete(); }
	, insertAppDepartment: function(data) { return db.from("AppDepartment").set(data).insert(); }
	, updateAppDepartment: function(id, data) { return db.from("AppDepartment").set(data).where({ DepartmentID: id }).update(); }

	//岗位
	, getAppJobs: function() {
		return db.from("AppJob").order('Order').toList().then(function (results) {
			var list = {};
			for (var i = 0, len = results.length; i < len; i++) {
				results[i].JobName = results[i].JobName ? JSON.parse(results[i].JobName) : null;
				list[results[i].JobID] = results[i];
			}
			return list;
		});
	}
	, deleteAppJob: function(id) { return db.from("AppJob").where({ JobID: id }).delete(); }
	, insertAppJob: function(data) { return db.from("AppJob").set(data).insert(); }
	, updateAppJob: function(id, data) { return db.from("AppJob").set(data).where({ JobID: id }).update(); }

};