/**
 *
 * @authors dujie (760813193@qq.com)
 * @date    2014-12-08 11:08:08
 * @version 1.0
 * @description 有层级关系的树形菜单
 *data:{name:'',id:'',value:"",check:boolean,children:[]}
 *
 */
define("common/base/component/levelTreeWidget/levelTreeWidget", function(require, exports, module) {
	/*
		根节点：
		data-select-type='multi'
		data-checkbranch="false"
		data-ignoreroot='false'
	*/
	function LevelTreeWidget(element, data) {
		// 存放树的节点
		this.element = $(element);
		// 用户传过来的原始数据
		this.data = data;
		// 树的根节点
		this.rootElement = null;
		// 是否忽略根节点（在树枝节点可以选中的时候，避免根节点选中）
		this.ignoreRoot = false;
		// 选择模式
		this.selectType = null;
		// 父节点是否可以被选中
		this.checkbranch = false;
		// 用户最终选中的节点对象
		this.selected_node_map = {};
		// 存放临时的选中节点对象
		this.temp_node_map = {};
		// 记录当前查看的node
		this.current_node = null;
		// 临时保存当前显示的节点
		this.temp_current_node = null;
		// 根节点对象
		this.rootNode = new Node(this.data, null);
	};

	/*
		预处理
	*/
	LevelTreeWidget.prototype.preprocess = function() {
		var _this = this;

		/*
			根据根节点处理用户配置信息
		*/
		this.selectType = this.element.data("select-type") || "single";
		this.checkbranch = this.element.data("checkbranch") == true ? true : false;
		this.ignoreRoot = this.element.data("ignoreroot") == true ? true : false;

		/*
			生成页面需要的元素
		*/
		this.rootElement = $("<div class='u-level-tree'>");
		this.element.html(this.rootElement);


		/*
			处理data数据 转换成node对象
		*/
		function recursive(node) {
			if (node.data.children) {
				if (!node.childrenNodes)
					node.childrenNodes = [];
				for (var i = 0; i < node.data.children.length; i++) {
					var child = new Node(node.data.children[i], node);
					node.childrenNodes.push(child);
					recursive(child);
				}
			}

			// 如果节点有check为true 则表示该节点被选中
			if (node.check == true && _this.current_node == null) {
				if (_this.checkbranch == true) {
					_this.current_node = node;
					_this.temp_current_node = node;
				} else {
					_this.current_node = node.parentNode;
					_this.temp_current_node = node.parentNode;
				}
				_this.selected_node_map[node.id] = node;
				_this.temp_node_map[node.id] = node;
			}
		}

		recursive(this.rootNode);
		// 如果预处理数据完成之后 当前选中的节点还为null，则默认赋值根节点对象
		if (this.current_node == null) {
			this.current_node = this.rootNode;
			this.temp_current_node = this.rootNode;
		}
	};

	/*
		渲染入口
	*/
	LevelTreeWidget.prototype.render = function() {
		this.preprocess();
		this.create(this.current_node);
		return this;
	};

	/*
		生成树形结构
	*/
	LevelTreeWidget.prototype.create = function(node) {
		// node = $.extend(true,{},node);
		// console.log(node === this.current_node)
		if (this.selectType == "single") {
			this.createSingleMode(node);
		} else if (this.selectType == "multi") {
			this.createMultiMode(node);
		}
	};

	/*
		单选模式
		父节点class只有存在check，single才可以单选
	*/
	LevelTreeWidget.prototype.createSingleMode = function(node) {
		// 保存当前选中的节点到临时变量
		this.temp_current_node = node;
		var _this = this;
		node = node || this.rootNode;
		if (!node)
			return;

		var _ul = $("<ul class='u-container'>");
		var _li = $("<li>");
		var _h = $("<h2>").text(node.data.name);

		// 子节点需要的标签
		var c_div = $("<div class='u-chilren-tree'>");
		var c_ul = $("<ul>");
		_li.append(_h);
		c_div.html(c_ul);
		_li.append(c_div);
		_ul.append(_li);
		this.rootElement.html(_ul);

		/*
			父节点可以选中的情况下，
			创建按钮并设置样式 
		*/
		if (this.checkbranch) {
			if (node.parentNode != null || this.ignoreRoot == false) {
				var _button = $("<span>")
					.addClass("single")
					.appendTo(_h)
					.on("click", function(e) {
						e.stopPropagation();
						if ($(this).hasClass("active")) {
							return;
						}

						_this.temp_node_map = {};
						c_div.find("li.active").removeClass("active");
						$(this).addClass("active");
						_this.temp_node_map[node.id] = node;
					});

				if (_this.temp_node_map[node.id]) {
					_button.addClass("active");
				}
			}
		}


		/*
			存在父节点 则绑定回退
			test code debug
		*/
		if (node.parentNode) {
			_h.on("click", function() {
				_this.goback();
			});
		}

		/*
			生成子节点
		*/
		if (node.childrenNodes) {
			for (var i = 0; i < node.childrenNodes.length; i++) {
				var c_node = node.childrenNodes[i];
				var c_li = $("<li>");
				var c_button = $("<span>");
				c_li.text(c_node.data.name);
				c_li.appendTo(c_ul);

				if (c_node.childrenNodes) {
					c_li.addClass("branch").on("click", {
						node: c_node
					}, function(e) {
						_this.create(e.data.node);
					});

					// 父节点可以选中
					//					if (this.checkbranch) {
					//						c_button.addClass("single").appendTo(c_li).on("click", {
					//							node: c_node,
					//							li: c_li
					//						}, function(e) {
					//							e.stopPropagation();
					//							var curr_node = e.data.node;
					//							var curr_li = e.data.li;
					//							_this.temp_node_map = {};
					//
					//							_button && _button.removeClass("active");
					//							c_ul.find("li.active").removeClass("active");
					//							curr_li.addClass("active");
					//
					//							_this.temp_node_map[curr_node.id] = curr_node;
					//							// console.log(_this.temp_node_map)
					//						});
					//					}
				} else {
					c_button.addClass("single").appendTo(c_li);
					c_li.addClass("leaf").on("click", {
						node: c_node
					}, function(e) {
						if ($(this).hasClass("active"))
							return;

						var curr_node = e.data.node;
						_this.temp_node_map = {};
						_button && _button.removeClass("active");
						c_ul.find("li.active").removeClass("active");
						$(this).addClass("active");
						_this.temp_node_map[curr_node.id] = curr_node;
					});
				}

				if (_this.temp_node_map[c_node.id]) {
					c_li.addClass("active");
				}
			}
		}
	};
	/*
		多选模式
	*/
	LevelTreeWidget.prototype.createMultiMode = function(node) {
		// 保存当前选中的节点到临时变量
		this.temp_current_node = node;
		var _this = this;
		node = node || this.rootNode;
		if (!node)
			return;

		var _ul = $("<ul class='u-container'>");
		var _li = $("<li>");
		var _h = $("<h2>").text(node.data.name);

		// 子节点需要的标签
		var c_div = $("<div class='u-chilren-tree'>");
		var c_ul = $("<ul>");
		_li.append(_h);
		c_div.html(c_ul);
		_li.append(c_div);
		_ul.append(_li);
		this.rootElement.html(_ul);

		/*
			父节点可以选中的情况下，
			创建按钮并设置样式 
		*/
		if (this.checkbranch) {
			if (node.parentNode != null || this.ignoreRoot == false) {
				var _button = $("<span>")
					.addClass("multi")
					.appendTo(_h)
					.on("click", function(e) {
						e.stopPropagation();
						if ($(this).hasClass("active")) {
							$(this).removeClass("active");
							delete _this.temp_node_map[node.id]
						} else {
							$(this).addClass("active");
							_this.temp_node_map[node.id] = node;
						}
					});

				if (_this.temp_node_map[node.id]) {
					_button.addClass("active");
				}
			}
		}


		/*
			存在父节点 则绑定回退
			test code debug
		*/
		if (node.parentNode) {
			_h.on("click", function() {
				_this.goback();
			});
		}

		/*
			生成子节点
		*/
		if (node.childrenNodes) {
			for (var i = 0; i < node.childrenNodes.length; i++) {
				var c_node = node.childrenNodes[i];
				var c_li = $("<li>");
				var c_button = $("<span>");
				c_li.text(c_node.data.name);
				c_li.appendTo(c_ul);

				if (c_node.childrenNodes) {
					c_li.addClass("branch").on("click", {
						node: c_node
					}, function(e) {
						_this.create(e.data.node);
					});

					// 父节点可以选中
//					if (this.checkbranch) {
//						c_button.addClass("multi").appendTo(c_li).on("click", {
//							node: c_node,
//							li: c_li
//						}, function(e) {
//							e.stopPropagation();
//
//							var curr_node = e.data.node;
//							var curr_li = e.data.li;
//
//							if (curr_li.hasClass('active')) {
//								curr_li.removeClass('active');
//								delete _this.temp_node_map[curr_node.id];
//							} else {
//								curr_li.addClass('active');
//								_this.temp_node_map[curr_node.id] = curr_node;
//							}
//						});
//					}
				} else {
					c_button.addClass("multi").appendTo(c_li);
					c_li.addClass("leaf").on("click", {
						node: c_node
					}, function(e) {
						e.stopPropagation();
						var curr_node = e.data.node;
						if ($(this).hasClass('active')) {
							$(this).removeClass('active');
							delete _this.temp_node_map[curr_node.id];
						} else {
							$(this).addClass('active');
							_this.temp_node_map[curr_node.id] = curr_node;
						}
					});
				}

				if (_this.temp_node_map[c_node.id]) {
					c_li.addClass("active");
				}
			}
		}
	};


	/*
		回滚事务
	*/
	LevelTreeWidget.prototype.rollback = function() {
		this.temp_node_map = $.extend(true, {}, this.selected_node_map);
		this.create(this.current_node);
	};

	/*
		提交事务
	*/
	LevelTreeWidget.prototype.commit = function() {
		this.selected_node_map = $.extend(true, {}, this.temp_node_map);
		if (this.rootElement.find(".active").length > 0) {
			this.current_node = this.temp_current_node;
		}
		this.create(this.current_node);
	};

	LevelTreeWidget.prototype.queryNode = function() {
		this.commit();
		var arr = [];
		for (var i in this.selected_node_map)
			arr.push(this.selected_node_map[i]);
		return arr;
	};

	LevelTreeWidget.prototype.queryNodes = function() {
		return this.queryNode();
	};
	/*
		供外部调用选中节点
	*/
	LevelTreeWidget.prototype.selectNode = function(id) {
		var _this = this;

		function r(node) {
			if (node.id == id) {
				node.check = true;
				_this.selected_node_map[node.id] = node;
				_this.temp_node_map[node.id] = node;
				_this.current_node = node.parentNode;
				_this.temp_current_node = node.parentNode;
				return true;
			}

			if (node.childrenNodes) {
				for (var i = 0; i < node.childrenNodes.length; i++) {
					if (r(node.childrenNodes[i]))
						break;
				}
			}
		}

		r(this.rootNode);

		this.create(this.current_node);
	};
	LevelTreeWidget.prototype.selectNodes = function(array) {
		if (!array)
			return;

		for (var i = 0; i < array.length; i++) {

		}
	};


	/*
		判断当前有木有选中的节点
	*/
	LevelTreeWidget.prototype.hasCheckNode = function() {};

	/*
		回退
	*/
	LevelTreeWidget.prototype.goback = function() {
		this.create(this.temp_current_node.parentNode);
	};

	LevelTreeWidget.prototype.querySelectedData = function() {
		return this.temp_node_map;
		// var key = null;
		// for(var key in this.temp_node_map)
		// 	return this.temp_node_map[key];
	}

	/*
		抽象节点对象
	*/
	function Node(data, parentNode) {
		this.data = data;
		this.id = data.id;
		this.name = data.name;
		this.check = data.check === true ? true : false;
		this.parentNode = parentNode;
		this.depth = parentNode == null ? 0 : parentNode.depth + 1;
		this.childrenNodes = undefined;
		// if (data.children) {
		// 	for (var i = 0; i < data.children.length; i++)
		// 		this.childrenNodes.push(new Node(data.children[i], this, depth + 1));
		// }
	}


	module.exports.LevelTreeWidget = LevelTreeWidget;
});