/**
 * series入口模块
 * @author dj
 */
define(function (require) {
    var Base = require('./base');
    var zr_util = require('../zrender/tool/util');
    var config = require('../conf');

    var chartDefine = {
        'line': require('../chart/line'),
        'bar': require('../chart/bar'),
        'pie': require('../chart/pie'),
        'k': require('../chart/k'),
        'radar': require('../chart/radar'),
        'scatter': require('../chart/scatter'),
        'gauge': require('../chart/gauge')
    };

    function Series(option, type, charts) {
        Base.call(this, option, type, charts);
        this.legend = this.charts.component.legend;
        this.xAxis = this.charts.component.xAxis;
        this.yAxis = this.charts.component.yAxis;
        this.chartMap = {};
        this.series = null;
        //this.selectedMap = {};
        this.refresh(option);
    }


    Series.prototype.refresh = function (newOption) {
        if (newOption) {
            this.option = newOption;
            this.series = this.option.series;
        }
        this._build();
    };


    Series.prototype._build = function () {
        var series = this.series;
        if (series[0].type == config.CHART_TYPE_PIE ||
            series[0].type == config.CHART_TYPE_RADAR
        ) {
            var serieName;
            var ChartClass;
            var chartType;
            var needRefresh;
            for (var i = 0, l = series.length; i < l; i++) {
                serieName = series[i].name;

                // 这里需要对pie里面的图例数组做对比  只要有一个不一致都需要刷新
                needRefresh = false;
                if (this.chartMap[serieName]) {
                    var sm = this.chartMap[serieName].selectedMap;
                    for (var name in sm) {
                        if (sm[name] != this.legend.isSelected(name)) {
                            needRefresh = true;
                        }
                    }

                    if (needRefresh) {
                        this.chartMap[serieName].refresh(series[i]);
                    }

                    continue;
                }

                chartType = series[i].type;
                ChartClass = chartDefine[chartType];
                this.chartMap[serieName] = new ChartClass(series[i], chartType, this.charts);
            }
        }
        else if (series[0].type == config.CHART_TYPE_GAUGE) {
            var serieName;
            var ChartClass;
            var chartType;
            var needRefresh;
            for (var i = 0, l = series.length; i < l; i++) {
                serieName = series[i].name;
                if (this.chartMap[serieName]) {
                    this.chartMap[serieName].refresh(series[i]);


                }
                else {
                    chartType = series[i].type;
                    ChartClass = chartDefine[chartType];
                    this.chartMap[serieName] = new ChartClass(series[i], chartType, this.charts);
                }

            }
        }


        else if (series[0].type == config.CHART_TYPE_SCATTER) {
            var serieName;
            var ChartClass;
            var chartType;
            for (var i = 0, l = series.length; i < l; i++) {
                serieName = series[i].name;

                if (!this.legend.isSelected(serieName)) {
                    if (this.chartMap[serieName]) {
                        this.chartMap[serieName].clear();
                    }
                    continue;
                }

                if (this.chartMap[serieName]) {
                    // 存在直接刷新
                    this.chartMap[serieName].refresh();
                    continue;
                }

                chartType = series[i].type;
                ChartClass = chartDefine[chartType];
                this.chartMap[serieName] = new ChartClass(series[i], chartType, this.charts);
            }
        } else {
            // 直角坐标系图形的处理逻辑

            // 根据位置分组series
            var _position2seriesIndexMap = {
                top: [],
                bottom: [],
                right: [],
                left: [],
                other: []
            };

            var xAxis;
            var yAxis;
            var serieName;
            for (var i = 0, l = series.length; i < l; i++) {
                serieName = series[i].name;

                // 如果图例没选中的图形，并且在map中存在的话则擦除图形，并删除对象
                if (!this.legend.isSelected(serieName)) {
                    if (this.chartMap[serieName]) {
                        this.chartMap[serieName].clear();
                    }
                    continue;
                }

                xAxis = this.xAxis.getAxis(series[i].xAxisIndex);
                yAxis = this.yAxis.getAxis(series[i].yAxisIndex);
                if (xAxis.type == config.COMPONENT_TYPE_AXIS_CATEGORY) {
                    _position2seriesIndexMap[xAxis.getPosition()].push(i);
                } else if (yAxis.type == config.COMPONENT_TYPE_AXIS_CATEGORY) {
                    _position2seriesIndexMap[yAxis.getPosition()].push(i);
                } else {
                    _position2seriesIndexMap['other'].push(i);
                }
            }


            var ChartClass;
            var chartType;
            var serie;
            for (var position in _position2seriesIndexMap) {
                if (_position2seriesIndexMap[position].length > 0) {
                    var stackMap = this._mapDataByStack(_position2seriesIndexMap[position]);
                    var _barNeedData = this._mapBarNeedData(stackMap);
                    // 重新设置stack值
                    this._buildStackData(stackMap);

                    for (var stack in stackMap) {
                        for (var i = 0, l = stackMap[stack].length; i < l; i++) {
                            serie = series[stackMap[stack][i]];
                            serieName = serie.name;

                            if (this.chartMap[serieName]) {
                                //    已创建过对象不再创建，直接刷新
                                if (this.chartMap[serieName].type == config.CHART_TYPE_BAR) {
                                    // 柱状图刷新 需要重新计算需要的数据
                                    this.chartMap[serieName].refresh(serie, _barNeedData);
                                } else {
                                    this.chartMap[serieName].refresh(serie);
                                }
                                continue;
                            }

                            chartType = serie.type;
                            ChartClass = chartDefine[chartType];
                            if (chartType == config.CHART_TYPE_BAR) {
                                this.chartMap[serieName] = new ChartClass(serie, chartType, this.charts, _barNeedData);
                            } else {
                                this.chartMap[serieName] = new ChartClass(serie, chartType, this.charts);
                            }
                        }
                    }
                }
            }
        }
    };


    /**
     * 构造柱状图需要的数据
     * @param stackMap
     * @returns {*}
     * @private
     */
    Series.prototype._mapBarNeedData = function (stackMap) {
        var series = this.series;
        var serie;
        var legend = this.charts.component.legend;
        var barNumber = 0;
        var barWidth;
        var barGap;
        var barGapWidth;
        var barCategoryGap;
        var barCategoryGapWidth;
        var interval;
        var hasBar;
        var index = 0;
        for (var stack in stackMap) {
            hasBar = false;
            for (var i = 0, l = stackMap[stack].length; i < l; i++) {
                serie = series[stackMap[stack][i]];
                serie = this.reviseOption(serie, serie.type);
                //if (!legend.isSelected(serie.name)) {
                //    continue;
                //}

                if (serie.type == config.CHART_TYPE_BAR) {
                    hasBar = true;
                    if (!barGap || !barCategoryGap) {
                        barGap = serie.barGap;
                        barCategoryGap = serie.barCategoryGap;
                    }
                    serie._stackIndex = barNumber;
                }
            }

            if (hasBar) {
                barNumber++;
            }
        }


        if (barGap && barCategoryGap) {
            if (this.isHorizontal()) {
                interval = this.charts.component.xAxis.getAxis(0).getInterval();
            } else {
                interval = this.charts.component.yAxis.getAxis(0).getInterval();
            }
            barWidth = interval * (1 - barCategoryGap) / (barNumber + barGap * barNumber - barGap);

            barGapWidth = barWidth * barGap;
            barCategoryGapWidth = interval * barCategoryGap;

            return {
                barNumber: barNumber,
                barWidth: barWidth,
                barGapWidth: barGapWidth,
                barCategoryGapWidth: barCategoryGapWidth,
                interval: interval
            }
        } else {
            return null;
        }

    };


    /**
     * 构造堆叠数据
     * @param stackMap
     * @private
     */
    Series.prototype._buildStackData = function (stackMap) {
        var series = this.series;
        var serie;
        var data;
        var sumStack;
        var sumStack2; // 负值
        var dataLength;
        if (this.isHorizontal()) {
            dataLength = this.xAxis.getAxis(0).option.data.length;
        } else {
            dataLength = this.yAxis.getAxis(0).option.data.length;
        }


        // 存在之前计算的stackData 则删除
        series.forEach(function (serie) {
            serie.stackData && delete serie.stackData;
        });


        for (var stack in stackMap) {
            for (var i = 0; i < dataLength; i++) {
                sumStack = sumStack2 = 0;
                for (var j = 0, l = stackMap[stack].length; j < l; j++) {
                    serie = series[stackMap[stack][j]];
                    //data = serie.data[serie.dataIndex[i]];
                    data = serie.data[i];
                    if (this.isEmpty(data)) {
                        data = 0;
                    }

                    serie.stackData = serie.stackData || [];
                    serie.stackData.push([sumStack, sumStack2]);
                    if (data <= 0) {
                        sumStack2 += data;
                    } else {
                        sumStack += data;
                    }
                }
            }
        }
    }


    /**
     * 根据堆叠获取分组的series下标数组
     * @param seriesIndexList
     * @returns {{}}
     * @private
     */
    Series.prototype._mapDataByStack = function (seriesIndexList) {
        var series = this.option.series;
        var serie;
        var serieName;
        var _STACK_KEY = '__stack_key__';
        var stackKey;
        var legend = this.charts.component.legend;
        var locationMap = [];
        var stackMap = {};
        var index = 0;
        for (var i = 0, l = seriesIndexList.length; i < l; i++) {
            serie = series[seriesIndexList[i]];
            serieName = serie.name;
            if (legend.isSelected(serieName)) {
                stackKey = serie.stack || ( _STACK_KEY + seriesIndexList[i]);
                stackMap[stackKey] = stackMap[stackKey] || [];
                stackMap[stackKey].push(seriesIndexList[i]);
            }
        }
        return stackMap;
    };


    ///**
    // * 刷新事件
    // * @param {Object} arg
    // */
    //Series.prototype.onrefresh = function (arg) {
    //    var needData;
    //    for (var i = 0, l = this.chart.length; i < l; i++) {
    //        _chart = this.chart[i];
    //        if (_chart.option.show) {
    //            if (_chart.type == config.CHART_TYPE_BAR) {
    //                needData = this._buildBarNeedData();
    //            }
    //            if (_chart.type == config.CHART_TYPE_PIE) {
    //                for (var i = 0; i < _chart.sectorDataList.length; i++) {
    //                    var sector = _chart.sectorDataList[i];
    //                    if (arg.name == sector.name) {
    //                        sector.show = arg.status;
    //                        _chart.refresh(arg.name);
    //                    }
    //                }
    //            }
    //            else if (_chart.type == config.CHART_TYPE_RADAR) {
    //                _chart.refresh(arg.name, arg.status);
    //
    //                // for (var i = 0; i < _chart.itemDataList.length; i++) {
    //                // 	var _data =  _chart.itemDataList[i];
    //                // 	if (arg.name == _data.name) {
    //                // 		_data.show = arg.status;
    //                // 		_chart.refresh(arg.name);
    //                // 	}
    //                // }
    //
    //            }
    //
    //            else {
    //                // 说明图例选中此chart
    //                if (arg.name == _chart.name) {
    //                    _chart.show(needData);
    //                } else {
    //                    _chart.refresh(needData);
    //                }
    //            }
    //        } else {
    //            _chart.hide();
    //        }
    //
    //    }
    //};
    //
    //
    /**
     * 分页回调事件
     * @param {Object} arg
     */
    Series.prototype.onpagelineChange = function (arg) {
        //var chart;
        //for (var name in this.chartMap) {
        //    chart = this.chartMap[name];
        //    if (chart.type == config.CHART_TYPE_BAR) {
        //
        //    }
        //}


        //var needData = this._buildBarNeedData();
        //var chart;
        //for (var i = 0, l = this.chart.length; i < l; i++) {
        //    chart = this.chart[i];
        //    if (chart.type == config.CHART_TYPE_BAR ||
        //        chart.type == config.CHART_TYPE_K) {
        //        chart.refresh(needData);
        //    } else {
        //        chart.dispose();
        //        chart.load(needData);
        //    }
        //}
    };


    zr_util.inherits(Series, Base);
    return Series;
});