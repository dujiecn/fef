/**
 *
 * @authors dujie (760813193@qq.com)
 * @date    2014-12-05 11:00:55
 * @version 1.2
 * @description 切换查询菜单的组件
 * {name:"",id:"",value:"",check:boolean,children:[]}
 */
define("common/base/component/selectWidget/selectWidget",function(require, exports, module) {
	/*
		根节点可以配置：
		data-ignore-rootnode 设置根节点是否忽略
		data-select-type 设置选择模式
		data-branch-scrollable 树枝是否启用scroll
		data-leaf-scrollable 叶子是否启用scroll
	*/
	function SelectWidget(element) {
		this.element = $(element);
		// 选择模式
		this.selectType = this.element.data("select-type") || "single";

		this.ignoreRootNode = this.element.data("ignore-rootnode") == undefined ? true : this.element.data("ignore-rootnode");

		this.branchScrollable = this.element.data("branch-scrollable") == undefined ? false : this.element.data("branch-scrollable");

		this.leafScrollable = this.element.data("leaf-scrollable") == undefined ? false : this.element.data("leaf-scrollable");

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

		// 判断是否已经加载过
		this.loaded = false;

		// 保存当前选中的节点数据，最终用户点击完成的数据
		this.selected_node_map = {};
		// 临时保存选中的节点
		this.temp_node_map = {};

		// 转换过的node对象
		this.rootNode = null;

		// 保存当前选中的父节点
		this.selectedBranchNode = null;

		// 保存所有的树枝node对象数组
		this.branches_node_array = [];
	};


	/*
		渲染html的入口函数
	*/
	SelectWidget.prototype.render = function(data) {
		this.createHtmlTag();

		this.setStyle();

		this.parse(data);

		this.renderBranches();

		this.branchUseScroll(function() {
			this.branchesElement.hide();
			this.bind();
			this.leafUseScroll();
		}.bind(this));

		this.loaded = true;
		return this;
	};

		/*
		渲染html的入口函数
	*/
	SelectWidget.prototype.refresh = function(data) {
		this.renderBranches();
		return this;
	};


	/*
		创建需要的标签元素
	*/
	SelectWidget.prototype.createHtmlTag = function() {
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
	SelectWidget.prototype.setStyle = function() {
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
	SelectWidget.prototype.parse = function(data) {
		var _this = this;

		/*
			处理data数据 转换成node对象
		*/
		function recursive(node) {
			if (node.data.children) {
				node.childrenNodes = [];
				_this.branches_node_array.push(node);
				for (var i = 0; i < node.data.children.length; i++) {
					var child = new Node(node.data.children[i], node);
					node.childrenNodes.push(child);
					recursive(child);
				}
			}

			// 如果节点有check为true 则表示该节点被选中
			if (node.check == true && _this.current_node == null) {
				_this.current_node = node.parentNode;
				_this.temp_current_node = node.parentNode;
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
	SelectWidget.prototype.renderBranches = function() {
		// 判断树枝是否检索到选中的节点
		var flag = false;

		// 根据根节点是否忽略，设置i的开始值，忽略则跳过第一个树枝
		var index = this.ignoreRootNode ? 1 : 0;
		for (i = index; i < this.branches_node_array.length; i++) {
			var node = this.branches_node_array[i];
			var _li = $("<li>");

			_li.data("node", node)
				.text(node.name)
				.appendTo(this.branchesUlElement);

			if (!this.loaded) {
				if (!flag) {
					if (node.check) {
						this.setSelectedBranchStyle(_li);
						this.select_input_element.val(node.name);
						this.renderLeaves(node);
						flag = true;
					} else {
						// 如果树枝的叶子存在选中的，则选中当前树枝
						for (var j = 0; j < node.childrenNodes.length; j++) {
							if (node.childrenNodes[j].check) {
								this.setSelectedBranchStyle(_li);
								this.select_input_element.val(node.name);
								this.renderLeaves(node);
								flag = true;
								break;
							}
						}
					}
				}
			}
		}

		// 说明没有设置选中的节点，则默认是第一个节点
		if (flag == false) {
			var firstNode = this.branches_node_array[index];
			this.setSelectedBranchStyle(this.branchesUlElement.find(":first"));
			this.select_input_element.val(firstNode.name);
			this.renderLeaves(firstNode);
		}
	};

	/*
		设置树枝选中样式
	*/
	SelectWidget.prototype.setSelectedBranchStyle = function(branchElement) {
		branchElement.parent().find(".active").removeClass("active");
		branchElement.addClass("active");
	}

	/*
		渲染叶子
	*/
	SelectWidget.prototype.renderLeaves = function(node) {
		this.leavesUlElement.empty();
		for (var i = 0; i < node.childrenNodes.length; i++) {
			var tempNode = node.childrenNodes[i];
			var _li = $("<li>");

			if (this.selectType == "single") {
				_li.addClass("single");
			} else if (this.selectType == "multi") {
				_li.addClass("multi");
			}

			_li.data("node", tempNode)
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
	SelectWidget.prototype.refreshLeaves = function(node) {
		this.renderLeaves(node);
		this.bindLeaves();
	};

	/*
		叶子动画
	*/
	SelectWidget.prototype.leavesAnimation = function(callback) {
		this.leavesUlElement.css("opacity", "0");
		setTimeout(function() {
			this.leavesUlElement.css("opacity", "1");
			callback && callback();
		}.bind(this), 250);
	};

	/*
		打开箭头
	*/
	SelectWidget.prototype.openArrow = function() {
		this.select_arrow_element.addClass("active");
	};

	/*
		关闭箭头
	*/
	SelectWidget.prototype.closeArrow = function() {
		this.select_arrow_element.removeClass("active");
	};

	/*
		树枝启用scroll
	*/
	SelectWidget.prototype.branchUseScroll = function(callback) {
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
	SelectWidget.prototype.leafUseScroll = function(callback) {
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
	SelectWidget.prototype.bind = function() {
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
	SelectWidget.prototype.bindLeaves = function() {
		var _this = this;

		if (this.selectType == "single") {
			this.leavesUlElement.find("li").on("click", function() {
				_this.branchesElement.hide();

				_this.closeArrow();

				_this.clearMap();

				$(this).parent().find(".active").removeClass("active");
				$(this).addClass("active");

				var node = $(this).data("node");

				_this.temp_node_map[node.id] = node;

			});
		} else if (this.selectType == "multi") {
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
	};

	/*
		绑定树枝的事件
	*/
	SelectWidget.prototype.bindBranches = function() {
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
	SelectWidget.prototype.setSelectedBranchText = function(text) {
		this.select_input_element.val(text);
	}

	SelectWidget.prototype.rollback = function() {
		if (this.selectType == "single") {
			this.temp_node_map = $.extend(true, {}, this.selected_node_map);
		} else if (this.selectType == "multi") {
			$.extend(true, this.selected_node_map, this.temp_node_map);
		}

		this.create(this.current_node);
	};
	SelectWidget.prototype.commit = function() {
		if (this.selectType == "single") {
			this.selected_node_map = $.extend(true, {}, this.temp_node_map);

		} else if (this.selectType == "multi") {
			$.extend(true, this.selected_node_map, this.temp_node_map);
		}

		var len = 0;
		for (var i in this.selected_node_map) {
			len++;
		}

		var index = 0;
		for (var i in this.selected_node_map) {
			index++;
			if (index == len) {
				this.curr_node = this.selected_node_map[i];
			}
		}

		if (this.rootElement.find(".active").length > 0) {
			this.current_node = this.temp_current_node;
		}
		// this.create(this.current_node);
	};

	/*
		单选的时候返回选中的唯一的叶子节点
	*/
	SelectWidget.prototype.queryNode = function() {
		this.commit();
		return this.selected_node_map;
	};
	/*
		多选的时候返回所有的选中的叶子节点
	*/
	SelectWidget.prototype.queryAllNodes = function() {
		return this.queryNode();
	};
	/*
		多选的时候返回当前树枝下面的所有被选中的叶子节点
	*/
	SelectWidget.prototype.queryCurrentNodes = function() {
		this.commit();
		var arr = [];
		this.leavesUlElement.find("li.active").each(function() {
			arr.push($(this).data("node").data);
		});
		return arr;
	};

	/*
		返回当前选中的父条件
	*/
	SelectWidget.prototype.queryCurrentConditionNodes = function() {
		return this.branchesUlElement.find("li.active").data("node");
	};

	SelectWidget.prototype.clearMap = function() {
		for (var i in this.selected_node_map)
			delete this.selected_node_map[i];
	};



	/*
		抽象节点对象
	*/
	function Node(data, parentNode) {
		this.data = data;
		this.id = data.id;
		this.name = data.name;
		this.check = data.check === true ? true : false;
		this.parentNode = parentNode;
		this.childrenNodes = undefined;
	}



	module.exports.SelectWidget = SelectWidget;
});