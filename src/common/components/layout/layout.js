define(function(require) {
	require('./layout.css');

	var ZLEVEL = 100;

	var pages = $('.spa-page');
	var len = pages.length;

	// 设置每一个pageview的z-index
	pages
		.each(function(i) {
			$(this).css('z-index',ZLEVEL + len - i);
		})
		.first()
		.css('visibility','visible'); // 并默认显示第一个页面


	//  不需要设置zindex  因为页面visibility属性隐藏了
	// 设置每个页面里面的存在的子页面的样式
	// pages
	// 	.find('.spa-page-body>.spa-page-container')
	// 	.each(function(i) {
	// 	$(this).css('z-index',ZLEVEL + len - i);
	// }); // 并默认显示第一个子页面

});