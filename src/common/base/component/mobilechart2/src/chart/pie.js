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
    var Polyline = require('../zrender/shape/Polyline');
    var Sector = require('../zrender/shape/Sector');
    var Text = require('../zrender/shape/Text');
    var zr_event = require('../zrender/tool/event');

    var RingShape = require('../zrender/shape/Ring');
    var CircleShape = require('../zrender/shape/Circle');

    var zr_color = require('../zrender/tool/color');

    /**
     * 这里的option是进过值轴处理的seriesGroup
     * @param {Object} option
     * @param {Object} type
     * @param {Object} charts
     */
    function Pie(option, type, charts) {
        Base.call(this, option, type, charts);
        this.legend = charts.component.legend;
        this._max = Math.MAX_VALUE;
        this.selectedMap = {};
        this.center = null;
        this.radius = null;
        this.refresh(option);
    }


    Pie.prototype.refresh = function (newOption) {
        if (newOption) {
            this.option = this.reviseOption(newOption);
            this.center = this.parseCenter(this.option.center);
            this.radius = this.option.radius;
        }


        this.backupShapeList();
        this._buildShape();
    };


    Pie.prototype._buildShape = function () {
        // 保存饼图的最大值
        this._max = 0;
        var name;
        var value;
        for (var i = 0, l = this.option.data.length; i < l; i++) {
            name = this.option.data[i].name;
            value = this.option.data[i].value;

            if (!this.legend.isSelected(name)) {
                this.selectedMap[name] = false;
                continue;
            }

            if (this.isEmpty(value)) {
                value = 0;
            }

            this._max += value;
            this.selectedMap[name] = true;
        }


        this._buildPieBase();
        this._buildPie();
        this.addShapeList();
    };


    Pie.prototype._buildPieBase = function () {
        var pieBase = {
            zlevel: this.getZlevel(),
            z: this.getZ(),
            _seriesIndex: this.name,
            _dataIndex: -1,
            _animationable: true,
            hoverable: false,
            style: {
                x: this.center[0],          // 圆心横坐标
                y: this.center[1],          // 圆心纵坐标
                // 圆环内外半径
                r0: this.radius[0] <= 10 ? 0 : this.radius[0] - 10,
                r: this.radius[1] + 10,
                brushType: 'stroke',
                lineWidth: 1,
                strokeColor: this.option.baseColor
            }
        };

        pieBase = this.radius[0] <= 10
            ? new CircleShape(pieBase)
            : new RingShape(pieBase);
        this.shapeList.push(pieBase);
    };


    /**
     * 创建饼
     * @private
     */
    Pie.prototype._buildPie = function () {
        var sectorStyle = this.option.sectorStyle;
        var lineWidth = sectorStyle.lineWidth;
        var storkeColor = sectorStyle.strokeColor;
        //var sectorList = [];
        var value;
        var name;
        var x;
        var y;
        var color;
        var startAngle = 270;
        var endAngle;
        var percent = 360 / this._max;
        for (var i = 0, l = this.option.data.length; i < l; i++) {
            name = this.option.data[i].name;
            if (!this.selectedMap[name]) {
                continue;
            }
            value = this.option.data[i].value;
            color = this.legend.getColor(name);
            endAngle = startAngle + value * percent;
            this._buildSinleItem(startAngle, endAngle, color, storkeColor, lineWidth, name, i);
            startAngle = endAngle;
        }
    };

    /**
     * 创建单个扇形和指标数据
     * @private
     */
    Pie.prototype._buildSinleItem = function (startAngle, endAngle, color, storkeColor, lineWidth, name, dataIndex) {
        var center = this.center;
        var radius = this.radius;
        var pieOpt = {
            clickable: true,
            _seriesIndex: this.name,
            _dataIndex: dataIndex,
            _animationable: true,
            zlevel: this.getZlevel(),
            z: this.getZ() + 1,
            hoverable: true,
            style: {
                x: center[0],
                y: center[1],
                r: radius[1],
                r0: radius[0],
                startAngle: startAngle,
                endAngle: endAngle,
                brushType: 'both',
                color: color,
                strokeColor: storkeColor,
                lineWidth: lineWidth,
                clockWise: true
            },
            highlightStyle: {
                color: getHightLightColor(zr_color.toRGBA(color)),
                lineWidth: 0
            }
        };
        this.shapeList.push(new Sector(pieOpt));


        //    创建文本显示
        var avgAngle = ((startAngle + endAngle) >> 1);
        var _textAlign;
        if (avgAngle > 270 && avgAngle < 450) {
            _textAlign = 'right';
        } else if (avgAngle >= 450 && avgAngle <= 630) {
            _textAlign = 'left';
        }


        var TOOLTIP_LINE_LENGTH_1 = 10;
        var TOOLTIP_LINE_LENGTH_2 = 20;
        if (this.option.showTextLine) {
            var polylineShape;
            var x0 = center[0] + Math.cos(avgAngle / 180 * Math.PI) * radius[1];
            var y0 = center[1] + Math.sin(avgAngle / 180 * Math.PI) * radius[1];
            var x1 = center[0] + Math.cos(avgAngle / 180 * Math.PI) * (radius[1] + TOOLTIP_LINE_LENGTH_1);
            var y1 = center[1] + Math.sin(avgAngle / 180 * Math.PI) * (radius[1] + TOOLTIP_LINE_LENGTH_1);
            var x2 = _textAlign == 'right' ? (x1 + TOOLTIP_LINE_LENGTH_2) : (x1 - TOOLTIP_LINE_LENGTH_2);
            var y2 = y1;
            polylineShape = new Polyline({
                zlevel: this.getZlevel(),
                z: this.getZ(),
                _seriesIndex: this.name + '_' + name,
                _dataIndex: dataIndex,
                _animationable: true,
                _type: 'pie',
                _center: center,
                style: {
                    pointList: [[x0, y0], [x1, y1], [x2, y2]],
                    strokeColor: color,
                    lineWidth: 1,
                    text: name
                }
            });
            this.shapeList.push(polylineShape);
        } else {
            //var x0 = center[0] + Math.cos(avgAngle / 180 * Math.PI) * radius[1];
            //var y0 = center[1] + Math.sin(avgAngle / 180 * Math.PI) * radius[1];
            var x1 = center[0] + Math.cos(avgAngle / 180 * Math.PI) * (radius[1] + TOOLTIP_LINE_LENGTH_1);
            var y1 = center[1] + Math.sin(avgAngle / 180 * Math.PI) * (radius[1] + TOOLTIP_LINE_LENGTH_1);
            var x2 = _textAlign == 'right' ? (x1 + TOOLTIP_LINE_LENGTH_2) : (x1 - TOOLTIP_LINE_LENGTH_2);
            var y2 = y1;

            var textShape = new Text({
                zlevel: this.getZlevel(),
                z: this.getZ(),
                _seriesIndex: this.name + '_' + name,
                _dataIndex: dataIndex,
                _animationable: true,
                _center: center,
                style: {
                    text: name,
                    //x: center[0],
                    //y: center[1],
                    x: x2,
                    y: y2,
                    color: color,
                    textAlign: _textAlign == 'right' ? 'left' : 'right'
                }
            });
            this.shapeList.push(textShape);
        }
    };

    Pie.prototype.parseCenter = function (center) {
        return [
            this.parsePercent(center[0], this.zr.getWidth()),
            this.parsePercent(center[1], this.zr.getHeight())
        ];
    };


    Pie.prototype.ontooltipHover = function (tooltipComponent) {
        var self = this;
        var position = tooltipComponent.option.tooltip.position;
        var currentShape;
        for (var i = 0; i < this.shapeList.length; i++) {
            currentShape = this.shapeList[i];
            if (currentShape.type != 'sector') {
                continue;
            }

            currentShape.onmousemove = function (e) {
                var val = self.option.data[this._dataIndex].value;
                var txt = self.option.data[this._dataIndex].name + '<br/>'
                    + val + '[' + (val / self._max * 100).toFixed(2) + '%]'
                tooltipComponent.showModel(zr_event.getX(e.event) + position[0], zr_event.getY(e.event) + position[1], txt);
            };
            currentShape.onmouseout = function () {
                tooltipComponent.hide();
            };

        }
    };


    //将颜色高亮显示
    function getHightLightColor(rgba) {
        var arr = rgba.match(/\d+/g);
        for (var i = 0, l = arr.length; i < l - 1; i++) {
            arr[i] = parseInt(arr[i]) + 20;
        }
        return 'rgba(' + arr[0] + ',' + arr[1] + ',' + arr[2] + ',' + arr[3] + ')';
    }


    zr_util.inherits(Pie, Base);
    return Pie;
});

