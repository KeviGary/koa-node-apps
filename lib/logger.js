//加载配置文件中的logger
'use strict';

module.exports = require('./logger/' + (require('../config').logger || 'console'));
