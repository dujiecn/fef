/**
 * timeLine
 * author C.L
 */
define(function (require) {
    var Base = require('./base'),
        config = require('../conf'),
        zr_util = require('../zrender/tool/util');
    var RectangleShape = require('../zrender/shape/Rectangle');
    var PolygonShape = require('../zrender/shape/Polygon');
    var Line = require('../zrender/shape/Line');
    var Circle = require('../zrender/shape/Circle');
    var Star = require('../zrender/shape/Star');
    var Numbers = require('../util/number');
    var Text = require('../zrender/shape/Text');
    var Group = require('../zrender/Group');

    // pagePreview遮罩的层
    function Pageline(option, type, charts) {
        Base.call(this, option, type, charts);
        this.legend = charts.component.legend;
        this.groupSeries = {};
        this.shapeList = [];
        this.viewShapeList = [];
        this.categoryData = [];
        /* 记录当前所在的游标的页数*/
        this.cursorPageIndex = 1;
        /* 记录上一次游标所在的页数*/
        this.lastCursorPageIndex = 1;

        /* 覆盖在pagepreview上面的半透明层 shape*/
        this.coverShape = new RectangleShape();
        // group块的对象
        this.groupBlockMap = {};
        //记录当前的coverBlock的shape
        this.currentCoverBlock = null;
        // 存放所有的symbol的shape的array
        this.symbolShapeArray = [];
        // 存放所有的symbol的text的array
        this.symbolTextArray = [];

        /*左边箭头*/
        this.leftControl_shape = null;
        /*右边箭头*/
        this.rightControl_shape = null;

        // 是否是初始化的判断flag
        this.isInicial = true;

        /*symbol的移动的group*/
        this.symbolGroup = new Group();

        /*记录上次选中的symbol的index*/
        this.lastSelectdIndex = null;

        this.refresh(option);
    }

    /**
     * 刷新
     * @param {Object} newOption
     */
    Pageline.prototype.refresh = function (newOption) {
        if (newOption) {
            this.option = newOption;
            // 将配置的pageline和默认的pageline合并
            this.option.pageline = this.reviseOption(newOption.pageline);
        }
        this.shapeList = [];

        this.catagoryData = this.groupDataByName();
        if (!this.catagoryData)
            return;

        /* 展示初始化显示的组或者页*/
        this._setDataIndex(this.option.pageline.selected);

        // 绘制
        var groupNumber = 0;
        for (var k in this.catagoryData) {
            groupNumber++;
        }
        // 有一个是_key的，所以是一页或者一组的时候判断为是否大于2
        if (groupNumber > 2)
            this._buildShape();

    };


    /* 设置类目轴和series里面的indexData属性的值，标出要显示的下标*/
    Pageline.prototype._setDataIndex = function (groupName) {
        var indexArray = this.catagoryData[groupName].index;
        var xAxis = this.option.xAxis[0];
        var yAxis = this.option.yAxis[0];

        var series = this.option.series;
        for (var i = 0; i < series.length; i++) {
            series[i]['dataIndex'] = indexArray;
        }

        if (xAxis.type === 'category') {
            this.option.xAxis[0]['dataIndex'] = indexArray;
        } else {
            this.option.yAxis[0]['dataIndex'] = indexArray;
        }
    };

    /**
     * 将数据分组
     * @param {Object} newOption
     */
    Pageline.prototype.groupDataByName = function () {
        var xAxis = this.option.xAxis ? this.option.xAxis[0] : null;
        var yAxis = this.option.yAxis ? this.option.yAxis[0] : null;
        var data;
        var groups = [];

        if (xAxis && xAxis.type === 'category') {
            data = xAxis.data;
        } else if (yAxis && yAxis.type === 'category') {
            data = yAxis.data;
        } else {
            return false;
        }

        return putObjIntoArray.call(this, data);
    };

    /**
     * 绘制图形
     */
    Pageline.prototype._buildShape = function () {
        // 图例元素组的位置参数，通过计算所得x, y, width, height
        this.pagelineLocation = this.getPagelineLocation();

        if (this.option.pageline.cursorShow) {
            this._buildCursor();
        }
        if (this.option.pageline.pageviewShow) {
            this._bulidPageView();
        }
    };

    /* 绘制游标图形 */
    Pageline.prototype._buildCursor = function () {
        var positioner = this.pagelineLocation;
        var pageline = this.option.pageline;
        var backShape = new RectangleShape({
            style: {
                x: this.optimizePixel(positioner.cursor.x, pageline.borderWidth),
                y: this.optimizePixel(positioner.cursor.y, pageline.borderWidth),
                width: positioner.cursor.width,
                height: positioner.cursor.height,
                radius: 0,
                brushType: 'both',
                color: pageline.backgroundColor,
                strokeColor: pageline.borderColor,
                lineWidth: pageline.borderWidth,
            },
            hoverable: false,
            zlevel: pageline.zlevel,
            z: pageline.z
        });
        this.shapeList.push(backShape);


        this._buildSeparator();
        this._buildSymbol();
        if (positioner.cursor.pageNum > 1) //当页数大于一的时候，才画出控制按钮
            this._bulidControls();

        for (var i = 0, l = this.shapeList.length; i < l; i++) {
            this.zr.addShape(this.shapeList[i]);
        }
    };

    //画出兩頭的控制按鈕
    Pageline.prototype._bulidControls = function () {
        var cursorPosition = this.pagelineLocation.cursor,
            cursorPageNum = cursorPosition.pageNum,
            groupStartX = cursorPosition.groupStartX,
            groupEndX = cursorPosition.groupEndX,
            groupWidth = cursorPosition.groupWidth;
        var pageline = this.option.pageline,
            padding = this.parseCssArray(pageline.padding);
        // 画出左边的控制按钮
        var controls = pageline.controls,
            controlWidth = controls.controlWidth,
            controlHeight = controls.controlHeight;
        var midCursorY = cursorPosition.y + (cursorPosition.height >> 1);


        // 左边图标的定义
        this.leftControl_shape = new PolygonShape({
            style: {
                pointList: [
                    [cursorPosition.x + padding[3], midCursorY],
                    [cursorPosition.x + padding[3] + controlWidth, midCursorY - (controlHeight >> 1)],
                    [cursorPosition.x + padding[3] + controlWidth, midCursorY + (controlHeight >> 1)]
                ],
                color: this.cursorPageIndex == 1 ? 'rgb(150,150,150)' : controls.color,
                brushType: controls.brushType,
                strokeColor: controls.strokeColor,
                lineWidth: controls.lineWidth,
                opacity: controls.opacity
            },
            hoverable: controls.hoverable,
            clickable: this.cursorPageIndex == 1 ? false : true,
            zlevel: pageline.zlevel,
            z: pageline.z + 2,
            _position: 'left'
        });
        // 右边图标的定义
        this.rightControl_shape = new PolygonShape({
            style: {
                pointList: [
                    [cursorPosition.x + cursorPosition.width - padding[1] - controlWidth, midCursorY - (controlHeight >> 1)],
                    [cursorPosition.x + cursorPosition.width - padding[1] - controlWidth, midCursorY + (controlHeight >> 1)],
                    [cursorPosition.x + cursorPosition.width - padding[1], midCursorY]
                ],
                color: cursorPageNum == this.cursorPageIndex ? 'rgb(150,150,150)' : controls.color,
                brushType: controls.brushType,
                strokeColor: controls.strokeColor,
                lineWidth: controls.lineWidth,
                opacity: controls.opacity
            },
            hoverable: controls.hoverable,
            clickable: cursorPageNum == this.cursorPageIndex ? false : true,
            zlevel: pageline.zlevel,
            z: pageline.z + 2,
            _position: 'right'
        });

        var _this = this;
        /* group一次移动的距离*/
        var _width = cursorPosition.pageStep * pageline.separateWidth;

        _this.zr.addShape(this.rightControl_shape);
        _this.zr.addShape(this.leftControl_shape);

        this.leftControl_shape.onclick = this.rightControl_shape.onclick = function () {
            var _position = this._position;
            _position == 'left' ? _this.cursorPageIndex-- : _this.cursorPageIndex++;

            _this._cursorAnimate();
            _this.lastCursorPageIndex = _this.cursorPageIndex;
            _this.lastCursorPageIndex = _this.cursorPageIndex;
        }
    };


    //	画出分割图形
    Pageline.prototype._buildSeparator = function () {
        var pageline = this.option.pageline,
            cursorHeight = pageline.cursorHeight,
            controlWidth = pageline.controls.controlWidth,
            padding = this.parseCssArray(pageline.padding),
            separator = pageline.separate,
            type = separator.type;
        if (type == "none") {
            return;
        }
        var style = type == 'line' ? separator.lineStyle : (type == 'circle' ? separator.circleStyle : separator.ringStyle);
        var sepNum = this.catagoryData.length + 1;


        var position = this.pagelineLocation.cursor, //位置信息
            curPageNum = position.pageNum;
        var _y = position.y + (cursorHeight >> 1);
        if (type == 'line') {
            sepShape = new Line({
                style: {
                    xStart: position.x + padding[3] + (curPageNum > 1 ? controlWidth : 0),
                    yStart: _y,
                    xEnd: position.x + position.width - padding[1] - (curPageNum > 1 ? controlWidth : 0),
                    yEnd: _y,
                    strokeColor: '#000',
                    //lineCape:'square',   //butt, round, square
                    lineWidth: style.lineWidth,
                    lineType: style.lineType, //dotted,dashed
                    strokeColor: style.strokeColor

                },
                hoverable: false,
                zlevel: pageline.zlevel,
                z: pageline.z
            });
        }
        this.shapeList.push(sepShape);
    };

    /*
     绘制symbols
     */
    Pageline.prototype._buildSymbol = function () {
        var pageline = this.option.pageline,
            cursorHeight = pageline.cursorHeight,
            separateWidth = pageline.separateWidth,
            symbol = pageline.symbol,
            padding = this.parseCssArray(pageline.padding),
            circleStyle = symbol.circleStyle;
        type = symbol.type,
            fontStyle = symbol.fontStyle,
            controlWidth = pageline.controls.controlWidth,
            symbolStyle = null;
        var position = this.pagelineLocation.cursor, //位置信息
            stepNum = position.pageStep,
            curPageNum = position.pageNum; //游标的页数

        var cataData = this.catagoryData;

        //记录循环的次数
        var _time = 0;
        var _y = cursorHeight >> 1;
        var keyArray = cataData['_key'];
        // 组名是否上下交叉显示
        var isCross = fontStyle.isCross || false;
        for (var key in cataData) {
            if (key == '_key')
                continue;
            var _thisX = curPageNum > 1 ? separateWidth * _time + (separateWidth >> 1) : separateWidth * _time;

            if (pageline.selected == keyArray[_time])
                this.lastSelectdIndex = _time;
            if (type == 'circle') {
                symbolStyle = symbol.circleStyle;
                var symbolShape = new Circle({
                    style: {
                        x: _thisX,
                        y: _y,
                        r: symbolStyle.r,
                        brushType: symbolStyle.brushType,
                        color: symbolStyle.color, //pageline.selected == keyArray[_time] ? circleStyle.strokeColor : circleStyle.color,
                        strokeColor: symbolStyle.strokeColor,
                        lineWidth: symbolStyle.lineWidth
                    },
                    ignore: true,
                    hoverable: symbolStyle.hoverable,
                    clickable: true,
                    zlevel: pageline.zlevel,
                    z: pageline.z + 1,
                    highlightStyle: symbolStyle.highlightStyle,
                    groupName: keyArray[_time],
                    _index: _time
                });

                this.symbolShapeArray.push(symbolShape);
            } else if (type == 'star') {
                symbolStyle = symbol.starStyle;
                var symbolShape = new Star({
                    style: {
                        x: _thisX,
                        y: _y,
                        r: symbolStyle.radius,
                        n: symbolStyle.n,
                        brushType: symbolStyle.brushType,
                        color: symbolStyle.color,
                        strokeColor: symbolStyle.strokeColor,
                        lineWidth: symbolStyle.lineWidth
                    },
                    ignore: true,
                    hoverable: symbolStyle.hoverable,
                    clickable: true,
                    zlevel: pageline.zlevel,
                    z: pageline.z + 1,
                    highlightStyle: symbolStyle.highlightStyle,
                    groupName: keyArray[_time],
                    _index: _time
                });

                this.symbolShapeArray.push(symbolShape);
            }

            var _yPoint;
            if (isCross) {
                _yPoint = _time % 2 == 0 ? _y + fontStyle.lineHeight : _y - fontStyle.lineHeight;
            } else {
                _yPoint = _y + fontStyle.lineHeight
            }

            var textShapge = new Text({
                style: {
                    text: keyArray[_time], //this.catagoryData[i].group,
                    x: _thisX,
                    y: _yPoint,
                    textAlign: fontStyle.textAlign,
                    color: symbolStyle.strokeColor,
                    strokeColor: symbolStyle.strokeColor,
                    textFont: fontStyle.textFont
                },
                ignore: true,
                hoverable: false,
                zlevel: pageline.zlevel,
                z: pageline.z + 1,
                highlightStyle: symbolStyle.highlightStyle
            });

            this.symbolTextArray.push(textShapge);
            _time++;
        }

        var _selectedIndex = 1;
        // 根据selected计算出当前的游标应该在哪一页
        var selected = pageline.selected;
        var _cataSize = 0;
        for (var k in cataData) {
            if (k == '_key')
                continue;
            _cataSize++;
            if (k == selected) {
                _selectedIndex = _cataSize;
            }
        }
        this.cursorPageIndex = Math.ceil(_selectedIndex / stepNum);
        this.lastCursorPageIndex = this.cursorPageIndex;

        // 要根据当前的lastSelectIndex来设置group的起始位置
        this.symbolGroup.position = [curPageNum > 1 ? position.x + padding[3] + controlWidth - stepNum * separateWidth * (this.cursorPageIndex - 1) : position.x + padding[3], position.y];

        // 画出symbol
        this._drawSymbols();

        var viewposition = this.pagelineLocation.pagePreview;

        // 为每个symbol增加点击事件
        for (var i = 0; i < this.symbolShapeArray.length; i++) {
            var _item = this.symbolShapeArray[i];
            var _this = this;
            /*	给每一个symbol增加click的事件	*/
            _item.onclick = function (param) {
                /* 如果点击的是已经选中的symbol那么不做任何操作*/
                if (_this.lastSelectdIndex == this._index)
                    return;

                var groupName = this.groupName;
                _this.symbolShapeArray[_this.lastSelectdIndex].style.color = circleStyle.color;
                this.style.color = circleStyle.strokeColor;
                _this.lastSelectdIndex = this._index;

                //重新绘制图标中的数据
                _this._setDataIndex(groupName);
                _this._messageCenter.notify(
                    config.EVENT_TYPE.PAGELINE_SYMBOL_CLICK,
                    param.event, {},
                    _this.charts
                );

                _this.zr.modShape(_this.symbolGroup);

                if (pageline.pageviewShow) {
                    var _style = _this.groupBlockMap[groupName].style;
                    _this._drawBlockCover(viewposition.x + _style.x, viewposition.y + _style.y, _style.width, _style.height);
                }
            }
        }
        this.zr.addShape(this.symbolGroup);
    };

    /* 画出symbol */
    Pageline.prototype._drawSymbols = function () {
        var pageline = this.option.pageline;
        var position = this.pagelineLocation.cursor, //位置信息
            curPageNum = position.pageNum, //游标的页数
            groupWidth = position.groupWidth;
        var circleStyle = pageline.symbol.circleStyle;

        for (var i = 0; i < this.symbolShapeArray.length; i++) {
            var _itemShape = this.symbolShapeArray[i];
            var _itemText = this.symbolTextArray[i];

            _itemShape.style.color = circleStyle.color;
            // 判断这个symbol和文字是不是该显示出来
            var _thisX = _itemShape.style.x;
            if (curPageNum == 1) {
                _itemShape.ignore = false;
                _itemText.ignore = false;
            } else {
                if (_thisX >= groupWidth * (this.cursorPageIndex - 1) && _thisX <= groupWidth * this.cursorPageIndex) {
                    _itemShape.ignore = false;
                    _itemText.ignore = false;
                } else {
                    _itemShape.ignore = true;
                    _itemText.ignore = true;
                }
            }

            // 选中的点的颜色的设置
            if (this.lastSelectdIndex == i) {
                _itemShape.style.color = circleStyle.strokeColor;
            }

            this.symbolGroup.addChild(_itemShape);
            this.symbolGroup.addChild(_itemText);
        }

        this.zr.modShape(this.symbolGroup);

    }

    // 计算pageline的位置x,y,width,height
    Pageline.prototype.getPagelineLocation = function () {
        var grid = this.option.grid;
        var zr = this.zr;
        var pageline = this.option.pageline; // 	合并处理后的pageline对象
        var previewHeight = pageline.pagePreview.height, // pagepreview的高度
            padding = this.parseCssArray(pageline.padding), // 游标的padding
            type = pageline.type, // 类型是num还是group
            isReverse = pageline.reversal, // 两个图形是否翻转（调换位置）
            position = pageline.position, //是在图形的上方还是下方
            borderWidth = pageline.borderWidth,
            separeteLength = pageline.separateWidth, //分割图形的宽度
            symbolWidth = pageline.symbolWidth, //symbol的图形的宽度
            controlWidth = pageline.controls.controlWidth; //控制按钮的宽度

        // cursor的最大宽度就是和图形的宽度一样，也就是和pageview的宽度一样
        var curMaxWidth = zr.getWidth() - grid.x - grid.x2;

        var separaterNum = this.catagoryData['_key'].length - 1,
            symbolNum = this.catagoryData['_key'].length;

        var cursorX, cursorY, cursorWidth, cursorHeight = pageline.cursorHeight,
            cursorPageNum, cursorPageStep,
            viewX, viewY, viewWidth, viewHeight;

        // cursor的总长度，有可能大于图形的长度
        var totalWidth = borderWidth + padding[3] + (separaterNum + 1) * separeteLength + padding[1];
        // cursor的页数

        if (separaterNum * separeteLength + borderWidth + padding[3] + padding[1] <= curMaxWidth) {
            cursorPageNum = 1;
            cursorPageStep = separaterNum;
        } else {
            cursorPageStep = Math.floor((curMaxWidth - (padding[3] + padding[1] + (controlWidth << 1))) / separeteLength);
            cursorPageNum = Math.ceil(symbolNum / cursorPageStep);
        }

        cursorWidth = cursorPageNum > 1 ? cursorPageStep * separeteLength + padding[1] + padding[3] + (controlWidth << 1) : totalWidth - separeteLength;
        cursorX = (zr.getWidth() - cursorWidth) >> 1;

        if (pageline.cursorShow && !pageline.pageviewShow) {
            if (position == 'top') { //游标在图形的上方
                var top = pageline.top;
                cursorY = top;
            } else { //游标在图形的下方
                var bottom = pageline.bottom;
                cursorY = zr.getHeight() - bottom - cursorHeight - (borderWidth >> 1);
            }
        } else if (!pageline.cursorShow && pageline.pageviewShow) {
            viewWidth = zr.getWidth() - grid.x - grid.x2;
            viewX = (zr.getWidth() - viewWidth) >> 1;
            viewHeight = pageline.pagePreview.height;

            if (position == 'top') { //游标在图形的上方
                var top = pageline.top;
                viewY = top;
            } else { //游标在图形的下方
                var bottom = pageline.bottom;
                viewY = zr.getHeight() - bottom - cursorHeight - (borderWidth >> 1);
            }
        } else {
            viewWidth = zr.getWidth() - grid.x - grid.x2;
            viewX = (zr.getWidth() - viewWidth) >> 1;
            viewHeight = pageline.pagePreview.height;

            if (position == 'top') {
                var top = pageline.top;
                if (isReverse) { //翻转了，pagePreview在上面
                    viewY = top;
                    cursorY = top + pageline.distance;
                } else {
                    cursorY = top;
                    viewY = top + pageline.distance;
                }
            } else {
                var bottom = pageline.bottom;
                if (isReverse) { //翻转了，pagePreview在上面
                    viewY = zr.getHeight() - bottom - cursorHeight - pageline.distance - viewHeight - (borderWidth >> 1);
                    cursorY = zr.getHeight() - bottom - cursorHeight - (borderWidth >> 1);
                } else {
                    cursorY = zr.getHeight() - bottom - cursorHeight - pageline.distance - viewHeight - (borderWidth >> 1);
                    viewY = zr.getHeight() - bottom - viewHeight - (borderWidth >> 1);
                }
            }
        }

        return {
            cursor: {
                x: cursorX,
                y: cursorY,
                width: cursorWidth,
                height: cursorHeight,
                pageNum: cursorPageNum,
                pageStep: cursorPageStep,
                groupWidth: cursorPageStep * separeteLength,
                groupStartX: cursorX + padding[3] + controlWidth,
                groupEndX: cursorX + cursorWidth - padding[1] - controlWidth
            },
            pagePreview: {
                x: viewX,
                y: viewY,
                width: viewWidth,
                height: viewHeight
            }
        }
    };

    // 计算pageline的位置x,y,width,height
    Pageline.prototype._bulidPageView = function () {
        var location = this.pagelineLocation;
        curLocation = location.cursor,
            previewLocation = location.pagePreview;
        var pageline = this.option.pageline;
        var position = this.pagelineLocation.pagePreview;
        var preview = pageline.pagePreview;
        // 背景的边框
        var _rectShap = new RectangleShape({
            style: {
                x: this.optimizePixel(position.x, preview.borderWidth),
                y: this.optimizePixel(position.y, preview.borderWidth),
                width: position.width,
                height: position.height,
                radius: 0,
                brushType: 'stroke',
                color: preview.color,
                strokeColor: preview.backgroundColor,
                lineWidth: preview.borderWidth
            },
            hoverable: false,
            zlevel: pageline.zlevel,
            z: pageline.z,
            clickable: true
        });

        this.viewShapeList.push(_rectShap);

        this._buildLineArea();
        this._bulidCover();

        for (var i = 0, l = this.viewShapeList.length; i < l; i++) {
            this.zr.addShape(this.viewShapeList[i]);
        }
    };

    /* 画出pagepreview的当前页的样式，效果是增加透明度 */
    Pageline.prototype._bulidCover = function () {
        var position = this.pagelineLocation.pagePreview;
        var pageline = this.option.pageline;
        var viewWidth = position.width;
        // 计算这个pageview里面一个画了多少个点
        var viewItemNum = 0,
            _vtp = 0;
        for (var k in this.catagoryData) {
            if (k != '_key') {
                viewItemNum += this.catagoryData[k].index.length;
                _vtp = viewWidth / viewItemNum;
            }
        }

        var _x = 0;
        var shapeGroup = new Group();
        shapeGroup.position[0] = position.x;
        shapeGroup.position[1] = position.y;
        var isFirst = true;
        var _time = 0;
        for (var k in this.catagoryData) {
            var _length = 0;
            if (k != '_key') {
                var _itemNum = this.catagoryData[k].index.length;
                _length = _itemNum * _vtp;
                var groupBlock = new RectangleShape({
                    invisible: true,
                    style: {
                        x: _x,
                        y: 0,
                        width: _length,
                        height: position.height
                    },
                    hoverable: false,
                    zlevel: pageline.zlevel,
                    z: pageline.z,
                    clickable: true,
                    groupName: k,
                    _index: _time
                });
                this.groupBlockMap[k] = groupBlock;
                var _this = this;
                groupBlock.onclick = function (param) {
                    /* 点击的是当前的块，不做重新绘制*/
                    if (_this.lastSelectdIndex == this._index)
                        return;
                    _this.groupBlockClick(this, position.x + this.style.x, position.y + this.style.y,
                        this.style.width, this.style.height, this.groupName);

                    // 重新绘制图标中的数据
                    _this._setDataIndex(this.groupName);
                    _this._messageCenter.notify(
                        config.EVENT_TYPE.PAGELINE_SYMBOL_CLICK,
                        param.event, {
                            // status:pagelineSelf._selectedMap[itemName]
                        },
                        _this.charts
                    );
                }

                this.zr.addShape(this.coverShape);
                shapeGroup.addChild(groupBlock);
                _time++;
                _x += _length;
            }
        }

        this.viewShapeList.push(shapeGroup);

        var lastSelectd = pageline.selected;
        // 画出第一次的位置
        var _style = _this.groupBlockMap[lastSelectd].style;
        this._drawBlockCover(position.x + _style.x, position.y + _style.y, _style.width, _style.height);

    };

    // pagepreview的点击事件，切换组或者页
    Pageline.prototype.groupBlockClick = function (_self, x, y, width, height, groupname) {

        var pageline = this.option.pageline;
        this._drawBlockCover(x, y, width, height);

        //如果有cursor显示的话，促发symbol的click的联动效果
        if (this.option.pageline.cursorShow) {

            var position = this.pagelineLocation.cursor, //位置信息
                curPageNum = position.pageNum, //游标的页数
                pageStep = position.pageStep;

            this.cursorPageIndex = Math.ceil((_self._index + 1) / pageStep);

            // 实现动画
            if (curPageNum > 1)
                this._cursorAnimate();

            this.lastCursorPageIndex = this.cursorPageIndex;
            this.lastSelectdIndex = _self._index;
            // 画出相应的图形
            this._drawSymbols();
        }
    };

    /* 游标的翻页动画实现*/
    Pageline.prototype._cursorAnimate = function () {
        var movePageNum = this.cursorPageIndex - this.lastCursorPageIndex;
        if (movePageNum == 0) {
            return;
        }

        var pageline = this.option.pageline,
            controls = pageline.controls;
        var position = this.pagelineLocation.cursor, //位置信息
            groupStartX = position.groupStartX,
            groupEndX = position.groupEndX,
            pageNum = position.pageNum;
        groupWidth = position.groupWidth;
        var _moveWidth = movePageNum * groupWidth;

        var cur_position = [this.symbolGroup.position[0] - _moveWidth, this.symbolGroup.position[1]];
        var childArray = this.symbolGroup.children();
        var _this = this;

        /* 动画之前让左右两个箭头都不可用*/
        _this.leftControl_shape.clickable = false;
        _this.rightControl_shape.clickable = false;

        for (var k in _this.groupBlockMap) {
            _this.groupBlockMap[k].clickable = false;
        }

        this.zr.animate(this.symbolGroup.id).when(400, {
            position: cur_position
        }).during(function () {
            for (var i = 0; i < childArray.length; i++) {
                var child = childArray[i];
                var _x = child.style.x + _this.symbolGroup.position[0];
                if (_x < groupEndX && _x > groupStartX) {
                    child.ignore = false;
                } else {
                    child.ignore = true;
                }
            }
        }).done(function () {
            if (_this.cursorPageIndex == 1) {
                _this.leftControl_shape.style.color = 'rgb(150,150,150)';
                _this.leftControl_shape.clickable = false;
                _this.rightControl_shape.style.color = controls.color;
                _this.rightControl_shape.clickable = true;
            } else if (_this.cursorPageIndex == pageNum) {
                _this.rightControl_shape.style.color = 'rgb(150,150,150)';
                _this.rightControl_shape.clickable = false;
                _this.leftControl_shape.style.color = controls.color;
                _this.leftControl_shape.clickable = true;
            } else {
                _this.leftControl_shape.style.color = controls.color;
                _this.rightControl_shape.style.color = controls.color;
                _this.leftControl_shape.clickable = true;
                _this.rightControl_shape.clickable = true;
            }

            for (var k in _this.groupBlockMap) {
                _this.groupBlockMap[k].clickable = true;
            }

            _this.zr.modShape(_this.leftControl_shape);
            _this.zr.modShape(_this.rightControl_shape);

            /* 如果是第一页或者最后一页，那么相应的箭头颜色进行灰化处理*/
        }).start('QuadraticOut');

    }

    /* 绘制选中的页或组在pagepreview上的覆盖的状态 */
    Pageline.prototype._drawBlockCover = function (x, y, width, height) {
        var coverStyle = this.option.pageline.pagePreview.coverStyle;
        var style = {
            x: x,
            y: y,
            width: width,
            brushType: coverStyle.brushType,
            height: height,
            color: coverStyle.color,
            lineWidth: coverStyle.lineWidth,
            strokeColor: coverStyle.strokeColor,
            radius: coverStyle.radius,
            opacity: coverStyle.opacity
        }
        var oldStyle = this.coverShape.style;

        this.coverShape['style'] = style;
        this.coverShape['hoverable'] = false;
        this.coverShape['_operate'] = "showbar";
        this.coverShape.zlevel = 10;

        this.animate({
            oldShape: {
                style: oldStyle
            },
            newShape: this.coverShape,
            duration: coverStyle.duration,
            easing: coverStyle.easing
        });
    }


    /* 画出pagepreview里面的区域图形 */
    Pageline.prototype._buildLineArea = function () {
        var position = this.pagelineLocation.pagePreview,
            viewHeight = position.height;
        var group = new Group();
        group.position[0] = position.x;
        group.position[1] = position.y;
        var series = this.option.series;

        //计算最大值最小值和分组之后的series
        this._getMaxMinValue();
        var pointPosition = this._getPointsPosition();
        var toolColor = require('../zrender/tool/color');

        for (var k in pointPosition) {
            // 每条曲线都可能是断线
            var _pointArr = Numbers.getLinePoints(pointPosition[k]);
            var strokColor = this.legend.getColor(k);
            var fillColor = toolColor.alpha(strokColor, 0.5);

            for (var i = 0; i < _pointArr.length; i++) {
                var points = _pointArr[i];

                var sPoint = [points[0][0], viewHeight];
                var ePoint = [points[points.length - 1][0], viewHeight];

                points.splice(0, 0, sPoint);
                points.splice(points.length, 0, ePoint);

                var lineShape = new PolygonShape({
                    style: {
                        pointList: points,
                        brushType: 'both',
                        color: fillColor,
                        strokeColor: strokColor,
                        lineWidth: 1
                    },
                    hoverable: false
                });
                group.addChild(lineShape);
            }
        }

        this.viewShapeList.push(group);
    };

    /* 获得pagepreview里面的每一个值点的位置 */
    Pageline.prototype._getPointsPosition = function () {
        var position = {};
        var viewHeight = this.pagelineLocation.pagePreview.height;
        var viewWidth = this.pagelineLocation.pagePreview.width;
        var stepNum = 0;
        for (var k in this.groupSeries) {
            stepNum = Math.max(stepNum, this.groupSeries[k].length);
        }

        var stepLength = viewWidth / stepNum;
        for (var k in this.groupSeries) {
            var array = [];
            var data = this.groupSeries[k];
            for (var i = 0; i < data.length; i++) {
                var location = [];
                location.push((i + 0.5) * stepLength);
                location.push(viewHeight - data[i]);
                array.push(location);
            }
            position[k] = array;
        }

        return position;
    };

    /**
     根据堆叠分组
     option:根据series里面的index分组的数组
     */
    Pageline.prototype._getMaxMinValue = function () {
        var series = this.option.series;
        var max = series[0].data[0],
            min = series[0].data[0];
        var groupArray = {};
        var _serieData = {};
        for (var i = 0; i < series.length; i++) {
            var serie = series[i];
            if (serie.type != 'line' && serie.type != 'bar' && serie.type != 'k')
                continue;
            var data = serie.data;

            if (serie.type == 'line' || serie.type == 'bar') {
                var stackName = serie.stack;
                if (!stackName) {
                    _serieData[serie.name] = serie.data;
                } else {
                    if (!groupArray[stackName]) {
                        groupArray[stackName] = serie.data;
                        _serieData[serie.name] = serie.data;
                    } else {
                        var resultData = [];
                        var _data = groupArray[stackName];
                        for (var j = 0; j < Math.max(data.length, _data.length); j++) {
                            if (_data[j] == '-' && data[j] == '-') {
                                resultData.push('-');
                            } else {
                                var data1 = _data[j] ? (_data[j] == '-' ? 0 : _data[j]) : 0;
                                var data2 = data[j] ? (data[j] == '-' ? 0 : data[j]) : 0;
                                resultData.push(data1 + data2);
                            }
                        }
                        groupArray[stackName] = resultData;
                        _serieData[serie.name] = resultData;
                    }
                }
            }
            /*  K线图的时候的数据封装 */
            else {
                max = series[0].data[0][0],
                    min = series[0].data[0][0];

                var startDataArray = [];
                var endDataArray = [];
                for (var i = 0; i < data.length; i++) {
                    startDataArray.push(data[i][0]);
                    endDataArray.push(data[i][1]);
                }

                groupArray['startData'] = startDataArray;
                groupArray['endData'] = endDataArray;

                _serieData['startData'] = startDataArray;
                _serieData['endData'] = endDataArray;

            }

        }

        // 找出最大值和最小值
        for (var k in groupArray) {
            var data = groupArray[k];
            for (var i = 0; i < data.length; i++) {
                if (data[i] == '-')
                    continue;
                max = Math.max(max, data[i]);
                min = Math.min(min, data[i]);
            }
        }

        // 将data里面的数值转为y轴的坐标的高度
        var viewHeight = this.pagelineLocation.pagePreview.height;
        var vtp = (viewHeight - 4) / (max - min);
        for (var k in _serieData) {
            var data = _serieData[k];
            var array = [];
            for (var key in this.catagoryData) {
                if (key != '_key') {
                    var indexData = this.catagoryData[key].index;
                    for (var j = 0; j < indexData.length; j++) {
                        array.push((data[indexData[j]] - min) * vtp);
                    }
                }
            }
            this.groupSeries[k] = array;
        }
    };

    zr_util.inherits(Pageline, Base);
    return Pageline;
});

