/**
 * 悬浮框
 * @author j.d
 */
define(function (require) {
    'use strict';


    var Base = require('./base'),
        zr_util = require('../zrender/tool/util'),
        RectangleShape = require('../zrender/shape/Rectangle'),
        rectangleClassObject = new RectangleShape({}),
        CrossShape = require('../util/shape/Cross'),
        Circle = require('../zrender/shape/Circle'),
        circleClassObject = new Circle({}),
        Sector = require('../zrender/shape/Sector'),
        sectorClassObject = new Sector({}),
        config = require('../conf'),
        zr_event = require('../zrender/tool/event'),
        zr_area = require('../zrender/tool/area'),
        Line = require('../zrender/shape/Line');
    var css = require('../util/css');

    function Tooltip(option, type, charts) {
        Base.call(this, option, type, charts);

        this.xAxis = charts.component.xAxis;
        this.yAxis = charts.component.yAxis;
        this.grid = charts.component.grid;
        this.legend = charts.component.legend;
        this.series = charts.component.series;

        this._zrWidth = this.zr.getWidth();
        this._zrHeight = this.zr.getHeight();

        // 在直角坐标系中，存在逻辑轴的时候并且pointer的type为line的时候创建
        this._axisLineShape = null;
        // 在双值轴的时候创建，（scatter）
        this._axisCrossShape = null;
        // 在直角坐标系中，存在逻辑轴的时候并且pointer的type为shadow的时候创建
        this._axisShadowShape = null;

        this.dom = charts.dom;
        this.cDom = document.createElement('div');
        this.dom.firstChild.appendChild(this.cDom);

        this.refresh(option);
    }

    /**
     * 刷新
     */
    Tooltip.prototype.refresh = function (newOption) {
        if (newOption) {
            this.option = newOption;
            this.option.tooltip = this.reviseOption(this.option.tooltip);

            this.setDomStyle(this.option.tooltip);
        }

        this.trigger();
    };


    /**
     * 设置显示的弹出框的样式
     */
    Tooltip.prototype.setDomStyle = function (tooltip) {
        css(this.cDom, {
            'position': 'absolute',
            'display': 'none',
            'borderStyle': 'solid',
            'borderWidth': tooltip.borderWidth,
            'borderColor': tooltip.borderColor,
            'whiteSpace': 'nowrap',
            'transition': 'left 0.3s, top 0.3s',
            'borderRadius': this.parseCssArray(tooltip.borderRadius).join('px ') + 'px',
            'color': tooltip.color,
            'fontFamily': '微软雅黑, Arial, Verdana, sans - serif',
            'padding': this.parseCssArray(tooltip.padding).join('px ') + 'px',
            'backgroundColor': tooltip.backgroundColor,
            'fontSize': tooltip.size + 'px'
        });
    };


    Tooltip.prototype.trigger = function () {
        var tooltip = this.option.tooltip;


        // 双值轴的情况，则强制trigger为axis
        //if (this.xAxis && this.yAxis) {
        //    if (this.xAxis.getAxis(0).type == config.COMPONENT_TYPE_AXIS_VALUE &&
        //        this.yAxis.getAxis(0).type == config.COMPONENT_TYPE_AXIS_VALUE) {
        //        tooltip.trigger = 'axis';
        //    }
        //} else {
        // 饼图 雷达图强制设置为item
        if (this.option.series[0].type == config.CHART_TYPE_PIE) {
            tooltip.trigger = 'item';
        }
        //}


        switch (tooltip.trigger) {
            case 'item':
                this._showItemTrigger(tooltip);
                break;
            case 'axis':
                this._showAxisTrigger(tooltip);
                break;
            default:
                break;
        }
    };


    Tooltip.prototype._showItemTrigger = function (tooltip) {
        var chartMap = this.series.chartMap;
        for (var name in chartMap) {
            chartMap[name].ontooltipHover && chartMap[name].ontooltipHover(this);
        }
    };

    Tooltip.prototype._showAxisTrigger = function (tooltip) {
        var self = this;
        var pointer = this.option.tooltip.pointer;
        var grid = this.grid;
        var categoryAxis;

        if (this.xAxis && this.yAxis) {
            /*
             * 狼厂该配置如果在存在逻辑轴的图表里面，配置也是有效，这里暂不兼容存在逻辑轴的cross情况
             * 默认存在不存在逻辑轴的时候，强制转换为cross
             */
            if (this.xAxis.getAxis(0).type == config.COMPONENT_TYPE_AXIS_VALUE &&
                this.yAxis.getAxis(0).type == config.COMPONENT_TYPE_AXIS_VALUE) {
                pointer.type = 'cross';
            } else {
                // 就算用户在存在逻辑轴的图表里配置cross也被视为无效配置，强制置为line类型
                pointer.type = pointer.type || 'line';
                if (pointer.type == 'cross') {
                    pointer.type = 'line';
                }
            }

            // 如果存在逻辑轴，获取逻辑轴
            if (this.isHorizontal()) {
                categoryAxis = this.xAxis.getAxis(0);
            } else if (this.isVertical()) {
                categoryAxis = this.yAxis.getAxis(0);
            }
        }


        this.zr.on(config.EVENT_TYPE.MOUSEMOVE, function (e) {
            var x = zr_event.getX(e.event);
            var y = zr_event.getY(e.event);
            var showData = {};
            var area;


            if (self.xAxis && self.yAxis) {
                area = grid.getArea();
                //    判断是否在区域内
                if (!zr_area.isInside(rectangleClassObject, area, x, y)) {
                    self.hide();
                    return;
                }

                //    存在轴的时候才需要绘制坐标指示器
                self._setPointer(x, y, grid, categoryAxis, pointer, showData);
            } else {
                var area;
                var chart;
                var chartType = self.option.series[0].type;
                if (chartType == config.CHART_TYPE_RADAR) {
                    for (var name in self.series.chartMap) {
                        // 因为雷达就一个图，只取第一个
                        chart = self.series.chartMap[name];
                        area = {
                            x: chart.center[0],
                            y: chart.center[1],
                            r: chart.radius
                        }
                        break;
                    }
                }

                if (!area) {
                    return;
                }

                if (!zr_area.isInside(circleClassObject, area, x, y)) {
                    self.hide();
                    return;
                }

                //    不存在轴的图形，如雷达图
                self._showWithOutAxis(x, y, showData, chart);
            }

            if (!self.isEmptyObject(showData)) {
                self.showModel(showData.x, showData.y, showData.text);
            }
        });
    };

    Tooltip.prototype._showWithOutAxis = function (mouseX, mouseY, data, chart) {
        if (chart.type == config.CHART_TYPE_RADAR) {
            var currentShape;
            var _dataIndex;
            var text = '';
            for (var i = 0, l = chart.shapeList.length; i < l; i++) {
                currentShape = chart.shapeList[i];
                if (currentShape.type != 'sector') {
                    continue;
                }

                // 判断在不在图形内
                if (zr_area.isInside(sectorClassObject, currentShape._area, mouseX, mouseY)) {
                    _dataIndex = currentShape._dataIndex;
                    // 判断之前选中的是否跟当前选中的是同一个图形
                    if (this._hoverShape && this._hoverShape._dataIndex == _dataIndex) {
                        data.x = mouseX;
                        data.y = mouseY;
                        break;
                    }


                    for (var j = 0, len = chart.option.data.length; j < len; j++) {
                        text += chart.option.data[j].name + '<br/>'
                            + chart.polar.indicator[_dataIndex].text + ':'
                            + chart.option.data[j].value[_dataIndex] + '<br/>';
                    }

                    data.x = mouseX;
                    data.y = mouseY;
                    data.text = text;
                    this._hoverShape = currentShape;
                    break;
                }
            }

        }


    };

    /**
     * 设置指示器样式
     */
    Tooltip.prototype._setPointer = function (mouseX, mouseY, grid, categoryAxis, pointer, data) {
        if (pointer.type == 'line') {
            this._buildAxisLine(mouseX, mouseY, grid, categoryAxis, pointer.lineStyle, data);
        } else if (pointer.type == 'cross') {
            this._buildAxisCross(mouseX, mouseY, grid, pointer.crossStyle, data);
        } else if (pointer.type == 'shadow') {
            this._buildAxisShadow(mouseX, mouseY, grid, categoryAxis, pointer.shadowStyle, data);
        }
    };


    Tooltip.prototype._buildAxisLine = function (mouseX, mouseY, grid, categoryAxis, style, data) {
        var color = style.color;
        var lineWidth = style.width;
        var interval = categoryAxis.getInterval();
        var intervalOffset = categoryAxis.option.boundaryGap ? 0 : interval * 0.5;
        var chartMap = this.series.chartMap;

        if (this.isHorizontal()) {
            // 转换鼠标位置为逻辑轴索引
            var blockIndex = Math.floor((mouseX - grid.getX() + intervalOffset) / interval);
            var x = this.optimizePixel(categoryAxis.getCoordByIndex(blockIndex), lineWidth);

            var shapeStyle = {
                xStart: x,
                yStart: grid.getY(),
                xEnd: x,
                yEnd: grid.getY2(),
                color: color,
                lineWidth: lineWidth
            };
            if (!this._axisLineShape) {
                this._axisLineShape = new Line({
                    zlevel: this.getZlevel(),
                    z: this.getZ(),
                    hoverable: false,
                    style: shapeStyle
                });
                this.zr.addShape(this._axisLineShape);
            } else {
                this._axisLineShape.invisible = false;
                this._axisLineShape.style = shapeStyle;
                this.zr.modShape(this._axisLineShape.id);
            }


            // 组装需要显示的数据
            var dataIndex = categoryAxis.option.dataIndex[blockIndex];
            var text = categoryAxis.option.data[dataIndex];
            if (typeof text == 'object') {
                text = text.value
            }
            text += '<br/>';

            for (var name in chartMap) {
                // 图例不显示的serie，则忽略
                if (!this.legend.isSelected(name)) {
                    continue;
                }
                text += chartMap[name].option.name + ':' + chartMap[name].option.data[dataIndex] + '<br/>';
            }

            data.x = x;
            data.y = mouseY;
            data.text = text;
        } else if (this.isVertical()) {
            //  TODO
        } else {

        }
    };

    Tooltip.prototype._buildAxisCross = function (mouseX, mouseY, grid, style, data) {
        var color = style.color;
        var lineWidth = style.width;
        var lineType = style.type;
        var chartMap = this.series.chartMap;

        var shapeStyle = {
            brushType: 'stroke',
            rect: grid.getArea(),
            x: this.optimizePixel(mouseX, lineWidth),
            y: this.optimizePixel(mouseY, lineWidth),
            text: this.xAxis.getAxis(0).getValueByCoord(mouseX) + ',' + this.yAxis.getAxis(0).getValueByCoord(mouseY),
            textPosition: 'specific',
            strokeColor: color,
            lineWidth: lineWidth,
            lineType: lineType
        };

        // 设置显示文本的位置
        if (grid.getX2() - mouseX > 100) { // 右侧有空间
            shapeStyle.textAlign = 'left';
            shapeStyle.textX = mouseX + 10;
        } else {
            shapeStyle.textAlign = 'right';
            shapeStyle.textX = mouseX - 10;
        }

        if (mouseY - grid.getY() > 50) { // 上方有空间
            shapeStyle.textBaseline = 'bottom';
            shapeStyle.textY = mouseY - 10;
        } else {
            shapeStyle.textBaseline = 'top';
            shapeStyle.textY = mouseY + 10;
        }


        if (!this._axisCrossShape) {
            this._axisCrossShape = new CrossShape({
                zlevel: this.getZlevel(),
                z: this.getZ(),
                hoverable: false,
                style: shapeStyle
            });
            this.zr.addShape(this._axisCrossShape);
        } else {
            this._axisCrossShape.invisible = false;
            this._axisCrossShape.style = shapeStyle;
            this.zr.modShape(this._axisCrossShape.id);
        }


        /*=================== 处理scatter显示tooltip的问题 ===============================*/
        //    默认scatter是触发的item的mousemove事件
        //    this._showItemTrigger();
        //    cross目前只认为是scatter所有。其他情况暂不考虑
        if (this.charts._option.series[0].type == config.CHART_TYPE_SCATTER) {
            if (this._hoverShape) {
                data.x = mouseX;
                data.y = mouseY;
                if (!zr_area.isInside(rectangleClassObject, this._hoverShape._area, mouseX, mouseY)) {
                    // 不在图形区域内，如果当前的图形已经点击过则复原原来的z值
                    if (!this.charts._option.series[this._hoverShape._seriesIndex].large && this._hoverShape.clicked) {
                        this._hoverShape.z--;
                        this._hoverShape.clicked = false;
                        this.zr.modShape(this._hoverShape);
                    }
                    //并置空选中图形对象
                    this._hoverShape = null;
                }
            } else {
                if (!this._chartList) {
                    this._chartList = [];
                    for (var name in chartMap) {
                        // 循环需要逆向，否则会一直选中下面的图形
                        this._chartList.unshift(chartMap[name]);
                    }
                }

                var chart;
                var currentShape;
                var serie;
                var xAxis = this.xAxis.getAxis(0);
                var yAxis = this.yAxis.getAxis(0);
                for (var i = 0, l = this._chartList.length; i < l; i++) {
                    chart = this._chartList[i];

                    // 图例不显示的serie，则忽略
                    if (!this.legend.isSelected(chart.name)) {
                        continue;
                    }

                    for (var j = 0, len = chart.shapeList.length; j < len; j++) {
                        currentShape = chart.shapeList[j];

                        // 不是scatter的图形 忽略!!
                        if (currentShape.type != 'icon') {
                            continue;
                        }

                        if (zr_area.isInside(rectangleClassObject, currentShape._area, mouseX, mouseY)) {
                            serie = this.charts._option.series[currentShape._seriesIndex];
                            if (!serie.large && !this.clicked) {
                                currentShape.z++;
                                currentShape.clicked = true;
                                this.zr.modShape(currentShape);
                            }

                            var text = serie.name + '<br/>'
                                + xAxis.option.axisLabel.formatter(serie.data[currentShape._dataIndex][0])
                                + ',' + yAxis.option.axisLabel.formatter(serie.data[currentShape._dataIndex][1])
                                + (serie.data[currentShape._dataIndex][2] ? ',' + serie.data[currentShape._dataIndex][2] : '');

                            //data.x = currentShape.style.x + currentShape.style.width;
                            //data.y = currentShape.style.y + currentShape.style.height;
                            data.x = mouseX;
                            data.y = mouseY;
                            data.text = text;

                            this._hoverShape = currentShape;
                            break;
                        }
                    }

                    if (this._hoverShape) {
                        break;
                    }
                }

                //    如果搜索结果还是没有选中的shape，则隐藏显示框
                if (!this._hoverShape) {
                    this.hide();
                }
            }
        }
    };

    Tooltip.prototype._buildAxisShadow = function (mouseX, mouseY, grid, categoryAxis, style, data) {
        var color = style.color;
        var interval = categoryAxis.getInterval();
        var intervalOffset = categoryAxis.option.boundaryGap ? 0 : interval * 0.5;
        var xStart, yStart, xEnd, yEnd, lineWidth;
        var chartMap = this.series.chartMap;

        if (this.isHorizontal()) {
            yStart = grid.getY();
            yEnd = grid.getY2();

            // 转换鼠标位置为逻辑轴索引
            var blockIndex = Math.floor((mouseX - grid.getX() + intervalOffset) / interval);
            var x = categoryAxis.getCoordByIndex(blockIndex);

            // 轴不顶头显示
            if (categoryAxis.option.boundaryGap) {
                lineWidth = interval;
                xStart = xEnd = this.optimizePixel(x, lineWidth);
            } else {
                if (blockIndex == 0 || blockIndex == categoryAxis.getAreaBlockLength()) {
                    lineWidth = interval * 0.5;
                } else {
                    lineWidth = interval;
                }

                if (blockIndex == 0) {
                    xStart = xEnd = this.optimizePixel(x + lineWidth * 0.5, lineWidth);
                } else if (blockIndex == categoryAxis.getAreaBlockLength()) {
                    xStart = xEnd = this.optimizePixel(x - lineWidth * 0.5, lineWidth);
                } else {
                    xStart = xEnd = this.optimizePixel(x, lineWidth);
                }
            }


            var shapeStyle = {
                xStart: xStart,
                yStart: yStart,
                xEnd: xEnd,
                yEnd: yEnd,
                color: color,
                lineWidth: lineWidth
            };


            if (!this._axisShadowShape) {
                this._axisShadowShape = new Line({
                    zlevel: this.getZlevel(),
                    z: this.getZ(),
                    hoverable: false,
                    style: shapeStyle
                });
                this.zr.addShape(this._axisShadowShape);
            } else {
                this._axisShadowShape.invisible = false;
                this._axisShadowShape.style = shapeStyle;
                this.zr.modShape(this._axisShadowShape.id);
            }


            var dataIndex = categoryAxis.option.dataIndex[blockIndex];
            var text = categoryAxis.option.data[dataIndex];
            if (typeof text === 'object') {
                text = text.value;
            }
            text += '<br/>';

            for (var name in chartMap) {
                // 图例不显示的serie，则忽略
                if (!this.legend.isSelected(name)) {
                    continue;
                }
                text += chartMap[name].option.name + ':' + chartMap[name].option.data[dataIndex] + '<br/>';
            }

            data.x = x;
            data.y = mouseY;
            data.text = text;
        } else if (this.isVertical()) {
            //  TODO
        } else {

        }
    };


    /**
     * 显示数据框
     * @param {Object} e
     * @param {Object} _this
     */
    Tooltip.prototype.showModel = function (x, y, txt) {
        var position = this.option.tooltip.position;
        if (this.cDom.innerHTML.replace(/<br>/g, '<br/>') != txt && !this.isEmpty(txt)) {
            this.cDom.innerHTML = txt;
        }

        var domStyle = this.cDom.style;
        domStyle.display = 'block';

        var w = this.cDom.offsetWidth;
        var h = this.cDom.offsetHeight;
        var x2;
        var y2;
        if (this.grid) {
            x2 = this.grid.getX2();
            y2 = this.grid.getY2();
        } else {
            x2 = this._zrWidth;
            y2 = this._zrHeight;
        }


        if (x + w > x2) {
            domStyle.left = x2 - w - position[0] + 'px';
        } else {
            domStyle.left = x + position[0] + 'px';
        }

        if (y + h > y2) {
            domStyle.top = y2 - h - position[1] + 'px';
        } else {
            domStyle.top = y + position[1] + 'px';
        }

    };


    /**
     * 隐藏数据框
     */
    Tooltip.prototype.hide = function () {
        if (this._axisLineShape) {
            this._axisLineShape.invisible = true;
            this.zr.modShape(this._axisLineShape.id);
        }

        if (this._axisCrossShape) {
            this._axisCrossShape.invisible = true;
            this.zr.modShape(this._axisCrossShape.id);
        }

        if (this._axisShadowShape) {
            this._axisShadowShape.invisible = true;
            this.zr.modShape(this._axisShadowShape.id);
        }

        this.cDom.style.display = 'none';
    };


    //Tooltip.prototype.dispose = function () {
    //    this.removeShape(this.transparentShapeArray);
    //};


    zr_util.inherits(Tooltip, Base);
    return Tooltip;
});