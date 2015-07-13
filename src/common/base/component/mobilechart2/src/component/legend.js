/**
 * legend
 * @author j.d
 */
define(function (require) {
    'use strict';

    var Base = require('./base');
    var TextShape = require('../zrender/shape/Text');
    var zr_util = require('../zrender/tool/util');
    var zrArea = require('../zrender/tool/area');
    var RectangleShape = require('../zrender/shape/Rectangle');
    var Line = require('../zrender/shape/Line');
    var Circle = require('../zrender/shape/Circle');
    var Star = require('../zrender/shape/Star');
    var Polyline = require('../zrender/shape/Polyline');
    var Group = require('../zrender/Group');

    var IconShape = require('../util/shape/Icon');
    var ecConfig = require('../conf');
    var ecQuery = require('../util/ecQuery');


    function Legend(option, type, charts) {
        Base.call(this, option, type, charts);

        var self = this;
        self._legendSelected = function (param) {
            self.__legendSelected(param);
        };
        self._dispatchHoverLink = function (param) {
            return self.__dispatchHoverLink(param);
        };

        this.deepQuery = ecQuery.deepQuery;
        // 存放legend里面的text和type对象的数组
        this.shapeList = [];

        this._colorIndex = 0;
        this._colorMap = {};
        this._selectedMap = {};
        this._hasDataMap = {};

        this.init(option);
    }


    Legend.prototype._buildShape = function () {
        if (!this.legendOption.show) {
            return;
        }
        // 图例元素组的位置参数，通过计算所得x, y, width, height
        this._itemGroupLocation = this._getItemGroupLocation();

        this._buildBackground();
        this._buildItem();

        for (var i = 0, l = this.shapeList.length; i < l; i++) {
            this.zr.addShape(this.shapeList[i]);
        }
    }

    /*
     * 绘制legend的背景，可配置有边框
     */
    Legend.prototype._buildBackground = function () {
        var padding = this.parseCssArray(this.legendOption.padding);

        this.shapeList.push(new RectangleShape({
            zlevel: this.getZlevel(),
            z: this.getZ(),
            hoverable: false,
            style: {
                x: this._itemGroupLocation.x - padding[3],
                y: this._itemGroupLocation.y - padding[0],
                width: this._itemGroupLocation.width + padding[3] + padding[1],
                height: this._itemGroupLocation.height + padding[0] + padding[2],
                brushType: this.legendOption.borderWidth === 0 ? 'fill' : 'both',
                color: this.legendOption.backgroundColor,
                strokeColor: this.legendOption.borderColor,
                lineWidth: this.legendOption.borderWidth
            }
        }));
    };

    /**
     * 构建所有图例元素
     */
    Legend.prototype._buildItem = function () {
        var data = this.legendOption.data;
        var dataLength = data.length;
        var itemName;
        var itemType;
        var itemShape;
        var textShape;

        var textStyle = this.legendOption.textStyle;

        var dataTextStyle;
        var dataFont;
        var formattedName;

        var zrWidth = this.zr.getWidth();
        var zrHeight = this.zr.getHeight();
        var lastX = this._itemGroupLocation.x;
        var lastY = this._itemGroupLocation.y;
        var itemWidth = this.legendOption.itemWidth;
        var itemHeight = this.legendOption.itemHeight;
        var itemGap = this.legendOption.itemGap;
        var color, color0;

        if (this.legendOption.orientation === 'vertical' && this.legendOption.x === 'right') {
            lastX = this._itemGroupLocation.x + this._itemGroupLocation.width - itemWidth;
        }

        for (var i = 0; i < dataLength; i++) {

            dataTextStyle = zr_util.merge(
                data[i].style.normal.font || {},
                textStyle
            );
            dataFont = this.getFont(dataTextStyle);

            itemName = data[i].name;
            itemType = data[i].icon || this._getSomethingByName(itemName).type;

            color = data[i].style.normal.color;
            color0 = data[i].style.normal.color0;


            if (this.legendOption.orientation === 'horizontal') {
                if (zrWidth - lastX < 200 // 最后200px做分行预判
                    && (itemWidth + 5 + zrArea.getTextWidth(formattedName, dataFont)
                            // 分行的最后一个不用算itemGap
                        + (i === dataLength - 1 || data[i + 1] === '' ? 0 : itemGap)
                    ) >= zrWidth - lastX
                ) {
                    lastX = this._itemGroupLocation.x;
                    lastY += itemHeight + itemGap;
                }
            } else {
                if (zrHeight - lastY < 200 // 最后200px做分行预判
                    && (itemHeight
                            // 分行的最后一个不用算itemGap
                        + (i === dataLength - 1 || data[i + 1] === '' ? 0 : itemGap)
                    ) >= zrHeight - lastY
                ) {
                    this.legendOption.x === 'right' ? lastX -= this._itemGroupLocation.maxWidth + itemGap : lastX += this._itemGroupLocation.maxWidth + itemGap;
                    lastY = this._itemGroupLocation.y;
                }
            }

            // 图形
            var colorObj = {color: color, color0: color0, disableColor: this.option.legend.disabledColor};

            itemShape = this._getItemShapeByType(
                lastX, lastY,
                itemWidth, itemHeight,
                this._selectedMap[itemName] && this._hasDataMap[itemName],
                itemType,
                colorObj
            );

            itemShape._name = itemName;
            itemShape._type = itemType;

            if (itemType == ecConfig.CHART_TYPE_LINE) {
                var series = this.option.series;
                for (var j = 0; j < series.length; j++) {
                    if (series[j].type == 'line' && data[i].name == series[j].name) {
                        var _line = this.reviseOption(series[j], 'line');
                        itemShape.style.symbol = _line.symbol.type;
                        break;
                    }
                }
            } else if (itemType == ecConfig.CHART_TYPE_PIE) {
                itemShape.style.iconType = "legendPieIcon";
                itemShape.style.brushType = 'fill';
                itemShape.style.color = itemShape.style.strokeColor;
            } else if (itemType == 'k') {
                itemShape.style.iconType = "legendKIcon";
                itemShape.style.brushType = 'both';
                itemShape.style.color = itemShape.style.strokeColor;
            } else if (itemType == 'radar') {
                itemShape.style.iconType = "legendRadarIcon";
                itemShape.style.brushType = 'both';
                itemShape.style.color = itemShape.style.strokeColor;
            }

            itemShape = new IconShape(itemShape);


            // 文字
            textShape = {
                zlevel: this.getZlevel(),
                z: this.getZ(),
                style: {
                    x: lastX + itemWidth + 5,
                    y: lastY + itemHeight / 2,
                    color: (this._selectedMap[itemName] && this._hasDataMap[itemName] ? this.legendOption.textStyle.defaultColor : this.option.legend.disabledColor),
                    text: itemName,
                    textFont: dataFont, //this.getFont(), //dataFont,
                    textBaseline: 'middle'
                },
                highlightStyle: {
                    color: color0,
                    brushType: 'fill'
                },
                hoverable: true, //!!this.legendOption.selectedMode,
                clickable: !!this.legendOption.selectedMode,
                isLegend: true
            };
            textShape._name = itemName;
            textShape = new TextShape(textShape);

            if (this.legendOption.selectedMode) {
                itemShape.onclick = textShape.onclick = this._legendSelected;
                itemShape.onmouseover = textShape.onmouseover = this._dispatchHoverLink;
                // itemShape.hoverConnect = textShape.id;
                // textShape.hoverConnect = itemShape.id;
            }

            itemShape.isLegend = true;
            this.shapeList.push(itemShape);
            this.shapeList.push(textShape);

            if (this.legendOption.orientation === 'horizontal') {
                lastX += itemWidth + 5 + zrArea.getTextWidth(itemName, this.getFont) + itemGap;
            } else {
                lastY += itemHeight + itemGap;
            }
        }

        if (this.legendOption.orientation === 'horizontal' && this.legendOption.x === 'center' && lastY != this._itemGroupLocation.y) {
            // 多行橫排居中优化
            this._mLineOptimize();
        }
    };

    // 多行橫排居中优化
    Legend.prototype._mLineOptimize = function () {
        var lineOffsetArray = []; // 每行宽度
        var lastX = this._itemGroupLocation.x;
        for (var i = 2, l = this.shapeList.length; i < l; i++) {
            if (this.shapeList[i].style.x === lastX) {
                lineOffsetArray.push(
                    (
                        this._itemGroupLocation.width - (
                            this.shapeList[i - 1].style.x + zrArea.getTextWidth(
                                this.shapeList[i - 1].style.text,
                                this.shapeList[i - 1].style.textFont
                            ) - lastX
                        )
                    ) / 2
                );
            } else if (i === l - 1) {
                lineOffsetArray.push(
                    (
                        this._itemGroupLocation.width - (
                            this.shapeList[i].style.x + zrArea.getTextWidth(
                                this.shapeList[i].style.text,
                                this.shapeList[i].style.textFont
                            ) - lastX
                        )
                    ) / 2
                );
            }
        }
        var curLineIndex = -1;
        for (var i = 1, l = this.shapeList.length; i < l; i++) {
            if (this.shapeList[i].style.x === lastX) {
                curLineIndex++;
            }
            if (lineOffsetArray[curLineIndex] === 0) {
                continue;
            } else {
                this.shapeList[i].style.x += lineOffsetArray[curLineIndex];
            }
        }
    };


    Legend.prototype.setColor = function (legendName, color) {
        this._colorMap[legendName] = color;
    };


    // 根据legend名称返回一个颜色
    Legend.prototype.getColor = function (legendName) {
        if (!this._colorMap[legendName]) {
            this._colorMap[legendName] = this.getColorFromZR(this._colorIndex++);
        }
        return this._colorMap[legendName];
    };


    /**
     * 根据名称返回series数据或data
     */
    Legend.prototype._getSomethingByName = function (name) {
        var series = this.option.series;
        var data;
        for (var i = 0, l = series.length; i < l; i++) {
            if (series[i].name === name) {
                // 系列名称优先
                return {
                    type: series[i].type,
                    series: series[i],
                    seriesIndex: i,
                    data: null,
                    dataIndex: -1
                };
            }

            if (
                series[i].type === ecConfig.CHART_TYPE_PIE || series[i].type === ecConfig.CHART_TYPE_RADAR || series[i].type === ecConfig.CHART_TYPE_CHORD || series[i].type === ecConfig.CHART_TYPE_FORCE || series[i].type === ecConfig.CHART_TYPE_FUNNEL
            ) {
                data = series[i].categories || series[i].data || series[i].nodes;

                for (var j = 0, k = data.length; j < k; j++) {
                    if (data[j].name === name) {
                        return {
                            type: series[i].type,
                            series: series[i],
                            seriesIndex: i,
                            data: data[j],
                            dataIndex: j
                        };
                    }
                }
            }
        }
        return {
            type: 'bar',
            series: null,
            seriesIndex: -1,
            data: null,
            dataIndex: -1
        };
    }


    Legend.prototype.__legendSelected = function (param) {
        var itemName = param.target._name;
        var itemType = param.target._type;
        this.onlegendSelected(itemName, itemType);
        this._messageCenter.notify(
            ecConfig.EVENT_TYPE.LEGEND_SELECTED,
            param.event, {
                name: itemName,
                type: itemType,
                status: this._selectedMap[itemName]
            },
            this.charts
        );
    };


    Legend.prototype.onlegendSelected = function (itemName, itemType) {
        // 单选模式的时候，需要把别的图例关闭
        if (this.legendOption.selectedMode === 'single') {
            for (var k in this._selectedMap) {
                this._selectedMap[k] = false;
            }
        }
        this._selectedMap[itemName] = !this._selectedMap[itemName];
        this.init();
    };


    /**
     * 产生hover link事件
     */
    Legend.prototype.__dispatchHoverLink = function (param) {
        this._messageCenter.dispatch(
            ecConfig.EVENT_TYPE.LEGEND_HOVERLINK,
            param.event, {
                target: param.target._name
            },
            this.charts
        );
        return;
    }


    Legend.prototype._getItemShapeByType = function (x, y, width, height, isvisible, itemType, colorObj) {

        var itemShape = {
            zlevel: this.getZlevel(),
            z: this.getZ(),
            style: {
                //				iconType:'legendicon' + itemType,
                x: x,
                y: y,
                width: width,
                brushType: "stroke",
                color: isvisible ? colorObj.color : colorObj.disableColor,
                height: height,
                iconType: "legendLineIcon",
                lineWidth: 2,
                strokeColor: isvisible ? colorObj.color : colorObj.disableColor, //"#ff7f50",
                symbol: "circle"
            },
            highlightStyle: {
                color: colorObj.color0,
                strokeColor: colorObj.color0,
                lineWidth: 1
            },
            hoverable: this.legendOption.selectedMode,
            clickable: this.legendOption.selectedMode
        };

        var imageLocation;
        if (itemType.match('image')) {
            var imageLocation = itemType.replace(
                new RegExp('^image:\\/\\/'), ''
            );
            itemType = 'image';
        }
        // 特殊设置
        switch (itemType) {
            case 'bar':
                itemShape.style.brushType = 'fill';
                itemShape.style.iconType = 'legendBarIcon';
                itemShape.style.color = isvisible ? colorObj.color : colorObj.disableColor;
                break;
            case 'line':
                itemShape.style.brushType = 'stroke';
                itemShape.style.color = 'white';
                itemShape.highlightStyle.lineWidth = 3;
                break;
            case 'radar':
            case 'scatter':
                itemShape.highlightStyle.lineWidth = 3;
                break;
            // case 'k':
            // 	itemShape.style.brushType = 'both';
            // 	itemShape.highlightStyle.lineWidth = 3;
            // 	itemShape.highlightStyle.color =
            // 		itemShape.style.color = this.deepQuery(
            // 			[this.ecTheme, ecConfig], 'k.itemStyle.normal.color'
            // 		) || '#fff';
            // 	itemShape.style.strokeColor = isvisible ? (
            // 		this.deepQuery(
            // 			[this.ecTheme, ecConfig], 'k.itemStyle.normal.lineStyle.color'
            // 		) || '#ff3200'
            // 	) : colorObj.disableColor;
            // 	break;
            case 'image':
                itemShape.style.iconType = 'image';
                itemShape.style.image = imageLocation;
                if (!isvisible) {
                    itemShape.style.opacity = 0.5;
                }
                break;
        }
        return itemShape;
    };


    /**
     * 根据选项计算图例实体的位置坐标
     */
    Legend.prototype._getItemGroupLocation = function () {
        var data = this.legendOption.data;
        var dataLength = data.length;
        var itemGap = this.legendOption.itemGap;
        var itemWidth = this.legendOption.itemWidth + 5; // 5px是图形和文字的间隔，不可配
        var itemHeight = this.legendOption.itemHeight;
        var textStyle = this.legendOption.textStyle;
        var font = this.getFont(textStyle);
        var totalWidth = 0;
        var totalHeight = 0;
        var padding = this.parseCssArray(this.legendOption.padding);

        var zrWidth = this.zr.getWidth() - padding[1] - padding[3];
        var zrHeight = this.zr.getHeight() - padding[0] - padding[2];

        var temp = 0; // 宽高计算，用于多行判断
        var maxWidth = 0; // 垂直布局有用
        if (this.legendOption.orientation === 'horizontal') {
            // 水平布局，计算总宽度
            totalHeight = itemHeight;
            for (var i = 0; i < dataLength; i++) {
                if (this._getName(data[i]) === '') {
                    temp -= itemGap;
                    totalWidth = Math.max(totalWidth, temp);
                    totalHeight += itemHeight + itemGap;
                    temp = 0;
                    continue;
                }
                var tempTextWidth = zrArea.getTextWidth(
                    this._getFormatterNameFromData(data[i]),
                    data[i].textStyle ? this.getFont(zr_util.merge(
                        data[i].textStyle || {},
                        textStyle
                    )) : font
                );
                if (temp + itemWidth + tempTextWidth + itemGap > zrWidth) {
                    // new line
                    temp -= itemGap; // 减去最后一个的itemGap
                    totalWidth = Math.max(totalWidth, temp);
                    totalHeight += itemHeight + itemGap;
                    temp = 0;
                } else {
                    temp += itemWidth + tempTextWidth + itemGap;
                    totalWidth = Math.max(totalWidth, temp - itemGap);
                }
            }
        } else {
            // 垂直布局，计算总高度
            for (var i = 0; i < dataLength; i++) {
                maxWidth = Math.max(
                    maxWidth,
                    zrArea.getTextWidth(
                        this._getFormatterNameFromData(data[i]),
                        data[i].textStyle ? this.getFont(zr_util.merge(
                            data[i].textStyle || {},
                            textStyle
                        )) : font
                    )
                );
            }
            maxWidth += itemWidth;
            totalWidth = maxWidth;
            for (var i = 0; i < dataLength; i++) {
                if (this._getName(data[i]) === '') {
                    totalWidth += maxWidth + itemGap;
                    temp -= itemGap; // 减去最后一个的itemGap
                    totalHeight = Math.max(totalHeight, temp);
                    temp = 0;
                    continue;
                }
                if (temp + itemHeight + itemGap > zrHeight) {
                    // new line
                    totalWidth += maxWidth + itemGap;
                    temp -= itemGap; // 减去最后一个的itemGap
                    totalHeight = Math.max(totalHeight, temp);
                    temp = 0;
                } else {
                    temp += itemHeight + itemGap;
                    totalHeight = Math.max(totalHeight, temp - itemGap);
                }
            }
        }

        zrWidth = this.zr.getWidth();
        zrHeight = this.zr.getHeight();
        var x;
        switch (this.legendOption.x) {
            case 'center':
                x = Math.floor((zrWidth - totalWidth) / 2);
                break;
            case 'left':
                x = padding[3] + this.legendOption.borderWidth;
                break;
            case 'right':
                x = zrWidth - totalWidth - padding[1] - padding[3] - this.legendOption.borderWidth * 2;
                break;
            default:
                x = this.parsePercent(this.legendOption.x, zrWidth);
                break;
        }

        var y;
        switch (this.legendOption.y) {
            case 'top':
                y = padding[0] + this.legendOption.borderWidth;
                break;
            case 'bottom':
                y = zrHeight - totalHeight - padding[0] - padding[2] - this.legendOption.borderWidth * 2;
                break;
            case 'center':
                y = Math.floor((zrHeight - totalHeight) / 2);
                break;
            default:
                y = this.parsePercent(this.legendOption.y, zrHeight);
                break;
        }

        return {
            x: x,
            y: y,
            width: totalWidth,
            height: totalHeight,
            maxWidth: maxWidth
        };

    };

    Legend.prototype._getFormatterNameFromData = function (data) {
        var itemName = this._getName(data);
        return this._getFormatterName(itemName);
    };

    Legend.prototype._getName = function (data) {
        return typeof data.name != 'undefined' ? data.name : data;
    };

    Legend.prototype._getFormatterName = function (itemName) {
        var formatter = this.legendOption.formatter;
        var formattedName;
        if (typeof formatter === 'function') {
            formattedName = formatter.call(this.charts, itemName);
        } else if (typeof formatter === 'string') {
            formattedName = formatter.replace('{name}', itemName);
        } else {
            formattedName = itemName;
        }
        return formattedName;
    };


    /**
     * 根据图表名判断当前legend有木有选中
     * @param {Object} name
     */
    Legend.prototype.isSelected = function (name) {
        if (typeof this._selectedMap[name] != 'undefined') {
            return this._selectedMap[name];
        }
        else {
            return false;
        }
    };


    Legend.prototype.getColorFromZR = function (idx) {
        return this.theme.color[idx];
    }

    Legend.prototype.init = function (newOption) {
        if (newOption) {
            this.option = newOption;
        }

        this.legendOption = this.reviseOption(this.option.legend);

        // 如果没有配置data,则去series里面去找data
        if (!this.legendOption.data) {
            this.legendOption.data = [];
            var series = this.option.series;

            for (var i = 0; i < series.length; i++) {
                this.legendOption.data.push(series[i].name);
            }
        }


        var data = this.legendOption.data || [];
        var itemName;
        var something;
        var color;
        var queryTarget;


        if (this.legendOption.selected) {
            for (var k in this.legendOption.selected) {
                this._selectedMap[k] = typeof this._selectedMap[k] != 'undefined' ? this._selectedMap[k] : this.legendOption.selected[k];
            }
        }

        for (var i = 0, dataLength = data.length; i < dataLength; i++) {
            var _data = data[i];

            if (typeof _data === 'string') {
                data[i] = {
                    name: _data,
                    style: {
                        normal: {}
                    }
                };
            } else if (typeof _data === 'object') {
                data[i].style = zr_util.merge(_data.style || {}, {
                    normal: {}
                });
            }

            // 取legend的style
            _data = data[i];
            something = this._getSomethingByName(_data.name);
            this.reviseOption(something.series, something.type);
            // if (_data.style.normal.color) {
            // 	this.setColor(_data.name, _data.style.normal.color);
            // } else {
            var color, color0;
            if (something.series && something.series.style && something.series.style.normal && something.series.style.normal.color) {
                color = something.series.style.normal.color;
                color0 = something.series.style.normal.color0;
                if (color0) {
                    color = {
                        color: color,
                        color0: color0
                    };
                }
            } else {
                color = this.getColor(_data.name);
            }
            // if(color0)
            // 	this.setColor(_data.name, {'color':color,'color0':color0});
            // else
            this.setColor(_data.name, color);
            if (typeof color == 'object') {
                _data.style.normal.color = color.color;
                _data.style.normal.color0 = color.color0;
            } else {
                _data.style.normal.color = color;
                _data.style.normal.color0 = color;
            }
            // _data.style.normal.color =  typeof color == 'object' ? color.color : color ;
            // _data.style.normal.color0 =  typeof color == 'object' ? color.color0 : color ;
            // }


            itemName = _data.name;
            if (!something.series) {
                this._hasDataMap[itemName] = false;
            } else {
                this._hasDataMap[itemName] = true;
            }

            this._selectedMap[itemName] =
                this._selectedMap[itemName] != null ? this._selectedMap[itemName] : true;
        }

        // 绘制
        this._buildShape();
    };


    Legend.prototype.getItemStyleColor = function (itemColor, seriesIndex, dataIndex, data) {
        return typeof itemColor === 'function' ? itemColor.call(
            this.myChart, {
                seriesIndex: seriesIndex,
                series: this.series[seriesIndex],
                dataIndex: dataIndex,
                data: data
            }
        ) : itemColor;
    };





    zr_util.inherits(Legend, Base);
    return Legend;
});