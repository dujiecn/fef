/**
 *
 * @authors dujie (760813193@qq.com)
 * @date    2014-12-05 11:00:55
 * @version 1.0
 * @description 切换查询菜单的组件
 * 数据格式：
 * {name:"",id:"",children:[]}
 * 此控件待完善 没做完
 */
define(function(require, exports, module) {

	function SelectWidget(element,data) {
		var _this = this,
			rootNode = new Node(data,null),
			// 用户传的标签
			root_element = 
			// 在用户传过来的标签下最外面的div,用来包裹整个控件
			parent_element =
			// 下拉框最外层标签，包裹下拉框的内容
			select_wrapper_element =
			// 下拉框显示当前选中树枝的input标签
			select_input_element =
			// 下拉框箭头标签
			select_arrow_element =
			// 包裹存放树枝的标签
			branches_wrapper_element =
			// 树枝的ul标签
			branches_ul_element = 
			// 包裹叶子的标签
			leaves_wrapper_element =
			// 叶子滑动的标签
			leaves_scroller_lement =
			// 叶子的ul标签
			leaves_ul_Element = null;

		

		this.render = function() {
			parse(data,rootNode);
			renderHTML();
			console.log(rootNode);
		}

		/*
			解析用户传过来的data，转换为node对象
		*/
		function parse(data,parentNode) {
			if(data.children) {
				for(var i = 0;i < data.children.length;i++) {
					var obj = data.children[i];
					var node = new Node(obj,parentNode);
					parse(obj,node);
				}
			}else {
				new Node(data,parentNode);
			}
		}

		function renderHTML() {
			root_element = $(element);
			parent_element = $("<div class='u-select-panel'>");
			select_wrapper_element = $("<div class='u-select'>");
			select_input_element = $("<input type='text' readonly>");
			select_arrow_element = $("<span class='arrow'>");
			select_wrapper_element.append(select_input_element).append(select_arrow_element);

			branches_wrapper_element = $("<div class='u-branch-list u-select-list'>");
			branches_ul_element = $("<ul>");
			branches_wrapper_element.append(branches_ul_element);

			leaves_wrapper_element = $("<div class='u-leaf-wrapper u-select-list'>")
			leaves_scroller_lement = $("<div class='u-leaf-list'>");
			leaves_ul_Element = $("<ul>");
			leaves_wrapper_element.append(leaves_scroller_lement).append(leaves_ul_Element);

			parent_element.append(select_wrapper_element)
				.append(branches_wrapper_element)
				.append(leaves_wrapper_element);
			root_element.html(parent_element);


			/*
				设置样式
			*/
			var width = root_element.width();
			var height = root_element.height();
			parent_element.outerWidth(width * 0.9);
			parent_element.outerHeight(height);

			var parentElementWidth = parent_element.width();
			var parentElementHeight = parent_element.height();

			select_wrapper_element.outerWidth(parentElementWidth);

			var select_wrapper_width = select_wrapper_element.width();

			select_input_element.outerWidth(select_wrapper_width * 0.88);
			select_arrow_element.outerWidth(select_wrapper_width * 0.12);

			branches_wrapper_element.outerWidth(parentElementWidth);

			this.leaves_wrapper_element.outerWidth(parentElementWidth);
			this.leaves_wrapper_element.outerHeight(parentElementHeight - this.leaves_wrapper_element.position().top);
		}

		/*
			渲染树枝
		*/
		function renderBranches(array) {
			
			
			for (var i = 0; i < array.length; i++) {
				var obj = array[i];
				$("<li>").data("data", obj).text(obj.name).appendTo(this.branchesUlElement);
			}
		}



		/*
			封装节点对象
		*/
		function Node(data,parentNode) {
			this.data = data;
			this.parentNode = parentNode;
			if(data.children) {
				this.childrenNode = [];
				for(var i = 0;i < data.children.length;i++)
					this.childrenNode.push(new Node(data.children[i],this));
			}
		}

	}

	





	module.exports.SelectWidget = SelectWidget;
});