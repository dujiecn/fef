/**
 * 散点图
 * @author dj
 */
define(function (require) {
    'use strict';

    var Base = require('./base');
    var zr_util = require('../zrender/tool/util');
    var config = require('../conf');
    //	var CircleShape = require('../zrender/shape/Circle');
    var zr_event = require('../zrender/tool/event');
    var IconShape = require('../util/shape/Icon');


    function Scatter(option, type, charts) {
        Base.call(this, option, type, charts);
        this.refresh(option);
    }

    Scatter.prototype.refresh = function (newOption) {
        if (newOption) {
            this.option = this.reviseOption(newOption);
            // 默认配置没有颜色值，这里做处理
            if (!this.option.style.normal.color) {
                this.option.style.normal.color = this.legend.getColor(this.option.name);
            }
        }

        this.backupShapeList();
        this._buildShape();
    };

    Scatter.prototype._buildShape = function () {
        //  散点图因为都是值轴  所以这里不做判断
        var xAxis = this.xAxis.getAxis(this.option.xAxisIndex);
        var yAxis = this.yAxis.getAxis(this.option.yAxisIndex);

        // 不同的图形计算不同的半径
        var large = this.option.large;
        // 配置此属性 说明是气泡图 优先级低于大规模
        var symbolSize = this.option.symbolSize;
        // 用户配置的半径大小
        var radius = this.option.radius;

        if (large) {
            // 大规模散点图
            radius = radius || 1;
        } else if (symbolSize) {
            // 由于是函数，循环里面处理
        } else {
            // 标准散点图
            radius = radius || 5;
        }

        var width = radius * 2;
        var height = radius * 2;

        var pointList = [];
        var data;
        for (var i = 0, l = this.option.data.length; i < l; i++) {
            data = this.option.data[i];
            if (this.isEmpty(data[0]) || this.isEmpty(data[1])) {
                continue;
            }

            if(data[0] < xAxis._min || data[0] > xAxis._max || data[1] < yAxis._min || data[1] > yAxis._max) {
                continue;
            }

            if (data.length == 3 && symbolSize) {
                radius = symbolSize(data);
                width = height = radius * 2;
            }

            pointList.push({
                x: xAxis.getCoordByValue(data[0]),
                y: yAxis.getCoordByValue(data[1]),
                width: width,
                height: height,
                dataIndex: i
            });
        }

        this._buildPointList(pointList);
        this.addShapeList();
    };

    Scatter.prototype._buildPointList = function (pointList) {
        var normalStyle = this.option.style.normal;
        var iconType = normalStyle.iconType;
        var color = normalStyle.color;
        var strokeColor = normalStyle.strokeColor;
        var opacity = normalStyle.opacity;
        var lineWidth = normalStyle.lineWidth || 0;

        // 根据名称获取seriesindex索引
        var _seriesIndex;
        for (var i = 0, l = this.charts._option.series.length; i < l; i++) {
            if (this.charts._option.series[i].name == this.name) {
                _seriesIndex = i;
                break;
            }
        }


        var point;
        var shapeOpt = {
            zlevel: this.getZlevel(),
            z: this.getZ(),
            _animationable: true,
            hoverable: false,
            highlightStyle: {
                color: normalStyle.color,
                strokeColor: normalStyle.color
            }
        };
        for (var i = 0, l = pointList.length; i < l; i++) {
            point = pointList[i];

            shapeOpt._seriesIndex = _seriesIndex;
            shapeOpt._dataIndex = point.dataIndex;

            // 保存区域用来在tooltip里面判断是否在区域内使用的
            shapeOpt._area = {
                x: point.x,
                y: point.y,
                width: point.width,
                height: point.height
            };

            shapeOpt.style = {
                brushType: 'both',
                x: point.x,
                y: point.y,
                width: point.width,
                height: point.height,
                iconType: iconType,
                color: color,
                strokeColor: strokeColor,
                opacity: opacity,
                lineWidth: lineWidth
            };

            this.shapeList.push(new IconShape(shapeOpt));
        }
    };

    Scatter.prototype.ontooltipHover = function (tooltipComponent) {
        var xAxis = this.xAxis.getAxis(this.option.xAxisIndex);
        var yAxis = this.yAxis.getAxis(this.option.yAxisIndex);
        var position = tooltipComponent.option.tooltip.position;
        var ps;
        var _this = this;

        var large = this.option.large;

        var currentShape;
        for (var i = 0, l = this.shapeList.length; i < l; i++) {
            currentShape = this.shapeList[i];
            if (currentShape.type != 'icon') {
                continue;
            }

            currentShape.onmouseover = function (param) {
                /*
                 修改z值是为了突出显示，但是在大规模的时候，这个属性会导致卡顿。
                 */
                if (!large && !this.clicked) {
                    this.z++;
                    this.clicked = true;
                    _this.zr.modShape(this);
                }


                var txt = _this.name + '<br/>'
                    + xAxis.option.axisLabel.formatter(_this.option.data[this._dataIndex][0])
                    + ',' + yAxis.option.axisLabel.formatter(_this.option.data[this._dataIndex][1])
                    + (_this.option.data[this._dataIndex][2] ? ',' + _this.option.data[this._dataIndex][2] : '');

                tooltipComponent.showModel(this.style.x + position[0], this.style.y + position[1], txt);
            };
            currentShape.onmouseout = function (param) {
                tooltipComponent.hide();

                if (!large && this.clicked) {
                    this.z--;
                    this.clicked = false;
                    _this.zr.modShape(this);
                }
            };
        }
    };

    zr_util.inherits(Scatter, Base);
    return Scatter;
});