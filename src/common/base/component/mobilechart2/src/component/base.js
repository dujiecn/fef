/**
 * 组件公共模块
 @ author j.d
 */
define(function (require) {
    'use strict';

    var zr_util = require('../zrender/tool/util'),
        config = require('../conf');

    var animation;

    function Base(option, type, charts) {
        this.option = option;
        this.type = type;
        this.charts = charts;
        this.zr = charts._zr;
        this.theme = charts.theme;
        this.backgroundColor = charts._option.backgroundColor;
        this._messageCenter = charts._messageCenter;
        this.animation = charts._option.animation;
        this.shapeList = [];
        if (this.animation.show) {
            animation = require('../util/animation');
        }

    }

    /**
     *对option参数进行预处理，合并默认的配置
     */
    Base.prototype.reviseOption = function (opt, type) {
        return zr_util.merge(opt || {}, zr_util.merge(zr_util.clone(this.theme[type || this.type] || {}), zr_util.clone(config[type || this.type] || {})));
    };

    /**
     * 获取自定义和默认配置合并后的字体设置
     */
    Base.prototype.getFont = function (textStyle) {
        var finalTextStyle = this.getTextStyle(zr_util.clone(textStyle));
        return finalTextStyle.fontStyle + ' ' + finalTextStyle.fontWeight + ' ' + finalTextStyle.fontSize + 'px ' + finalTextStyle.fontFamily;
    };

    /**
     * 获取统一主题字体样式
     */
    Base.prototype.getTextStyle = function (targetStyle) {
        return zr_util.merge(targetStyle || {}, config.textStyle);
    };

    /**
     * 刷新
     * @param {Object} option
     */
    Base.prototype.refresh = function (option) {
        console.warn('call Base Object refresh method.');
    };

    /**
     * 释放
     */
    Base.prototype.dispose = function () {
        this.clear();
        this.shapeList = null;
    };

    /**
     * 清除图形数据
     */
    Base.prototype.clear = function () {
        this.zr && this.zr.delShape(this.shapeList);
        this.shapeList = [];
    };


    /**
     * css类属性数组补全，如padding，margin等
     * @param {Number | Array} p
     */
    Base.prototype.parseCssArray = function (p) {
        if (p instanceof Array) {
            switch (p.length + '') {
                case '4':
                    return p;
                case '3':
                    return [p[0], p[1], p[2], p[1]];
                case '2':
                    return [p[0], p[1], p[0], p[1]];
                case '1':
                    return [p[0], p[0], p[0], p[0]];
                case '0':
                    return [0, 0, 0, 0];
            }
        } else {
            return [p, p, p, p];
        }
    };

    Base.prototype.getZ = function () {
        return this._getByZ('z');
    };

    Base.prototype.getZlevel = function () {
        return this._getByZ('zlevel');
    };

    Base.prototype._getByZ = function (z) {
        if (this[z] != undefined) {
            return this[z];
        }

        if (this.option[z] != undefined) {
            return this.option[z];
        }

        var opt = this.option[this.type];
        if (opt && opt[z] != undefined) {
            return opt[z];
        }

        return 0;
    };

    /**
     * 优化像素
     * @param {Object} position
     * @param {Object} lineWidth
     */
    Base.prototype.optimizePixel = function (position, lineWidth) {
        if (lineWidth % 2 === 1) {
            //position += position === Math.ceil(position) ? 0.5 : 0;
            position = Math.floor(position) + 0.5;
        } else {
            position = Math.round(position);
        }
        return position;
    };

    Base.prototype.backupShapeList = function () {
        if (this.shapeList && this.shapeList.length > 0) {

            this.lastShapeList = this.shapeList;
            this.shapeList = [];
        } else {
            this.lastShapeList = [];
        }
    };


    /**
     * 最后往zrender添加图形
     */
    Base.prototype.addShapeList = function () {
        if (this.animation.show) {
            var duration = this.animation.duration;
            var easing = this.animation.easing;
            var delay = this.animation.delay || 0;
            var oldShapeMap = {};
            var newShapeMap = {};
            var key;
            var shape;


            //    通过已有的shape做动画过度
            for (var i = 0, l = this.lastShapeList.length; i < l; i++) {
                shape = this.lastShapeList[i];

                // 可动画的元素（关键元素）
                if (shape['_animationable']) {
                    key = shape['_seriesIndex'] + '_' + shape['_dataIndex'];
                    key += shape.type;
                    if (oldShapeMap[key]) {
                        this.zr.delShape(shape.id);
                    } else {
                        oldShapeMap[key] = shape;
                    }
                } else {
                    this.zr.delShape(shape.id);
                }
            }

            for (i = 0, l = this.shapeList.length; i < l; i++) {
                shape = this.shapeList[i];

                // 可动画的元素（关键元素）
                if (shape['_animationable']) {
                    key = shape['_seriesIndex'] + '_' + shape['_dataIndex'];
                    key += shape.type;
                    newShapeMap[key] = shape;
                } else {
                    this.zr.addShape(shape);
                }
            }


            for (key in oldShapeMap) {
                if (!newShapeMap[key]) {
                    this.zr.delShape(oldShapeMap[key].id);
                }
            }


            //console.log(oldShapeMap)
            //console.log(newShapeMap)


            for (key in newShapeMap) {
                if (oldShapeMap[key]) {
                    this.zr.delShape(oldShapeMap[key].id);
                }
                this._animate(oldShapeMap[key], newShapeMap[key], duration, easing, delay);
            }
            this.zr.refresh();
        } else {
            // clear old
            this.zr.delShape(this.lastShapeList);
            // 直接添加
            for (var i = 0, l = this.shapeList.length; i < l; i++) {
                this.zr.addShape(this.shapeList[i]);
            }
        }
    };


    Base.prototype._animate = function (oldShape, newShape, duration, easing, delay) {
        switch (newShape.type) {
            case 'polyline':
            case 'polygon':
                if (newShape._type == 'pie') {
                    if (!oldShape) {
                        var oldPointList;
                        var oldPosition;
                        var newPosition = newShape.position;
                        var newPointList = newShape.style.pointList;
                        var center = newShape._center;
                        oldPosition = [];
                        oldPointList = [newPointList[0], zr_util.clone(newPointList[2]), newPointList[2]];
                        if (oldPointList[0][0] > center[0]) {
                            oldPosition[0] = newPosition[0] + 50;
                        } else {
                            oldPosition[0] = newPosition[0] - 50;
                        }
                        oldPosition[1] = 0;

                        oldShape = {
                            position: oldPosition,
                            style: {
                                pointList: oldPointList
                            }
                        };
                    }

                    animation.pointList(this.zr, oldShape, newShape, duration, easing);
                } else if (newShape._type == 'radar') {
                    if (!oldShape) {
                        var pointList = [];
                        for (var i = 0, l = newShape.style.pointList.length; i < l; i++) {
                            pointList.push([
                                newShape._center[0],
                                newShape._center[1]
                            ]);
                        }

                        oldShape = {
                            style: {
                                pointList: pointList
                            }
                        };
                    }

                    animation.pointList(this.zr, oldShape, newShape, duration, easing);
                }
                else {
                    animation.pointList(this.zr, oldShape, newShape, duration, easing);
                }

                break;
            case 'icon':
                animation.icon(this.zr, oldShape, newShape, duration, easing, delay);
                break;
            case 'rectangle':
                animation.rectangle(this.zr, oldShape, newShape, duration, easing);
                break;
            case 'candle' :
                animation.candle(this.zr, oldShape, newShape, duration, easing);
                break;
            case 'gauge-pointer' :
                animation.gaugePointer(this.zr, oldShape, newShape, duration, easing);
                break;
            case 'text':
                animation.text(this.zr, oldShape, newShape, duration, easing);
                break;
            case 'circle':
                animation.circle(this.zr, oldShape, newShape, duration, easing, delay);
                break;

            case 'sector':
            case 'circle' :
                if (this.lastShapeList.length == 0) {
                    //    add
                    animation.ring(
                        this.zr,
                        oldShape,
                        newShape,
                        duration,
                        easing
                    );
                } else {
                    //    update
                    animation.sector(this.zr, oldShape, newShape, duration, easing);
                }
                break;
            default:
                this.zr.addShape(newShape);
                break;
        }
    };


    Base.prototype.animate = function (obj) {

        var zr = this.zr,
            oldShape = obj.oldShape,
            newShape = obj.newShape,
            duration = obj.duration,
            easing = obj.easing,
            operate = newShape._operate,
            grid = obj.grid;

        switch (operate) {
            case 'showline':
                animation.showLine(zr, oldShape, newShape, duration, easing);
                break;
            case 'hideline':
                animation.hideLine(zr, oldShape, newShape, duration, easing, grid);
                break;
            case 'showpoint':
                animation.showPoint(zr, oldShape, newShape, duration, easing);
                break;
            case 'showbar':
                animation.showBar(zr, oldShape, newShape, duration, easing);
                break;
            case 'show_by_opacity':
                animation.showShapeByOpacity(zr, newShape, duration, easing);
                break;
            case 'showicon':
                animation.showIcon(zr, oldShape, newShape, duration, easing);
                break;
            case 'showpie':
                animation.showpie(zr, oldShape, newShape, duration, easing);
                break;
            case 'updatePie':
                animation.updatePie(zr, oldShape, newShape, duration, easing);
                break;
            case 'showk':
                animation.showK(zr, oldShape, newShape, duration, easing);
                break;
            case 'showpieText':
                animation.showpieText(zr, oldShape, newShape, duration, easing);
                break;
            case 'updatepieText':
                animation.updatepieText(zr, oldShape, newShape, duration, easing);
                break;
            case 'showpieLineText':
                animation.showpieLineText(zr, oldShape, newShape, duration, easing);
                break;
            case 'updatepieLineText':
                animation.updatepieLineText(zr, oldShape, newShape, duration, easing);
                break;
            case 'gaugePointer':
                animation.gaugePointer(zr, oldShape, newShape, duration, easing);
                break;


            default:
                break;
        }
    };


    /**
     * 判断图形水平(当存在逻辑轴的时候可用)
     */
    Base.prototype.isHorizontal = function () {
        return this.charts.component.xAxis && this.charts.component.xAxis.getAxis(0).type == config.COMPONENT_TYPE_AXIS_CATEGORY;
    };

    /**
     * 判断图形垂直(当存在逻辑轴的时候可用)
     */
    Base.prototype.isVertical = function () {
        return this.charts.component.yAxis && this.charts.component.yAxis.getAxis(0).type == config.COMPONENT_TYPE_AXIS_CATEGORY;
    };


    /**
     * 判断数据是否为空
     * @param {Object} data
     */
    Base.prototype.isEmpty = function (data) {
        return data == '-' || data == null || data == undefined || data == 'undefined' || data == '';
    };

    /**
     * 删除zrender里面的图形
     * @param {Object} data
     */
    Base.prototype.removeShape = function (shapes) {
        // if (shapes instanceof Array && shapes.length > 0) {
        // 	var shape;
        // 	while (shapes.length > 0) {
        // 		shape = shapes.shift();
        // 		shape && this.zr.delShape(shape.id);
        // 	}
        // }

        this.removeAll(shapes, function (shape) {
            this.zr.delShape(shape.id);
        });

    };


    Base.prototype.removeAll = function (array, callback) {
        if (!array)
            return;

        var o;
        if (array instanceof Array && array.length > 0) {
            while (array.length) {
                o = array.shift();
                callback && callback.call(this, o);
            }
        }
    };


    Base.prototype.set = function (name, value) {
        this[name] = value;
    };


    Base.prototype.get = function (name) {
        return this[name];
    };


    Base.prototype.enable = function (name) {
        this[name] = true;
    };


    Base.prototype.disable = function (name) {
        this[name] = false;
    };


    Base.prototype.enabled = function (name) {
        return this[name];
    };


    Base.prototype.parsePercent = function (percent, maxVal) {
        if (typeof percent == 'string') {
            if (/^([1-9]?\d(\.\d+)?|100)%$/.test(percent)) {
                return parseFloat(percent) * 0.01 * maxVal;
            } else if (/^[1-9]?\d+(\.\d+)?$/) {
                return parseFloat(percent) * maxVal;
            }
        } else if (typeof percent == 'number') {
            return parseFloat(percent) * maxVal;
        }
    };

    /**
     * 判断是否是纯粹的空对象 {}
     * @param object
     * @returns {boolean}
     */
    Base.prototype.isEmptyObject = function (object) {
        var flag = true;
        for (var k in object) {
            if (object.hasOwnProperty(k)) {
                flag = false;
                break;
            }
        }
        return flag;
    };

    /**
     * 查询一个同一个属性值相同的第一个出现的下标
     * @param val
     * @param array
     * @param depth 深度
     * @returns {*}
     */
    Base.prototype.searchIndexFormArray = function (val, array, depth) {
        if (!val || !array || !array.length) {
            return -1;
        }

        depth = depth || null; // style ,style.normal,style.normal.color ....

        var i = 0;
        var l = array.length;
        if (/^\w+(\.\w+)*$/.test(depth)) {
            var strArr = depth.split('.');
            var j;
            var len = strArr.length;
            for (; i < l; i++) {
                var _value = '';
                for (j = 0; j < len; j++) {
                    if (_value) {
                        _value = _value[strArr[j]];
                    } else {
                        _value = array[i][strArr[j]];
                    }
                }

                if (val == _value) {
                    return i;
                }
            }
        } else {

            for (; i < l; i++) {
                if (val == array[i]) {
                    return i;
                }
            }
        }

        return -1;
    };


    return Base;
});