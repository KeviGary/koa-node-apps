//加载使用什么数据库
var config = appConfig('app');

//加载数据库
function Database() {
	if (!config.database) return null;
    return appRequire('/lib/db/' + config.database);
};

module.exports = new Database();
