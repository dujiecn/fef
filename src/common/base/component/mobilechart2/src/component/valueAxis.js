/**
 * 值轴
 @author j.d
 */
define(function (require) {
    'use strict';


    var Base = require('./base'),
        zr_util = require('../zrender/tool/util'),
        zr_text = require('../zrender/tool/area'),
        config = require('../conf'),
        TextShape = require('../zrender/shape/Text'),
        LineShape = require('../zrender/shape/Line'),
        smartSteps = require('../util/smartSteps'),
        Group = require('../zrender/Group');

    function ValueAxis(option, type, charts, properties) {
        //ValueAxis.superClass.constructor.call(this, option, type, charts);
        Base.call(this, option, type, charts);


        this.grid = charts.component.grid;
        this.legend = this.charts.component.legend;
        this._max = null;
        this._min = null;
        this._valueList = [];
        this.hasSeries = false;

        for (var property in properties) {
            this[property] = properties[property];
        }


        this.refresh(option, properties.series);
    }


    ValueAxis.prototype.refresh = function (newOption, newSeries) {
        if (newOption) {
            this.option = this.reviseOption(newOption);
            this.option.axisLabel.textStyle = this.getTextStyle(this.option.axisLabel.textStyle);
            if (newSeries) {
                this.series = newSeries;
            }
        }

        this.clear();
        this._buildShape();
    };


    ValueAxis.prototype._buildShape = function () {
        // 判断是否存在显示的serie
        this.hasSeries = false;
        this._calculateValue();
        if (!this.option.show || !this.hasSeries) {
            return;
        }


        //this._buildSplitArea();
        this._buildSplitLine();
        this._buildAxisLine();
        this._buildAxisTick();
        this._buildAxisLabel();
        this._buildMarkLine();

        for (var i = 0, l = this.shapeList.length; i < l; i++) {
            this.zr.addShape(this.shapeList[i]);
        }
    };


    ValueAxis.prototype.ondataZoom = function (max, min) {
        //// 删除原来的生成的图形列表
        //this.removeShape(this.shapeArray);
        //
        //this._reviseUltimateValue(max, min);
        //var splitNumber = this.option.splitNumber;
        //
        //var stepOpt = smartSteps(this.min, this.max, splitNumber);
        //this._step = stepOpt.step;
        //this._valueArray = stepOpt.pnts;
        //
        //// 重新赋值新的max和min
        //this.min = stepOpt.min;
        //this.max = stepOpt.max;
        //
        //this._buildShape();

        this.option.max = max;
        this.option.min = min;
        this.refresh(this.option);
    };


    /**
     *计算极值
     * @private
     */
    ValueAxis.prototype._calculateValue = function () {
        this._min = this._max = null;

        for(var i  = 0,l = this.series.length;i < l;i++) {
            // 图例没选中不参与计算
            if (!this.legend.isSelected(this.series[i].name)) {
                continue;
            }

            this.hasSeries = true;
            break;
        }


        if (isNaN(this.option.min - 0) || isNaN(this.option.max - 0)) {
            var data = {};
            var xAxisIndex;
            var yAxisIndex;
            var type;
            var serie;
            for (var i = 0, l = this.series.length; i < l; i++) {
                serie = this.series[i];
                type = serie.type;
                // 非坐标轴的图形不计算极值
                if (type != config.CHART_TYPE_LINE &&
                    type != config.CHART_TYPE_BAR &&
                    type != config.CHART_TYPE_SCATTER &&
                    type != config.CHART_TYPE_K) {
                    continue;
                }

                // 图例没选中不参与计算
                if (!this.legend.isSelected(serie.name)) {
                    continue;
                }


                xAxisIndex = serie.xAxisIndex || 0;
                yAxisIndex = serie.yAxisIndex || 0;

                // 不属于该值轴的不参与计算
                if (this.option.xAxisIndex != xAxisIndex &&
                    this.option.yAxisIndex != yAxisIndex) {
                    continue;
                }

                this._calculSum(data, i);
                //this.hasSeries = true;
            }

            var orientData;
            for (var key in data) {
                orientData = data[key];
                for (var i = 0, l = orientData.length; i < l; i++) {
                    if (!isNaN(orientData[i])) {
                        if (this._max == null || this._min == null) {
                            this._min = orientData[i];
                            this._max = orientData[i];
                        } else {
                            this._min = Math.min(this._min, orientData[i]);
                            this._max = Math.max(this._max, orientData[i]);
                        }
                    }
                }
            }

            var gap = Math.abs(this._max - this._min);
            this._min = isNaN(this.option.min - 0) ? (this._min - Math.abs(gap * this.option.boundaryGap[0])) : (this.option.min - 0);
            this._max = isNaN(this.option.max - 0) ? (this._max - Math.abs(gap * this.option.boundaryGap[1])) : (this.option.max - 0);

            if (this._min == this._max) {
                if (this._max == 0) {
                    this._max = 1;
                } else if (this._max > 0) {
                    this._min = this._max / this.option.splitNumber != null ? this.option.splitNumber : 5;
                } else {
                    this._max = this._max / this.option.splitNumber != null ? this.option.splitNumber : 5;
                }
            }
            this._reformValue();
        } else {
            //用户配置了最大值最小值
            //this._hasData = true;
            this._min = this.option.min - 0;    // 指定min忽略boundaryGay[0]
            this._max = this.option.max - 0;    // 指定max忽略boundaryGay[1]
            this._reformValue();
        }
    };


    /**
     * 计算堆叠和
     * @private
     */
    ValueAxis.prototype._calculSum = function (data, seriesIndex) {
        var serie = this.series[seriesIndex];
        var seriesName = serie.name;
        var seriesStack = serie.stack;
        var value;
        if (!seriesStack) {
            // 不存在堆叠的情况
            data[seriesName] = data[seriesName] || [];
            for (var i = 0, l = serie.data.length; i < l; i++) {
                value = serie.data[i];
                if (serie.type == config.CHART_TYPE_K) {
                    //    k线图的情况
                    data[seriesName].push(value[0]);
                    data[seriesName].push(value[1]);
                    data[seriesName].push(value[2]);
                    data[seriesName].push(value[3]);

                } else if (value instanceof Array) {
                    //    scatter
                    if (this.option.xAxisIndex != -1) {
                        data[seriesName].push(value[0]);
                    }

                    if (this.option.yAxisIndex != -1) {
                        data[seriesName].push(value[1]);
                    }
                } else {
                    data[seriesName].push(value);
                }
            }
        } else {
            // 堆积数据，需要区分正负向堆积
            var keyP = '__+stack_key__' + seriesStack;
            var keyN = '__-stack_key__' + seriesStack;
            data[keyP] = data[keyP] || [];
            data[keyN] = data[keyN] || [];
            for (var i = 0, l = serie.data.length; i < l; i++) {
                //value = this.getDataFromOption(serie.data[i]);
                value = serie.data[i];
                if (this.isEmpty(value)) {
                    continue;
                }

                value = value - 0;
                if (value >= 0) {
                    if (data[keyP][i] != null) {
                        data[keyP][i] += value;
                    } else {
                        data[keyP][i] = value;
                    }
                } else {
                    if (data[keyN][i] != null) {
                        data[keyN][i] += value;
                    } else {
                        data[keyN][i] = value;
                    }
                }

                if (this.option.scale) {
                    data[seriesName].push(value);
                }
            }
        }
    };

    ValueAxis.prototype._reformValue = function () {
        var scale = this.option.scale;
        var smartSteps = require('../util/smartSteps');
        var splitNumber = this.option.splitNumber;

        // 非scale下双正，修正最小值为0
        if (!scale && this._min >= 0 && this._max >= 0) {
            this._min = 0;
        }
        // 非scale下双负，修正最大值为0
        if (!scale && this._min <= 0 && this._max <= 0) {
            this._max = 0;
        }


        var stepOpt = smartSteps(this._min, this._max, splitNumber);

        splitNumber = splitNumber != null ? splitNumber : stepOpt.secs;
        //this.option.splitNumber = splitNumber;
        this._min = stepOpt.min;
        this._max = stepOpt.max;
        this._valueList = stepOpt.pnts;
    };


    ValueAxis.prototype._buildSplitArea = function () {
        if (!this.option.splitArea.show) {
            return;
        }
    };

    /**
     * markline
     */
    ValueAxis.prototype._buildMarkLine = function () {
        var markLine = this.option.markLine || [{value: 0, style: {}}];
        var markLineStyle = {
            width: 1,
            type: 'dashed'
        };


        var shapeOpt = {
            zlevel: this.getZlevel(),
            z: this.getZ(),
            hoverable: false,
            clickable: false
        };
        if (this.isHorizontal()) {

        } else {
            var y;
            var ml;
            for (var i = 0, l = markLine.length; i < l; i++) {
                markLine[i].style = zr_util.merge(markLineStyle, markLine[i].style);
                ml = markLine[i];
                y = this.optimizePixel(this.getCoordByValue(ml.value), ml.style.width);
                shapeOpt.style = {
                    xStart: this.grid.getX(),
                    yStart: y,
                    xEnd: this.grid.getX2(),
                    yEnd: y,
                    strokeColor: ml.style.color || this.option.axisLine.lineStyle.color,
                    lineType: ml.style.type,
                    lineWidth: ml.style.width
                };
                this.shapeList.push(new LineShape(shapeOpt));
            }
        }
    };


    ValueAxis.prototype._buildSplitLine = function () {
        if (!this.option.splitLine.show) {
            return;
        }

        var axShape;
        var data = this._valueList;
        var dataLength = this._valueList.length;
        var sLineOption = this.option.splitLine;
        var lineType = sLineOption.lineStyle.type;
        var lineWidth = sLineOption.lineStyle.width;
        var color = sLineOption.lineStyle.color;
        color = color instanceof Array ? color : [color];
        var colorLength = color.length;

        if (this.isHorizontal()) {
            // 横向
            var sy = this.grid.getY();
            var ey = this.grid.getY2();
            var x;

            for (var i = 0; i < dataLength; i++) {
                // 亚像素优化
                x = this.optimizePixel(this.getCoordByValue(data[i]), lineWidth);
                axShape = {
                    zlevel: this.getZlevel(),
                    z: this.getZ(),
                    hoverable: false,
                    style: {
                        xStart: x,
                        yStart: sy,
                        xEnd: x,
                        yEnd: ey,
                        strokeColor: color[i % colorLength],
                        lineType: lineType,
                        lineWidth: lineWidth
                    }
                };
                this.shapeList.push(new LineShape(axShape));
            }
        } else {
            // 纵向
            var sx = this.grid.getX();
            var ex = this.grid.getX2();
            var y;

            for (var i = 0; i < dataLength; i++) {
                // 亚像素优化
                y = this.optimizePixel(this.getCoordByValue(data[i]), lineWidth);
                axShape = {
                    zlevel: this.getZlevel(),
                    z: this.getZ(),
                    hoverable: false,
                    style: {
                        xStart: sx,
                        yStart: y,
                        xEnd: ex,
                        yEnd: y,
                        strokeColor: color[i % colorLength],
                        lineType: lineType,
                        lineWidth: lineWidth
                    }
                };
                this.shapeList.push(new LineShape(axShape));
            }
        }

    };


    ValueAxis.prototype._buildAxisTick = function () {
        if (!this.option.tick.show) {
            return;
        }

        var axShape;
        var grid = this.grid;
        var data = this._valueList;
        var dataLength = data.length;
        var tickOption = this.option.tick;
        var length = tickOption.length;
        var color = tickOption.style.color;
        var lineWidth = tickOption.style.width;

        if (this.isHorizontal()) {
            var x;
            var y = this.option.position == 'bottom'
                ? (tickOption.inside ? (grid.getY2() - length - 1) : (grid.getY2() + 1))
                : (tickOption.inside ? (grid.getY() + 1) : (grid.getY() - length - 1));

            for (var i = 0; i < dataLength; i++) {
                x = this.optimizePixel(this.getCoordByValue(data[i]), lineWidth);
                axShape = {
                    _axisShape: 'axisTick',
                    zlevel: this.getZlevel(),
                    z: this.getZ(),
                    hoverable: false,
                    style: {
                        xStart: x,
                        yStart: y,
                        xEnd: x,
                        yEnd: y + length,
                        strokeColor: color,
                        lineWidth: lineWidth
                    }
                };


                this.shapeList.push(new LineShape(axShape));
            }
        } else {
            // 纵向
            var x = this.option.position === 'left'
                ? (tickOption.inside ? (grid.getX()) : (grid.getX() - length))
                : (tickOption.inside ? (grid.getX2() - length) : (grid.getX2()));
            var y;
            for (var i = 0; i < dataLength; i++) {
                // 亚像素优化
                y = this.optimizePixel(this.getCoordByValue(data[i]), lineWidth);
                axShape = {
                    _axisShape: 'axisTick',
                    zlevel: this.getZlevel(),
                    z: this.getZ(),
                    hoverable: false,
                    style: {
                        xStart: x,
                        yStart: y,
                        xEnd: x + length,
                        yEnd: y,
                        strokeColor: color,
                        lineWidth: lineWidth
                    }
                };
                this.shapeList.push(new LineShape(axShape));
            }
        }
    };


    ValueAxis.prototype._buildAxisLabel = function () {
        if (!this.option.axisLabel.show) {
            return;
        }

        var axShape;
        var data = this._valueList;
        var dataLength = this._valueList.length;
        var rotate = this.option.axisLabel.rotate;
        var margin = this.option.axisLabel.margin;
        //var clickable = this.option.axisLabel.clickable;
        var textStyle = this.option.axisLabel.textStyle;

        if (this.isHorizontal()) {
            var y;
            var baseline;
            if (this.option.position == 'bottom') {
                y = this.grid.getY2() + margin;
                baseline = 'top';
            } else {
                y = this.grid.getY() - margin;
                baseline = 'bottom';
            }


            for (var i = 0; i < dataLength; i++) {
                axShape = {
                    zlevel: this.getZlevel(),
                    z: this.getZ() + 5,
                    hoverable: false,
                    style: {
                        x: this.getCoordByValue(data[i]),
                        y: y,
                        color: typeof textStyle.color === 'function'
                            ? textStyle.color(data[i]) : textStyle.color,
                        text: this._valueList[i],
                        textFont: this.getFont(textStyle),
                        textAlign: textStyle.align || 'center',
                        textBaseline: textStyle.baseline || baseline
                    }
                };

                if (rotate) {
                    axShape.style.textAlign = rotate > 0
                        ? (this.option.position === 'bottom'
                        ? 'right' : 'left')
                        : (this.option.position === 'bottom'
                        ? 'left' : 'right');

                    axShape.rotation = [
                        rotate * Math.PI / 180,
                        axShape.style.x,
                        axShape.style.y
                    ];
                }
                this.shapeList.push(new TextShape(axShape));
            }
        } else {
            var x;
            var align;
            var baseline;
            if (this.option.position == 'left') {
                x = this.grid.getX() - margin;
                align = 'right';
            } else {
                x = this.grid.getX2() + margin;
                align = 'left';
            }


            for (var i = 0; i < dataLength; i++) {
                if (i == 0 && !this.isEmpty(this.option.name)) {
                    baseline = 'bottom';
                } else if (i == dataLength - 1 && !this.isEmpty(this.option.name)) {
                    baseline = 'top';
                } else {
                    baseline = 'middle';
                }


                axShape = {
                    zlevel: this.getZlevel(),
                    z: this.getZ() + 5,
                    hoverable: false,
                    style: {
                        x: x,
                        y: this.getCoordByValue(data[i]),
                        color: typeof textStyle.color === 'function'
                            ? textStyle.color(data[i]) : textStyle.color,
                        text: this._valueList[i],
                        textFont: this.getFont(textStyle),
                        textAlign: textStyle.align || align,
                        textBaseline: textStyle.baseline || baseline
                    }
                };

                if (rotate) {
                    axShape.rotation = [
                        rotate * Math.PI / 180,
                        axShape.style.x,
                        axShape.style.y
                    ];
                }
                this.shapeList.push(new TextShape(axShape));
            }
        }

    };


    /**
     * 根据值换算坐标
     * @param {Object} value
     */
    ValueAxis.prototype.getCoordByValue = function (value) {
        value = value < this._min ? this._min : value;
        value = value > this._max ? this._max : value;


        var res;
        if (this.isHorizontal()) {
            res = this.grid.getX() + (value - this._min) / (this._max - this._min) * this.grid.getWidth();
        } else if (this.isVertical()) {
            res = this.grid.getY2() - (value - this._min) / (this._max - this._min) * this.grid.getHeight();
        }
        //console.log("value:" + value + ' max:' + this._max + ' min:' + this._min + " result:" + res);
        return res;
    };


    /**
     * 根据坐标换算值
     * @param {Object} value
     */
    ValueAxis.prototype.getValueByCoord = function (coord) {
        var result;
        if (!this.isHorizontal()) {
            // 纵向
            coord = coord < this.grid.getY() ? this.grid.getY() : coord;
            coord = coord > this.grid.getY2() ? this.grid.getY2() : coord;
            result = this._max - (coord - this.grid.getY()) / this.grid.getHeight() * (this._max - this._min);
        } else {
            // 横向
            coord = coord < this.grid.getX() ? this.grid.getX() : coord;
            coord = coord > this.grid.getX2() ? this.grid.getX2() : coord;
            result = this._min + (coord - this.grid.getX()) / this.grid.getWidth() * (this._max - this._min);
        }

        return result.toFixed(2) - 0;
    };


    /**
     * 获取值轴文本的最大高度
     */
    ValueAxis.prototype.getTextMaxWidth = function () {
        var textMaxWidth = 0;
        var w = textMaxWidth = zr_text.getTextWidth(this._max, this.option.axisLabel.textStyle);
        var w2 = zr_text.getTextWidth(this._min, this.option.axisLabel.textStyle);
        if (w2 > w) {
            textMaxWidth = w2;
        }
        return textMaxWidth;
    };

    /**
     * 获取值轴文本的最大高度
     */
    ValueAxis.prototype.getTextMaxHeight = function () {
        var textMaxHeight = 0;
        var h = textMaxHeight = zr_text.getTextHeight(this._max, this.option.axisLabel.textStyle);
        var h2 = zr_text.getTextHeight(this._min, this.option.axisLabel.textStyle);
        if (h2 > h) {
            textMaxHeight = h2;
        }
        return textMaxHeight;
    };


    ValueAxis.prototype.getCoordSize = function (value) {
        if (this.isHorizontal()) {
            return Math.abs(value / (this._max - this._min) * this.grid.getWidth());
        } else {
            return Math.abs(value / (this._max - this._min) * this.grid.getHeight());
        }
    };


    zr_util.inherits(ValueAxis, Base);
    return ValueAxis;
});