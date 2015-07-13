/**
 * 图形基类
 * @author j.d
 */
define(function (require) {
    'use strict';

    var ComponentBase = require('../component/base');
    var zr_util = require('../zrender/tool/util');
    var config = require('../conf');

    function Base(option, type, charts) {
        ComponentBase.call(this, option, type, charts);
        this.legend = charts.component.legend;
        this.name = option.name;
        this.backgroundColor = charts._option.backgroundColor;
        this.xAxis = charts.component.xAxis;
        this.yAxis = charts.component.yAxis;
        this.grid = charts.component.grid;

        this.lastShapeList = [];
    }


    //Base.prototype.setUdata = function (udata) {
    //    for (var key in udata || {}) {
    //        this[key] = udata[key];
    //    }
    //};

    Base.prototype.load = function () {
        console.warn('load method must be rewrite.');
    };
    Base.prototype.show = function () {
        console.warn('show method must be rewrite.');
    };
    Base.prototype.hide = function () {
        console.warn('hide method must be rewrite.');
    };
    Base.prototype.refresh = function () {
        console.warn('refresh method must be rewrite.');
    };
    Base.prototype.ontooltipHover = function (tooltipComponent) {
        console.warn('ontooltipHover method need be implement');
    };


    Base.prototype.isHorizontal = function () {
        return this.xAxis.getAxis(0).type == config.COMPONENT_TYPE_AXIS_CATEGORY;
    };

    Base.prototype.isVertical = function () {
        return this.yAxis.getAxis(0).type == config.COMPONENT_TYPE_AXIS_CATEGORY;
    };


    zr_util.inherits(Base, ComponentBase);
    return Base;
});