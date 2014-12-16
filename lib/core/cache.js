//加载使用什么缓存
var config = appRequire('/config/app');

//加载缓存
function cache() {
    if (!config.cache) return null;
    return libRequire('cache/' + config.cache);
}

module.exports = new cache();