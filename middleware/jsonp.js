//jsonp中间件
"use strict";

module.exports = function* (next) {
	yield* next;
	if (this.body) this.jsonp = this.body;
}