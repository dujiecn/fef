/**
 * 折线
 * @author C L
 *
 */
define(function (require) {
    'use strict';
    var Base = require('./base');
    var zr_util = require('../zrender/tool/util');
    var config = require('../conf');
    var animate = require('../util/animation');
    var Polyline = require('../zrender/shape/Polygon');
    var Text = require('../zrender/shape/Text');
    var zr_event = require('../zrender/tool/event');
    var Circle = require('../zrender/shape/Circle');
    /* 正N边形 */
    var IsogonShape = require('../zrender/shape/Isogon');

    var Sector = require('../zrender/shape/Sector');

    var Animation = require('../zrender/animation/Animation');
    var Line = require('../zrender/shape/Line');
    var Color = require('../zrender/tool/color');

    /**
     * 这里的option是进过值轴处理的seriesGroup
     * @param {Object} option
     * @param {Object} type
     * @param {Object} charts
     */
    function Radar(option, type, charts) {
        Base.call(this, option, type, charts);
        this.polar = charts._option.polar[0];
        this.selectedMap = {};
        this._zrWidth = this.zr.getWidth();
        this._zrHeight = this.zr.getHeight();
        this.center = [];
        this.legend = charts.component.legend;
        this.radius = 0;
        //this._seriesIndex = -1;
        this.refresh(option);
    }


    /**
     * 初始化函数
     */
    Radar.prototype.refresh = function (newOption) {
        if (newOption) {
            this.option = this.reviseOption(newOption);
            this.polar = this.reviseOption(this.polar, 'polar');
            this.animation = zr_util.merge(this.option.animation || {}, config.animation);
            // 原点显示需要有延迟
            this.animation.delay = this.animation.duration - 200;

            // 计算中心点坐标
            this.center[0] = this.parsePercent(this.polar.center[0], this._zrWidth);
            this.center[1] = this.parsePercent(this.polar.center[1], this._zrHeight);

            // 外圆半径
            this.radius = this.polar.radius || Math.min(this._zrWidth, this._zrHeight) * 0.5 * 0.8;

            // 缓存index
            //for (var i = 0, l = this.charts.component.series.series.length; i < l; i++) {
            //    if (this.charts.component.series.series[i].name == this.name) {
            //        this._seriesIndex = i;
            //        break;
            //    }
            //}


        }

        this.backupShapeList();
        this._buildShape();
    };

    Radar.prototype._buildShape = function () {
        var polar = this.polar;
        var polarType = polar.type;
        var splitNumber = polar.splitNumber;
        var radius = this.radius;
        var secLength = radius / splitNumber;
        var indicator = polar.indicator;
        var eleNumber = indicator.length;
        var secAngle = 360 / eleNumber;
        var data = this.option.data;
        var splitArea = polar.splitArea;
        var splitLine = polar.splitLine;
        var lineStyle = splitLine.lineStyle;
        var textStyle = polar.textStyle;
        var radialLineStyle = polar.radialLine;


        var fillColor;
        if (splitArea.show) {
            if (splitArea.areaStyle.color) {
                fillColor = splitArea.areaStyle.color;
            } else {
                fillColor = splitArea.defaultColor;
            }
        }

        // 绘制八卦阵
        var polarShape;
        for (var i = splitNumber; i > 0; i--) {
            if (polarType == 'circle') {
                polarShape = new Circle({
                    style: {
                        x: this.center[0],
                        y: this.center[1],
                        r: i * secLength,
                        brushType: 'both',
                        color: i % 2 == 0 ? fillColor : this.backgroundColor,
                        strokeColor: lineStyle.strokeColor,
                        lineWidth: splitLine.show ? lineStyle.lineWidth : 0
                    },
                    hoverable: false,
                    zIndex: this.getZlevel(),
                    z: this.getZ()
                });
            } else {
                polarShape = new IsogonShape({
                    style: {
                        x: this.center[0],
                        y: this.center[1],
                        r: i * secLength,
                        n: eleNumber,
                        brushType: 'both',
                        color: i % 2 == 0 ? fillColor : this.backgroundColor,
                        strokeColor: lineStyle.strokeColor,
                        lineWidth: splitLine.show ? lineStyle.lineWidth : 0
                    },
                    hoverable: false,
                    zIndex: this.getZlevel(),
                    z: this.getZ()
                });
            }
            this.shapeList.push(polarShape);
        }


        // 初始化点的坐标map
        var pointListMap = {};
        for (var i = 0, l = data.length; i < l; i++) {
            this.selectedMap[data[i].name] = this.legend.isSelected(data[i].name);
            if (!this.selectedMap[data[i].name]) {
                continue;
            }

            pointListMap[data[i].name] = {
                pointList: [],
                seriesIndex: i // 由于series中的配置不同，所以这里把i作为seriesIndex
            };
        }

        var _degree;
        var _angle;
        var _textAlign;
        var _tipStartDegree;
        var _tipEndDegree;
        var textX;
        var textY;
        var lineShape;
        var textShape;
        var tooltipShape;
        for (var i = 0; i < eleNumber; i++) {
            _degree = 270 - i * secAngle;
            _angle = _degree * Math.PI / 180;
            _tipStartDegree = 90 - (secAngle >> 1) + i * secAngle;
            _tipEndDegree = 90 + (secAngle >> 1) + i * secAngle;


            // 射线
            lineShape = new Line({
                style: {
                    xStart: this.center[0],
                    yStart: this.center[1],
                    xEnd: this.center[0] + radius * Math.cos(_angle),
                    yEnd: this.center[1] + radius * Math.sin(_angle),
                    strokeColor: radialLineStyle.strokeColor,
                    lineWidth: radialLineStyle.lineWidth
                },
                hoverable: false,
                zIndex: this.getZlevel(),
                z: this.getZ()
            });
            this.shapeList.push(lineShape);


            // 文字
            textX = this.center[0] + (radius + 10) * Math.cos(_angle);
            textY = this.center[1] + (radius + 10) * Math.sin(_angle);
            _textAlign = _degree > 90 && _degree < 270 ? 'right' : _degree == 90 || _degree == 270
                ? 'center' : 'left';

            textShape = new Text({
                style: {
                    text: indicator[i].text,
                    x: textX,
                    y: textY,
                    color: textStyle.color,
                    textAlign: _textAlign,
                    textFont: textStyle.textFont
                },
                hoverable: false
            });
            this.shapeList.push(textShape);


            // 隐藏的tooltipshape
            /* 画出tooltip需要使用的hide的shape，促发tooltip事件*/
            tooltipShape = new Sector({
                ignore: true,
                zIndex: this.getZlevel(),
                z: this.getZ(),
                _seriesIndex: this.name,
                _dataIndex: i,
                _animationable: false,
                _area: {
                    x: this.center[0],
                    y: this.center[1],
                    r: radius,
                    r0: 0,
                    startAngle: _tipStartDegree,
                    endAngle: _tipEndDegree
                },
                style: {
                    x: this.center[0],
                    y: this.center[1],
                    r: radius,
                    r0: 0,
                    startAngle: _tipStartDegree,
                    endAngle: _tipEndDegree,
                    brushType: 'both',
                    color: this.theme.color[i],
                    strokeColor: this.theme.color[i],
                    lineWidth: 1
                },
                highlightStyle: {
                    opacity: 0
                }
            });
            this.shapeList.push(tooltipShape);


            // 构造点的坐标数组
            for (var j = 0, k = data.length; j < k; j++) {
                if (data[j].value[i]) {
                    var len = data[j].value[i] * radius / (indicator[i].max - (indicator[i].min || 0));
                    pointListMap[data[j].name] && pointListMap[data[j].name].pointList.push([
                        this.center[0] + len * Math.cos(_angle),
                        this.center[1] + len * Math.sin(_angle),
                        i,
                        data[j].name
                    ]);
                }
            }
        }


        this._buildPolyLine(pointListMap);
        this.addShapeList();
    };


    Radar.prototype._buildPolyLine = function (pointListMap) {
        var strokeColor;
        var color;
        var pointList;
        var polylineShape;
        var circleShape;
        for (var name in pointListMap) {
            strokeColor = this.legend.getColor(name);
            color = Color.alpha(strokeColor, 0.5);
            pointList = pointListMap[name].pointList;
            var polylineShape = new Polyline({
                hoverable: false,
                zIndex: this.getZlevel(),
                z: this.getZ(),
                _center: this.center,
                _seriesIndex: pointListMap[name].seriesIndex,
                _dataIndex: pointListMap[name].seriesIndex,
                _animationable: true,
                _type: this.type,
                style: {
                    pointList: pointList,
                    brushType: this.option.area ? 'both' : 'stroke',
                    strokeColor: strokeColor,
                    lineWidth: 2,
                    color: color
                },
                highlightStyle: {
                    brushType: 'stroke',
                    strokeColor: strokeColor,
                    lineWidth: 2
                }
            });
            this.shapeList.push(polylineShape);


            // 绘制点
            for (var i = 0, l = pointList.length; i < l; i++) {
                circleShape = new Circle({
                    hoverable: false,
                    zIndex: this.getZlevel(),
                    z: this.getZ() + 1,
                    _seriesIndex: pointListMap[name].seriesIndex,
                    _dataIndex: pointList[i][2],
                    _animationable: true,
                    style: {
                        x: pointList[i][0],
                        y: pointList[i][1],
                        r: 3,
                        brushType: 'both',
                        strokeColor: this.legend.getColor(name),
                        color: this.backgroundColor,
                        lineWidth: 1
                    },
                    highlightStyle: {
                        brushType: 'both',
                        strokeColor: this.legend.getColor(name),
                        color: this.backgroundColor,
                        r: 3,
                        lineWidth: 3
                    }
                });
                this.shapeList.push(circleShape);
            }

        }

    };


    Radar.prototype.ontooltipHover = function (tooltipComponent) {
        var self = this;
        var position = tooltipComponent.option.tooltip.position;

        var currentShape;
        for (var i = 0, l = this.shapeList.length; i < l; i++) {
            currentShape = this.shapeList[i];
            if (currentShape.type == 'polygon') {
                currentShape.hoverable = true;
                currentShape.onmouseover = function (param) {
                    var txt = this._seriesIndex + '<br/>';
                    var _dataIndex = this._dataIndex;
                    var data;
                    for (var i = 0, l = self.option.data[_dataIndex].value.length; i < l; i++) {
                        data = self.option.data[_dataIndex].value[i];
                        txt += self.polar.indicator[i].text + ':' + data + '<br/>';
                    }
                    tooltipComponent.showModel(zr_event.getX(param.event) + position[0], zr_event.getY(param.event) + position[1], txt);
                };
            }

            if (currentShape.type == 'circle') {
                currentShape.hoverable = true;
                currentShape.onmouseover = function (param) {
                    var _dataIndex = this._dataIndex;
                    var _seriesIndex = this._seriesIndex;
                    var txt = self.polar.indicator[_dataIndex].text + ':<br/>'
                        + self.option.data[_seriesIndex].value[_dataIndex];
                    tooltipComponent.showModel(zr_event.getX(param.event) + position[0], zr_event.getY(param.event) + position[1], txt);
                };
            }
            currentShape.onmouseout = function () {
                tooltipComponent.hide();
            };

        }

    };


    zr_util.inherits(Radar, Base);
    return Radar;

})
;

