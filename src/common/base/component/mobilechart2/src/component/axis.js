/*
 轴线模块
 @author dj
 */
define(function (require) {
    var Base = require('./base'),
        zr_util = require('../zrender/tool/util'),
        LineShape = require('../zrender/shape/Line'),
        config = require('../conf');


    function Axis(option, type, charts) {
        Base.call(this, option, type, charts);
        this.series = null;
        // 当前轴对象数组
        this._axisList = [];
        this.refresh(option);
    }

    /**
     * 刷新
     * @param {Object} option
     */
    Axis.prototype.refresh = function (newOption) {
        if (newOption) {
            this.option = newOption;
            this.series = newOption.series;
        }


        var axisOption;
        // 预处理轴参数
        if (this.type == config.COMPONENT_TYPE_AXIS_X) {
            axisOption = this.option.xAxis = this.reviseOption(this.option.xAxis);
        } else if (this.type == config.COMPONENT_TYPE_AXIS_Y) {
            axisOption = this.option.yAxis = this.reviseOption(this.option.yAxis);
        }


        // 需要继承的方法
        var properties = {};
        [
            '_buildAxisLine',
            'isHorizontal',
            'isVertical',
            'getPosition'
        ].forEach(function (property, i) {
                properties[property] = this[property];
            }, this);


        // 解析轴
        var CategoryAxis = require('./categoryAxis');
        var ValueAxis = require('./valueAxis');
        var type,
            position,
            object;
        for (var i = 0, len = axisOption.length; i < len; i++) {
            type = axisOption[i].type;
            position = axisOption[i].position;

            if (type == 'category') {
                object = new CategoryAxis(axisOption[i], config.COMPONENT_TYPE_AXIS_CATEGORY, this.charts, properties);
            } else {
                properties.series = this.option.series;
                object = new ValueAxis(axisOption[i], config.COMPONENT_TYPE_AXIS_VALUE, this.charts, properties);
            }


            // 保存轴信息到charts
            //this.charts.axisMap[position] = object;
            this._axisList.push(object);
        }
    };

    //	/**
    //	 * 刷新
    //	 * @param {Object} option
    //	 */
    //	Axis.prototype.refresh = function() {
    //		for (var i = 0, l = this._axisList.length; i < l; i++) {
    //			this._axisList[i].refresh();
    //		}
    //	};


    /**
     * 对option参数进行数据修正
     * @param {Object} opt
     */
    Axis.prototype.reviseOption = function (opt) {
        if (!opt || (opt instanceof Array && opt.length == 0)) {
            opt = [{
                type: 'value'
            }];
        }

        // 如果配置的option多余2个，则忽略
        if (opt.length > 2) {
            opt = [opt[0], opt[1]];
        }


        var TOP = config.AXIS_POSITION_TOP;
        var BOTTOM = config.AXIS_POSITION_BOTTOM;
        var RIGHT = config.AXIS_POSITION_RIGHT;
        var LEFT = config.AXIS_POSITION_LEFT;
        if (this.type == 'xAxis') {
            // 如果xAxis位置没配置 或者配置错误，默认位置为‘bottom’;
            if (!opt[0].position || (opt[0].position != BOTTOM && opt[0].position != TOP)) {
                opt[0].position = BOTTOM;
            }

            if (opt.length > 1) {
                opt[1].position = opt[0].position === BOTTOM ? TOP : BOTTOM;
            }

            for (var i = 0, l = opt.length; i < l; i++) {
                opt[i].type = opt[i].type || 'category';
                opt[i].xAxisIndex = i;
                opt[i].yAxisIndex = -1;
            }
        } else if (this.type == 'yAxis') {
            // 如果xAxis位置没配置 或者配置错误，默认位置为‘bottom’;
            if (!opt[0].position || (opt[0].position != LEFT && opt[0].position != RIGHT)) {
                opt[0].position = LEFT;
            }

            if (opt.length > 1) {
                opt[1].position = opt[0].position === LEFT ? RIGHT : LEFT;
            }

            for (var i = 0, l = opt.length; i < l; i++) {
                opt[i].type = opt[i].type || 'value';
                opt[i].xAxisIndex = -1;
                opt[i].yAxisIndex = i;
            }
        }

        return opt;
    };

    /**
     * 获取位置
     */
    Axis.prototype.getPosition = function () {
        return this.option.position;
    };


    /**
     * 绘制轴线
     */
    Axis.prototype._buildAxisLine = function () {
        var axisLine = this.option.axisLine;
        if (!axisLine.show) {
            return;
        }

        var lineWidth = axisLine.lineStyle.width || 1;
        var halfLineWidth = lineWidth * 0.5;
        var axShape = {
            hoverable: axisLine.hoverable,
            zlevel: this.getZlevel(),
            z: this.getZ() + 5
        };
        var grid = this.grid;
        switch (this.option.position) {
            case 'left':
                axShape.style = {
                    xStart: grid.getX(),
                    yStart: grid.getY2(),
                    xEnd: grid.getX(),
                    yEnd: grid.getY(),
                    lineCap: 'round'
                };
                break;
            case 'right':
                axShape.style = {
                    xStart: grid.getX2(),
                    yStart: grid.getY2(),
                    xEnd: grid.getX2(),
                    yEnd: grid.getY(),
                    lineCap: 'round'
                };
                break;
            case 'bottom':
                axShape.style = {
                    xStart: grid.getX(),
                    yStart: grid.getY2(),
                    xEnd: grid.getX2(),
                    yEnd: grid.getY2(),
                    lineCap: 'round'
                };
                break;
            case 'top':
                axShape.style = {
                    xStart: grid.getX(),
                    yStart: grid.getY(),
                    xEnd: grid.getX2(),
                    yEnd: grid.getY(),
                    lineCap: 'round'
                };
                break;
        }
        var style = axShape.style;
        if (this.option.name !== '') {
            style.text = this.option.name;
            style.textPosition = this.option.nameLocation;
            style.textFont = this.getFont(this.option.nameTextStyle);
            if (this.option.nameTextStyle.align) {
                style.textAlign = this.option.nameTextStyle.align;
            }
            if (this.option.nameTextStyle.baseline) {
                style.textBaseline = this.option.nameTextStyle.baseline;
            }
            if (this.option.nameTextStyle.color) {
                style.textColor = this.option.nameTextStyle.color;
            }
        }

        style.strokeColor = this.option.axisLine.lineStyle.color;
        style.lineWidth = lineWidth;
        style.lineType = this.option.axisLine.lineStyle.type;

        // 优化像素
        style.xStart = this.optimizePixel(style.xStart, lineWidth);
        style.yStart = this.optimizePixel(style.yStart, lineWidth);
        style.xEnd = this.optimizePixel(style.xEnd, lineWidth);
        style.yEnd = this.optimizePixel(style.yEnd, lineWidth);

//		if (!this.lineShape) {
//			this.lineShape = new LineShape(axShape);
//			this.zr.addShape(this.lineShape);
//		} else {
//			this.lineShape = zr_util.merge(axShape, this.lineShape);
//			this.zr.modShape(this.lineShape.id);
//		}

        this.shapeList.push(new LineShape(axShape));
    };

    Axis.prototype.getAxis = function (index) {
        return this._axisList[index];
    };

    /**
     * 返回当前轴集合的长度
     * @param {Object} index
     */
    Axis.prototype.getLength = function (index) {
        return this._axisList.length;
    };


    Axis.prototype.isHorizontal = function () {
        return this.option.position == config.AXIS_POSITION_TOP || this.option.position == config.AXIS_POSITION_BOTTOM;
    };

    Axis.prototype.isVertical = function () {
        return this.option.position == config.AXIS_POSITION_LEFT || this.option.position == config.AXIS_POSITION_RIGHT;
    };

    /**
     * 轴动画 （渐入渐出）
     */
    Axis.prototype.axisAnimate = function () {

    };


    zr_util.inherits(Axis, Base);
    return Axis;
});