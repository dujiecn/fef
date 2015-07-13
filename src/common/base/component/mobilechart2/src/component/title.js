/**
 * 标题
 * @author j.d
 */
define(function(require) {
	'use strict';

	var Base = require('./base'),
		zr_util = require('../zrender/tool/util'),
		zr_area = require('../zrender/tool/area'),
		config = require('../conf');

	function Title(option, type, charts) {
		Base.call(this, option, type, charts);
		this.groupShape = null;
		this.refresh(option);
	}

	/**
	 * 刷新
	 * @param {Object} newOption
	 */
	Title.prototype.refresh = function(newOption) {
		if (newOption) {
			this.option = newOption;
		}
		this.option.title = this.reviseOption(this.option.title);
		this.option.title.textStyle = this.getTextStyle(this.option.title.textStyle);
		this.option.title.subtextStyle = this.getTextStyle(this.option.title.subtextStyle);
		this.titleOption = this.option.title;
		this._buildShape();
	};

	/**
	 * 绘制
	 */
	Title.prototype._buildShape = function() {
		if (!this.titleOption.show) {
			return;
		}

		var Group = require('../zrender/Group');
		this.groupShape = new Group();
		this._itemGroupLocation = this._getItemGroupLocation();

		this._buildBackground();
		this._buildItem();

		this.zr.addGroup(this.groupShape);
	};

	/**
	 * 绘制背景
	 */
	Title.prototype._buildBackground = function() {
		var self = this;
		var padding = this.parseCssArray(this.titleOption.padding);
		var RectangleShape = require('../zrender/shape/Rectangle');
		var shape = new RectangleShape({
			hoverable: false,
			zlevel: this.getZlevel(),
			z: this.getZ(),
			style: {
				x: this._itemGroupLocation.x - padding[3],
				y: this._itemGroupLocation.y - padding[0],
				width: this._itemGroupLocation.width + padding[3] + padding[1],
				height: this._itemGroupLocation.height + padding[0] + padding[2],
				brushType: this.titleOption.borderWidth === 0 ? 'fill' : 'both',
				color: this.titleOption.backgroundColor,
				strokeColor: this.titleOption.borderColor,
				lineWidth: this.titleOption.borderWidth
			},
			//			clickable: true,
			//			onclick: function(arg) {
			//				self._messageCenter.notify(config.EVENT_TYPE.LEGEND_SELECTED, arg.event, null, self.charts);
			//				self._messageCenter.notify(config.EVENT_TYPE.LEGEND_SELECTED, arg,null);
			//			}
		});
		this.groupShape.addChild(shape);
	};

	/**
	 * 绘制标题
	 */
	Title.prototype._buildItem = function() {
		var text = this.titleOption.text,
			textFont = this.getFont(this.titleOption.textStyle);

		var TextShape = require('../zrender/shape/Text');

		var textOpt = {
			hoverable: false,
			clickable: this.titleOption.link ? true : false,
			style: {
				x: this._itemGroupLocation.x,
				y: this._itemGroupLocation.y,
				color: this.titleOption.textStyle.color,
				text: text,
				textFont: textFont,
				textBaseline: 'top'
			}
		};

		var subtextOpt = {
			hoverable: false,
			clickable: this.titleOption.link ? true : false,
			style: {
				x: this._itemGroupLocation.x,
				y: this._itemGroupLocation.y + zr_area.getTextHeight(text, textFont) + this.titleOption.itemGap,
				color: this.titleOption.subtextStyle.color,
				text: this.titleOption.subtext,
				textFont: this.getFont(this.titleOption.subtextStyle),
				textBaseline: 'top'
			}
		};


		var textShape = new TextShape(textOpt);
		var subtextShape = new TextShape(subtextOpt);
		this.groupShape.addChild(textShape);
		this.groupShape.addChild(subtextShape);
	};

	/**
	 * 获取标题的位置坐标
	 */
	Title.prototype._getItemGroupLocation = function() {
		var titleOption = this.titleOption,
			borderWidth = titleOption.borderWidth,
			padding = this.parseCssArray(titleOption.padding),
			text = titleOption.text,
			subtext = titleOption.subtext,
			textFont = this.getFont(titleOption.textStyle),
			subtextFont = this.getFont(titleOption.subtextStyle);

		var textMaxWidth = Math.max(zr_area.getTextWidth(text, textFont), zr_area.getTextWidth(subtext, subtextFont));
		var x;
		var _zrWidth = this.zr.getWidth();
		switch (titleOption.x) {
			case 'center':
				x = Math.floor(_zrWidth - textMaxWidth) * 0.5;
				break;
			case 'right':
				x = _zrWidth - textMaxWidth - padding[1] - borderWidth;
				break;
			case 'left':
				x = padding[3] + borderWidth;
				break;
			default:
				x = isNaN(titleOption.x - 0) ? 0 : x;
				break;
		}


		var totalHeight = zr_area.getTextHeight(text, textFont) + (subtext === '' ? 0 : this.titleOption.itemGap + zr_area.getTextHeight(subtext, subtextFont));
		var y;
		var _zrHeight = this.zr.getHeight();
		switch (titleOption.y) {
			case 'top':
				y = padding[0] + borderWidth;
				break;
			case 'center':
				break;
			case 'bottom':
				y = _zrHeight - totalHeight - padding[3] - borderWidth;
				break;
			default:
				y = isNaN(titleOption.y - 0) ? 0 : x;
				break;
		}

		return {
			x: x,
			y: y,
			width: textMaxWidth,
			height: totalHeight
		};


	};




	zr_util.inherits(Title, Base);
	return Title;
});