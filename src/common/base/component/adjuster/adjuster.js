define("common/base/component/adjuster/adjuster", function(require, exports, module) {
	function Adjuster(element) {
		var _this = this,
			rootElement = $(element),
			maxValue = 1000;

		this.groupElement = $("<div>").addClass('u-adjuster-group').appendTo(rootElement);
		// 记录进度条个数
		this.adjusterNumer = 0;
		
		this.group = [];
		
		Adjuster.prototype.render = function() {
			this.adjusterNumer++;
			var containerElem = $("<div>").addClass("u-progress");
			var progressElem = $("<progress min='0' value='0' max=" + maxValue / this.adjusterNumer + ">");
			var handlerELem = $("<a>");
			containerElem.append(progressElem).append(handlerELem).appendTo(this.groupElement);

			this.group.push(containerElem);


			function bind() {
				var width = progressElem.width();
				var touch = {};
				var left = 0;
				handlerELem.on("touchstart", function(e) {
					//清除偏移量
					touch.offsetX = 0;
					//记录刚刚开始按下的时间
					touch.startTime = new Date() * 1;
					//记录手指按下的坐标
					touch.startX = e.originalEvent.touches[0].pageX;

				}).on("touchmove", function(e) {
					e.preventDefault();
					//计算手指的偏移量
					touch.offsetX = e.originalEvent.targetTouches[0].pageX - touch.startX;
					var offset = left + (touch.offsetX / width) * 100;
					if (offset < 0)
						offset = 0;
					else if (offset > 100)
						offset = 100;

					$(this).css("left", offset + "%");
					progressElem.attr("value",offset * maxValue * 0.01);
				}).on("touchend", function(e) {
					e.preventDefault();
					//手指抬起的时间值
					touch.endTime = new Date() * 1;
					// 保存当前的偏移量
					left += (touch.offsetX / width) * 100;
				});
			}

			bind();
		};
	}




	exports.Adjuster = Adjuster;
});