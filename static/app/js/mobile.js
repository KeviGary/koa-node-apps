
$(window).resize(function(){
	var winW = $(window).width(), winH = $(window).height();
	$('.window-frame').width(winW - 40);
	$('.window-frame').height(winH - 40);
	$('.desktop-container').width(winW - 40);
}).click(function() {
	if (top.$('.desktop-dock .dropup').hasClass('open')) top.$('.desktop-dock .dropup').removeClass('open');
}).resize();

var safeUrl = function(){
	if (self == top) top.location = appUrl;
};

var initLogin = function() {
	$("#account").focus();
	$('#alert-window').on('hidden.bs.modal', function() {
		if ($("#account").val().length == 0) return $("#account").focus();
		$("#password").focus();
	});
	$('#account,#password').keydown(function(event){ if (event.keyCode == 13) $('.btn-primary').click(); });
	$('.btn-primary').click(function() {
		$.ajax({
			type: 'post', dataType: 'json', url: apiUrl + 'login',
			data: { account: $('#account').val(), password: $('#password').val(), remember: $('#remember').val() },
			success: function (json) {
				if (json.ret == 1) { location.href = '/'; return true; }
				$('#alert-window').find('.modal-body > p').html(json.msg).end().modal('show');
			},
			error: function(json){ }
		});
	});
};

var initDesktop = function() {
	var open = function(path, o) {
		var app = path.split('/')[0], url = $('[app=' + app + ']').attr('url');
		if (o) $('[app=' + app + ']').click();
		$('#' + app + '-frame').attr('src', url + path);
		var obj = $('.desktop-container .window-nav [path="' + path + '"]');
		obj.parent().find('[path]').removeClass('active');
		obj.addClass('active');
		location.hash = path;
	};
	$('.desktop-container .window-nav').on('click', '[path]', function() { open($(this).attr('path'), true); });
	$('.desktop-container .window-op .window-refresh').click(function() {
		var id = $(this).parent().parent().parent().attr('id').split('-')[0];
		if (top.window.frames[id + "-frame"].location) top.window.frames[id + "-frame"].location.reload();
        else document.getElementById(id + "-frame").contentDocument.location.reload();
	});
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="dropdown"]').dropdown();
	$('.dock-menus').on('click', '[app]', function() {
		var app = $(this).attr('app');
		if (app === 'desktop') {
			if ($('.desktop-container').hasClass('hide')) {
				$('.desktop-container').removeClass('hide');
				$('.desktop-component').addClass('hide');
				app = $('.desktop-container > .window:not(.hide)').first().attr('app').split('-')[0];
				$('.desktop-dock > .dock-menus > .dock-menu[app=' + app + ']').click();
			} else {
				$('.desktop-container').addClass('hide');
				$('.desktop-component').removeClass('hide');
				$('.desktop-dock > .dock-menus > .dock-menu').removeClass('active');
			}
			return false;
		}
		$('.desktop-dock > .dock-menus > .dock-menu').removeClass('active');
		$('.desktop-container > .window').addClass('hide');
		$('#' + app.split('/')[0] + '-container').removeClass('hide').parent().removeClass('hide');
		$(this).addClass('active');

		if ($('#' + app + '-container .window-nav a.active').length == 0) open($('#' + app + '-container .window-nav a[path]:first').attr('path'));
	});
	if (location.hash.length > 1) open(location.hash.substr(1), true);
	$('[path="setting/profile"]').click(function(){ open('setting/profile', true); });
	$('.bgcolors > li > a').click(function(){
		var me = $(this), color = me.attr('color');
		$.ajax({
			type: 'post', dataType: 'json', url: apiUrl + 'bgcolor',
			data: { color: color },
			success: function (json) {
				$('body').css('background-color', color);
				$('.bgcolors > li').removeClass('active');
				me.parent().addClass('active');
			}
		});
	});
};

var initSettingProfile = function() {
	//safeUrl();
};