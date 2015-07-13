/**
 * grid
 	@author j.d
 */
define(function(require) {
	var Base = require('./base'),
		zr_util = require('../zrender/tool/util');

	function Grid(option, type, charts) {
		Base.call(this, option, type, charts);
		this._x = null;
		this._y = null;
		this._width = null;
		this._height = null;
		this.refresh(option);
	}

	/**
	 * 刷新
	 * @param {Object} newOption
	 */
	Grid.prototype.refresh = function(newOption) {
		if (!newOption) {
			newOption = this.option;
		}

		var axisMap = this.charts.axisMap;
		this.option.grid = this.reviseOption(newOption.grid);
		var grid = this.option.grid;

		// 暂不处理烦人的自适应
		//		grid.x2 = grid.x2 || 0;
		//		grid.y = grid.y || 0;
		//		// 没有配置x，则获取y轴左侧的文本的宽度作为x的值
		//		if (!grid.x) {
		//			var leftAxis = axisMap['left'];
		//			if (leftAxis) {
		//				grid.x = leftAxis.getTextMaxWidth();
		//			}
		//		}
		//
		//		// 没有配置y2，则获取x轴下面的文本的高度作为y2的值
		//		if (!grid.y2) {
		//			var bottomAxis = axisMap['bottom'];
		//			if (bottomAxis) {
		//				grid.y2 = bottomAxis.getTextMaxHeight();
		//			}
		//		}


		// 计算grid的边距值
		var _zrWidth = this.zr.getWidth();
		var _zrHeight = this.zr.getHeight();
		var zr_number = require('../util/number');
		this._x = zr_number.parsePercent(grid.x, this._zrWidth);
		this._y = zr_number.parsePercent(grid.y, this._zrHeight);
		var _x2 = zr_number.parsePercent(grid.x2, this._zrWidth);
		var _y2 = zr_number.parsePercent(grid.y2, this._zrHeight);
		this._width = _zrWidth - this.getX() - _x2;
		this._height = _zrHeight - this.getY() - _y2;

		// 绘制
		this._buildShape();
	};

	/**
	 * 绘制图形
	 */
	Grid.prototype._buildShape = function() {
		var grid = this.option.grid;
		if (!grid.show) {
			return;
		}



		var RectangleShape = require('../zrender/shape/Rectangle');
		var shape = new RectangleShape({
			style: {
				x: this.optimizePixel(this._x, grid.borderWidth),
				y: this.optimizePixel(this._y, grid.borderWidth),
				width: this.getWidth(),
				height: this.getHeight(),
				radius: 0,
				brushType: grid.borderWidth > 0 ? 'both' : 'fill',
				color: grid.backgroundColor,
				strokeColor: grid.borderColor,
				lineWidth: grid.borderWidth,
			},
			hoverable: false,
			zlevel: this.getZlevel(),
			z: this.getZ()
		});
		this.zr.addShape(shape);
	};

	Grid.prototype.getX = function() {
		return this._x;
	};

	Grid.prototype.getX2 = function() {
		return this._x + this._width;
	};

	Grid.prototype.getY = function() {
		return this._y;
	};

	Grid.prototype.getY2 = function() {
		return this._y + this._height;
	};

	Grid.prototype.getWidth = function() {
		return this._width;
	};

	Grid.prototype.getHeight = function() {
		return this._height;
	};

	Grid.prototype.getArea = function() {
		return {
			x: this._x,
			y: this._y,
			width: this._width,
			height: this._height
		};
	};


	Grid.prototype.getBox = function() {
		return [
			[this._x, this._y],
			[this.getX2(), this.getY2()]
		];
	};





	zr_util.inherits(Grid, Base);
	return Grid;
});