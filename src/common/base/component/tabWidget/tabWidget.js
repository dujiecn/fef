/**
 *
 * @authors Your Name (you@example.org)
 * @date    2014-12-15 14:12:37
 * @version $Id$
 * @description tab标签切换组件
 */
define("common/base/component/tabWidget/tabWidget",function(require, exports, module) {
	function Tab(element) {
		var _this = this;
		var rootElement = $(element);
		this.ulElement = $("<ul>").addClass("u-tab").appendTo(rootElement);
		var backItem = null;

		/*
			参数接收多个string类型的字符串，或者一个string类型的数组
		*/
		Tab.prototype.render = function() {
			createHTML.apply(this, arguments);
			bind();
			return this;
		};

		Tab.prototype.getActiveIndex = function() {
			return this.ulElement.find("li.active").index() + 1;
		}


		function createHTML() {
			var height = rootElement.height();
			var width = rootElement.width();
			
			var w = width / arguments[0].length;


			for (var i in arguments[0]) {
				var _li = $("<li>");
				_li.addClass("item").css({
					"width" : w,
					"height": height,
					"lineHeight": height + "px",
				}).text(arguments[0][i]).appendTo(this.ulElement);
			}

			this.ulElement.find(".item:first").addClass("active");

			backItem = $("<li>").addClass("back")
				.css({
					"width" : w,
					"height": height,
					"lineHeight": height + "px",
				}).appendTo(this.ulElement);


			arguments[1] && arguments[1].call();	
		}

		function bind() {
			_this.ulElement.find("li.item").on("click", function() {
				_this.ulElement.find("li.active").removeClass("active");
				$(this).addClass("active");
				var left = $(this).position().left;
				backItem.css("left", left);
			});
		}
	}

	module.exports.Tab = Tab;
});