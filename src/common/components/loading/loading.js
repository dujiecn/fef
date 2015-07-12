define(function(require,exports,module) {
	var loading = {};

	// 加载条状态 0 关闭 1 打开
	loading.status = 0;

	// 超时时间
	loading.time = 6000;

	/*
		创建loading
	*/
	loading.create = function() {
		if($('.spa-loader').length > 0) {
			return;
		}

		// loadingEle = $('<div class="loading">');
		// var $div = $('<div class="c-loading-a">');
		// var $div2 = $('<div class="spinner">');
		// for(var i = 1;i < 6;i++) {
		// 	$('<div>').addClass('rect')
		// 		.addClass('r' + i)
		// 		.appendTo($div2);
		// }

		// $div.append($div2);
		// loadingEle.append($div)
		// 	.appendTo(document.body);


		var html = '<div class="spa-loader">\
				<div class="spa-loader-animate">\
					<div class="bg"></div>\
					<span class="ball"></span>\
					<span class="ball"></span>\
				</div>\
			</div>';

		$(document.body).append(html);	

		this.close();	
	};

	/*
		打开loading
	*/
	loading.open = function(callback) {
		$('.spa-loader').show();
		this.status = 1;

		setTimeout(function() {
			if(this.status == 1) {
				this.close();
				this.status = 0;
				callback && callback();
			}
		}.bind(this), this.time);
	};

	/*
		关闭loading
	*/
	loading.close = function() {
		$('.spa-loader').hide();
		this.status = 0;
	};


	loading.create();

	module.exports = loading;
});