/**
 * 默认主题样式
 * @author j.d
 */
define(function (require) {

    /*
     * 绘制图形的颜色索引
     */
    // var _globalColorIndex = 0;

    var theme = {

        color: [
            '#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80',
            '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
            '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
            '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
        ],


        // 类目轴
        categoryAxis: {
            axisLabel: { // 坐标轴文本标签
                textStyle: {
                    color: '#333'
                }
            },
            splitLine: { // 分隔线
                lineStyle: {
                    color: '#eee',
                    width: 1
                }
            },
            splitArea: { // 分隔区域
                areaStyle: {
                    color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)']
                }
            },
            axisLine: { // 坐标轴线
                lineStyle: {
                    color: '#48b',
                    width: 1
                }
            },
            tick: {
                style: {
                    color: '#48b',
                    width: 1,
                    r: 3
                }
            }
        },


        valueAxis: {
            axisLabel: {
                textStyle: {
                    color: '#333'
                }
            },
            axisLine: {
                lineStyle: {
                    width: 1,
                    color: '#48b',
                }
            },
            splitLine: { // 分隔线
                lineStyle: {
                    color: '#eee',
                    width: 1
                }
            },
            tick: {
                style: {
                    color: '#48b',
                    width: 1,
                    r: 3
                }
            }
        },


        grid: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 1,
            borderColor: '#ccc'
        },


        // pageline 时间轴
        pageline: {
            padding: [20],
            borderColor: '#ccc',
            borderWidth: 0,
            position: 'bottom', //位置在图形的上面还是下面top/bottom
            bottom: 10,
            top: 10,
            backgroundColor: 'white'
        },


        legend: {
            borderColor: '#ccc',
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            padding: 5,
            borderColor: '#ccc',
            disabledColor: '#ccc',

            textStyle: {
                defaultColor: 'black',
                color: 'yellow'
            } // 默认只设定了图例文字颜色（详见textStyle） ，更个性化的是，要指定文字颜色跟随图例，可设color为'auto'
        },


        title: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderColor: '#ccc',
            textStyle: {
                fontSize: 18,
                fontWeight: 'normal',
                color: '#008acd'

            },
            subtextStyle: {
                color: '#aaa'
            }
        },


        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderColor: '#333',
            borderRadius: 3,
            borderWidth: 0,
            padding: 5,
            color: '#fff',
            size: 12,
            pointer: {
                type: '', //line,cross,shadow  暂时该配置是由代码逻辑控制，不同的图表只是不一样的类型，避免蛋疼且繁琐的逻辑代码判断
                lineStyle: {
                    color: '#48b',
                    width: 2,
                    type: 'solid'
                },
                crossStyle: {
                    color: '#1e90ff',
                    width: 1,
                    type: 'dashed'
                },
                shadowStyle: {
                    color: 'rgba(150,150,150,0.3)',
                    width: 'auto',
                    type: 'default'
                }
            }
        },


        //  工具箱样式
        toolbox: {
            textStyle: {},
            backgroundColor: 'rgba(0,0,0,0)',
            borderColor: '#ccc',
            borderWidth: 0,
            color: ['#1e90ff', '#22bb22', '#4b0082', '#d2691e'],
            disableColor: '#ddd', // 失效颜色
            effectiveColor: 'red', // 生效颜色
            feature: {
                mark: {},
                dataView: {},
                dataZoom: {
                    dataBackgroundColor: 'rgba(181,195,52,0.3)', // 数据背景颜色
                    fillerColor: 'rgba(181,195,52,0.2)', // 填充颜色
                    handleColor: '#27727B'
                },
                magicType: {},
                restore: {
                    color: '#1e90ff'
                },
                saveAsImage: {}
            }
        },


        line: {
            symbol: {
                style: {
                    //r: 3,
                    //lineWidth: 2,
                    size: 3,
                    emptyColor: '#fff'

                }
            },
            style: {
                normal: {
                    width: 2,
                    opacity: 1,
                    type: 'solid'
                }
            }
        },


        bar: {
            style: {
                normal: {},
                hightlightStyle: {}
            },
        },


        scatter: {
            style: {
                normal: {
                    opacity: 0.7,
                    iconType: 'circle',

                },
                hightlightStyle: {}
            }
        },


        k: {
            style: {
                normal: {
                    width: 1,
                    color: '#5ab1ef',
                    color0: '#d87a80'
                },
                hightlightStyle: {}
            }
        },

        pie: {
            totalTextStyle: {
                textFont: '15px Arial',
                color: 'black',
                opacity: 1,
                textAlign: 'center',
                formatter: function (a) {
                    return 'total\n' + a;
                }
            },
            sectorStyle: {
                brushType: 'both',
                strokeColor: 'black',
                lineWidth: 1
            }
        },


        radar: {},

        // 是迎合echarts配置，只是针对雷达图
        polar: {
            splitLine: {			//分割线的样式
                show: true,
                lineStyle: {
                    lineWidth: 1,
                    strokeColor: 'rgb(217,217,217)'
                }
            },
            splitArea: {			//分割区域的样式
                show: true,
                defaultColor: 'rgb(239,239,239)',
                areaStyle: {}
            },
            radialLine: {			//发射线的样式
                strokeColor: 'rgb(217,217,217)',
                lineWidth: 1,
                opacity: 1
            },
            textStyle: {
                color: 'balck',
                textFont: '12px Arial'
            }
        }


    };

    return theme;
});