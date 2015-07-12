define(function(require) {
	require('./nav.css');

	// 初始化页面导航配置标签
	$('.navbar').each(function(i) {
		var that = $(this);
		var container = $('<nav class="navbar-header">');
		var navs = that.data('navs').split(",");
		var active = that.data('active');
		$.each(navs,function(j,d) {
			container.append(
				'<a class="navbar-brand'+(d == active ? ' active' : '')+'" href="javascript:void(0);">'+d+'</a>'
			);
		});
		that.append(container);
	});



	var navs = $('.navbar-brand');
	var Hammer = require('hammer');

	// 绑定导航事件，这里的事件不完全，如果有需要，后面自己切换页面的时候补充ajax请求
	navs.each(function(i,el) {
		var hammer = new Hammer(el);

		hammer.on('tap',function(e) {
			var subpages = 	
				navs
					.eq(i)
					.parents('.spa-page-body')
					.find('.spa-page-container');

			// 去除原来的页面的选中状态		
			subpages.removeClass('active');
			subpages.eq(i).addClass('active');

			navs.removeClass('active');
			navs.eq(i).addClass('active');
		});

	});
});