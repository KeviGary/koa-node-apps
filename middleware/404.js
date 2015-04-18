//404中间件
'use strict';

module.exports = function* (next) {
	yield* next;

	if (this.status && this.status !== 404) return;
	if (this.body) return;

	var text = '404: Page Not Found';

	this.status = 404;
	yield* this.render('404', {
		title: text,
		text: text
	});
};
