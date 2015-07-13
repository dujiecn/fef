/*
	树结构
*/
define("common/base/component/treeview/tree",function(require,exports,module) {
	require("jquery");

	function TreeView(option) {
		this.element = $(option.element);
		this.leaves = [];
		this.rootElement = $("<div class='u-tree'>");
		this.wrapperUlElement = $('<ul>');
		this.data = typeof option.data == "string" ? JSON.parse(option.data) : option.data;
	}
	TreeView.prototype.render = function() {
		this.createHTML(this.data,this.wrapperUlElement);
		this.rootElement.append(this.wrapperUlElement);
		this.element.append(this.rootElement).trigger("create");
		return this;
	};
	TreeView.prototype.createHTML = function(data,parentElement) {
		var _this = this;

		var li = $("<li>").data("data",data);

		if(data.nocheck) {// 不是叶子节点
			var children = data.children;
			var count = children ? children.length : 0;
			var ul_element = $('<ul>');
			var div_element = $("<div class='u-tree u-tree-content'>");
			var h_element = $("<h2>");
			var span_element = $("<span>").text(count);

			ul_element.appendTo(div_element);

			h_element.on("click",function() {
				$(this).next(".u-tree").toggle();
			}).append(data.name).append(span_element).appendTo(li);

			div_element.appendTo(li);

			li.addClass("branch").appendTo(parentElement);

			if(children && children.length > 0) {
				for(var i = 0; i < data.children.length;i++)
					this.createHTML(data.children[i],ul_element);
			}
		}else {// 是叶子节点
			li.addClass("leaf").on("click",function() {
				// 去掉之前的选中的
				for(var i = 0;i < _this.leaves.length;i++) {
					if(_this.leaves[i].hasClass("leaf-active")) {
						_this.leaves[i].removeClass("leaf-active");
						break;
					}
				}

				$(this).addClass("leaf-active");
			}).text(data.name).appendTo(parentElement);

			this.leaves.push(li);
		}
	};




	module.exports.TreeView = TreeView;
});