/**
 * 页面骨架
 */
define("common/base/imobilebone/imobilebone", function(require, exports, module) {
	// 需要使用扩展jquery方法
	require("common/module/extend/extend");

	function initialize() {
		IMobilebone.init();
	}

	var IMobilebone = {};

	IMobilebone.pageElements = $("body>[data-role='page']");

	// 使用手势
	//	IMobilebone.useSign = true;

	IMobilebone.init = function() {
		this.reset();

		this.swipe();
	};

	IMobilebone.reset = function() {
		this.pageElements.each(function(index) {
			var translate = index * window.innerWidth;

			// 保存最初的位移和是实时位移（初始化的时候两个值一样）
			$(this).data("translate", {
					origin: translate,
					real: translate
				})
				.css({
					transition: "none",
					transform: "translateX(" + $(this).data("translate").origin + "px)",
					webkitTransform: "translateX(" + $(this).data("translate").origin + "px)"
				});
		});
	};

	IMobilebone.swipe = function() {
		var _this = this;
		SignEvent.swipe(document.body, function(e, p1, p2) {

			if (_this.pageElements.first().data("translate").real + p2.x > 0 ||
				_this.pageElements.last().data("translate").real + p2.x < 0)
				return;

			if (this.signDirection == this.direction.UP || this.signDirection == this.direction.DOWN)
				return;

			//	保存实时的位移
			e.preventDefault();
			_this.pageElements.each(function() {
				var translate = $(this).data("translate").real + p2.x;
				$(this).css({
					transition: "none",
					transform: "translateX(" + translate + "px)",
					webkitTransform: "translateX(" + translate + "px)"
				}).data("translate").real = translate;
			});

		}, function(e, p1, p2) {
			// touchend 调用事件
			var _self = this;

			if (_this.pageElements.first().data("translate").real + p2.x >= 0 ||
				_this.pageElements.last().data("translate").real + p2.x <= 0)
				return;

			_this.pageElements.each(function() {
				var realTranslate = $(this).data("translate").real;
				var originTranslate = $(this).data("translate").origin;

				if (p1.x > window.innerWidth * 0.3) {
					originTranslate += window.innerWidth;
				} else if (p1.x < -window.innerWidth * 0.3) {
					originTranslate -= window.innerWidth;
				}


				$(this).data("translate", {
						origin: originTranslate,
						real: originTranslate
					})
					.removeStyleProperty("transition")
					.css({
						transform: "translateX(" + originTranslate + "px)",
						webkitTransform: "translateX(" + originTranslate + "px)"
					});
			});
		});
	};


	/**
	 * 手势事件 上下左右方向
	 */
	var SignEvent = {
		/*
		 * 手势方向
		 */
		direction: {
			UP: 1,
			RIGHT: 2,
			DOWN: 3,
			LEFT: 4
		},
		/*
		 * 当前手势方向
		 */
		signDirection: null,
		/*
		 * 开始鼠标位置
		 */
		startPoint: {},
		/*
		 * 结束鼠标位置
		 */
		endPoint: {},
		/**
		 * 获取角度
		 */
		getAngle: function(dx, dy) {
			return Math.atan2(dy, dx) * 180 / Math.PI;
		},
		/**
		 * 根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动
		 */
		getDirection: function(startPoint, endPoint) {
			var dx = endPoint.x - startPoint.x;
			var dy = endPoint.y - startPoint.y;
			var angle = this.getAngle(dx, dy);

			if (isNaN(angle))
				return;


			var result = 0;
			if (Math.abs(angle) <= 45)
				result = this.direction.RIGHT;
			else if (Math.abs(angle) >= 135)
				result = this.direction.LEFT;
			else if (angle <= -45 && angle >= -135)
				result = this.direction.UP;
			else if (angle >= 45 && angle <= 135)
				result = this.direction.DOWN;
			return result;
		},
		/**
		 * 获取移动的距离
		 */
		getMoveDirection: function(startPoint, endPoint) {
			var direction = this.getDirection(startPoint, endPoint);

			if (direction == this.direction.UP || direction == this.direction.DOWN)
				return endPoint.y - startPoint.y;
			else if (direction == this.direction.LEFT || direction == this.direction.RIGHT)
				return endPoint.x - startPoint.x;
		},
		swipe: function(element, moveCallback, endCallback) {
			var _this = this;
			var startPoint =
				startTempPoint =
				endPoint = {};

			$(element).on("touchstart", function(e) {
				_this.signDirection = null;
				e.stopPropagation();
				var point = {
					x: e.originalEvent.touches[0].clientX,
					y: e.originalEvent.touches[0].clientY
				};

				startPoint = $.extend({}, point);
				startTempPoint = $.extend({}, point);
				endPoint = $.extend({}, point);

				// 绑定move事件
				$(this).on("touchmove", function(e) {
					e.stopPropagation();

					endPoint = {
						x: e.originalEvent.touches[0].clientX,
						y: e.originalEvent.touches[0].clientY
					};

					// 保存当前手势方向
					_this.signDirection == null && (_this.signDirection = _this.getDirection(startTempPoint, endPoint));

					moveCallback && moveCallback.call(_this, e, {
						x: endPoint.x - startTempPoint.x,
						y: endPoint.y - startTempPoint.y
					}, {
						x: endPoint.x - startPoint.x,
						y: endPoint.y - startPoint.y
					});

					$.extend(startPoint, endPoint);
				});
			}).on("touchend", function(e) {
				e.stopPropagation();

				endCallback && endCallback.call(_this, e, {
					x: endPoint.x - startTempPoint.x,
					y: endPoint.y - startTempPoint.y
				}, {
					x: endPoint.x - startPoint.x,
					y: endPoint.y - startPoint.y
				});

			});
		}
	};

	module.exports.initialize = initialize;
});