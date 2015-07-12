/*
	页面布局
*/
define(function(require,exports,module) {
	var Hammer = require('hammer');

	var baseZlevel = 100;

	/*
		设置page的层级
	*/
	function setPageZlevel() {
		var len = $('.spa-page').length;
		$('.spa-page').each(function(i) {
			$(this).css('z-index',baseZlevel + len - i);
		});
	}


	/*
		导航事件
	*/
	function homeNavbarEvent() {

		var pages = $('.navbar-brand')
			.parents('.spa-page-body')
			.children('.page-container-navbar');

		$('.spa-page-body .navbar-brand').each(function(i,el) {
			var hammer = new Hammer(el);
			hammer.on('tap',function(e) {
				var $target = $(e.target);
				var pages = $target
					.parents('.spa-page-body')
					.children('.page-container-navbar');

				pages.addClass("spa-hide").removeClass('spa-show');
				pages.eq($target.index()).removeClass('spa-hide').addClass('spa-show');

				$target.parent().children().removeClass('active');
				$target.addClass('active');

			});
		});
	}


	(function() {
		setPageZlevel();
		homeNavbarEvent();
	})();


});