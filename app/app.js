//app
"use strict";

var path = require('path');
var http = require('http');
var koa = require('koa');
var middlewares = require('koa-middlewares');

var tool = require('../lib/tool');
var config = require('../config');
var appConfig = require('./config');
var webRouters = require('./routers/web');
var apiRouters = require('./routers/api');
var cookie = require('../middleware/cookie');
var cookieAuth = require('./middleware/cookieAuth');
var auth = require('./middleware/auth');
var notFound = require('../middleware/404');
var lang = require('../middleware/lang');
var mobile = require('../middleware/mobile');

var app = koa();
var rootPath = __dirname;
var viewPath = path.join(rootPath, 'views');
var langPath = path.join(rootPath, 'langs');
config = tool.extend(config, appConfig);

middlewares.jsonp(app);
middlewares.csrf(app);
app.use(middlewares.rt({headerName: 'X-ReadTime'}));
app.use(cookie(config.secret, config.cookieOption));

app.proxy = true;
app.use(middlewares.bodyParser());
app.use(mobile);
app.use(cookieAuth);
app.use(auth);
app.use(lang(langPath));
app.use(notFound);

if (config.enableCompress) app.use(middlewares.compress({threshold: 150}));
app.use(middlewares.conditional());
app.use(middlewares.etag());

var locals = { config: config, title: null, script: null, lang: null, device: 'pc', user: null, bg: null, jsfiles: null, cssfiles: null };
middlewares.ejs(app, { root: viewPath, viewExt: 'html', layout: '_layout', cache: config.viewCache, debug: config.debug, locals: locals });

app.use(middlewares.router(app));
webRouters(app);
apiRouters(app);

app.on('error', function (err, ctx) {
	err.url = err.url || ctx.request.url;
	console.log(err.stack);
	logger.error(err.stack);
});

app = http.createServer(app.callback());
if (!module.parent) app.listen(config.webPort);

module.exports = app;