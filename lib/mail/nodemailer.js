'use strict';

var nodemailer = require('nodemailer');
var config = appConfig('mail');

function nodeMailer() {
	this.transport = nodemailer.createTransport(config);
};

//发送邮件
nodeMailer.prototype.send = function (to, subject, html) {
	var p = promise.defer();
	
	var message = {
		from: config.from,
		to: to,
		subject: subject,
		html: html
	};

	this.transport.sendMail(message, function (err, result) {
		if (err) logger.error(err);
		p.resolve(result);
	});
	
	return p.promise;
};

module.exports = new nodeMailer();