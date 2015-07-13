/**
 * 工具箱
 * @author j.d
 */
define(function (require) {
    'use strict';


    var Base = require('./base'),
        zr_util = require('../zrender/tool/util'),
        config = require('../conf'),
        RectangleShape = require('../zrender/shape/Rectangle'),
        rectangleClassObject = new RectangleShape({}),
        zr_event = require('../zrender/tool/event'),
        zr_area = require('../zrender/tool/area'),
        IconShape = require('../util/shape/Icon');


    function Toolbox(option, type, charts) {
        Base.call(this, option, type, charts);
        this.shapeList = [];
        this._iconList = [];


        // 写在这里，因为需要传递this
        var self = this;
        this._onmousedown = function (param) {
            return self.__onmousedown(param);
        };
        this._onmousemove = function (param) {
            return self.__onmousemove(param);
        };
        this._onmouseup = function (param) {
            return self.__onmouseup(param);
        };

        // 缩放开始
        this._zoomStart = false;
        // 缩放进行时
        this._zooming = false;
        // 缩放队列 方便回退
        this._zoomQueue = [];
        this._zoomShape = null;

        this._iconShapeMap = {};

        this._backgroundShape = null;

        this.refresh(option);
    }


    /*
     初始化函数
     */
    Toolbox.prototype.refresh = function (newOption) {
        if (newOption) {
            this.option = newOption;
            this.option.toolbox = this.reviseOption(this.option[this.type]);
            this.option.toolbox.textStyle = this.getTextStyle(this.option.toolbox.textStyle);
            this.toolbox = this.option.toolbox;
        }

        if (!this.option.toolbox.show) {
            return;
        }

        this._build();
    };

    /*
     刷新函数
     */
    Toolbox.prototype._build = function () {
        var tool, _tool;
        for (var k in this.toolbox.feature) {
            tool = this.toolbox.feature[k];

            if (!tool.show) {
                continue;
            }

            if (tool['tool']) {
                for (var key in tool['tool']) {
                    _tool = tool['tool'][key];
                    this._iconList.push({
                        name: key,
                        title: _tool.title,
                        color: _tool.color
                    });
                }
            } else {
                this._iconList.push({
                    name: k,
                    title: tool.title,
                    color: tool.color
                });
            }
        }

        if (this._iconList.length > 0) {
            this._buildShape();
        }
    };


    Toolbox.prototype._buildShape = function () {
        this.groupLocation = this._getItemGroupLocation();
        this._buildBackground();
        this._buildItem();

        //var xAxis = this.charts.component.xAxis.getAxis(0);
        //var yAxis = this.charts.component.yAxis.getAxis(0);
        for (var type in this._iconShapeMap) {
            this.zr.addShape(this._iconShapeMap[type]);
            if (type == 'dataZoomReset') {
                this._itemDisable(this._iconShapeMap[type]);
                this.zr.refresh();
            }

            // 存在逻辑轴的时候 不显示缩放
            if (this.charts.component.xAxis && this.charts.component.yAxis) {
                if (type == 'dataZoom' && (this.isHorizontal() || this.isVertical())) {
                    this._itemDisable(this._iconShapeMap[type]);
                }
            } else {
                // 不存在轴的情况
                if (this.option.series[0].type == config.CHART_TYPE_RADAR) {
                    if (type == 'dataZoom' || type == 'barChart') {
                        this._itemDisable(this._iconShapeMap[type]);
                    }
                }
            }


        }
    };

    /*
     构造背景
     */
    Toolbox.prototype._buildBackground = function () {
        var self = this;
        var padding = this.parseCssArray(this.toolbox.padding);
        var RectangleShape = require('../zrender/shape/Rectangle');
        var shape = new RectangleShape({
            hoverable: false,
            zlevel: this.getZlevel(),
            z: this.getZ(),
            style: {
                x: this.groupLocation.x - padding[3],
                y: this.groupLocation.y - padding[0],
                width: this.groupLocation.width + padding[3] + padding[1],
                height: this.groupLocation.height + padding[0] + padding[2],
                brushType: this.toolbox.borderWidth === 0 ? 'fill' : 'both',
                color: this.toolbox.backgroundColor,
                strokeColor: this.toolbox.borderColor,
                lineWidth: this.toolbox.borderWidth
            }
        });

        this.zr.addShape(shape);

    };

    /*
     构造按钮
     */
    Toolbox.prototype._buildItem = function () {
        var itemGap = this.toolbox.itemGap;
        var itemSize = this.toolbox.itemSize;
        var lineWidth = this.toolbox.lineWidth;
        var orient = this.toolbox.orient;
        // var color = this.toolbox.color;
        var disableColor = this.toolbox.disableColor;
        var textFont = this.getFont(this.toolbox.textStyle);
        var feature = this.toolbox.feature;
        var tool;
        var currentX = this.groupLocation.x;
        var currentY = this.groupLocation.y;
        var shapeObj;
        var shapeOpt = {
            type: 'icon',
            zlevel: this.getZlevel(),
            z: this.getZ(),
            hoverable: true,
            clickable: true
        };
        var textPosition;
        if (orient === config.ORIENTATION_TYPE.HORIZONTAL) {
            textPosition = this.groupLocation.y / this.zr.getHeight() < 0.5 ? 'bottom' : 'top';
        } else if (orient === config.ORIENTATION_TYPE.VERTICAL) {
            textPosition = this.groupLocation.x / this.zr.getWidth() < 0.5 ? 'right' : 'left';
        }

        var self = this;
        this._iconList.forEach(function (icon, i) {
            shapeOpt.style = {
                _index: i,
                x: currentX,
                y: currentY,
                width: itemSize,
                height: itemSize,
                iconType: this._iconList[i].name,
                lineWidth: 1,
                strokeColor: this._iconList[i].color, //color[i % color.length],
                brushType: 'stroke'
            };

            shapeOpt.highlightStyle = {
                lineWidth: 1,
                text: this.toolbox.showTitle ? this._iconList[i].title : undefined,
                textFont: textFont,
                textPosition: textPosition,
                strokeColor: this._iconList[i].color //color[i % color.length]
            };

            shapeObj = new IconShape(shapeOpt);

            shapeObj.onclick = function (e) {
                self['_on' + this.style.iconType](e);
            };

            // this.groupShape.addChild(shapeObj);
            this._iconShapeMap[this._iconList[i].name] = shapeObj;

            if (orient == config.ORIENTATION_TYPE.HORIZONTAL) {
                currentX += itemSize + itemGap;
            } else if (orient == config.ORIENTATION_TYPE.VERTICAL) {
                currentY += itemSize + itemGap;
            }
        }, this);


    };


    /*
     缩放
     */
    Toolbox.prototype._ondataZoom = function (e) {
        var dom = this.charts.dom;
        var shape = e.target;
        if (this._zoomQueue.length == 0) {
            var xAxis = this.charts.component.xAxis.getAxis(0);
            var yAxis = this.charts.component.yAxis.getAxis(0);
            var grid = this.charts.component.grid;
            //if (xAxis.type == config.COMPONENT_TYPE_AXIS_CATEGORY ||
            //    yAxis.type == config.COMPONENT_TYPE_AXIS_CATEGORY) {
            //    this._itemDisable(shape);
            //}


            this._zoomQueue.push({
                x: xAxis.getValueByCoord(grid.getX()),
                x2: xAxis.getValueByCoord(grid.getX2()),
                y: yAxis.getValueByCoord(grid.getY()),
                y2: yAxis.getValueByCoord(grid.getY2())
            });
        }


        if (this._isEnabled(shape)) {
            shape.style.strokeColor = this._iconList[shape.style._index].color;
            this.zr.modShape(shape);
            dom.style.cursor = 'default';

            this._zoomStart = this._zooming = false;

            this.zr.un(config.EVENT_TYPE.MOUSEDOWN, this._onmousedown);
            this.zr.un(config.EVENT_TYPE.MOUSEMOVE, this._onmousemove);
            this.zr.un(config.EVENT_TYPE.MOUSEUP, this._onmouseup);
        } else {
            this._itemEnable(shape);

            // this._zoomQueue = [];
            this._zoomStart = true;


            this.zr.on(config.EVENT_TYPE.MOUSEDOWN, this._onmousedown);
            this.zr.on(config.EVENT_TYPE.MOUSEMOVE, this._onmousemove);
            this.zr.on(config.EVENT_TYPE.MOUSEUP, this._onmouseup);
        }
    };


    Toolbox.prototype._onrestore = function (param) {
        //this.charts.disposeChartList();
        //this.charts.setOption(this.charts._originalOption);
        this.charts.onrestore();
    };


    Toolbox.prototype.__onmousedown = function (param) {
        if (param.target) {
            return;
        }


        var area = this.charts.component.grid.getArea();
        var x = zr_event.getX(param.event);
        var y = zr_event.getY(param.event);
        // 1.判断是否在区域内
        if (!zr_area.isInside(rectangleClassObject, area, x, y)) {
            return;
        }


        this._zooming = true;
        var x = zr_event.getX(param.event);
        var y = zr_event.getY(param.event);
        var zoomOption = this.toolbox.feature.dataZoom;
        this._zoomShape = new RectangleShape({
            zlevel: this.getZlevel(),
            z: this.getZ(),
            style: {
                x: x,
                y: y,
                width: 1,
                height: 1,
                brushType: 'both'
            },
            highlightStyle: {
                lineWidth: 2,
                color: zoomOption.fillerColor,
                strokeColor: zoomOption.handleColor,
                brushType: 'both'
            }
        });
        this.zr.addHoverShape(this._zoomShape);
        return true; // 阻塞全局事件
    };
    Toolbox.prototype.__onmousemove = function (param) {
        var e = param.event;
        var dom = this.charts.dom;
        var grid = this.charts.component.grid;
        var area = grid.getArea();
        var x = zr_event.getX(e);
        var y = zr_event.getY(e);

        // 1.判断是否在区域内
        if (!zr_area.isInside(rectangleClassObject, area, x, y)) {
            return;
        }

        dom.style.cursor = 'crosshair';

        if (this._zooming) {
            this._zoomShape.style.width =
                zr_event.getX(param.event) - this._zoomShape.style.x;
            this._zoomShape.style.height =
                zr_event.getY(param.event) - this._zoomShape.style.y;
            this.zr.addHoverShape(this._zoomShape);
            dom.style.cursor = 'crosshair';
            zr_event.stop(param.event);
        }
    };
    Toolbox.prototype.__onmouseup = function (param) {
        if (!this._zoomShape ||
            Math.abs(this._zoomShape.style.width) < 10 ||
            Math.abs(this._zoomShape.style.height) < 10) {
            this._zooming = false;
            return true;
        }

        if (this._zooming) {
            this._zooming = false;
            var style = this._zoomShape.style;
            var x, x2, y, y2;
            if (style.width < 0) {
                x = style.x + style.width;
                x2 = style.x;
            } else {
                x = style.x;
                x2 = style.x + style.width;
            }

            if (style.height < 0) {
                y = style.y + style.height;
                y2 = style.y;
            } else {
                y = style.y;
                y2 = style.y + style.height;
            }


            // 轴刷新
            var obj = {};
            var xAxis = this.charts.component.xAxis.getAxis(0);
            var yAxis = this.charts.component.yAxis.getAxis(0);
            if (xAxis.type == config.COMPONENT_TYPE_AXIS_VALUE) {
                obj.x = xAxis.getValueByCoord(x);
                obj.x2 = xAxis.getValueByCoord(x2);

            }
            if (yAxis.type == config.COMPONENT_TYPE_AXIS_VALUE) {
                obj.y = yAxis.getValueByCoord(y);
                obj.y2 = yAxis.getValueByCoord(y2);
            }


            this._messageCenter.notify(config.EVENT_TYPE.DATA_ZOOM, param.event, obj, this.charts);

            // 保存缩放序列
            this._zoomQueue.push(obj);

            // 让缩放回退按钮可用
            this._itemAvailable(this._iconShapeMap['dataZoomReset']);

            return true;
        }

    };


    Toolbox.prototype._ondataZoomReset = function (param) {
        if (this._zoomQueue.length == 1) {
            return;
        }

        this._zoomQueue.pop();
        this._messageCenter.notify(config.EVENT_TYPE.DATA_ZOOM, param.event, this._zoomQueue.slice(-1)[0], this.charts);

        if (this._zoomQueue.length == 1) {
            this._itemDisable(param.target);
        }
    };

    /**
     * 转柱图
     * @private
     */
    Toolbox.prototype._onbarChart = function () {
        var series = this.charts._option.series;
        var serie;
        for (var i = 0, l = series.length; i < l; i++) {
            serie = series[i];
            serie.type = 'bar';
        }
        this.charts.disposeChartList();
        this.charts.setOption(this.charts._option);
    };


    /*
     禁用按钮
     */
    Toolbox.prototype._itemDisable = function (icon) {
        this.zr.modShape(icon.id, {
            clickable: false,
            hoverable: false,
            style: {
                // color:this.toolbox.disableColor,
                strokeColor: this.toolbox.disableColor
            }
        });
    };

    /*
     启用按钮
     */
    Toolbox.prototype._itemEnable = function (icon) {
        this.zr.modShape(icon.id, {
            clickable: true,
            hoverable: true,
            style: {
                strokeColor: this.toolbox.effectiveColor
            }
        });
    };

    /*
     设置按钮可用
     */
    Toolbox.prototype._itemAvailable = function (icon) {

        this.zr.modShape(icon.id, {
            clickable: true,
            hoverable: true,
            style: {
                strokeColor: this._iconList[icon.style._index].color
            }
        });
    };


    /*
     判断按钮是否处于启用状态
     */
    Toolbox.prototype._isEnabled = function (icon) {
        return icon.style.strokeColor == this.toolbox.effectiveColor;
    };


    /*
     获取工具箱的位置
     */
    Toolbox.prototype._getItemGroupLocation = function () {
        var orient = this.toolbox.orient;
        var itemGap = this.toolbox.itemGap;
        var itemSize = this.toolbox.itemSize;
        var borderWidth = this.toolbox.borderWidth;
        var padding = this.parseCssArray(this.toolbox.padding);
        var _zrWidth = this.zr.getWidth();
        var _zrHeight = this.zr.getHeight();
        var len = this._iconList.length;
        var x, y, width, height;
        if (orient == config.ORIENTATION_TYPE.HORIZONTAL) {
            width = itemSize * len + itemGap * (len - 1);
            height = itemSize;
        } else if (orient == config.ORIENTATION_TYPE.VERTICAL) {
            width = itemSize;
            height = itemSize * len + itemGap * (len - 1);
        }

        switch (this.toolbox.x) {
            case 'right':
                x = _zrWidth - width - padding[1] - borderWidth;
                break;
            case 'left':
                x = padding[3] + borderWidth;
                break;
            case 'center':
                x = Math.floor(_zrWidth - width) * 0.5;
                break;
            default:
                x = isNaN(this.toolbox.x - 0) ? 0 : x;
                break;
        }

        switch (this.toolbox.y) {
            case 'top':
                y = padding[0] + borderWidth;
                break;
            case 'bottom':
                y = _zrHeight - height - padding[2] - borderWidth;
                break;
            case 'center':
                y = Math.floor(_zrHeight - height) * 0.5;
                break;
            default:
                y = isNaN(this.toolbox.y - 0) ? 0 : y;
                break;
        }


        return {
            x: x,
            y: y,
            width: width,
            height: height
        };

    };


    Toolbox.prototype.dispose = function () {

    };


    zr_util.inherits(Toolbox, Base);
    return Toolbox;
});