/*
 将对象放到相应的数组的对象的数组中去
 */
function putObjIntoArray(data) {
    var selected = this.option.pageline.selected;

    var groupMap = {
        _key: []
    };
    if (this.option.pageline.type === 'group') {
        for (var i = 0; i < data.length; i++) {
            var _data = data[i];
            if (!groupMap[_data.group]) {
                groupMap[_data.group] = {
                    data: [],
                    index: []
                };
                groupMap._key.push(_data.group);
            }
            groupMap[_data.group].data.push(_data.value);
            groupMap[_data.group].index.push(i);
        }
    } else {
        var pageNum = this.option.pageline.pageSize; //多少页
        var capacity = this.option.pageline.capacity; //每页个数

        if (pageNum) {
            capacity = Math.ceil(data.length / pageNum);
        }
        var index = 1;
        for (var i = 0; i < data.length; i++) {
            var _data = data[i];
            if (i != 0 && i % capacity == 0)
                index++;
            if (!groupMap[index]) {
                groupMap[index] = {
                    data: [],
                    index: []
                };
                groupMap._key.push(index);
            }
            groupMap[index].data.push(_data);
            groupMap[index].index.push(i);
        }
    }

    // 在没有配置selected或者配置的selected不存在的时候，默认显示第一页或者第一组
    if (!selected || !groupMap[selected])
        this.option.pageline.selected = groupMap['_key'][0];

    return groupMap;
}