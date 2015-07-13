/**
 * 逻辑轴
 * @author j.d
 */
define(function (require) {
    'use strict';

    var Base = require('./base'),
        zr_util = require('../zrender/tool/util'),
        zr_text = require('../zrender/tool/area'),
        config = require('../conf'),
        TextShape = require('../zrender/shape/Text'),
        LineShape = require('../zrender/shape/Line');

    function CategoryAxis(option, type, charts, properties) {
        Base.call(this, option, type, charts);
        this.grid = charts.component.grid;
        this._step = -1;

        //需要从axis对象继承过来的方法
        for (var property in properties) {
            this[property] = properties[property];
        }

        this.refresh(option);
    }


    /**
     * 刷新事件
     */
    //CategoryAxis.prototype.onrefresh = function () {
    //    this.removeShape(this.shapeList);
    //    this.refresh();
    //};


    /**
     * 渲染
     */
    CategoryAxis.prototype.refresh = function (newOption) {
        if (newOption) {
            this.option = this.reviseOption(newOption);
            this.option.axisLabel.textStyle = this.getTextStyle(this.option.axisLabel.textStyle);
        }


        /*
         如果存在柱状图强制 boundaryGap=true
         */
        var hasBar;
        var series = this.charts._option.series;
        for (var i = 0, l = series.length; i < l; i++) {
            if (series[i].type == config.CHART_TYPE_BAR) {
                hasBar = true;
                break;
            }
        }
        if (hasBar) {
            this.option.boundaryGap = true;
        }


        this.clear();
        this._buildShape();
    };


    /**
     * 创建需要绘制的图形
     */
    CategoryAxis.prototype._buildShape = function () {
        // 配置不显示，则不进行绘制
        if (!this.option.show) {
            return;
        }

        this._step = this.getStep();

        this._buildSplitArea();
        this._buildSplitLine();
        this._buildAxisLine();
        this._buildAxisLabel();
        this._buildTick();


        for(var i = 0,l = this.shapeList.length;i < l;i++) {
            this.zr.addShape(this.shapeList[i]);
        }
    };

    CategoryAxis.prototype._buildSplitArea = function () {
        if (!this.option.splitArea.show) {
            return;
        }
    };

    CategoryAxis.prototype._buildSplitLine = function () {
        if (!this.option.splitLine.show) {
            return;
        }

        var position = this.getPosition();
        var dataLength = this.option.dataIndex.length;
        var splitLineOption = this.option.splitLine;
        var lineType = splitLineOption.lineStyle.type;
        var lineWidth = splitLineOption.lineStyle.width;
        var color = splitLineOption.lineStyle.color;
        var axShape = {
                hoverable: splitLineOption.hoverable,
                zlevel: this.getZlevel(),
                z: this.getZ()
            },
            i, x, shapeObj;


        if (position == config.AXIS_POSITION_BOTTOM) {
            var _interval = this.option.boundaryGap ? this.getInterval() * 0.5 : 0;
            for (i = 0; i < dataLength; i += this._step + 1) {
                x = this.optimizePixel(this.getCoordByIndex(i) + _interval, lineWidth);
                axShape.style = {
                    xStart: x,
                    yStart: this.grid.getY(),
                    xEnd: x,
                    yEnd: this.grid.getY2(),
                    strokeColor: color,
                    lineType: lineType,
                    lineWidth: lineWidth
                };

                shapeObj = new LineShape(axShape);
                this.shapeList.push(shapeObj);
                //				this.zr.addShape(shapeObj);
            }
        } else if (position == config.AXIS_POSITION_TOP) {

        } else if (position == config.AXIS_POSITION_RIGHT) {

        } else if (position == config.AXIS_POSITION_LEFT) {

        }
    };


    CategoryAxis.prototype._buildTick = function () {
        if (!this.option.tick.show) {
            return;
        }

        var position = this.getPosition();
        var tickOption = this.option.tick;
        var dataLength = this.option.dataIndex.length;
        var offset = tickOption.offset;
        var lineWidth = this.option.axisLine.lineStyle.width;
        var axShape = {
                hoverable: tickOption.hoverable,
                zlevel: this.getZlevel(),
                z: this.getZ()
            },
            i, shapeObj;
        if (position == config.AXIS_POSITION_BOTTOM) {
            var Shape;
            if (tickOption.type == 'circle') {
                Shape = require('../zrender/shape/Circle');
                var _interval = this.option.boundaryGap ? this.getInterval() * 0.5 : 0;
                for (i = 0; i < dataLength; i += this._step + 1) {
                    axShape.style = {
                        x: this.getCoordByIndex(i) + _interval + offset.x,
                        y: this.grid.getY2() + lineWidth * 0.5 + offset.y,
                        r: tickOption.style.r || lineWidth * 0.5 + 3,
                        brushType: 'fill',
                        color: tickOption.style.color
                    };

                    shapeObj = new Shape(axShape);
                    this.shapeList.push(shapeObj);
                    //					this.zr.addShape(shapeObj);
                }
            } else if (tickOption.type == 'line') {
                Shape = LineShape;
                var x;
                var _interval = this.option.boundaryGap ? this.getInterval() * 0.5 : 0;

                for (i = 0; i < dataLength; i++) {
                    x = this.optimizePixel(this.getCoordByIndex(i) + _interval, lineWidth);
                    axShape.style = {
                        xStart: x + offset.x,
                        yStart: this.grid.getY2() + lineWidth * 0.5 + offset.y,
                        xEnd: x + offset.x,
                        yEnd: this.grid.getY2() - 5 + offset.y,
                        brushType: 'fill',
                        strokeColor: tickOption.style.color,
                        lineType: tickOption.style.type,
                        lineWidth: tickOption.style.width
                    };


                    shapeObj = new Shape(axShape);
                    this.shapeList.push(shapeObj);
                    //					this.zr.addShape(shapeObj);
                }
            }


        } else if (position == config.AXIS_POSITION_TOP) {

        } else if (position == config.AXIS_POSITION_RIGHT) {

        } else if (position == config.AXIS_POSITION_LEFT) {

        }


    };

    /**
     * 坐标轴轴线 (因为画轴的步骤一样，所在在Axis模块里面实现该方法)
     */
    //	CategoryAxis.prototype._buildAxisLine = function() {
    //		var position = this.option.position;
    //		if (position == 'bottom') {
    //
    //		} else if (position == 'top') {
    //
    //		} else if (position == 'left') {
    //
    //		} else if (position == 'right') {
    //
    //		}
    //	};

    /**
     * 坐标轴文本
     */
    CategoryAxis.prototype._buildAxisLabel = function () {
        if (!this.option.axisLabel.show) {
            return;
        }

        var position = this.getPosition();
        var axisLabelOption = this.option.axisLabel;
        var offset = axisLabelOption.offset;
        var rotate = axisLabelOption.rotate;
        var axShape = {
                hoverable: axisLabelOption.hoverable,
                zlevel: this.getZlevel(),
                z: this.getZ() + 5
            },
            shapeObj,
            text,
            dt;
        if (position == config.AXIS_POSITION_BOTTOM) {
            for (var i = 0, l = this.option.dataIndex.length; i < l; i += this._step + 1) {
                dt = this.option.data[this.option.dataIndex[i]];
                if (typeof dt == 'object') {
                    text = dt.value;
                } else {
                    text = dt;
                }
                axShape.style = {
                    x: this.getCoordByIndex(i) + offset.x,
                    y: this.grid.getY2() + offset.y,
                    text: text,
                    textFont: this.getFont(axisLabelOption.textStyle),
                    color: axisLabelOption.textStyle.color,
                    textAlign: axisLabelOption.textStyle.align || 'center',
                    textBaseline: axisLabelOption.textStyle.baseline || 'top'
                };


                if (rotate) {
                    axShape.rotation = [rotate * Math.PI / 180,
                        axShape.style.x,
                        axShape.style.y
                    ];
                }

                shapeObj = new TextShape(axShape);
                this.shapeList.push(shapeObj);
                //				this.zr.addShape(shapeObj);
            }
        } else if (position == config.AXIS_POSITION_TOP) {

        } else if (position == config.AXIS_POSITION_RIGHT) {

        } else if (position == config.AXIS_POSITION_LEFT) {

        }


    };

    /**
     * 计算逻辑轴步长（相隔几个数据显示一个AxisLabel）
     */
    CategoryAxis.prototype.getStep = function () {
        //		var step = this.option.step + 1;
        //		return step <= 0 ? 1 : step;
        var step = this.option.step;
        var dataLength = this.option.data.length;

        if (step < 0) {
            step = this.option.step = 0;
        }

        if (step > dataLength - 2) {
            step = dataLength - 2;
        }

        return step;
    };

    /**
     * 根据data的下标换算坐标
     * @param {Number} dataIndex
     */
    CategoryAxis.prototype.getCoordByIndex = function (dataIndex) {
        // 根据step中间间隔的个数计算当前时第一个索引
        //		dataIndex = Math.floor((dataIndex + this._step) / (this._step + 1));

        var _interval = this.getInterval();
        var position = (this.option.boundaryGap ? _interval * 0.5 : 0) + dataIndex * _interval;
        if (this.isHorizontal()) {
            // 横向
            position += this.grid.getX();
        } else {
            // 纵向
            position += this.grid.getY2();
        }
        return position;
    };


    /**
     * 返回间隔
     */
    CategoryAxis.prototype.getInterval = function () {
        // 需要根据分页组件修改，用里面的dataIndex
        var dataLength = this.option.dataIndex.length;
        //		var dataLength = this.option.data.length;
        var total = this.isHorizontal() ? this.grid.getWidth() : this.grid.getHeight();
        var length = this.getAreaBlockLength();
        //		if (this.option.boundaryGap) { // 留空
        //			return total / dataLength;
        //		} else { // 顶头
        //			return total / (dataLength > 1 ? (dataLength - 1) : 1);
        //		}

        return total / length;

    };


    /**
     * 返回间隔
     */
    CategoryAxis.prototype.getAreaBlockLength = function () {
        var dataLength = this.option.dataIndex.length;
        return this.option.boundaryGap ? dataLength : (dataLength > 1 ? (dataLength - 1) : 1);
    };


    /**
     * 返回区域块坐标（tooltip里面的绑定事件的区域）
     */
    CategoryAxis.prototype.getAreaBlockCoord = function () {
        //		var coordArray = [];
        //		var dataLength = this.option.dataIndex.length;
        //		var interval = this.getInterval();
        //		var halfInterval = interval * 0.5;
        //		var offset = categoryAxis.option.boundaryGap ? halfInterval : 0;
        //		var len = this.getAreaBlockLength();
        //		if (this.isHorizontal()) {
        //			for (var i = 0; i < len; i++) {
        //				coordArray.push([
        //					this.getCoordByIndex(i) - halfInterval + offset,
        //					this.grid.getY(),
        //					interval,
        //					this.grid.getHeight()
        //				]);
        //			}
        //		}
        //
        //		return coordArray;
    };


    /**
     * 获取逻辑轴文本的最大宽度
     */
    CategoryAxis.prototype.getTextMaxWidth = function () {
        var textMaxWidth = 0;
        for (var i in this.option) {
            var w = zr_text.getTextWidth(this.option.data[i], this.option.axisLabel.textStyle);
            if (w > textMaxWidth) {
                textMaxWidth = w;
            }
        }
        return textMaxWidth;
    };

    /**
     * 获取逻辑轴文本的最大高度
     */
    CategoryAxis.prototype.getTextMaxHeight = function () {
        var textMaxHeight = 0;
        for (var i in this.option) {
            var h = zr_text.getTextHeight(this.option.data[i], this.option.axisLabel.textStyle);
            if (h > textMaxHeight) {
                textMaxHeight = h;
            }
        }
        return textMaxHeight;
    };


    /**
     * 根据下标获取逻辑轴的名称
     * @param index
     * @returns {*}
     */
    CategoryAxis.prototype.getNameByIndex = function (index) {
        var data = this.option.data[this.option.dataIndex[index]];
        return data != null ? (data.value != null ? data.value : data) : undefined;
    };


    zr_util.inherits(CategoryAxis, Base);
    return CategoryAxis;
});