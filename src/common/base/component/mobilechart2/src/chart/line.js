/**
 * 折线
 * @author j.d
 *
 *
 */
define(function (require) {
    'use strict';

    var Base = require('./base');
    var zr_util = require('../zrender/tool/util');
    var config = require('../conf');
    //var animate = require('../util/animation');
    var PolylineShape = require('../zrender/shape/Polyline');
    var PolygonShape = require('../zrender/shape/Polygon');
    var IconShape = require('../util/shape/Icon');


    /**
     * 这里的option是进过值轴处理的seriesGroup
     * @param {Object} option
     * @param {Object} type
     * @param {Object} charts
     */
    function Line(option, type, charts) {
        Base.call(this, option, type, charts);
        this._step = -1;
        this.finalPointList = [];
        this.refresh(option);
    }


    Line.prototype.refresh = function (newOption) {
        if (newOption) {
            this.option = this.reviseOption(newOption);
            this.animation.delay = this.animation.duration;

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


    Line.prototype._buildShape = function () {
        this.finalPointList = [];
        this._buildPosition();
        this.addShapeList();
    };


    /**
     * 构造线上的点的数组
     */
    Line.prototype._buildPosition = function () {
        //var _pointArr = [];
        var categoryAxis;
        var valueAxis;
        if (this.isHorizontal()) {
            categoryAxis = this.xAxis.getAxis(this.option.xAxisIndex);
            valueAxis = this.yAxis.getAxis(this.option.yAxisIndex);
            this._step = categoryAxis.getStep();

            var data;
            var pnts = [];
            var val;
            var _dataIndex;
            for (var i = 0, l = this.option.dataIndex.length; i < l; i++) {
                _dataIndex = this.option.dataIndex[i];
                data = this.option.data[_dataIndex];
                if (this.isEmpty(data)) {
                    if (pnts.length > 0) {
                        this.finalPointList.push(pnts);
                        pnts = [];
                    }
                } else {
                    if (data >= 0) {
                        val = data + this.option.stackData[_dataIndex][0];
                    } else {
                        val = data + this.option.stackData[_dataIndex][1];
                    }
                    pnts.push([
                        categoryAxis.getCoordByIndex(i),
                        valueAxis.getCoordByValue(val),
                        i,
                        categoryAxis.getNameByIndex(i)
                    ]);
                }
            }

            if (pnts.length > 0) {
                this.finalPointList.push(pnts);
            }

            this._buildLine(this.finalPointList, 'horizontal');
        } else {
            // TODO
            this._buildLine(this.finalPointList, 'vertical');
        }
    };


    Line.prototype._buildLine = function (pointList, orient) {
        var lineStyle = this.option.style.normal;
        var lineWidth = lineStyle.width;
        var lineColor = lineStyle.color;
        var lineType = lineStyle.type;
        var shadowColor = lineStyle.shadowColor;
        var shadowBlur = lineStyle.shadowBlur;
        var shadowOffsetX = lineStyle.shadowOffsetX;
        var shadowOffsetY = lineStyle.shadowOffsetY;

        var shapeOpt = {
            zlevel: this.getZlevel(),
            z: this.getZ(),
            _animationable: true,// 标识可做动画
            hoverable: false,
            _orient: orient
        };


        if (orient == 'horizontal') {
            for (var i = 0, l = pointList.length; i < l; i++) {
                if (this.option.symbol.show) {
                    var point;
                    for (var j = 0, k = pointList[i].length; j < k; j++) {
                        point = pointList[i][j];
                        //    拐点设为显示
                        this.shapeList.push(this._buildSymbol(point[0], point[1], point[2], 'horizontal'));
                    }
                }

                // 用于做key索引
                shapeOpt._dataIndex = i;
                shapeOpt._seriesIndex = this.option.name;

                shapeOpt.style = {
                    miterLimit: lineWidth,
                    pointList: pointList[i],
                    strokeColor: lineColor,
                    lineWidth: lineWidth,
                    lineType: lineType,
                    smooth: this.option.smooth ? 0.3 : 0,
                    //smoothConstraint: shapeBox,
                    shadowColor: shadowColor,
                    shadowBlur: shadowBlur,
                    shadowOffsetX: shadowOffsetX,
                    shadowOffsetY: shadowOffsetY,
                    brushType: 'both'
                };

                if (this.option.area) {
                    // 这里需要进行方向判断
                    if (orient == 'horizontal') {
                        shapeOpt.style.pointList.unshift([pointList[i][0][0], this.grid.getY2()]);
                        shapeOpt.style.pointList.push([pointList[i][pointList[i].length - 1][0], this.grid.getY2()]);
                    } else if (orient == 'vertical') {

                    }

                    var zr_color = require('../zrender/tool/color');
                    shapeOpt.style.color = zr_color.alpha(lineColor, 0.5);
                    shapeOpt.style.smoothConstraint = this._getBox(shapeOpt.style.pointList, orient);
                    this.shapeList.push(new PolygonShape(shapeOpt));
                } else {
                    this.shapeList.push(new PolylineShape(shapeOpt));
                }
            }

        } else if (orient == 'vertical') {

        }
    };


    Line.prototype._buildSymbol = function (x, y, dataIndex, orient) {
        var symbol = this.option.symbol;
        var itemShapeOption = {
            _x: x,
            _y: y,
            _orient: orient,
            hoverable: false,
            clickable: false,
            _seriesIndex: this.option.name,
            _dataIndex: dataIndex,
            _animationable: true,
            zlevel: this.getZlevel(),
            z: this.getZ() + 1,
            style: {
                iconType: symbol.type.toLowerCase(),
                x: x - symbol.style.size,
                y: y - symbol.style.size,
                width: symbol.style.size * 2,
                height: symbol.style.size * 2,
                brushType: 'both',
                color: symbol.style.emptyColor,
                strokeColor: symbol.style.color || this.option.style.normal.color, //this._seriesIndex2ColorMap[seriesIndex],
                lineWidth: this.option.style.normal.width
            }
        };

        if (symbol.type == 'circle') {

        } else if (symbol.type == 'star') {

        } else if (symbol.type == 'none') {

        }

        return new IconShape(itemShapeOption);
    };


    Line.prototype._getBox = function (points, orient) {
        var minX, minY, maxX, maxY;
        if (orient == 'horizontal') {
            for (var i = 0, l = points.length; i < l; i++) {
                if (minX == undefined) {
                    minX = points[i][0];
                }
                if (maxX == undefined) {
                    maxX = points[i][0];
                }
                if (minY == undefined) {
                    minY = points[i][1];
                }
                if (maxY == undefined) {
                    maxY = points[i][1];
                }


                minX = Math.min(minX, points[i][0]);
                maxX = Math.max(maxX, points[i][0]);
                minY = Math.min(minY, points[i][1]);
                maxY = Math.max(maxY, points[i][1]);
            }

        } else if (orient == 'vertical') {

        }

        return [
            [minX, minY],
            [maxX, maxY]
        ];
    };


    /**
     * 响应trigger为item的时候的事件
     * @param tooltipComponent
     */
    Line.prototype.ontooltipHover = function (tooltipComponent) {
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
            if (currentShape.type != 'icon') {
                continue;
            }

            //currentShape.hoverable = true;
            currentShape.onmousemove = function () {
                var _dataIndex = categoryAxis.option.dataIndex[this._dataIndex];
                var txt = self.name + '<br/>' + categoryAxis.option.data[_dataIndex] + ':' + self.option.data[_dataIndex];
                tooltipComponent.showModel(this.style.x + position[0], this.style.y + position[1], txt);
            };
            currentShape.onmouseout = function () {
                tooltipComponent.hide();
            };
        }
    };


    zr_util.inherits(Line, Base);
    return Line;
});