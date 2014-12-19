'use strict';

//Model
var User = {
	model: 'User',
	getUser: function(id, cb) {
		return from('User').select('UserID', 'UserName').where({ UserID: id }).first(cb);
	},
	getUsers: function(cb) {
		return from('User').select('UserID', 'UserName').toList(cb);
	}
};

module.exports = User;