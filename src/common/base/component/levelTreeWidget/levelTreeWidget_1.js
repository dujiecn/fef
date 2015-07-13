/**
 * 
 * @authors dujie (760813193@qq.com)
 * @date    2014-12-08 11:08:08
 * @version 1.0
 * @description 有层级关系的树形菜单
 */
define(function(require,exports,module) {
	/*
		<div data-select-type='multi' 'single' 'group' 单选 data-checkbranch="true / false" 默认false 枝是否可被选中 
	*/
	function LevelTreeWidget(element) {
		// 存放树的节点
		this.element = $(element);
		// 树的根节点
		this.rootElement = null;
		this.selectType = "single";
		this.checkbranch = false;
	}
	LevelTreeWidget.prototype.init = function(data) {
		this.rootElement = $("<div class='u-level-tree'>");
		this.selectType = this.element.data("select-type");
		

	};
	LevelTreeWidget.prototype.render = function(data) {
		// if(!data)
		// 	return;

		this.init(data);
		// console.log(this);
	};



/***********************抽象相应的类**************************/
	/*
		父节点的抽象类
	*/
	function ParentItem(selectType,checkbranch) {
		this.element = null;
		// this.select_btn_element = null;
		this.selectType = selectType;
		this.checkbranch = checkbranch;
		// 只有用户设置了父节点可以选择才有status属性
		checkbranch && (this.status = false);
		
	}
	// ParentItem.prototype.create = function() {};

	/*
		单选的父节点类
	*/
	function SingleParentItem(selectType,checkbranch) {
		ParentItem.call(this,selectType,checkbranch);
	}
	SingleParentItem.prototype.create = function() {
		this.element = $("<h2>");
		// this.select_btn_element = $("<span>");
	};

	/*
		多选的父节点类
	*/
	function MultiParentItem(selectType,checkbranch) {
		ParentItem.call(this,selectType,checkbranch);
	}

	/*
		子节点的抽象类
	*/
	function ChildrenItem(selectType) {
		this.element = null;
		this.select_btn_element = null;
		this.selectType = selectType;
		// 选中状态 默认不选中
		this.status = false;
	}

	/*
		单选的子节点类
	*/
	function SingleChildrenItem(selectType) {
		ChildrenItem.call(this,selectType);
	}

	/*
		多选的子节点类
	*/
	function MultiChildrenItem(selectType) {
		ChildrenItem.call(this,selectType);
	}



	module.exports.LevelTreeWidget = LevelTreeWidget;
});