/**
 * 折线
 * @author C L
 *
 */
define(function(require) {
	'use strict';
	var Base = require('./base');
	var zr_util = require('../zrender/tool/util');
	var config = require('../conf');
	var animate = require('../util/animation');
	var Polygon = require('../zrender/shape/Polygon');
	var Text = require('../zrender/shape/Text');
	var GaugePointerShape = require('../util/shape/GaugePointer');
	var zr_event = require('../zrender/tool/event');
	var Circle = require('../zrender/shape/Circle');
	/* 正N边形 */
	var IsogonShape = require('../zrender/shape/Isogon');
	var Sector = require('../zrender/shape/Sector');
	var Animation = require('../zrender/animation/Animation'); 
	var Line = require('../zrender/shape/Line');
	var Color = require('../zrender/tool/color');
	var ImageShape = require('../zrender/shape/Image');

	var NumberUtil = require('../util/number');

	/**
	 * 这里的option是进过值轴处理的seriesGroup
	 * @param {Object} option
	 * @param {Object} type
	 * @param {Object} charts
	 */
	function Gauge(option, type, charts) {
		Base.call(this, option, type, charts);
		/*
		 * 此数组保存所有的点的集合，跟newPointArray不同的是，
		 * newPointArray在数据存在空的情况时可能是包含几个点集合的二维数组
		 */
		this.reload = true;

		this.pointShapeMap = {};

		this.itemShapeMap = {};

		this._paramMap={};

		this.pointerShape;
		this.pointerClickShape;


		/*---以维度包装所有的对象数据---*/
		this.gourpByModeName = {};

		this.tooltipShapeMap = {};

		/* 存放data中包装后对象的list */
		this.itemDataList = [];
		this.refresh(option);
	}

	Gauge.prototype.refresh = function(newOption) {
		if (newOption) {
			this.option = newOption;
		}

		this.reviseOption(this.option);

		this.animation = zr_util.merge(this.option.animation ||{},config.animation)


		this.backupShapeList();

		this.load();
	}



	Gauge.prototype.load = function() {

		/* 重新包装axisLine.lineStyle.color原始数据，将它的起始角度放进去 */
		this.caculateColorArray();

		/* 画出表盘 */
		this._bulidBatholith();

		/* 画出title */
		this._bulidTitle();

		this._buildPointer();

		/* 画出指针的取值数，在表盘中显示 */
		this._buildDetail();



		this.addShapeList();

	}


	/*
		将axisline的color的数据重新包装一下
	*/
	Gauge.prototype.caculateColorArray = function(){
		var serie = this.option,
			_colorArray = serie.axisLine.lineStyle.color,
			totalDegree = serie.startAngle - serie.endAngle,
			_nowDegree = serie.startAngle,
			_percent,
			_degree;

		for(var i = 0;i < _colorArray.length;i++){
			_percent = _colorArray[i][0];
			if(i == 0){
				_degree = totalDegree * _percent;
			}else{
				_degree = totalDegree * (_percent -  _colorArray[i - 1][0]);
			}

			var startDegree = _nowDegree,
				endDegree = _nowDegree - _degree;

			_colorArray[i]['startDegree']= _nowDegree;
			_colorArray[i]['endDegree']= _nowDegree - _degree;

			_nowDegree = _nowDegree - _degree;
		}

		/* 包装半径，圆心桌边等数据到this._paramMap中去 */
		var radius = NumberUtil.parseRadius(this.zr,serie.radius)[1],
			r0 = radius - serie.axisLine.lineStyle.width;
		var center = NumberUtil.parseCenter(this.zr,serie.center),
			totalDegree = (serie.startAngle - serie.endAngle); 

		this._paramMap['outRadius'] = radius;
		this._paramMap['innerRadius'] = r0;
		this._paramMap['centerX'] = center[0];
		this._paramMap['centerY'] = center[1];
		this._paramMap['totalDegree'] = totalDegree;
	}

	/* 画出data 意外的表盘部分,不会变的部分 */
	Gauge.prototype._bulidBatholith = function(){
		var serie = this.option,
			axisLine = serie.axisLine,
			colorArray = serie.axisLine.lineStyle.color;

		var _colorArray,
			_color;

		for(var i = 0;i < colorArray.length;i++){
			_colorArray = colorArray[i],
			_color = _colorArray[1];
			var angleShape = new Sector({
				style: {
					x: this._paramMap.centerX,
					y: this._paramMap.centerY,
					r: this._paramMap['outRadius'],
					r0: this._paramMap['innerRadius'],
					startAngle: _colorArray.endDegree,
					endAngle: _colorArray.startDegree,
					brushType: 'fill',
					color:_color
				},
				_seriesIndex:serie.name,
				_dataIndex:'sector'+ i,
				hoverable: false
			});
			this.shapeList.push(angleShape);
		}

		var axisTick = serie.axisTick,
			axisLabel = serie.axisLabel,
			_splitNumber = axisTick.splitNumber, // 每一大段分为多少小段
			totalSecNumber = serie.splitNumber * _splitNumber,
			verDregree = Math.abs(serie.startAngle - serie.endAngle) / totalSecNumber,
			xStart,
			yStart;
		var _size = (serie.max - serie.min) / serie.splitNumber,
			labelLoopTime=0,
			labelShape,
			labelColor,
			labelFont,
			textAlign,
			labelX,
			labelY;
		for(var i = 0 ;i <= totalSecNumber; i++){  
			var _degree =  serie.startAngle - verDregree * i,
				_angle = (360 - _degree) * Math.PI / 180;

			if(i % _splitNumber == 0){
				xStart = this._paramMap.centerX + (this._paramMap.outRadius - serie.splitLine.length) * Math.cos(_angle);
				yStart =  this._paramMap.centerY + (this._paramMap.outRadius - serie.splitLine.length) * Math.sin(_angle);

				labelX = this._paramMap.centerX + (this._paramMap.outRadius - serie.splitLine.length - 10) * Math.cos(_angle);
				labelY =  this._paramMap.centerY + (this._paramMap.outRadius - serie.splitLine.length -10) * Math.sin(_angle);

				/* 在长分割线的地方，还要画出label*/
				if(axisLabel.show){
					var number = labelLoopTime * _size + serie.min,
						_text = number % 1 == 0 ? number : number.toFixed(1);

					if(_degree > -90 && _degree < 90)
						textAlign = 'right';
					else if(_degree > 90 && _degree < 270)
						textAlign = 'left';
					else
						textAlign='center';

					labelColor = axisLabel.textStyle.color == 'auto' ? this.getColorByDegree(_degree) : axisLabel.textStyle.color;
					labelFont = axisLabel.textStyle;

					/* label的shape */
					labelShape = new Text({
						style:{
							text: i == totalSecNumber ? serie.max :  _text,
				            x: labelX,
				            y: labelY,
				            textAlign: textAlign,
				            textFont: this.getFont(labelFont),
				            color:labelColor
						},
						_seriesIndex:serie.name,
						_dataIndex:_text,
						hoverable:false
					});

					this.shapeList.push(labelShape);
					labelLoopTime++;
				}
			}else{
				if(axisTick.show == false)
					continue;
				xStart = this._paramMap.centerX + (this._paramMap.outRadius - axisTick.length) * Math.cos(_angle);
				yStart =  this._paramMap.centerY + (this._paramMap.outRadius - axisTick.length) * Math.sin(_angle);
			}

			var tickLine = new Line({
				style:{
					xStart: xStart,
					yStart: yStart,
					xEnd: this._paramMap.centerX + this._paramMap.outRadius * Math.cos(_angle),
					yEnd: this._paramMap.centerY + this._paramMap.outRadius * Math.sin(_angle),
					strokeColor: this.getColorByDegree(_degree),
					lineWidth: 2,
					brushType:'stroke'
				},
				_seriesIndex:serie.name,
				_dataIndex:'splitline'+i,
				hoverable:false
			});
			this.shapeList.push(tickLine);
		}
	};


	/* 画出title */
	Gauge.prototype._bulidTitle = function(){
		var serie = this.option,
			name = serie.data[0].name != null ? serie.data[0].name : '';
		if(!serie.title.show || name =='') 
			return;

		var title = serie.title,
			offsetCenter = title.offsetCenter,
			textStyle = title.textStyle;

		var x = this._paramMap.centerX + NumberUtil.parsePercent(offsetCenter[0], this._paramMap.outRadius);
        var y = this._paramMap.centerY + NumberUtil.parsePercent(offsetCenter[1], this._paramMap.outRadius);

        var nameShape = new Text({
			style: {
				text: name,
				x: x,
				y: y,
				textAlign: 'center',
				textFont: this.getFont(textStyle),
				color: textStyle.color == 'auto' ? 'black' : textStyle.color ,
				lineWidth:10
			},
			_seriesIndex:serie.name,
			_dataIndex:name,
			hoverable: false
        });

        this.shapeList.push(nameShape);
	}


	/* 画出detail 		*/
	Gauge.prototype._buildDetail = function(){
		var serie = this.option,
			data = serie.data;
		if (!serie.detail.show) {
			return;
		}

		var detail = serie.detail;
		var offsetCenter = detail.offsetCenter;
		var color = detail.backgroundColor;
		var textStyle = detail.textStyle;
		var textColor = textStyle.color;
		var x = this._paramMap.centerX + NumberUtil.parsePercent(offsetCenter[0], this._paramMap.outRadius);
        var y = this._paramMap.centerY + NumberUtil.parsePercent(offsetCenter[1], this._paramMap.outRadius);

        var startDegree = serie.startAngle,
			startAngle = startDegree * Math.PI / 180,
			total = serie.max - serie.min,
			endDegree = (serie.startAngle - this._paramMap.totalDegree / total * (data[0].value - serie.min));

        if(textColor == 'auto')
        	textColor = this.getColorByDegree(endDegree);

        var textContent = Number(data[0].value);
        
		var textShape = new Text({
			style:{
				text:this.getLabelText(detail.formatter, textContent),
				x:x,
				y:y,
				textAlign: 'center',
				textFont: this.getFont(textStyle),
				color: textColor ,
				lineWidth:10
			},
			hoverable:false,
			_seriesIndex:serie.name,
			_dataIndex:serie.name + 'detail'

		});	

		this.shapeList.push(textShape);
	}


	
	/* 活出pointer指针 */
	Gauge.prototype._buildPointer = function(){
		var serie = this.option,
			pointer = serie.pointer,
			length = pointer.length,
			width = pointer.width,
			data = serie.data;
		if(pointer.show && pointer.show == false)
			return;

		if(data[0].value >  serie.max ||  data[0].value <  serie.min){
			data[0].value = serie.min;
		}

		var startDegree = this.option.startAngle,
			startAngle = startDegree * Math.PI / 180,
			total = serie.max - serie.min,
			endDegree = (serie.startAngle - this._paramMap.totalDegree / total * (data[0].value - serie.min));

		var angle = endDegree* Math.PI / 180;

		var pointerShape,brushType = pointer.brushType;
		/* 指针样式为自配多边形 */
		if (pointer.type == 'polygon') {
			var pointObj = this._getPointList(pointer.pointList);

			var clickShape = new Polygon({
				zlevel: serie.zlevel,
				z: serie.z + 2,
				clickable: true,
				invisible:true,
				style: {
					pointList:pointObj.clickList,
					brushType : brushType
					// ,
					// color: pointer.color == 'auto' ? this.getColorByDegree(endDegree) : pointer.color,
					// strokeColor : pointer.color == 'auto' ? this.getColorByDegree(endDegree) : pointer.color,
			  //       lineWidth : 1
				},
				hoverable:false,
				_type:'gauge',
				_animationable: true,
				_seriesIndex: serie.name,
				_dataIndex: serie.name+'clickShape',
				_operate: 'gaugePolygonPointer',
				// highlightStyle: {
				// 	brushType: 'fill',
				// 	width: width > 2 ? 2 : (width / 2),
				// 	color: this.backgroundColor //'#fff'
				// }
				// ,
				rotation:[ angle - (Math.PI /2) ,this._paramMap.centerX,this._paramMap.centerY]
			}); 

			pointerShape = new Polygon({
				zlevel: serie.zlevel,
				z: serie.z+1,
				clickable: true,
				style: {
					pointList:pointObj.list,
					brushType : brushType,
					color: pointer.color == 'auto' ? this.getColorByDegree(endDegree) : pointer.color,
					strokeColor : pointer.color == 'auto' ? this.getColorByDegree(endDegree) : pointer.color,
			        lineWidth : 1
				},
				hoverable:false,
				_type:'gauge',
				_animationable: true,
				_seriesIndex: serie.name,
				_dataIndex: serie.name+'polygon',
				_operate: 'gaugePolygonPointer',
				// highlightStyle: {
				// 	brushType: 'fill',
				// 	width: width > 2 ? 2 : (width / 2),
				// 	color: this.backgroundColor //'#fff'
				// }
				// ,
				rotation:[ angle - (Math.PI /2) ,this._paramMap.centerX,this._paramMap.centerY]
			});


			this.pointerClickShape =  clickShape;
			this.pointerShape = pointerShape;

			this.shapeList.push(clickShape);
			this.shapeList.push(pointerShape);
		}
		else if(pointer.type == 'image'){
			var imageUrl = pointer.image;

			pointerShape = new ImageShape({
				style: {
					x: this._paramMap.centerX - (width >> 1),
					y: this._paramMap.centerY - length,
					image: imageUrl,
					width: width,
					height: length
				},
				_type:'gauge',
				_animationable: true,
				_seriesIndex: serie.name,
				_dataIndex: serie.name+'polygon',
				_operate: 'gaugePolygonPointer',
				highlightStyle: {
					shadowColor:pointer.color == 'auto' ? this.getColorByDegree(endDegree) : pointer.color,
					shadowOffsetX:0,
					shadowOffsetY:0,
					shadowBlur:2,
					color: this.backgroundColor //'#fff'
				},
				rotation:[ angle - (Math.PI /2) ,this._paramMap.centerX,this._paramMap.centerY]

			});

			this.pointerShape = pointerShape;
			this.shapeList.push(pointerShape);

		}
		else{
			pointerShape = new GaugePointerShape({
				zlevel: serie.zlevel,
				z: serie.z + 1,
				clickable: true,
				style: {
					x: this._paramMap.centerX,
					y: this._paramMap.centerY,
					r: length,
					startAngle: startAngle,
					angle: angle,
					// _degree: endDegree,
					color: pointer.color == 'auto' ? this.getColorByDegree(endDegree) : pointer.color,
					width: width
				},
				_animationable: true,
				_seriesIndex: serie.name,
				_dataIndex: serie.name,
				_operate: 'gaugePointer',
				highlightStyle: {
					brushType: 'fill',
					width: width > 2 ? 2 : (width / 2),
					color: this.backgroundColor //'#fff'
				}
			});
			var pointShape = new Circle({
				zlevel: serie.zlevel,
				z: serie.z + 1,
				hoverable: false,
				style: {
					x: this._paramMap.centerX,
					y: this._paramMap.centerY,
					r: width / 2.5,
					color: this.backgroundColor, //'#fff'
					strokeColor: 'red'
				}
			});
			this.shapeList.push(pointShape);

			this.pointerShape = pointerShape;
			this.shapeList.push(pointerShape);
		}

		

		
	}

	Gauge.prototype.hide = function(){

	};



	Gauge.prototype._getPointList = function(pointList){

		var pointer = this.option.pointer,
			width = pointer.width,
			height = pointer.length;

		var _x = this._paramMap.centerX - (width >> 1),
			_y = this._paramMap.centerY;

		var obj={};
		var returnArray = [],clickList = [];
		if(pointList instanceof  Array){
			var _position,_point;
			for(var i=0;i < pointList.length;i++){
				_point = pointList[i];
				_position = new Array();
				_position[0] = (_x + _point[0]* width ) ,
				_position[1] = (_y - _point[1]* height);

				returnArray.push(_position);
			}
		}

		obj['list'] = returnArray;
		obj['lightList'] = [[_x + (width >>1),_y],[_x + (width >>1),_y - height]];
		obj['clickList'] = [ [_x,_y], [_x,_y - height], [_x+width,_y-height], [_x+width,_y]];
		return obj;
	};


	/* tooltip的显示设置 */
	Gauge.prototype.ontooltipHover = function(tooltipComponent) {
		var _this = this;
		var position = tooltipComponent.option.tooltip.position;
		var serie = this.option,
			data = serie.data[0];

		var textContent = Number(data.value);


		var shape = this.pointerShape;
		var _this = this;

		if('gauge-pointer' == shape.type || 'image' == shape.type){
			shape.onmouseover = function(e) {
				var txt = serie.name + '<br/>' + data.name + " " + _this.getLabelText(serie.detail.formatter, textContent),
					contentMap = this._textContent;
				tooltipComponent.showModel(zr_event.getX(e.event) + position[0], zr_event.getY(e.event) + position[1], txt);
			};
			shape.onmouseout = function() {
				tooltipComponent.hide();
			};
		}else{
			this.pointerClickShape.onmouseover = function(e) {
				shape.style.brushType = 'stroke';
				_this.zr.modShape(shape);

				var txt = serie.name + '<br/>' + data.name + " " + _this.getLabelText(serie.detail.formatter, textContent),
					contentMap = this._textContent;
				tooltipComponent.showModel(zr_event.getX(e.event) + position[0], zr_event.getY(e.event) + position[1], txt);
			};
			this.pointerClickShape.onmouseout = function() {
				shape.style.brushType = 'fill';
				_this.zr.modShape(shape);
				tooltipComponent.hide();
			};
		}
	};


	/*  
	 根据角度返回color
	*/
	Gauge.prototype.getColorByDegree = function(degree){
		var colorArray = this.option.axisLine.lineStyle.color;
		for(var i = 0;i<colorArray.length;i++){
			if(degree <=  colorArray[i].startDegree && degree >=  colorArray[i].endDegree){
				return colorArray[i][1];
			}
		}
	};


	/**
        * 根据lable.format计算label text
     */
	Gauge.prototype.getLabelText= function(formatter, value) {
		if (formatter) {
			if (typeof formatter === 'function') {
				return formatter.call(this.charts, value);
			} else if (typeof formatter === 'string') {
				return formatter.replace('{value}', value);
			}
		}
		return value;
	};

	zr_util.inherits(Gauge, Base);
	return Gauge;

});

