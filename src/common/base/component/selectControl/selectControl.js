/**
 *
 * @authors dujie (760813193@qq.com)
 * @date    2014-12-05 11:00:55
 * @version 1.2
 * @description 切换查询菜单的组件
 * {name:"",id:"",value:"",check:boolean,children:[]}
 * 原来的selectWidget支持事务不行
 */
define("common/base/component/selectControl/selectControl", function(require, exports, module) {
	/*
		根节点可以配置：
		data-ignore-rootnode 设置根节点是否忽略
		data-select-type 设置选择模式
		data-branch-scrollable 树枝是否启用scroll
		data-leaf-scrollable 叶子是否启用scroll
	*/
	function SelectControl(option) {
		// 存放选择控件的容器
		this.element = $(option.container);
		// 是否忽略根节点
		this.ignoreRootNode = option.ignoreRootNode == undefined ? false : option.ignoreRootNode;
		// 选择框的类型 多选|单选
		this.type = option.type || "single";
		// 树枝是否启用scroll滑动
		this.branchScrollable = option.branchScrollable == undefined ? false : option.branchScrollable;
		// 叶子是否启用scroll滑动
		this.leafScrollable = option.leafScrollable == undefined ? false : option.leafScrollable;

		// 根节点
		this.rootElement = null;

		// 用来保存当前选中的内容
		this.selectElement = null;
		this.select_input_element = null;
		this.select_arrow_element = null;

		// 存放树枝列表的标签
		this.branchesElement = null;
		this.branchesUlElement = null;

		// 显示叶子列表的标签 
		this.leaves_wrapper_element = null;
		this.leavesElement = null;
		this.leavesUlElement = null;

		// 保存当前选中的节点数据，最终用户点击完成的数据
		this.selected_node_map = {};
		// 临时保存选中的节点
		this.temp_node_map = {};

		// 转换过的node对象
		this.rootNode = null;

		// 最后一次被确认选中的父节点
		this.lastCheckedBranchNode = null;
	};


	/*
		渲染html的入口函数
	*/
	SelectControl.prototype.render = function(data) {
		this.createHtmlTag();
		this.setStyle();
		this.parse(data);
		this.renderBranches();
		this.branchUseScroll(function() {
			this.branchesElement.hide();
			this.bind();
			this.leafUseScroll();
		}.bind(this));
		return this;
	};

	/*
		渲染html的入口函数
	*/
	SelectControl.prototype.refresh = function(data) {
		this.renderBranches();
		this.bind();
		return this;
	};


	/*
		创建需要的标签元素
	*/
	SelectControl.prototype.createHtmlTag = function() {
		this.rootElement = $("<div class='u-select-panel'>");

		// 构造下拉选择框节点
		this.selectElement = $("<div class='u-select'>");
		this.select_input_element = $("<input type='text' readonly>");
		this.select_arrow_element = $("<span class='arrow'>");
		this.selectElement.append(this.select_input_element).append(this.select_arrow_element);

		// 构造树枝节点
		this.branchesElement = $("<div class='u-branch-list u-select-list'>");
		this.branchesUlElement = $("<ul>");
		this.branchesElement.html(this.branchesUlElement);

		// 构造叶子节点
		this.leaves_wrapper_element = $("<div class='u-leaf-wrapper u-select-list'>")
		this.leavesElement = $("<div class='u-leaf-list'>");
		this.leavesUlElement = $("<ul>");
		this.leavesElement.html(this.leavesUlElement);
		this.leaves_wrapper_element.html(this.leavesElement);


		this.rootElement.append(this.selectElement)
			.append(this.branchesElement)
			.append(this.leaves_wrapper_element);
		this.element.html(this.rootElement);
	};


	/*
		设置样式
	*/
	SelectControl.prototype.setStyle = function() {
		var width = this.element.width();
		var height = this.element.height();

		this.rootElement.outerWidth(width);
		this.rootElement.outerHeight(height);

		var rootElementWidth = this.rootElement.width();
		var rootElementHeight = this.rootElement.height();

		this.selectElement.outerWidth(rootElementWidth);
		this.select_input_element.outerWidth(this.selectElement.width() * 0.88);
		this.select_arrow_element.outerWidth(this.selectElement.width() * 0.12);

		this.branchesElement.outerWidth(rootElementWidth);

		this.leaves_wrapper_element.outerWidth(rootElementWidth);
		this.leaves_wrapper_element.outerHeight(rootElementHeight - this.leaves_wrapper_element.position().top - this.selectElement.height());
	};

	/*
		解析数据 封装树枝和叶子数组
	*/
	SelectControl.prototype.parse = function(data) {
		var _this = this;

		/*
			处理data数据 转换成node对象
		*/
		function recursive(node) {
			if (node.data.children) {
				node.childrenNodes = [];
				for (var i = 0; i < node.data.children.length; i++) {
					var child = new Node(node.data.children[i], node);
					node.childrenNodes.push(child);
					recursive(child);
				}
			}

			// 如果节点有check为true 则表示该节点被选中
			if (node.check == true && _this.lastCheckedBranchNode == null) {
				// node.parentNode.check = true;
				_this.lastCheckedBranchNode = node.parentNode;
				_this.selected_node_map[node.id] = node;
				_this.temp_node_map[node.id] = node;
			}
		}

		this.rootNode = new Node(data, null);
		recursive(this.rootNode);
	};

	/*
		渲染树枝
	*/
	SelectControl.prototype.renderBranches = function() {
		this.branchesUlElement.empty();
		if (this.ignoreRootNode) {
			for (var i = 0; i < this.rootNode.childrenNodes.length; i++) {
				var node = this.rootNode.childrenNodes[i];
				var _li = $("<li>");
				_li.data("node", node)
					.text(node.name)
					.appendTo(this.branchesUlElement);
			}

			var checkNode = null;
			var checkLi = null;
			if (this.lastCheckedBranchNode) {
				checkNode = this.lastCheckedBranchNode;
				checkLi = this.branchesUlElement.find(":contains("+this.lastCheckedBranchNode.name+")");
			} else {
				// 没有设置选中的节点，则默认是第一个节点
				checkNode = this.rootNode.childrenNodes[0];
				checkLi = this.branchesUlElement.find(":first");
			}
			this.setSelectedBranchStyle(checkLi);
			this.select_input_element.val(checkNode.name);
			this.renderLeaves(checkNode);
		}
	};

	/*
		设置树枝选中样式
	*/
	SelectControl.prototype.setSelectedBranchStyle = function(branchElement) {
		branchElement.parent().find(".active").removeClass("active");
		branchElement.addClass("active");
	}

	/*
		渲染叶子
	*/
	SelectControl.prototype.renderLeaves = function(node) {
		this.leavesUlElement.empty();
		for (var i = 0; i < node.childrenNodes.length; i++) {
			var tempNode = node.childrenNodes[i];
			var _li = $("<li>");
			_li.addClass(this.type).data("node", tempNode)
				.text(tempNode.name)
				.appendTo(this.leavesUlElement);

			// 第一次初始化需要判断默认选中的叶子
			if (this.temp_node_map[tempNode.id]) {
				_li.addClass("active");
			}
		}
	};

	/*
		点击树枝刷新叶子
	*/
	SelectControl.prototype.refreshLeaves = function(node) {
		this.renderLeaves(node);
		this.bindLeaves();
	};

	/*
		叶子动画
	*/
	SelectControl.prototype.leavesAnimation = function(callback) {
		this.leavesUlElement.css("opacity", "0");
		setTimeout(function() {
			this.leavesUlElement.css("opacity", "1");
			callback && callback();
		}.bind(this), 250);
	};

	/*
		打开箭头
	*/
	SelectControl.prototype.openArrow = function() {
		this.select_arrow_element.addClass("active");
	};

	/*
		关闭箭头
	*/
	SelectControl.prototype.closeArrow = function() {
		this.select_arrow_element.removeClass("active");
	};

	/*
		树枝启用scroll
	*/
	SelectControl.prototype.branchUseScroll = function(callback) {
		if (this.branchScrollable) {
			var myScroll = new IScroll(this.branchesElement[0], {
				mouseWheel: false,
				scrollbars: false,
				click: true,
				bounce: false,
				shrinkScrollbars: 'scale',
				fadeScrollbars: true
			});
			this.branchesElement.data("myScroll", myScroll);
		}
		callback && callback();
	};

	/*
		叶子启用scroll
	*/
	SelectControl.prototype.leafUseScroll = function(callback) {
		if (this.leafScrollable) {
			var myScroll = new IScroll(this.leaves_wrapper_element[0], {
				mouseWheel: false,
				scrollbars: false,
				click: true,
				bounce: false,
				shrinkScrollbars: 'scale',
				fadeScrollbars: true
			});
			this.leaves_wrapper_element.data("myScroll", myScroll);
		}
		callback && callback();
	};

	/*
		绑定事件
	*/
	SelectControl.prototype.bind = function() {
		var _this = this;
		this.selectElement.off("click").on("click", function() {
			_this.branchesElement.fadeToggle();
			if (_this.select_arrow_element.hasClass('active')) {
				_this.select_arrow_element.removeClass('active');
			} else {
				_this.select_arrow_element.addClass('active');
			}
		});

		this.bindLeaves();
		this.bindBranches();
	};

	/*
		绑定叶子的事件
	*/
	SelectControl.prototype.bindLeaves = function() {
		var _this = this;

		if (this.type == "single") {
			this.leavesUlElement.find("li").on("click", function() {
				_this.branchesElement.hide();

				_this.closeArrow();

				_this.clearMap();

				$(this).parent().find(".active").removeClass("active");
				$(this).addClass("active");

				var node = $(this).data("node");

				_this.temp_node_map[node.id] = node;

			});
		} else if (this.type == "multi") {
			this.leavesUlElement.find("li").on("click", function() {
				_this.branchesElement.hide();

				_this.closeArrow();

				var node = $(this).data("node");

				if ($(this).hasClass("active")) {
					$(this).removeClass("active");
					delete _this.temp_node_map[node.id];
				} else {
					$(this).addClass("active");
					_this.temp_node_map[node.id] = node;
				}
			});
		}


		this.leavesUlElement.find("li").on("click", function() {
			_this.branchesElement.hide();
			_this.closeArrow();
			var node = $(this).data("node");
			if (this.type == "single") {
				$(this).parent().find(".active").removeClass("active");
				$(this).addClass("active");
				_this.clearMap();
				_this.temp_node_map[node.id] = node;
			} else if (this.type == "multi") {
				if ($(this).hasClass("active")) {
					$(this).removeClass("active");
					delete _this.temp_node_map[node.id];
				} else {
					$(this).addClass("active");
					_this.temp_node_map[node.id] = node;
				}
			}
		});
	};

	/*
		绑定树枝的事件
	*/
	SelectControl.prototype.bindBranches = function() {
		var _this = this;

		this.branchesUlElement.find("li").on("click", function() {
			_this.branchesElement.hide();

			_this.closeArrow();

			_this.setSelectedBranchStyle($(this));

			_this.setSelectedBranchText($(this).text());

			_this.refreshLeaves($(this).data("node"));
		});
	};

	/*
		设置input框值
	*/
	SelectControl.prototype.setSelectedBranchText = function(text) {
		this.select_input_element.val(text);
	}

	SelectControl.prototype.rollback = function() {
		this.temp_node_map = $.extend(true, {}, this.selected_node_map);
		this.refresh();
	};
	SelectControl.prototype.commit = function() {
		this.selected_node_map = $.extend(true, {}, this.temp_node_map);
		// 更新当前选中的父节点
		this.lastCheckedBranchNode = this.branchesUlElement.find("li.active").data("node");
	};

	/*
		单选的时候返回选中的唯一的叶子节点
	*/
	SelectControl.prototype.queryNode = function() {
		this.commit();
		for (var key in this.selected_node_map)
			return this.selected_node_map[key];
	};
	/*
		多选的时候返回所有的选中的叶子节点
	*/
	SelectControl.prototype.queryAllNodes = function() {
		this.commit();
		var nodes = [];
		for (var key in this.selected_node_map)
			nodes.push(this.selected_node_map[key]);
		return nodes;
	};
	/*
		多选的时候返回当前树枝下面的所有被选中的叶子节点
	*/
	SelectControl.prototype.queryCurrentNodes = function() {
		this.commit();
		var nodes = [];
		this.leavesUlElement.find("li.active").each(function() {
			nodes.push($(this).data("node"));
		});

		return nodes;
	};

	/*
		返回当前选中的父条件
	*/
	// SelectControl.prototype.queryCurrentConditionNodes = function() {
	// 	return this.branchesUlElement.find("li.active").data("node");
	// };

	SelectControl.prototype.clearMap = function() {
		for (var i in this.selected_node_map)
			delete this.selected_node_map[i];
	};



	/*
		抽象节点对象
	*/
	function Node(data, parentNode) {
		this.id = data.id;
		this.value = data.value;
		this.name = data.name;
		this.check = data.check === true ? true : false;
		this.data = data;
		this.parentNode = parentNode;
		this.childrenNodes = undefined;
	}



	module.exports.SelectControl = SelectControl;
});