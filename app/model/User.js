'use strict';

//Model
var User = {
	model: 'User',

	getUser: function(id) {
		return from('User').select('UserID', 'UserName').where({ UserID: id }).first();
	},
	getUsers: function() {
		return from('User').select('UserID', 'UserName').toList();
	}
};

module.exports = User;