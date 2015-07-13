/*
	菜单查询条件组件
*/
define("common/base/component/menuComponent/menuComponent",function(require, exports, module) {
	function config(element) {
		var menu = new Object();
		menu.element = $(element);
		menu.liElements = menu.element.find("li");
		menu.MIN_WIDTH = 99;
		set(menu);
	}

	function set(menu) {
		var number = menu.liElements.length;
		var sumLength = menu.MIN_WIDTH * number;
		var screenWidth = document.body.clientWidth || window.innerWidth;
		if (sumLength > screenWidth) {
			menu.liElements.width(menu.MIN_WIDTH);
		} else {
			var avgWidth = screenWidth / number;
			menu.liElements.each(function(index) {
				menu.liElements[index].style.width = avgWidth + 'px';
			});
		}
	}

	module.exports.config = config;
});