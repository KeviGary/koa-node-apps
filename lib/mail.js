//发送邮件
'use strict';

var os = require('os');
var promise = require('bluebird');
var nodemailer = require('nodemailer');

var config = require('../config');

var transport = nodemailer.createTransport(config.mail);

//发送邮件
var sendEmail = function (to, subject, html) {
	var p = promise.defer();
	var message = {
		from: config.mail.from,
		to: to,
		subject: subject,
		html: html,
	};
	transport.sendMail(message, function (err, result) {
		p.resolve(err ? null : result);
	});
	return p.promise;
};

//出错时发送邮件
exports.error = function (to, error) {
	if (!config.errorSendEmail) return;
	var message = {
		from: config.mail.from,
		to: to,
		subject: '[' + config.appName + '] [' + os.hostname() + '] 出现严重错误！',
		html: String(error).replace(/\n/g, '<br />'),
	};
	transport.sendMail(message, function (err, result) { });
};

//发送邮件
exports.send = function* (to, subject, html) { return yield sendEmail(to, subject, html); };
