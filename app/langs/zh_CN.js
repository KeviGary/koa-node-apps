//简体中文
'use strict';

module.exports = {
	langCode: ['zh_CN', 'zh-cn'],

	index: {
		title: '', script: 'initDesktop();'
	},
	setting: {
		profile: {
			title: '个人资料', script: 'initSettingProfile();',
			labels: [''],
			messages: ['']
		}
	},
	login: {
		title: '登陆', script: 'initLogin();', bg: '#446998',
		labels: ['Email：', '请输入您的Email', '密码：', '请输入您密码', '登 录', '保持登录', '找回密码？'],
		messages: ['登录失败，请检查您的Email或密码是否填写正确。', '<br>您还有 {0} 次重试机会。', '已达到最大重试次数，请与管理员联系。']
	},
	window: {
		titles: ['系统提示'],
		buttons: ['关 闭', '确 定']
	},
	notLogin: '未登陆！'
};