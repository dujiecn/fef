/**
 * 页面骨架
 */
define("common/base/component/pageview/pageview", function(require, exports, module) {
	var PageView = {};
	PageView.pageElements = $("body>[data-role='page']");
	PageView.footerElement = $("body>[data-role='footer']");

	/*
		初始化的入口函数
	*/
	PageView.initialize = function() {
		if (this.pageElements.length <= 1)
			return;

		this.resetStyle();

		if (this.footerElement.length > 0) {
			this.registFooterEvent();
			// 默认选中第一个
			this.footerElement.find("li:first").trigger("touchstart");
		}
	};

	/*
		设置初始化样式
	*/
	PageView.resetStyle = function() {
		// 如果页面有页脚则需要设置内容区域
		if (this.footerElement.length > 0) {
			// this.pageElements.each(function(index) {
			// 	var translate = index * 100 + "%";
			// 	$(this).css({
			// 		"transform": "translateX(" + translate + ")",
			// 		"webkiTransform": "translateX(" + translate + ")"
			// 	});
			// });
			this.pageElements.addClass('page-footer');
			var liElements = this.footerElement.find("li");
			liElements.width(100 / liElements.length + "%");
		}

		return this;
	};

	/*
		注册页脚事件
	*/
	PageView.registFooterEvent = function() {
		var _this = this;
		this.footerElement.find("li").each(function(currentIndex) {
			$(this).on("touchstart", function() {
				// 当前显示的tab对象
				var activeLi = $(this).parent().children(".active");
				// 当前显示的下标
				var activeIndex = activeLi.index();
				// 即将要显示的下标
				// currentIndex

				// 当前没有显示的对象
				if (activeIndex == -1) {
					$(this).addClass('active');
					_this.pageElements.each(function(index) {
						var translate = (index - currentIndex) * 100 + "%";
						$(this).css({
							"transform": "translateX(" + translate + ")",
							"webkiTransform": "translateX(" + translate + ")"
						});
					});
				} else {
					// 设置切换样式
					activeLi.removeClass('active');
					$(this).addClass('active');

					// 判断需要显示的page所在的位置进行移位
					if (currentIndex == activeIndex) {
						return;
					} else if (currentIndex > activeIndex) {
						_this.pageElements.eq(activeIndex).css({
							"transform": "translateX(-100%)",
							"webkiTransform": "translateX(-100%)"
						});
						_this.pageElements.eq(currentIndex).css({
							"transform": "translateX(0)",
							"webkiTransform": "translateX(0)"
						});
					} else if (currentIndex < activeIndex) {
						_this.pageElements.eq(activeIndex).css({
							"transform": "translateX(100%)",
							"webkiTransform": "translateX(100%)"
						});
						_this.pageElements.eq(currentIndex).css({
							"transform": "translateX(0)",
							"webkiTransform": "translateX(0)"
						});
					}

					// _this.pageElements.eq(currentIndex).on("transitionend", function() {
					// 	_this.pageElements.not(":eq(" + currentIndex + ")").each(function(index) {
					// 		var translate = (index - currentIndex) * 100 + "%";
					// 		$(this).css({
					// 			"transform": "translateX(" + translate + ")",
					// 			"webkiTransform": "translateX(" + translate + ")"
					// 		})
					// 	});
					// });
				}
			});
		});
	};



	$(function() {
		PageView.initialize();
	});

});