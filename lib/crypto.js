//加密解密
'use strict';

var crypto = require('crypto');
//md5
exports.md5 = function (text) {
	return crypto.createHash('md5').update(text).digest('hex');
};
//sha1
exports.sha1 = function (text) {
	return crypto.createHash('sha1').update(text).digest('hex');
};
//AES解密
exports.encryptAES = function(text, key) {
	var cipher = crypto.createCipher('aes-256-cbc', key);
	var crypted = cipher.update(text, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
};
//AES加密
exports.decryptAES = function(crypted, key) {
	var decipher = crypto.createDecipher('aes-256-cbc', key);
	var dec = decipher.update(crypted, 'hex', 'utf8');
	dec += decipher.final('utf8');
	return dec;
};
//生成密码
exports.passwordSalt = function (password) {
	var salt = crypto.randomBytes(30).toString('hex').substr(0, 6);
	return { password: exports.md5(password + salt), salt: salt };
};
exports.checkPassword = function (password, salt, pass) {
	return exports.md5(pass + salt) === password;
}
//加密受权信息
exports.encryptAuth = function (secret, uid, lang, isMobile) {
	var json = { u: uid, l: lang, m: isMobile, t: new Date().toUnixTime() };
	return exports.encryptAES(JSON.stringify(json), secret);
};
//解密受权信息
exports.decryptAuth = function (secret, auth) {
	var data = exports.decryptAES(String(authKey), secret);
	if (data[0] != '{') return null;
	data = JSON.parse(data);
	return { UserID: data.u, Lang: data.l, IsMobile: data.m };
};