/**
 * 折线
 * @author j.d
 */
define(function (require) {
    'use strict';

    var Base = require('./base');
    var zr_util = require('../zrender/tool/util');
    var config = require('../conf');
    var RectangleShape = require('../zrender/shape/Rectangle');
    var zr_event = require('../zrender/tool/event');


    function Bar(option, type, charts, udata) {
        Base.call(this, option, type, charts);
        this.refresh(option, udata);
    }

    Bar.prototype.refresh = function (newOption, udata) {
        // 外面调用刷新之前需要重新设置udata
        // 柱状图需要的数据，在series里面计算完后传递进来
        udata && this.setExtendData(udata);

        if (newOption) {
            this.option = this.reviseOption(newOption);
            // 默认配置没有颜色值，这里做处理
            if (!this.option.style.normal.color) {
                this.option.style.normal.color = this.legend.getColor(this.option.name);
            }
        }

        // 务必在备份图形之前删除，否则list里面没数据，导致删除图形不成功
        //if (!this.legend.isSelected(this.name)) {
        //    this.clear();
        //    return;
        //}

        this.backupShapeList();
        this._buildShape();
    };

    Bar.prototype._buildShape = function () {
        this._buildPosition();
        this.addShapeList();
    };

    Bar.prototype._buildPosition = function () {
        var categoryAxis;
        var valueAxis;
        if (this.isHorizontal()) {
            categoryAxis = this.xAxis.getAxis(this.option.xAxisIndex);
            valueAxis = this.yAxis.getAxis(this.option.yAxisIndex);

            var data;
            var dataIndex;
            var barList = [];
            var y;
            var stackY;
            var dataY;
            var height;
            var width = this.barWidth;
            var x = this.grid.getX() +
                this.barCategoryGapWidth * 0.5 +
                (this.barWidth + this.barGapWidth) * this.option._stackIndex;

            for (var i = 0, l = this.option.dataIndex.length; i < l; i++) {
                dataIndex = this.option.dataIndex[i];
                data = this.option.data[dataIndex];
                if (this.isEmpty(data)) {
                    continue;
                }


                if (data >= 0) {
                    var stackY = valueAxis.getCoordByValue(this.option.stackData[dataIndex][0]);
                    var dataY = valueAxis.getCoordByValue(data);
                    var height = Math.abs(valueAxis.getCoordByValue(0) - dataY);
                    y = stackY - height;
                } else {
                    var stackY = valueAxis.getCoordByValue(this.option.stackData[dataIndex][1]);
                    var dataY = valueAxis.getCoordByValue(data);
                    var height = Math.abs(valueAxis.getCoordByValue(0) - dataY);
                    y = stackY;
                }

                barList.push([
                    x + this.interval * i,
                    y,
                    width,
                    height,
                    i,
                    categoryAxis.getNameByIndex(i)
                ]);


            }

            this._buildBar(barList, 'vertical');// 逻辑轴水平方向，则柱状图的方向是垂直，即vertical
        } else {
            //    TODO
            //
            this._buildBar(barList, 'horizontal');
        }
    };


    Bar.prototype._buildBar = function (barList, orient) {
        var bar;
        var data;
        for (var i = 0, l = barList.length; i < l; i++) {
            bar = barList[i];
            data = this.option.data[this.option.dataIndex[bar[4]]];
            this.shapeList.push(this._buildBarItem(
                bar[0],
                bar[1],
                bar[2],
                bar[3],
                this.option.label.formatter(data),
                i,
                orient
            ));
        }
    };


    Bar.prototype._buildBarItem = function (x, y, width, height, txt, dataIndex, orient) {
        var radius = this.option.radius;
        var color = this.option.style.normal.color;
        var labelOpt = this.option.label;
        var formatter = labelOpt.formatter;

        var shapeOpt = {
            hoverable: this.option.hoverable,
            zlevel: this.getZlevel(),
            _orient: orient,
            _seriesIndex: this.name,
            _dataIndex: dataIndex,
            _animationable: true,
            z: this.getZ(),
            style: {
                radius: this.parseCssArray(radius),
                color: color,
                textPosition: labelOpt.textPosition,
                textAlign: labelOpt.textAlign,
                textFont: labelOpt.textFont,
                x: x,
                y: y,
                width: width,
                height: height,
                text: txt
            }
        };

        return new RectangleShape(shapeOpt);
    };


    Bar.prototype.setExtendData = function (udata) {
        for (var prop in udata) {
            this[prop] = udata[prop];
        }
    };


    Bar.prototype.ontooltipHover = function (tooltipComponent) {
        var self = this;
        var categoryAxis;
        if (this.isHorizontal()) {
            categoryAxis = this.xAxis.getAxis(this.option.xAxisIndex);
        } else {
            categoryAxis = this.yAxis.getAxis(this.option.yAxisIndex);
        }
        var position = tooltipComponent.option.tooltip.position;


        var currentShape;
        for (var i = 0, l = this.shapeList.length; i < l; i++) {
            currentShape = this.shapeList[i];
            if (currentShape.type != 'rectangle') {
                continue;
            }

            currentShape.onmouseover = function (e) {
                var txt = self.name + '<br/>'
                    + categoryAxis.option.data[this._dataIndex]
                    + ':' + self.option.data[this._dataIndex];
                tooltipComponent.showModel(zr_event.getX(e.event) + position[0], zr_event.getY(e.event) + position[1], txt);

            };
            currentShape.onmouseout = function () {
                tooltipComponent.hide();
            };

        }


        //var _this = this;
        //var categoryOption;
        //if (this.isHorizontal()) {
        //    categoryOption = this.xAxis.getAxis(0).option;
        //} else {
        //    categoryOption = this.yAxis.getAxis(0).option;
        //}
        //var position = tooltipComponent.option.tooltip.position;
        //
        //var dt;
        //var _shapeIndex = 0;
        //var shape;
        //var _index;
        //
        //
        //for (var i = 0, l = this.option.dataIndex.length; i < l; i++) {
        //    _index = this.option.dataIndex[i];
        //    dt = this.option.data[_index];
        //    if (this.isNull(dt)) {
        //        continue;
        //    }
        //
        //    shape = this.shapeArray[_shapeIndex];
        //    shape._dataIndex = _index;
        //    shape.onmousemove = function(e) {
        //        var txt = _this.name + '<br/>' + categoryOption.data[this._dataIndex] + ':' + _this.option.data[this._dataIndex];
        //        tooltipComponent.showModel(zr_event.getX(e.event) + position[0], zr_event.getY(e.event) + position[1], txt);
        //    };
        //    shape.onmouseout = function() {
        //        tooltipComponent.hide();
        //    };
        //
        //
        //    _shapeIndex++;
        //}
    };


    zr_util.inherits(Bar, Base);
    return Bar;
});