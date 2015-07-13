define("common/base/component/gridview/gridview", function(require, exports, module) {
	function GridView(element, expansion) {
		if (element) {
			this.isCreated = true;
			this.wrapper = $("<ul class='u-grid-list'>").appendTo($(element));
		}

		/*
			mainElem 显示的table数据
			contentElem 隐藏的table数据
			color 当前行显示的颜色
		*/
		GridView.prototype.add = function(mainElem, contentElem, color) {
			// 创建架子
			var li = $("<li>");
			var mainWrapper = $("<div class='u-grid-header'>");
			var contentWrapper = $("<div class='u-grid-content'>");
			mainWrapper.append("<span>").append(mainElem);
			contentWrapper.html(contentElem);

			var wrapper = this.wrapper;

			li.append(mainWrapper)
			  .append(contentWrapper)
			  .appendTo(wrapper).on("click", function() { // 如果使用touchend事件，结合页面的translate会失效。。可能原因是绑定的时候页面记住了touch的位置导致失效
				if(contentElem) {
					if ($(this).hasClass('active')) {
						$(this).removeClass('active');
						contentWrapper.height(0);
					} else {
						wrapper.children('li.active').trigger("click");
						$(this).addClass('active');
						contentWrapper.height(contentWrapper.children().outerHeight());
						color && mainWrapper.children("span").css("backgroundColor", color);
					}
				}else {
					$(this).parent().children('.selected').removeClass('selected');
					$(this).addClass('selected')
				}
			});

			return this;
		}

		GridView.prototype.addTitle = function(titleElem) {
			var titleWrapper = $("<div class='u-grid-title'>");
			titleWrapper.append($(titleElem));
			$("<li>").append(titleWrapper).prependTo(this.wrapper);
		}


		/*test code*/
		// $(".u-grid-list li").on("click", function() {
		// 	if ($(this).hasClass('active')) {
		// 		$(this).removeClass('active')
		// 			.find("div:eq(1)").height(0);
		// 	} else {
		// 		$(".u-grid-list li.active").trigger("click"); //.removeClass("active");

		// 		$(this).addClass('active')
		// 			.find("div:eq(1)").height($(this).find("div:eq(1)").children().outerHeight());

		// 		$(this).find("div>span").css("backgroundColor", $(this).find("table td:first").css("color"));
		// 	}
		// });


	}

	module.exports.GridView = GridView;
});