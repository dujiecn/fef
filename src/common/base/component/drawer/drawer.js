define("common/base/component/drawer/drawer", function(require, exports, module) {
	function Drawer(element) {
		// var drawerElem = $(".u-panel-drawer");
		var drawerElem = $(element);
		if (drawerElem.length == 0)
			return;

		var headerElem = drawerElem.children(".header");
		var contentElem = drawerElem.children(".content");
		var footerElem = null;
		this.cancelButton = null;
		this.submitButton = null;
		var arrowElem = null;
		var currentChanged = null;

		// 抽屉状态（开启或者关闭）
		this.isClose = true;

		/*
			设置样式
		*/
		Drawer.prototype.reset = function() {
			var w = headerElem.outerWidth();
			headerElem.find("li").width(w / headerElem.find("li").length);
			return this;
		};

		/*
			创建页脚
		*/
		Drawer.prototype.createFooter = function() {
			$("<div>").addClass('footer').html(function() {
				return "<ul><li class='cancel'>取 消</li><li class='submit'>完 成</li></ul>";
			}).appendTo(drawerElem);

			footerElem = drawerElem.find(".footer");
			this.cancelButton = footerElem.find(".cancel");
			this.submitButton = footerElem.find(".submit");
			return this;
		};

		Drawer.prototype.bindHandler = function(handlerElem) {
			// 触发打开选择条件菜单
			$(handlerElem).off("click").on("click", function() {
				if (drawerElem.hasClass('show')) {
					this.close();
				} else {
					this.open();
				}
			}.bind(this));
			return this;
		};
		
		Drawer.prototype.bindHandlerForNative = function() {
			if (drawerElem.hasClass('show')) {
				this.close();
			} else {
				this.open();
			}
		}
		
		

		/*
			抽屉关闭
		*/
		Drawer.prototype.close = function() {
			drawerElem.removeClass('show').height(0);
			headerElem.find("li.active").removeClass("active");
			footerElem.css("visibility", "hidden");
			arrowElem.hide(250, function() {
				contentElem.children().hide().removeClass('show');
			});
			this.isClose = true;
		};


		/*
			抽屉隐藏内容部分
		*/
		Drawer.prototype.hidden = function(callback) {
			drawerElem.addClass('show').height(headerElem.outerHeight() - 1);
			headerElem.find("li.active").removeClass("active");
			footerElem.css("visibility", "hidden");
			arrowElem.hide(250, function() {
				contentElem.children().hide().removeClass('show');
				callback && callback();
			});
		};



		/*
			抽屉打开
		*/
		Drawer.prototype.open = function() {
			drawerElem.addClass('show').height(headerElem.outerHeight() - 1);
			this.isClose = false;
		};

		Drawer.prototype.bind = function() {
			// 页脚的关闭事件
			this.cancelButton.on("click", function() {
				this.hidden();
			}.bind(this));

			// 导航菜单事件
			headerElem.find("li").on("click", function() {
				if (currentChanged != null) {
					return;
				}

				var _this = $(this);
				if (_this.hasClass('active'))
					return;

				// 菜单本身的样式切换
				$(this).parent().find("li.active").removeClass('active');
				$(this).addClass('active');

				//箭头动画
				if (arrowElem.is(":hidden")) {
					arrowElem.show();
				}
				arrowElem.css({
					left: $(this).offset().left + $(this).outerWidth() * 0.5 + headerElem.scrollLeft()
				});

				// 隐藏当前显示的内容区域元素
				if (contentElem.find(".show").length > 0) {
					currentChanged = contentElem.find(".show");
					currentChanged.fadeOut(125, function() {
						contentElem.find(".show").hide().removeClass('show');
						// 定位到与当前选中的菜单对应的内容元素并显示
						contentElem.find("[for=" + _this.attr("id") + "]").addClass('show').fadeIn(125);
						drawerElem.height(headerElem.outerHeight() + contentElem.outerHeight() + footerElem.outerHeight());
						currentChanged = null;
					}).removeClass('show');
				} else {
					contentElem.find("[for=" + _this.attr("id") + "]").addClass('show').fadeIn(125);
					// 刷新抽屉的高度
					drawerElem.height(headerElem.outerHeight() + contentElem.outerHeight() + footerElem.outerHeight());
				}

				setTimeout(function() {
					footerElem.css("visibility", "visible");
				}, 80);



			}).on("touchstart", function(e) {
				e.stopPropagation();
			}).on("touchmove", function(e) {
				e.stopPropagation();
			});

			return this;
		};

		Drawer.prototype.createArrow = function() {
			arrowElem = $("<span>").addClass('arrow').appendTo(headerElem.find("ul"));
			return this;
		}

		this.reset().createFooter().createArrow().bind();
	}


	module.exports.Drawer = Drawer;
});