/**
 * 配置组件的默认参数
 * @author j.d
 */
define(function () {
    var config = {
        ORIENTATION_TYPE: {
            HORIZONTAL: 'horizontal',
            VERTICAL: 'vertical'
        },


        // 事件类型
        EVENT_TYPE: {
            REFRESH: 'refresh',
            RESTORE: 'restore',
            CLICK: 'click',
            DBCLICK: 'dbclick',
            HOVER: 'hover',
            MOUSEOUT: 'mouseout',
            MOUSEDOWN: 'mousedown',
            MOUSEUP: 'mouseup',
            MOUSEMOVE: 'mousemove',
            LEGEND_SELECTED: 'legendSelected',
            LEGEND_HOVERLINK: 'legendHoverLink',
            DATA_ZOOM: 'dataZoom',
            //			TOOLTIP_HOVER: 'tooltipHover',
            //			TOOLTIP_CLICK: 'tooltipClick',
            PAGELINE_SYMBOL_CLICK: 'pagelineSymbolClick'
        },


        // 图表类型
        CHART_TYPE_LINE: 'line',
        CHART_TYPE_BAR: 'bar',
        CHART_TYPE_SCATTER: 'scatter',
        CHART_TYPE_PIE: 'pie',
        CHART_TYPE_RADAR: 'radar',
        CHART_TYPE_K: 'k',
        CHART_TYPE_GAUGE: 'gauge',

        // 组件类型
        COMPONENT_TYPE_TITLE: 'title',
        COMPONENT_TYPE_LEGEND: 'legend',
        COMPONENT_TYPE_TOOLBOX: 'toolbox',
        COMPONENT_TYPE_TOOLTIP: 'tooltip',
        COMPONENT_TYPE_GRID: 'grid',
        COMPONENT_TYPE_AXIS: 'axis',
        COMPONENT_TYPE_AXIS_X: 'xAxis',
        COMPONENT_TYPE_AXIS_Y: 'yAxis',
        COMPONENT_TYPE_AXIS_CATEGORY: 'categoryAxis',
        COMPONENT_TYPE_AXIS_VALUE: 'valueAxis',


        // 轴位置
        AXIS_POSITION_TOP: 'top',
        AXIS_POSITION_RIGHT: 'right',
        AXIS_POSITION_BOTTOM: 'bottom',
        AXIS_POSITION_LEFT: 'left',


        // 默认的字体样式
        textStyle: {
            decoration: 'none',
            fontFamily: 'Arial, Verdana, sans-serif',
            fontFamily2: '微软雅黑', // IE8- 字体模糊并且，不支持不同字体混排，额外指定一份
            fontSize: 12,
            fontStyle: 'normal',
            fontWeight: 'normal'
        },


        // 背景色
        backgroundColor: '#fff',


        // 默认动画
        animation: {
            show: true,
            duration: 600,
            easing: 'QuadraticOut' // QuadraticOut BounceOut
        },


        // 逻辑轴的默认配置
        categoryAxis: {
            show: true,
            zlevel: 1,
            z: 0,
            position: 'bottom',
            name: '',
            nameLocation: 'end',
            nameTextStyle: {},
            step: 0, // default 0  此属性有待优化，分割线显示的时候不是很好看，需要调节offset的位置，达到美观。 狼厂实现的也不是很完善
            boundaryGap: false,
            axisLine: {
                show: true,
                hoverable: false
            },
            axisLabel: {
                show: true,
                hoverable: false,
                rotate: 0,
                offset: {
                    x: 0,
                    y: 8
                }
            },
            splitLine: {
                show: true,
                hoverable: false,
                lineStyle: {
                    type: 'solid' // dashed
                }
            },
            splitArea: {
                show: false
            },
            tick: { // 标尺线样式
                show: true,
                hoverable: false,
                type: 'circle', // circle,line
                style: {},
                offset: {
                    x: 0,
                    y: 0
                }
            }
        },


        // 值轴的默认配置
        valueAxis: {
            show: true,
            zlevel: 1,
            z: 0,
            position: 'bottom',
            name: '',
            nameLocation: 'end',
            nameTextStyle: {},
            boundaryGap: [0, 0],
            splitNumber: 0,
            axisLine: {
                show: true,
                hoverable: false,
                lineStyle: {}
            },
            axisLabel: {
                show: true,
                margin: 5,
                clickable: false,
                hoverable: false,
                formatter: function (a) {
                    return a;
                },
                rotate: 0
                // offset: { 由用户外部配置
                // 	x: 0,
                // 	y: 0
                // }
            },
            splitLine: {
                show: true,
                hoverable: false
            },
            splitArea: {
                show: false
            },
            tick: { // 标尺线样式
                show: true,
                hoverable: false,
                type: 'line', // circle
                scale: 1,
                length: 5,
                offsetX: 0,
                offsetY: 0,
                style: {}
            }
        },


        // Grid
        grid: {
            show: false,
            zlevel: 0, // default 0
            z: 0,
            x: 50,
            y: 70,
            x2: 50,
            y2: 130
        },


        // pageline 分页的轴
        pageline: {
            cursorShow: true,
            pageviewShow: false,
            // selected:'1',
            type: 'number', //分页模式number，分组模式group
            //capacity:5,//num模式时，每页显示的个数
            //pageSize: 1, //num模式时，设置显示的页数
            reversal: false, //  true/false 是否调换工具的位置
            distance: 10, //pagePreview和分页图形之间的距离
            separateWidth: 50, // 分隔图形的宽度默认为40
            // symbolWidth: 20, // symbol图形的宽度默认为20
            cursorHeight: 50, // 标尺部分图形的高度默认为50
            symbol: { //  分割点的标志样式
                formatter: function (name) {
                    return name;
                },
                z: 1,
                type: 'star', // 可以是circle/ring
                fontStyle: {
                    lineHeight: 18,
                    textFont: '16px Arial',
                    textAlign: 'center',
                    isCross: true
                },
                circleStyle: {
                    r: 5,
                    brushType: 'both',
                    color: 'white',
                    strokeColor: 'rgb(0,138,205)',
                    lineWidth: 1,
                    opacity: 1,
                    hoverable: true,
                    zlevel: 0,
                    z: 6,
                    highlightStyle: {
                        brushType: 'fill',
                        color: 'rgb(125,125,125)'
                    }
                },
                /* 星形的配置*/
                starStyle: {
                    radius: 8,
                    n: 6,
                    brushType: 'both',
                    color: 'white',
                    strokeColor: 'rgb(0,138,205)',
                    lineWidth: 1,
                    opacity: 1,
                    hoverable: true,
                    zlevel: 0,
                    z: 6,
                    highlightStyle: {
                        brushType: 'fill',
                        color: 'rgb(125,125,125)'
                    }
                },
                ringStyle: {
                    strokeColor: 'blue',
                    brushType: 'fill',
                    r: 10,
                    r0: 5,
                    opacity: 1,
                    zlevel: 0,
                    z: 6
                }
            },
            separate: { // 用什么图形分割，模式用虚线分割
                type: 'line', // 可以使line/circle/ring/none（不配置）
                lineStyle: {
                    lineType: 'dashed', //dashed/solid/dotted 实线，虚线
                    strokeColor: 'blue',
                    lineWidth: 1, //不管用什么图形分割，图形的宽度都为40
                    opacity: 1,
                    zlevel: 0,
                    z: 6
                },
                circleStyle: {
                    strokeColor: 'blue',
                    brushType: 'fill',
                    r: 5,
                    opacity: 1
                },
                ringStyle: {
                    strokeColor: 'blue',
                    brushType: 'fill',
                    r: 10,
                    r0: 5,
                    opacity: 1
                }
            },

            controls: { // 两边的控制按钮的样式
                controlWidth: 15, //控制按钮的宽度
                controlHeight: 20, //控制按钮的高度
                brushType: 'fill',
                color: 'rgb(90,177,239)',
                strokeColor: 'rgb(90,177,239)',
                hoverable: false,
                lineWidth: 1,
                opacity: 1

                // polygonLeft:{			// 上一个的按钮样式
                // 	pointList:[[0,20],[40,0],[40,40]],
                // 	brushType:'fill',
                // 	color:'#ccc',
                // 	strokeColor:'#000000',
                // 	hoverable:true,
                // 	lineWidth:1,
                // 	opacity:1
                // },
                // polygonRight:{		// 下一个的按钮样式
                // 	pointList:[[0,0],[40,20],[0,40]],
                // 	brushType:'fill',
                // 	color:'#ccc',
                // 	strokeColor:'#000000',
                // 	hoverable:true,
                // 	lineWidth:1,
                // 	opacity:1
                // }

            },
            pagePreview: {
                backgroundColor: '#ccc',
                handleColor: 'blue',
                fillColor: 'rgba(0,0,100,0.5)',
                strokeColor: '#ccc',
                dataBackgroundColor: '#eee',
                width: 0,
                borderWidth: 1,
                height: 30,
                coverStyle: {
                    color: '#8d98b3',
                    radius: 1,
                    duration: 500,
                    easing: 'QuadraticOut',
                    strokeColor: 'rgb(150,150,150)',
                    lineWidth: 2,
                    opacity: 0.5,
                    brushType: 'both'
                }
            },
            zlevel: 7, //绘制的canvas
            z: 5 //canvas中绘制的层次
        },


        // 图例
        legend: {
            show: true,
            zlevel: 0,
            z: 0,
            itemGap: 5,
            x: 'center',
            y: 'top',
            orientation: 'horizontal',
            itemWidth: 20,
            itemHeight: 14,
            selected: {}, //设置某个图例是否处于选中状态
            selectedMode: true, //multiple,single 多选和单选 选择模式，默认开启图例开关
            textStyle: {}
            // data:[]			//legend的数据配置
        },

        // 标题
        title: {
            show: true,
            zlevel: 0,
            z: 6,
            text: '',
            link: '',
            target: 'blank', //self
            subtext: '',
            sublink: '',
            subtarget: '',
            x: 'left',
            y: 'top',
            borderWidth: 0,
            padding: 5,
            itemGap: 5
        },


        // 提示框
        tooltip: {
            zlevel: 3,
            z: 2,
            position: [10, 10],
            trigger: 'axis', // item ,axis
            triggerAction: 'hover' // click ,hover 只在trigger为axis有影响
        },


        //  工具箱配置
        toolbox: {
            show: false,
            showTitle: true,
            textStyle: {},
            zlevel: 0,
            z: 0,
            orient: 'horizontal',
            x: 'right', // center left,
            y: 'top', // center bottom
            // backgroundColor: 'rgba(0,0,0,0)',
            // borderColor: '#ccc',
            borderWidth: 0,
            padding: 5,
            itemGap: 10,
            itemSize: 16,
            // disableColor: '#ddd', // 失效颜色
            // effectiveColor: 'red', // 生效颜色
            feature: {
                // mark: {
                // 	show: true
                // },

                // dataView: {
                // 	show: true,
                // 	readOnly: false
                // },

                dataZoom: {
                    show: true,
                    tool: {
                        dataZoom: {
                            title: '区域缩放',
                            color: '#22bb22'
                        },
                        dataZoomReset: {
                            title: '区域缩放后退',
                            color: '#1e90ff'
                        }
                    }
                },

                // magicType: {
                // 	show: true,
                // 	type: ['line', 'bar']
                // },
                restore: {
                    show: true,
                    title: '还原'
                },
                barChart: {
                    show: true,
                    title: '线转柱'
                }
                // saveAsImage: {
                // 	show: true
                // }
            }
        },


        /********************** 图表配置 ***********************/


        // 线默认样式
        line: {
            show: true,
            hoverable: false,
            type: "line",
            zlevel: 2, //绘制的canvas
            z: 0,
            xAxisIndex: 0,
            yAxisIndex: 0,
            label: {
                formatter: function (a) {
                    return '';
                },
                textPosition: 'inside',
                textFont: ''
            },
            symbol: { //  线折点标志样式
                show: true,
                z: 0,
                type: 'circle',
                style: {}
            },
            smooth: true,
            area: false
        },


        bar: {
            show: true,
            hoverable: false,
            type: "bar",
            zlevel: 2, //绘制的canvas
            z: 0,
            xAxisIndex: 0,
            yAxisIndex: 0,
            label: {
                formatter: function (a) {
                    return '';
                },
                textPosition: 'inside',
                textFont: ''
            },
            radius: 1,
            barGap: 0.3,
            barCategoryGap: 0.2
        },


        // 散点图
        scatter: {
            show: true,
            xAxisIndex: 0,
            yAxisIndex: 0,
            large: false,
            type: "scatter",
            // radius:1,用户配置，因为存在不同的情况，不方便默认
            zlevel: 2,
            z: 0
        },


        /* 饼图的一些默认样式 */
        pie: {
            show: true,
            showText: true,
            showTextLine: true,
            strokeColor: 'black',
            baseColor: '#ccc',
            lineWidth: 1,
            selectedMode: 'single' //multiple,single 多选和单选 选择模式，默认开启图例开关
        },

        radar: {
            show: true,
            zlevel: 2,
            z: 0,
            area:false
        },

        polar: {
            center: [0.5, 0.5],	//中心的位置默认居中
            splitNumber: 5,   //分割的段数
            type: 'polygon', // 默认的图形
            splitLine: {			//分割线的样式
                show: true
            },
            splitArea: {			//分割区域的样式
                show: true,
                defaultColor: 'rgb(238,238,238)',
                areaStyle: {}
            },
            radialLine: {},
            textStyle: {}
        },


        k: {
            type: 'k',
            show: true,
            xAxisIndex: 0,
            yAxisIndex: 0,
            width: '30%', // number,precent
            zlevel: 2,
            z: 0,
            style: {
                normal: {
                    width: 1
                }
            }
            // click:function(param) {} 由用户配置，默认没有
        },
        /*  仪表图的默认配置 */
		gauge:{
			center: ['50%', '50%'],    // 默认全局居中
			clickable: true,
	        legendHoverLink: true,
	        radius: '75%',
	        startAngle: 225,
	        endAngle: -45,
	        min: 0,                     // 最小值
	        max: 100,                   // 最大值
	        splitNumber: 10,            // 分割段数，默认为10
	        axisLine: {            // 坐标轴线
	            show: true,        // 默认显示，属性show控制显示与否
	            lineStyle: {       // 属性lineStyle控制线条样式
	                color: [[0.2, '#228b22'],[0.8, '#48b'],[1, '#ff4500']], 
	                width: 30
	            }
	        },
	        axisTick: {            // 坐标轴小标记
	            show: true,        // 属性show控制显示与否，默认不显示
	            splitNumber: 5,    // 每份split细分多少段
	            length :8,         // 属性length控制线长
	            lineStyle: {       // 属性lineStyle控制线条样式
	                color: '#eee',
	                width: 1,
	                type: 'solid'
	            }
	        },
	        axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
	            show: true,
	            // formatter: null,
	            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
	                color: 'auto',
	                fontSize:11
	            }
	        },
	        splitLine: {           // 分隔线
	            show: true,        // 默认显示，属性show控制显示与否
	            length :30,         // 属性length控制线长
	            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
	                color: '#eee',
	                width: 2,
	                type: 'solid'
	            }
	        },
	        pointer: {
                type:'polygon',   //'polygon'多边形 ，'needle'针形   'image' 图片
                // 仪表盘的圆心为[0,0.5],pointlist中点的坐标值在0到1之间取值，为想多圆心的坐标
                pointList:[ [0.5,0], [0,0.3], [0.5,1],[1,0.3] ], 
                brushType:'fill', //fill
	            show: true,
	            length: 80,
	            width: 25,
	            color: 'auto'
	        },
	        title: {
	            show: true,
	            offsetCenter: [0, '-40%'],      // x, y，单位px
	            textStyle: {                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
	                color: '#333',
	                fontSize: 15
	            }
	        },
	        detail: {
                formatter: function(value) {
                    var textContent = value % 1 == 0 ? value : value.toFixed(2);
                    return textContent;
                },
	            show: true,
	            backgroundColor: 'rgba(0,0,0,0)',
	            borderWidth: 0,
	            borderColor: '#ccc',
	            width: 100,
	            height: 40,
	            offsetCenter: [0, '40%'],   // x, y，单位px
	            textStyle: {                // 其余属性默认使用全局文本样式，详见TEXTSTYLE
	                color: 'auto',
	                fontSize: 20
	            }
	        },
	        zlevel:0,
	        z:1
		}

    };

    return config;
});