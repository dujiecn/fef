/**
 * 动画
 * @author j.d
 * */
define(function (require) {
    'use strict';

    var config = require('../conf'),
        zr_util = require('../zrender/tool/util');


    function pointList(zr, oldShape, newShape, duration, easing) {
        var newPointList = newShape.style.pointList;
        var newPointListLength = newPointList.length;
        var oldPointList;
        if (!oldShape) {
            oldPointList = [];
            if (newShape._orient == 'horizontal') {
                var y = newPointList[0][1];
                for (var i = 0; i < newPointListLength; i++) {
                    oldPointList[i] = [newPointList[i][0], y];
                }
            } else if (newShape._orient == 'vertical') {
                var x = newPointList[0][0];
                for (var i = 0; i < newPointListLength; i++) {
                    oldPointList[i] = [x, newPointList[i][1]];
                }
            } else {
                // 饼图的折线动画
                //oldPointList = [newPointList[0],zr_util.clone(newPointList[2]),newPointList[2]];
            }

            // 如果是区域图
            if (newShape._area) {
                oldPointList[0] = zr_util.clone(newPointList[0]);
                oldPointList[newPointListLength - 1] = zr_util.clone(newPointList[newPointListLength - 1]);
            }

            oldShape = {style: {pointList: oldPointList}};
        }

        oldPointList = oldShape.style.pointList;
        var oldPointListLength = oldPointList.length;
        if (oldPointListLength == newPointListLength) {
            // 新旧长度一样
            newShape.style.pointList = oldPointList;
        } else if (oldPointListLength < newPointListLength) {
            //    旧的短 新的长
            newShape.style.pointList = oldPointList.concat(newPointList.slice(oldPointListLength));
        } else {
            //    原来长 新的短
            newShape.style.pointList = oldPointList.slice(0, newPointListLength);
        }
        zr.addShape(newShape);
        newShape.__animating = true;
        zr.animate(newShape.id, 'style')
            .when(duration, {pointList: newPointList})
            .during(function () {
                if (newShape.updateControlPoints) {
                    newShape.updateControlPoints(newShape.style);
                }
            })
            .done(function () {
                newShape.__animating = false;
            })
            .start(easing);


        //    如果存在position位置变换则动画(兼容饼图的线移动动画)
        if (oldShape.position) {
            var newPosition = newShape.position;
            newShape.position = oldShape.position;
            zr.animate(newShape.id, '')
                .when(duration, {position: newPosition})
                .during(function () {
                    if (newShape.updateControlPoints) {
                        newShape.updateControlPoints(newShape.style);
                    }
                })
                .done(function () {
                    newShape.__animating = false;
                })
                .start(easing);
        }

    }


    function icon(zr, oldShape, newShape, duration, easing, delay) {
        if (!oldShape) {
            var x = newShape.style.x;
            var y = newShape.style.y;
            var width = newShape.style.width;
            var height = newShape.style.height;
            newShape.scale = [0.01, 0.01, x + width * 0.5, y + height * 0.5];
            zr.addShape(newShape);
            newShape.__animating = true;
            zr.animate(newShape.id, '')
                .delay(delay)
                .when(
                duration,
                {scale: [1, 1, x + width * 0.5, y + height * 0.5]}
            )
                .done(function () {
                    newShape.__animating = false;
                })
                .start(easing || 'QuinticOut');
        }
        else {
            rectangle(zr, oldShape, newShape, duration, easing);
        }
    }


    function circle(zr, oldShape, newShape, duration, easing, delay) {
        var newR = newShape.style.r;
        if (!oldShape) {
            oldShape = {
                style: {
                    r: 0
                }
            }
        }
        newShape.style.r = oldShape.style.r;
        zr.addShape(newShape);

        zr.animate(newShape.id, 'style')
            .delay(delay)
            .when(duration, {r: newR})
            .start(easing);
    }


    function text(zr, oldShape, newShape, duration, easing) {
        var newX = newShape.style.x;
        var newY = newShape.style.y;
        if (!oldShape) {
            // 饼图的文字动画
            oldShape = {
                style: {
                    x: newShape._center[0],
                    y: newShape._center[1]
                }
            };
        }

        newShape.style.x = oldShape.style.x;
        newShape.style.y = oldShape.style.y;
        zr.addShape(newShape);
        zr.animate(newShape.id, 'style')
            .when(duration, {
                x: newX,
                y: newY
            })
            .during(function () {
                if (newShape.updateControlPoints) {
                    newShape.updateControlPoints(newShape.style);
                }
            })
            .done(function () {
                newShape.__animating = false;
            })
            .start(easing);

    }


    /**
     * 方型动画
     *
     * @param {ZRender} zr
     * @param {shape} oldShape
     * @param {shape} newShape
     * @param {number} duration
     * @param {tring} easing
     */
    function rectangle(zr, oldShape, newShape, duration, easing) {
        var newShapeStyle = newShape.style;
        if (!oldShape) {        // add
            oldShape = {
                position: newShape.position,
                style: {
                    x: newShapeStyle.x,
                    y: newShape._orient == 'vertical'
                        ? newShapeStyle.y + newShapeStyle.height
                        : newShapeStyle.y,
                    width: newShape._orient == 'vertical'
                        ? newShapeStyle.width : 0,
                    height: newShape._orient != 'vertical'
                        ? newShapeStyle.height : 0
                }
            };
        }

        var newX = newShapeStyle.x;
        var newY = newShapeStyle.y;
        var newWidth = newShapeStyle.width;
        var newHeight = newShapeStyle.height;
        var newPosition = [newShape.position[0], newShape.position[1]];

        newShape.style.x = oldShape.style.x;
        newShape.style.y = oldShape.style.y;
        newShape.style.width = oldShape.style.width;
        newShape.style.height = oldShape.style.height;
        newShape.position = oldShape.position;

        zr.addShape(newShape);
        if (newPosition[0] != oldShape.position[0] || newPosition[1] != oldShape.position[1]) {
            zr.animate(newShape.id, '')
                .when(
                duration,
                {
                    position: newPosition
                }
            )
                .start(easing);
        }

        newShape.__animating = true;
        zr.animate(newShape.id, 'style')
            .when(
            duration,
            {
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight
            }
        )
            .done(function () {
                newShape.__animating = false;
            })
            .start(easing);
    }


    function candle(zr, oldShape, newShape, duration, easing) {
        if (!oldShape) {        // add
            var y = newShape.style.y;
            oldShape = {style: {y: [y[0], y[0], y[0], y[0]]}};
        }

        var newY = newShape.style.y;
        newShape.style.y = oldShape.style.y;
        zr.addShape(newShape);
        newShape.__animating = true;
        zr.animate(newShape.id, 'style')
            .when(
            duration,
            {y: newY}
        )
            .done(function () {
                newShape.__animating = false;
            })
            .start(easing);
    }


    function sector(zr, oldShape, newShape, duration, easing) {
        console.log(oldShape)
        if (!oldShape) {        // add
            //if (newShape._animationAdd != 'r') {
            //    oldShape = {
            //        style: {
            //            startAngle: newShape.style.startAngle,
            //            endAngle: newShape.style.startAngle
            //        }
            //    };
            //}
            //else {
            //    oldShape = {style: {r0: newShape.style.r}};
            //}
            newShape.z -= 1;
            zr.addShape(newShape);

        } else {
            var startAngle = newShape.style.startAngle;
            var endAngle = newShape.style.endAngle;


            newShape.style.startAngle = oldShape.style.startAngle;
            newShape.style.endAngle = oldShape.style.endAngle;


            zr.addShape(newShape);
            newShape.__animating = true;
            zr.animate(newShape.id, 'style')
                .when(
                duration,
                {
                    startAngle: startAngle,
                    endAngle: endAngle
                }
            )
                .done(function () {
                    newShape.__animating = false;
                })
                .start(easing);
        }


    }

    function ring(zr, oldShape, newShape, duration, easing) {
        var x = newShape.style.x;
        var y = newShape.style.y;
        var r0 = newShape.style.r0;
        var r = newShape.style.r;

        newShape.__animating = true;

        if (newShape._animationAdd != 'r') {
            newShape.style.r0 = 0;
            newShape.style.r = 0;
            newShape.rotation = [Math.PI * 2, x, y];

            zr.addShape(newShape);
            zr.animate(newShape.id, 'style')
                .when(
                duration,
                {
                    r0: r0,
                    r: r
                }
            )
                .done(function () {
                    newShape.__animating = false;
                })
                .start(easing);
            zr.animate(newShape.id, '')
                .when(
                duration,
                {rotation: [0, x, y]}
            )
                .start(easing);


        }
        else {
            newShape.style.r0 = newShape.style.r;

            zr.addShape(newShape);
            zr.animate(newShape.id, 'style')
                .when(
                duration,
                {
                    r0: r0
                }
            )
                .done(function () {
                    newShape.__animating = false;
                })
                .start(easing);
        }
    }


    /**
     * 折线显示动画
     * @param {Object} zr
     * @param {Object} shape
     * @param {Object} duration
     * @param {Object} easing
     * @param {Object} doneCb
     */
    function showLine(zr, oldShape, newShape, duration, easing) {
        var oldPointList,
            newPointList = newShape.style.pointList,
            len = newPointList.length;

        if (oldShape) {
            oldPointList = oldShape.style.pointList;
        } else {
            //			oldPointList = [];
            //			if (newShape._orient == config.ORIENTATION_TYPE.VERTICAL) {
            //				var x = newPointList[0][0];
            //				for (var i = 0; i < len; i++) {
            //					oldPointList.push([x, newPointList[i][1]]);
            //				}
            //			} else {
            //				var y = newPointList[0][1];
            //				for (var i = 0; i < len; i++) {
            //					oldPointList.push([newPointList[i][0], y]);
            //				}
            //			}
        }


        newShape.style.pointList = oldPointList;
        newShape.style.opacity = 1;
        zr[newShape._actionType || 'addShape'](newShape);
        newShape.__animating = true;
        zr.animate(newShape.id, 'style').when(duration * 0.5, {
            //			scale: [1, 1, 0, 0]
        }).when(duration, {
            pointList: newPointList
        }).during(function () {
            // 贝塞尔曲线 需要更新补点
            newShape.updateControlPoints && newShape.updateControlPoints(newShape.style);
        }).done(function () {
            newShape.__animating = false;
        }).start(easing);
    }

    /**
     * 折线消失动画
     * @param {Object} zr
     * @param {Object} oldShape
     * @param {Object} newShape
     * @param {Object} duration
     * @param {Object} easing
     * @param {Object} done
     * @param {Object} grid
     */
    function hideLine(zr, oldShape, newShape, duration, easing, grid) {
        var oldPointList,
            newPointList = newShape.style.pointList,
            len = newPointList.length;

        if (!oldShape) {
            oldPointList = [];
            if (newShape._orient == config.ORIENTATION_TYPE.VERTICAL) {
                var x = newPointList[0][0];
                for (var i = 0; i < len; i++) {
                    oldPointList.push([x, newPointList[i][1]]);
                }
            } else {
                var y = newPointList[0][1];
                for (var i = 0; i < len; i++) {
                    oldPointList.push([newPointList[i][0], y]);
                }
            }
            oldShape = {
                style: {
                    pointList: oldPointList
                }
            };
        }

        newShape.style.pointList = oldShape.style.pointList;
        zr.addShape(newShape);
        newShape.__animating = true;


        zr.animate(newShape.id, 'style').when(duration, {
            pointList: newPointList,
            opacity: 0
        }).during(function () {
            // 贝塞尔曲线 需要更新补点
            newShape.updateControlPoints && newShape.updateControlPoints(newShape.style);
        }).done(function () {
            newShape.__animating = false;
        }).start(easing);
    }

    /**
     * 显示动画
     * @param {Object} zr
     * @param {Object} oldShape
     * @param {Object} newShape
     * @param {Object} duration
     * @param {Object} easing
     */
    function showBar(zr, oldShape, newShape, duration, easing) {
        var newShapeStyle = newShape.style;
        newShape.style = zr_util.merge(oldShape.style, newShape.style);
        zr[newShape._actionType || 'addShape'](newShape);
        zr.animate(newShape.id, 'style').when(duration, {
            x: newShapeStyle.x,
            y: newShapeStyle.y,
            width: newShapeStyle.width,
            height: newShapeStyle.height
        }).done(function () {
            newShape.__animating = false;
        }).start(easing);
    }


    /**
     * 圆点动画
     * @param {Object} zr
     * @param {Object} shape
     * @param {Object} duration
     * @param {Object} easing
     * @param {Object} doneCb
     */
    function showPoint(zr, oldShape, newShape, duration, easing, doneCb) {
        var newShapeStyle = newShape.style;
        newShape.style = zr_util.merge(oldShape.style, newShape.style);
        zr.addShape(newShape);
        zr.animate(newShape.id, 'style').when(duration, {
            x: newShapeStyle.x,
            y: newShapeStyle.y,
            r: newShapeStyle.r
        }).start(easing);
    }


    /**
     * 圆点动画
     * @param {Object} zr
     * @param {Object} shape
     * @param {Object} duration
     * @param {Object} easing
     * @param {Object} doneCb
     */
    function showIcon(zr, oldShape, newShape, duration, easing, doneCb) {
        var oldScale = oldShape.scale;
        var x = oldScale[2];
        var y = oldScale[3];


        newShape.scale = oldScale;
        zr[newShape._actionType || 'addShape'](newShape);
        zr.animate(newShape.id).when(duration, {
            scale: [1, 1, x, y]
        }).start(easing);


        if (oldShape.style) {
            var newShapeStyle = newShape.style;
            newShape.style = zr_util.merge(oldShape.style, newShape.style);
            zr.modShape(newShape);
            zr.animate(newShape.id, 'style').when(duration, {
                x: newShapeStyle.x,
                y: newShapeStyle.y,
                width: newShapeStyle.width,
                height: newShapeStyle.height
            }).start(easing);
        }


    }


    /**
     * 图形淡入淡出
     * @param {Object} zr
     * @param {Object} oldShape
     * @param {Object} newShape
     * @param {Object} duration
     * @param {Object} easing
     */
    function showShapeByOpacity(zr, newShape, duration, easing) {
        newShape.style.opacity = 0;
        zr.addShape(newShape);

        zr.animate(newShape.id, 'style').when(duration, {
            opacity: 1
        }).start(easing);

    }


    /**
     * 扇形动画
     * @param {Object} zr
     * @param {Object} shape
     * @param {Object} duration
     * @param {Object} easing
     * @param {Object} doneCb
     */
    function showpie(zr, oldShape, newShape, duration, easing) {
        var newShapeStyle = newShape.style;
        newShape.style = oldShape.style;

        zr.addShape(newShape);

        zr.animate(newShape.id, 'style').when(duration, {
            r: newShapeStyle.r,
            r0: newShapeStyle.r0,
            startAngle: newShapeStyle.startAngle,
            endAngle: newShapeStyle.endAngle,

        }).done(function () {
            var elements = zr.storage._elements;
            for (var k in elements) {
                var item = elements[k];
                if (item.isLegend) {
                    item.clickable = true;
                }
            }
        })
            .start(easing);
    }


    function updatePie(zr, oldShapeStyle, newShape, duration, easing) {

        var newShapeStyle = newShape.style;
        newShape.style = oldShapeStyle;

        zr.modShape(newShape);
        zr.animate(newShape.id, 'style').when(duration, {
            startAngle: newShapeStyle.startAngle,
            endAngle: newShapeStyle.endAngle
        }).done(function () {

            var elements = zr.storage._elements;
            for (var k in elements) {
                var item = elements[k];
                if (item.isLegend) {
                    item.clickable = true;
                }
            }

        })
            .start(easing);
    }


    function showpieText(zr, oldShape, newShape, duration, easing) {
        var newShapeStyle = newShape.style;
        newShape.style = oldShape.style;
        zr.addShape(newShape);

        zr.animate(newShape.id, 'style').when(duration, {
            x: newShapeStyle.x,
            y: newShapeStyle.y
        })
            .start(easing);
    }


    // 有连接线的pie在初始化的时候的动画效果
    function showpieLineText(zr, oldShape, newShape, duration, easing) {
        var newShapeStyle = newShape.style;
        newShape.style = oldShape.style;
        zr.addShape(newShape);

        zr.animate(newShape.id, 'style').when(duration, {
            pointList: newShapeStyle.pointList,
        })
            .start(easing);
    }


    function updatepieText(zr, oldStyle, newShape, duration, easing) {
        var newShapeStyle = newShape.style;
        newShape.style = oldStyle;

        zr.modShape(newShape);
        zr.animate(newShape.id, 'style').when(duration, {
            x: newShapeStyle.x,
            y: newShapeStyle.y
            // textAlign:newShapeStyle.textAlign
        })
            .start(easing);
    }

    function updatepieLineText(zr, oldStyle, newShape, duration, easing) {
        var newShapeStyle = newShape.style;
        newShape.style = oldStyle;

        zr.modShape(newShape);
        zr.animate(newShape.id, 'style').when(duration, {
            pointList: newShapeStyle.pointList
            // textAlign:newShapeStyle.textAlign
        })
            .start(easing);
    }


    /**
     * k线图动画
     *
     * @param {ZRender} zr
     * @param {shape} oldShape
     * @param {shape} newShape
     * @param {number} duration
     * @param {tring} easing
     */
    function showK(zr, oldShape, newShape, duration, easing) {
        //		if (!oldShape) { // add
        //			var y = newShape.style.y;
        //			oldShape = {
        //				style: {
        //					y: [y[0], y[0], y[0], y[0]]
        //				}
        //			};
        //		}

        var newY = newShape.style.y;
        newShape.style.y = oldShape.style.y;
        zr.addShape(newShape);
        zr.animate(newShape.id, 'style')
            .when(duration, {
                y: newY
            })
            .start(easing);
    }


    /**
     * gaugePointer动画
     *
     * @param {ZRender} zr
     * @param {shape} oldShape
     * @param {shape} newShape
     * @param {number} duration
     * @param {tring} easing
     */
    function gaugePointer(zr, oldShape, newShape, duration, easing) {
        if (!oldShape) {        // add
            oldShape = {
                style: {
                    angle: newShape.style.startAngle
                }
            };
        }
        var angle = newShape.style.angle,
            color = newShape.style.color;

        newShape.style.angle = oldShape.style.angle;
        newShape.style.color = oldShape.style.color || color;
        zr.addShape(newShape);
        newShape.__animating = true;
        zr.animate(newShape.id, 'style')
            .when(
            duration,
            {
                angle: angle,
                color: color
            }
        )
            .done(function () {
                newShape.__animating = false;
            })
            .start(easing);
    }


    /**
     * gaugePointer动画
     * 
     * @param {ZRender} zr
     * @param {shape} oldShape
     * @param {shape} newShape
     * @param {number} duration
     * @param {tring} easing
     */
    function gaugePolygonPointer(zr, oldShape, newShape, duration, easing) {
        if (!oldShape) {        // add
            oldShape = {
                style:{
                    color:newShape.style.color,
                    strokeColor:newShape.style.strokeColor
                },
                rotation:newShape.rotation
            };
        }

        var rotation =  newShape.rotation,
            color =  newShape.style.color,
            strokeColor = newShape.style.strokeColor;

        newShape.rotation = oldShape.rotation;
        newShape.style.color = oldShape.style.color || color;
        zr.addShape(newShape);

        newShape.__animating = true;
        zr.animate(newShape.id)
            .when(
                duration,
                {   
                    rotation:rotation
                }
            )
            .done(function() {
                newShape.__animating = false;
            })
            .start(easing);


        zr.animate(newShape.id,'style')
            .when(
                duration,
                {   
                    color:color  
                }
            )
            .done(function() {
                newShape.__animating = false;
            })
            .start(easing);

    };

    return {
        pointList: pointList,
        icon: icon,
        rectangle: rectangle,
        text: text,
        circle: circle,
        //pieLineText: pieLineText,
        candle: candle,
        ring: ring,
        sector: sector,
        showLine: showLine,
        //		hideLine: hideLine,
        showBar: showBar,
        showIcon: showIcon,
        showPoint: showPoint,
        showpie: showpie,
        updatePie: updatePie,
        showK: showK,
        showpieText: showpieText,
        updatepieText: updatepieText,
        showpieLineText: showpieLineText,
        updatepieLineText: updatepieLineText,
        showShapeByOpacity: showShapeByOpacity,
        gaugePolygonPointer:gaugePolygonPointer,
        gaugePointer: gaugePointer
    };
});