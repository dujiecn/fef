/**
 * K线图
 * @author j.d
 */
define(function (require) {
    'use strict';


    var Base = require('./base');
    var zr_util = require('../zrender/tool/util');
    var CandleShape = require('../util/shape/Candle');


    function K(option, type, charts) {
        Base.call(this, option, type, charts);
        this._step = -1;
        this.refresh(option);
    }

    K.prototype.refresh = function (newOption) {
        if (newOption) {
            this.option = this.reviseOption(newOption);
            // 默认配置没有颜色值，这里做处理
            if (!this.option.style.normal.color) {
                this.option.style.normal.color = this.legend.getColor(this.option.name);
                this.option.style.normal.color0 = this.legend.getColor(this.option.name);
            }
        }

        // 如果图例没有选中这清除图形，直接返回
        if (!this.legend.isSelected(this.name)) {
            this.clear();
            return;
        }


        this.backupShapeList();
        this._buildShape();
    };


    K.prototype._buildShape = function () {
        this._buildPosition();
        this.addShapeList();
    };

    K.prototype._buildPosition = function () {
        // 坐标数组
        var coordList = [];
        var valueAxis;
        var categoryAxis;
        var width = this.option.width;
        var color = this.option.style.normal.color;
        var color0 = this.option.style.normal.color0;
        var lineWidth = this.option.style.normal.width;

        if (this.isHorizontal()) {
            var categoryAxis = this.xAxis.getAxis(this.option.xAxisIndex);
            var valueAxis = this.yAxis.getAxis(this.option.yAxisIndex);
            this._step = categoryAxis.getStep();

            // 重新计算宽度
            if (typeof width === 'string' && width.match(/^[1-9]?[0-9]|100%$/)) {
                width = Number(width.replace(/%/g, '')) / 100 * categoryAxis.getInterval();
            } else if (!(typeof width != 'number')) {
                width = 0.5 * categoryAxis.getInterval();
            }

            var dt;
            var positionObject;
            for (var i = 0, l = this.option.dataIndex.length; i < l; i++) {
                dt = this.option.data[this.option.dataIndex[i]];
                if (this.isEmpty(dt[0]) ||
                    this.isEmpty(dt[1]) ||
                    this.isEmpty(dt[2]) ||
                    this.isEmpty(dt[3])) {
                    continue;
                }

                positionObject = {
                    x: categoryAxis.getCoordByIndex(i),
                    y: [
                        valueAxis.getCoordByValue(dt[0]),
                        valueAxis.getCoordByValue(dt[1]),
                        valueAxis.getCoordByValue(dt[2]),
                        valueAxis.getCoordByValue(dt[3])
                    ],
                    _data: dt, // 保存当前的图形的值轴数据
                    _dataIndex: i, // 标识逻辑轴对应的下标位置
                    width: width,
                    lineWidth: lineWidth
                };

                // 开盘大于收盘
                if (dt[0] > dt[1]) {
                    positionObject.color = color0;
                    positionObject.strokeColor = color0;
                } else {
                    positionObject.color = color;
                    positionObject.strokeColor = color;
                }

                coordList.push(positionObject);
            }

            this._buildK(coordList, 'horizontal');
        } else {
            //    TODO
            this._buildK(coordList, 'vertical');
        }


    };

    K.prototype._buildK = function (coordList, orient) {
        var coord;
        for (var i = 0, l = coordList.length; i < l; i++) {
            this.shapeList.push(this._buildItem(coordList[i]));
        }
    };


    K.prototype._buildItem = function (obj) {
        var shapeOpt = {
            zlevel: this.getZlevel(),
            z: this.getZ(),
            _dataIndex: obj._dataIndex,
            _seriesIndex: this.name,
            _animationable: true,
            clickable: false,
            hoverable: false,
            _operate: 'showk',
            _actionType: 'addShape',
            style: {
                brushType: 'both',
                x: obj.x,
                y: obj.y,
                width: obj.width,
                color: obj.color,
                strokeColor: obj.strokeColor,
                lineWidth: obj.lineWidth
            },
            highlightStyle: {}
        };


        return new CandleShape(shapeOpt);
    }


    zr_util.inherits(K, Base);
    return K;
});