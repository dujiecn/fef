/**
 * charts入口模块
 * @author j.d
 */
define(function (require) {
    'use strict';


    var zr_util = require('./zrender/tool/util');

    var zr = require('./zrender/zrender');

    var config = require('./conf');

    var Eventful = require('./zrender/mixin/Eventful');

    var self = {};

    /*
     * 版本
     */
    self.version = '1.0.0';

    var DOM_KEY = '_instance_key_';

    var id = Date.now() - 0;

    var _instances = {};

    self.init = function (dom, theme) {
        if (typeof dom == 'string') {
            dom = document.querySelector(dom);
        }

        if (dom instanceof Array) {
            dom = dom[0];
        }

        var key = dom.getAttribute(DOM_KEY);

        if (!key) {
            key = id++;
            dom.setAttribute(DOM_KEY, key);
        }

        if (_instances[key]) {
            // 如果存在之前的，则释放之前的对象
            _instances[key].dispose();
        }
        _instances[key] = new Charts(dom);
        _instances[key].id = key;
        _instances[key].setTheme(theme);

        return _instances[key];
    };

    self.getInstanceById = function (key) {
        return _instances[key];
    };


    function Dispatcher() {
        Eventful.call(this);
    }

    zr_util.merge(Dispatcher.prototype, Eventful.prototype, true);

    /**
     *
     * @param {Object} type 注册的事件类型
     * @param {Object} event 事件对象
     * @param {Object} params 用户传递的参数
     * @param {Object} ctx 运行时对象 [this]
     */
    Dispatcher.prototype.notify = function (type, event, params, ctx) {
        // 对传递参数进行再一次封装
        params = params || {};
        params.type = type;
        params.event = event;
        //		this.dispatch(type, params);
        this.dispatchWithContext(type, params, ctx);
    };


    /**
     * 实现charts接口层
     * @param {Element} dom
     */
    function Charts(dom) {
        dom.innerHTML = '';
        this.dom = dom;

        // 内部分发
        this._messageCenter = new Dispatcher();

        // 外部事件分发
        this.__messageCenter = new Dispatcher();

        this._init();
    }

    /*
     * 轴map 在axis轴里初始化
     */
    Charts.prototype.axisMap = null;

    /*
     * 默认主题
     */
    Charts.prototype.theme = null;

    /*
     * 最初的option参数
     */
    Charts.prototype._originalOption = null;

    /*
     * 解析完之后的option参数
     */
    Charts.prototype._restoreOption = null;

    /*
     * 内部操作使用
     */
    Charts.prototype._option = null;

    /*
     * zrender
     */
    Charts.prototype._zr = null;

    /*
     * 图表Array
     */
    Charts.prototype._chartList = null;

    /*
     * 图表Map
     */
    Charts.prototype.chart = null;

    Charts.prototype.animation = null;

    /*
     * 图表object
     */
    //	Charts.prototype.chartDefine = {
    //		'line': require('./chart/line'),
    //		'bar': require('./chart/bar')
    //	};

    /*
     * 组件Map
     */
    Charts.prototype.component = null;

    /*
     * 组件Map
     */
    Charts.prototype.componentDefine = {
        'axis': require('./component/axis'),
        'grid': require('./component/grid'),
        'title': require('./component/title'),
        'toolbox': require('./component/toolbox'),
        'tooltip': require('./component/tooltip'),
        'pageline': require('./component/pageLine'),
        'legend': require('./component/legend'),
        'series': require('./component/series')
    };

    /**
     * 构造函数
     */
    Charts.prototype._init = function () {
        var self = this;
        this._zr = zr.init(this.dom);
        this._chartList = [];
        this.chart = {};
        this.axisMap = {};
        this.component = {};


        /*
         * 注册事件回调
         */
        for (var e in config.EVENT_TYPE) {
            if (e != 'CLICK' && e != 'DBLCLICK' && e != 'HOVER' && e != 'MOUSEOUT') {
                this._messageCenter.bind(config.EVENT_TYPE[e], function (arg) {
                    switch (arg.type) {
                        case config.EVENT_TYPE.LEGEND_SELECTED:
                            this._onlegendSelected(arg);
                            break;
                        case config.EVENT_TYPE.REFRESH:
                            this._onrefresh(arg);
                            break;
                        //case config.EVENT_TYPE.RESTORE:
                        //	this._onrestore(arg);
                        //	break;

                        //						case config.EVENT_TYPE.TOOLTIP_HOVER:
                        //							this._ontooltipHover(arg);
                        //							break;
                        //						case config.EVENT_TYPE.TOOLTIP_CLICK:
                        //							this._onTooltipClick(arg);
                        //							break;
                        case config.EVENT_TYPE.PAGELINE_SYMBOL_CLICK:
                            this._onpagelineSymbolClick(arg);
                            break;
                        case config.EVENT_TYPE.DATA_ZOOM:
                            this._ondataZoom(arg);
                            break;


                        default:
                            break;
                    }
                }, this);
            }
        }

    };

    /**
     * 设置主题
     * @param {String} theme
     */
    Charts.prototype.setTheme = function (theme) {
        // 用户传过来的就是对象的样式格式，则合并默认的样式
        if (typeof theme === 'object' && theme != undefined) {
            this.theme = require('./theme/default');
            var tmp = zr_util.clone(this.theme);
            this.theme = zr_util.merge(tmp, theme, true);
        } else {
            switch (theme) {
                // case 'macarons':
                // this.theme = require('./theme/macarons');
                // break;
                case 'default':
                    this.theme = require('./theme/default');
                    break;
                case 'infographic':
                    this.theme = require('./theme/infographic');
                    break;
                default:
                    this.theme = require('./theme/default');

            }
        }
    };


    /**
     * 还原
     */
    Charts.prototype.restore = function () {

    };


    /**
     * 渲染
     */
    Charts.prototype._render = function (option) {
        var backgroundColor = option.backgroundColor;
        if (backgroundColor) {
            // 设置容器的背景色
            this.dom.style.backgroundColor = backgroundColor;
        }


        if (option.xAxis || option.yAxis) {
            option.grid = option.grid || {};
        }


        // 存在初始化优先级，否则后面的对象依赖不到
        var _componentList = [
            'title',
            'grid',
            'legend',
            'pageline',
            'xAxis',
            'yAxis',
            'series',
            'tooltip',
            'toolbox'
        ];

        var ComponentClass,
            componentType,
            componentObject;
        for (var i = 0, l = _componentList.length; i < l; i++) {
            componentType = _componentList[i];
            if (option[componentType]) {
                if (componentType.search(/^[xy]Axis$/) == 0) {
                    ComponentClass = this.componentDefine['axis'];
                } else {
                    ComponentClass = this.componentDefine[componentType];
                }
                componentObject = new ComponentClass(option, componentType, this);
                this.component[componentType] = componentObject;
            }
        }

        //option.animation.show ? this._zr.refresh() : this._zr.render();
    };

    /**
     * 设置option
     */
    Charts.prototype.setOption = function (option) {
        if (!this._originalOption) {
            this._originalOption = option;
        }

        this._option = zr_util.clone(option);

        // 解析之前合并默认的一些配置
        this._option.animation = zr_util.merge(this._option.animation || {}, config.animation);

        // 合并默认pageline配置
        this._option.pageline = zr_util.merge(this._option.pageline || {}, config.pageline);

        // 合并默认tooltip配置
        if (this._option.tooltip) {
            zr_util.merge(this._option.tooltip, config.tooltip);
        }


        // 如果没有配置背景色，则使用配置文件里面的背景色
        if (!this._option.backgroundColor) {
            this._option.backgroundColor = config.backgroundColor;
        }

        this._render(this._option);
    };

    /**
     * 返回option克隆
     */
    Charts.prototype.getOption = function () {
        return util.clone(this._restoreOption);
    };


    /**
     * 释放
     */
    Charts.prototype.dispose = function () {
        var key = this.dom.getAttribute(DOM_KEY);
        key && delete _instances[key];
        this._zr.dispose();
        this._zr = null;
    };


	Charts.prototype.refresh = function(option){
		this.component.series.refresh(option);
        this.component.tooltip.refresh();

	};


	/**
	 * 返回option克隆
	 */
	Charts.prototype.getOption = function() {
		return util.clone(this._restoreOption);
	};
    /**
     * 图例选中事件回调
     * @param {Object} arg
     */
    Charts.prototype._onlegendSelected = function (arg) {
        if (this.component.xAxis) {
            for (var i = 0, l = this.component.xAxis.getLength(); i < l; i++) {
                this.component.xAxis.getAxis(i).refresh();
            }
        }
        if (this.component.yAxis) {
            for (var i = 0, l = this.component.yAxis.getLength(); i < l; i++) {
                this.component.yAxis.getAxis(i).refresh();
            }
        }


        this.component.series.refresh();
        this.component.tooltip && this.component.tooltip.refresh();

    };


    /**
     * pageline切换页数回调
     * @param {Object} arg
     */
    Charts.prototype._onpagelineSymbolClick = function (arg) {
        for (var i = 0, l = this.component.xAxis.getLength(); i < l; i++) {
            this.component.xAxis.getAxis(i).refresh();
        }

        for (var i = 0, l = this.component.yAxis.getLength(); i < l; i++) {
            this.component.yAxis.getAxis(i).refresh();
        }

        this.component.series.refresh();
        this.component.tooltip && this.component.tooltip.refresh();
    };


    /**
     缩放事件
     */
    Charts.prototype._ondataZoom = function (arg) {
        // 轴刷新
        var xAxis = this.component.xAxis.getAxis(0);
        var yAxis = this.component.yAxis.getAxis(0);
        xAxis.ondataZoom(arg.x, arg.x2);
        yAxis.ondataZoom(arg.y, arg.y2);

        // series刷新
        this.component.series.refresh();

    };


    //Charts.prototype.disposeChartList = function () {
    //    var chartList = this.component.series.chart;
    //    var len = chartList.length;
    //    var chart;
    //    while (len--) {
    //        chart = chartList[len];
    //        chart.clear();
    //    }
    //};


    /**
     * 刷新事件
     * @param {Object} option
     */
    //Charts.prototype._onrefresh = function (arg) {
    //for (var i = 0, l = this.component.xAxis.getLength(); i < l; i++) {
    //    this.component.xAxis.getAxis(i).refresh();
    //}
    //
    //for (var i = 0, l = this.component.yAxis.getLength(); i < l; i++) {
    //    this.component.yAxis.getAxis(i).refresh();
    //}
    //
    //this.component.series.refresh();

    //var chart;
    //for (var name in this.component.series.chartMap) {
    //    chart = this.component.series.chartMap[name];
    //    chart.refresh && chart.refresh();
    //}


    //this._zr.refresh();
    //};


    return self;


});