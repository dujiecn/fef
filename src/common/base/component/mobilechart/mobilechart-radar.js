(function() {

	// 动画函数
	requestAnimationFrame = window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		function(callback) {
			return setTimeout(callback, 1000 / 60);
	};
	// 动画停止函数
	cancelAnimationFrame = window.cancelAnimationFrame ||
		window.webkitCancelAnimationFrame ||
		window.mozCancelAnimationFrame ||
		window.oCancelAnimationFrame ||
		function(id) {
			window.clearTimeout(id);
	};


	// 开发模式
	var debug = true;
	var globalIndex = 0;


	Element.prototype.css = function() {
		if (arguments.length == 2) {
			set(this, arguments[0], arguments[1]);
		} else if (arguments.length == 1 && typeof arguments[0] == 'object') {
			for (var key in arguments[0]) {
				set(this, key, arguments[0][key]);
			}
		}

		function set(element, key, value) {
			if (key == 'transition') {
				element.style.transition =
					element.style.webkitTransition =
					element.style.MozTransition =
					element.style.msTransition =
					element.style.OTransition = value;
			} else if (key == 'transform') {
				element.style.transform =
					element.style.webkitTransform =
					element.style.MozTransform =
					element.style.msTransform =
					element.style.OTransform = value;
			} else if (key == 'boxSizing') {
				element.style.boxSizing =
					element.style.webkitBoxSizing =
					element.style.MozBoxSizing =
					element.style.msBoxSizing =
					element.style.OBoxSizing = value;
			} else if (key == 'borderRadius') {
				element.style.borderRadius =
					element.style.webkitBorderRadius =
					element.style.MozBorderRadius =
					element.style.msBorderRadius =
					element.style.OBorderRadius = value;
			} else if (key == 'userSelect') {
				element.style.webkitUserSelect =
					element.style.mozUserSelect =
					element.style.OUserSelect =
					element.style.msUserSelect =
					element.style.userSelect = value;
			} else {
				element.style[key] = value;
			}
		}
		return this;
	};
	Element.prototype.removeCss = function(prop) {
		var style = this.style;
		for (i in style) {
			if (style[i] == prop) {
				delete style[i];
				style[prop] = '';
			}
		}
	};


	/*
		供外面调用的对象
	*/
	var Radar = function(element) {
		// 判断页面是否加载过
		this.loaded = false;
		// 判断是是否是第一次加载，有些绘制操作只需要操作一次
		this.option = {
			animation: {
				show: true,
				timeout: 2000
			},
			grid: {
				x: 60,
				y: 60,
				x2: 30,
				y2: 16
			}
		};
		this.element = element;
		this.parameters = new Parameters();
		this.container = null;
		this.touch = null;
		this.tween = new Tween();
		this.series = null;
		this.grid = null;
		this.title = null;
		this.legend = null;
		this.tip = null;
		this.type = 'radar';
		this.toolbox = null;
		this.originalOption = null;
		this.fromOption = null;
	};
	Radar.prototype.init = function(option, fromOption) {
		this.loaded = false;
		globalIndex = 0;

		this.fromOption = fromOption;
		// 整合用户设置和默认的值
		util.extend(true, this.option, option);
		// 创建对象
		this.container = new Container(this.element, this.option);
		this.title = new Title(this.option.title, this.parameters);

		// 创建需要的html元素
		this.container.drawHTML();

		this.touch = new Touch(this.container.middleCanvas, this.parameters);
		this.series = new Series(this.option.series, this.touch, this.parameters);


		if (this.option.legend.show != false)
			this.legend = new Legend(this.option.legend, this.touch, this.parameters);

		this.tip = new Tip(this.container.tipElement, this.parameters);
		this.calculateCommonData();
		if (!util.isEmpty(this.option.toolbox) && (this.option.toolbox.show === undefined || this.option.toolbox.show === true)) {
			this.toolbox = new Mobilechart.toolbox(this);
			this.originalOption = util.extend(true, {type:this.type}, this.option);
		}



		// 开始绘制页面(判断是否需要动画)
		this.load(function() {
			// 绑定事件
			this.bindEvent();
		}.bind(this));

		// this.translate2BarOpiton();

		return this;

	};


	// 将当前的canvas保存为图片
	Radar.prototype.saveAsImage = function() {

		var canvas = this.container.middleCanvas;
		var imageUrl = canvas.toDataURL("image/png");
		var imgDiv = document.createElement("div");

		var image = document.createElement("img");
		image.width = canvas.width * 0.5;
		image.height = canvas.height * 0.5;
		image.style.position = 'absolute';
		image.style.left = (document.body.scrollWidth - image.width) * 0.5 + "px";
		image.style.top = (document.body.scrollHeight - image.height) * 0.5 + "px";

		imgDiv.style.width = document.body.scrollWidth + 'px';
		imgDiv.style.height = document.body.scrollHeight + 'px';
		imgDiv.style.left = 0 + "px";
		imgDiv.style.top = 0 + "px";
		imgDiv.style.border = '1px solid black';
		imgDiv.style.backgroundColor = "rgba(0,0,0,0.5)";


		image.src = imageUrl;
		imgDiv.appendChild(image);

		imgDiv.style.position = 'absolute';
		imgDiv.style.zIndex = 1000;

		document.body.appendChild(imgDiv);

		imgDiv.addEventListener("click", function(e) {
			e.stopPropagation();
			if (e.target.nodeName == "DIV") {
				imgDiv.removeChild(image);
				document.body.removeChild(imgDiv);
			}
		}, false);

		//关闭按钮的处理
		var imageClose = document.createElement("img");
		imageClose.src = "res/close.png";
		imageClose.style.position = 'absolute';
		imageClose.style.width = "30px";
		imageClose.style.height = "30px";
		imageClose.style.left = document.body.scrollWidth * 0.5 + image.width * 0.5 - 40 + "px";
		imageClose.style.top = (document.body.scrollHeight - image.height) * 0.5 + 10 + "px";
		imgDiv.appendChild(imageClose);

		if (window.navigator.platform.indexOf("Win") != -1 || window.navigator.platform.indexOf("Mac") != -1) {
			imageClose.addEventListener("click", function(e) {
				e.stopPropagation();
				// imgDiv.removeChild(image);
				document.body.removeChild(imgDiv);
			}, false);
		} else {
			imageClose.addEventListener("touchend", function(e) {
				e.stopPropagation();
				// imgDiv.removeChild(image);
				document.body.removeChild(imgDiv);
			}, false);
		}

	};

	Radar.prototype.toBar = function() {
		var option = this.translate2BarOpiton();
		new Mobilechart.basic(this.element).init(option, this.fromOption || this.originalOption);
	};


	Radar.prototype.toTable = function() {
		var option = this.translate2BarOpiton();
		var seriesOption = option.series;
		var categoryOption = option.xAxis[0];
		var dataLength = categoryOption.data.length;

		var tdStyle = {
			boxSizing : 'border-box',
			border: '1px solid #333',
			padding: 0,
			margin: 0
		}

		var tableStyle = {
			borderCollapse: 'collapse',
			padding: 0,
			margin: 0,
			borderSpacing: '0',
			userSelect: 'none',
			textAlign: 'center',
			position: 'absolute',
			height: '100%',
			top: '0'
		};


		var right_width_data = [];
		var left_width_data = [];
		Array.prototype.push.apply(right_width_data,categoryOption.data);
		for(var i = 0;i < seriesOption.length;i++) {
			Array.prototype.push.apply(right_width_data,seriesOption[i].data);
			left_width_data.push(seriesOption[i].name);
		}
		left_width_data.push(categoryOption.name);

		var leftWidth = getMaxWordWidthFromArray(left_width_data);
		var rightWidth = getMaxWordWidthFromArray(right_width_data);
		if(rightWidth * dataLength + leftWidth < this.container.parentElement.clientWidth) {
			leftWidth = rightWidth = this.container.parentElement.clientWidth / (dataLength + 1); 
		}


		/*
			拼接html
		*/
		// 左上边区域
		var left_top_table = document.createElement('table');
		for (var i = 0; i < 1; i++) {
			var tr = document.createElement('tr');
			var td = document.createElement('td');
			td.innerHTML = categoryOption.name || '';
			td.css(tdStyle).css({
				width:  leftWidth + 'px'
			});
			tr.appendChild(td);
			left_top_table.appendChild(tr);
		}
		left_top_table.css(tableStyle);


		// 左下边的区域
		var left_bottom_table = document.createElement('table');
		for (var i = 0; i < seriesOption.length; i++) {
			var tr = document.createElement('tr');
			var td = document.createElement('td');
			td.innerHTML = seriesOption[i].name;
			td.css(tdStyle).css({
				width:  leftWidth + 'px'
			});
			tr.appendChild(td);
			left_bottom_table.appendChild(tr);
		}
		left_bottom_table.css(tableStyle);


		// 右上边的区域
		var right_top_table = document.createElement('table');
		for (var i = 0; i < 1; i++) {
			var tr = document.createElement('tr');
			for (var j = 0; j < categoryOption.data.length; j++) {
				var td = document.createElement('td');
				td.innerHTML = categoryOption.data[j];
				td.css(tdStyle);
				i == 0 && td.css('width',rightWidth + 'px');
				tr.appendChild(td);
			}
			right_top_table.appendChild(tr);
		}
		right_top_table.css(tableStyle).css('width',rightWidth * j + 'px');




		// 右下边的区域
		var right_bottom_table = document.createElement('table');
		for (var i = 0; i < seriesOption.length; i++) {
			var tr = document.createElement('tr');
			for (var j = 0; j < seriesOption[i].data.length; j++) {
				var td = document.createElement('td');
				td.innerHTML = seriesOption[i].data[j] || '无';
				td.css(tdStyle);
				i == 0 && td.css('width',rightWidth + 'px');
				tr.appendChild(td);
			}
			right_bottom_table.appendChild(tr);
		}
		right_bottom_table.css(tableStyle).css('width',rightWidth * j + 'px');;


		// 最外层的table
		var contentTable = document.createElement('table');
		for (var i = 0; i < 2; i++) {
			var tr = document.createElement('tr');
			for (var j = 0; j < 2; j++) {
				var td = document.createElement('td');
				if (i === 0) {
					if (j === 0) {
						td.appendChild(left_top_table);
						td.css('width',leftWidth + 'px');
					} else {
						td.appendChild(right_top_table);
					}

					td.css(tdStyle).css({
						position: 'relative',
						overflow: 'hidden',
						height : '36px',
						border:'1px solid black'
					});

				} else {
					if (j === 0) {
						td.appendChild(left_bottom_table);
					} else {
						td.appendChild(right_bottom_table);
					}

					td.css(tdStyle).css({
						position: 'relative',
						overflow: 'hidden',
						border:'1px solid black'
					});
				}
				tr.appendChild(td);
			}
			contentTable.appendChild(tr);
		}


		contentTable.css({
			borderCollapse: 'collapse',
			padding: 0,
			margin: 0,
			borderSpacing: '0',
			userSelect: 'none',
			textAlign: 'center',
			width: '100%',
			height: '100%'
		});


		function getMaxWordWidthFromArray(array) {
			var width = Math.MAX_VALUE;
			for(var i = 0;i < array.length;i++) {
				var w = getWordWidth(array[i],'12px','"微软雅黑","宋体",Arial').width;
				if(width == Math.MAX_VALUE || width < w)
					width = w;
			}
			
			var now = new Date().getTime();
			return width + 10;
		}

		function getWordWidth(word,fontSize,fontFamily) {
			
			var div = document.createElement('div');
			div.css({
				position : 'fixed',
				fontSize : fontSize,
				fontFamily : fontFamily,
				display : 'inline-block',
				visibility : 'hidden'
			});
			div.appendChild(document.createTextNode(word));
			document.body.appendChild(div);
			var width = div.offsetWidth;
			var height = div.offsetHeight;
			document.body.removeChild(div);


			return {
				width : width,
				height : height
			}
		}

		var df = document.createDocumentFragment();
		df.appendChild(contentTable);
		return df;
	};



	Radar.prototype.translate2BarOpiton = function() {
		var tempOption = util.extend(true, {}, this.option);
		var xAxis = {},
			xData = []; //x轴对象的封装
		var yAxis = { // y轴对象的封装
			'type': 'value'
		};
		var series = []; // 待封装的新的series对象
		for (var i = 0; i < tempOption.polar[0].indicator.length; i++)
			xData.push(tempOption.polar[0].indicator[i].text);

		xAxis['data'] = xData;
		xAxis['type'] = 'category';

		var oldData = tempOption.series[0].data;
		for (var i = 0; i < oldData.length; i++) {
			var itemSerie = {};
			itemSerie['name'] = oldData[i].name;
			itemSerie['type'] = 'bar';
			var data = [];
			for (var j = 0; j < oldData[i].value.length; j++) {
				data.push(oldData[i].value[j]);
			}
			itemSerie['data'] = data;
			series.push(itemSerie);
		}
		tempOption['xAxis'] = [];
		tempOption['yAxis'] = [];
		tempOption['xAxis'].push(xAxis);
		tempOption['yAxis'].push(yAxis);
		tempOption.series = series;

		// var last = JSON.stringify(tempOption);
		// console.log(last)

		return tempOption;
	};


	Radar.prototype.restore = function() {
		if (this.fromOption && this.fromOption.type != this.type) {
			if (this.fromOption.type == 'basic') {
				new Mobilechart.basic(this.element).init(this.fromOption);
			}
		} else {
			this.option = util.extend(true, {}, this.originalOption);
			this.refresh();
		}
	};


	Radar.prototype.refresh = function() {
		// 重设是否第一次加载
		this.loaded = false;

		this.tip.show = false;

		// 重设容器大小
		this.container.reset();

		// 重新计算需要的值
		this.calculateCommonData();

		// 重新绘制画布
		this.load();
	};


	/*
		画布开始渲染
	*/
	Radar.prototype.load = function(callback) {
		callback = callback || function() {};

		if (this.option.animation.show == true) {
			this.tween.timeout = this.option.animation.timeout;
			this.parameters.progress = 0;
			this.tween.start(null, this.step.bind(this), callback, null);
		} else {
			this.parameters.progress = 1;
			this.draw();
			callback();
		}
	};

	/*
		计算通用的一些数据
	*/
	Radar.prototype.calculateCommonData = function() {

		var polar = this.option.polar[0]
			// 保存根容器的宽高
		this.parameters.rootElementWH = {
			w: this.container.rootElementWidth,
			h: this.container.rootElementHeight
		};

		// 保存背景色
		this.parameters.backgroundColor = this.option.backgroundColor || this.parameters.backgroundColor;

		// 计算雷达的中心的位置
		if (!polar.center) { //默认为放在canvas的中心
			this.parameters.radarCenter.x = this.parameters.rootElementWH.w * 0.5;
			this.parameters.radarCenter.y = this.parameters.rootElementWH.h * 0.5;
		} else {
			this.parameters.radarCenter.x = polar.center[0] > 1 ? polar.center[0] : polar.center[0] * this.parameters.rootElementWH.w;
			this.parameters.radarCenter.y = polar.center[1] > 1 ? polar.center[1] : polar.center[1] * this.parameters.rootElementWH.h;
		}

		this.parameters.radarCenter.radius = polar.radius;
		//在indicator中动态计算出vtp的值，并放入
		var indicator = polar.indicator;
		var radius = polar.radius;
		for (var i = 0; i < indicator.length; i++) {
			indicator[i].vtp = radius / (indicator[i].max - (indicator[i].min ? indicator[i].min : 0));
		}

		//在data中将对应的text名字的数组放入，和value数组形成对应
		var data = this.option.series[0].data;
		var texts = [];
		for (var i = 0; i < indicator.length; i++) {
			texts.push(indicator[i].text);
		}
		for (var i = 0; i < data.length; i++) {
			data[i].text = texts;
			data[i].show = true;
		}

		//如果没有设置legend的垂直高度的位置，默认给20
		if (!this.option.legend.vertical) {
			this.option.legend.vertical = 20;
		}

		// 当每个区域的颜色没有配置的时候，配置默认的值
		for (var i = 0; i < data.length; i++) {
			if (!data[i].itemStyle) {
				var itemStyle = {
					'color': getFillColorByIndex(i)
				};
				data[i]['itemStyle'] = itemStyle;
				data[i]['hasStyle'] = false;
			} else if (!data[i].itemStyle.color) {
				data[i].itemStyle['color'] = getFillColorByIndex(i);
				data[i]['hasStyle'] = false;
			}else{
				data[i]['hasStyle'] = true;
			}
		}
	};

	/*
		初始化动画调用函数
	*/
	Radar.prototype.step = function(progress) {
		this.parameters.progress = progress;
		this.draw();
	};
	Radar.prototype.draw = function() {
		// 如果有动画效果，每次都要clear雷达区域

		var centerX = this.parameters.radarCenter.x,
			centerY = this.parameters.radarCenter.y,
			radius = this.option.polar[0].radius;
		var context = this.container.middleCanvas.getContext("2d");
		context.save();
		context.clearRect(0, 0, this.container.middleCanvas.width, this.container.middleCanvas.height);
		context.fillStyle = this.option.backgroundColor || 'white';
		context.fillRect(0, 0, this.container.middleCanvas.width, this.container.middleCanvas.height);


		this.drawPolar(this.container.middleCanvas);
		this.drawSeries(this.container.middleCanvas);
		this.drawLegend(this.container.middleCanvas);
		this.drawTitle(this.container.middleCanvas);

		context.restore();
		this.loaded = true;
	};

	/*
		绘制图标标题
	*/
	Radar.prototype.drawTitle = function(canvas) {
		this.title.drawTitle(canvas);
	};

	/*
		绘制图例
	*/
	Radar.prototype.drawLegend = function(canvas) {
		if (this.legend)
			this.legend.drawLegend(canvas, this.option.series);
	};

	/*
		绘制图形
	*/
	Radar.prototype.drawSeries = function(canvas) {
		this.series.draw(canvas, this.option);
	};

	/*
		雷达网图
	*/
	Radar.prototype.drawPolar = function(canvas) {
		var polar = this.option.polar[0];
		var indicator = polar.indicator;

		var center = {
			"x": 0,
			"y": 0
		};
		center.x = this.parameters.radarCenter.x;
		center.y = this.parameters.radarCenter.y;

		var context = canvas.getContext("2d");
		context.save();

		var degree = 2 * Math.PI / indicator.length;
		for (var j = this.parameters.radarStep; j > 0; j--) {
			var currentRadius = polar.radius * 0.2 * j;
			context.beginPath();
			context.moveTo(center.x + currentRadius * Math.cos(-Math.PI * 0.5), center.y + currentRadius * Math.sin(-Math.PI * 0.5));
			for (var i = 0; i < indicator.length; i++) {
				var currentDegree = -Math.PI * 0.5 - i * degree;
				context.lineTo(center.x + currentRadius * Math.cos(currentDegree), center.y + currentRadius * Math.sin(currentDegree));
			}

			// 画出斑马纹效果
			if (!polar.splitArea || !polar.splitArea.show) {
				if (j % 2 == 0) {
					context.closePath();
					context.fillStyle = 'RGBA(221,221,221,0.5)';
					context.fill();
				} else {
					context.closePath();
					context.fillStyle = 'RGBA(255,255,255,0.5)';
					context.fill();
				}
			} else {
				if (j % 2 == 0) {
					context.closePath();
					context.clip();
					context.fillStyle = this.option.backgroundColor;
					context.fill();
					context.fillStyle = polar.splitArea.areaStyle.color ? polar.splitArea.areaStyle.color[0] : 'RGBA(221,221,221,0.5)';
					context.fill();
				} else {
					context.closePath();
					context.clip();
					context.fillStyle = this.option.backgroundColor;
					context.fill();

					context.fillStyle = polar.splitArea.areaStyle.color ? polar.splitArea.areaStyle.color[1] : 'RGBA(255,255,255,0.5)';
					context.fill();
				}
			}

			// 设置区域间隔处的线的颜色样式
			if (polar.splitLine && polar.splitLine.show) {
				context.lineWidth = polar.splitLine.lineStyle.width || '1';
				context.strokeStyle = polar.splitLine.lineStyle.color || 'RGBA(221,221,221,0.5)';
				context.stroke();
			} else {
				context.lineWidth = '1';
				context.strokeStyle = 'RGBA(221,221,221,0.5)';
				context.stroke();
			}
		}
		context.restore();
		context.save();

		for (var i = 0; i < indicator.length; i++) {
			// 在各个拐角写出数据的类型名称
			var currentDegree = -Math.PI * 0.5 - i * degree;
			context.beginPath();
			context.font = "14px Arial";
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillStyle = 'black';
			context.fillText(indicator[i].text, center.x + (polar.radius + 30) * Math.cos(currentDegree), center.y + (polar.radius + 20) * Math.sin(currentDegree));
			context.closePath();

			//画出由圆心发散出去的线
			if (!polar.axisLine) { //默认的样式
				context.strokeStyle = 'RGB(221,221,221)';
				context.beginPath();
				context.moveTo(center.x, center.y);
				context.lineTo(center.x + polar.radius * Math.cos(currentDegree), center.y + polar.radius * Math.sin(currentDegree));
				context.closePath();
				context.stroke();
			} else if (polar.axisLine && polar.axisLine.show) {
				context.strokeStyle = polar.axisLine.lineStyle.color || 'RGB(221,221,221)';
				context.lineWidth = polar.axisLine.lineStyle.width || 1;
				context.beginPath();
				context.moveTo(center.x, center.y);
				context.lineTo(center.x + polar.radius * Math.cos(currentDegree), center.y + polar.radius * Math.sin(currentDegree));
				context.closePath();
				context.stroke();
			}
		}
		context.restore();
	};

	/*
		绑定事件
	*/
	Radar.prototype.bindEvent = function(canvas) {
		var _this = this;
		this.touch.bindTouchEvent(_this.tip,
			function(touchType, item, point) {
				if (touchType == _this.touch.touchType.CLICK) {
					if (item.type == 0) { //点击的是雷达图内
						_this.tip.showTip(item.udata, point);
					} else if (item.type == 1) { //点击的是在legend的上面
						_this.option.series[0].data[item.dataIndex].show = !_this.option.series[0].data[item.dataIndex].show;
						// _this.drawLegend(_this.container.middleCanvas);
						_this.draw();
					}
				}
			},
			function(touchType, touchObject, point) {
				if (touchType == _this.touch.touchType.SCROLL) {
					_this.scroll(touchObject);
				}
			}
		);

		/*
			监听屏幕变化重新加载画布 resize	 orientationchange
			"onorientationchange" in window ? "orientationchange" : "resize"
		*/
		window.addEventListener("resize", function() {
			// 重设是否第一次加载
			_this.loaded = false;

			_this.tip.show = false;

			// 重设容器大小
			_this.container.reset();

			// 重新计算需要的值
			_this.calculateCommonData();

			// 重新绘制画布
			_this.load(function() {});
		}, false);
	};

	/*
		创建页面容器
	*/
	var Container = function(element, option) {
		// this.backgroundColor = option.backgroundColor || 'white';
		// 用户配置用来装图标的容器
		this.rootElement = element;

		// 保存总容器的宽高
		this.rootElementWidth = this.rootElement.offsetWidth;
		this.rootElementHeight = this.rootElement.offsetHeight;
		// 创建的在容器里面最外层的容器
		this.parentElement = null;
		// 放置tip的容器
		this.tipElement = null;
		// 绘制中间坐标轴区域的canvas
		this.middleCanvas = null;
		// 保存放置坐标轴画布的容器的可视区域大小
	};
	Container.prototype.drawHTML = function() {
		while (this.rootElement.firstChild)
			this.rootElement.removeChild(this.rootElement.firstChild);

		this.parentElement = this.createElement(this.rootElement, "div");
		this.tipElement = this.createElement(this.parentElement, "div");
		this.middleCanvas = this.createElement(this.parentElement, "canvas");
		// 初始化默认样式
		this.initStyle();
		this.scale(this.middleCanvas);

	};
	Container.prototype.createElement = function(parentElement, tag) {
		var element = document.createElement(tag);
		parentElement.appendChild(element);
		return element;
	};

	/*
		设置创建的元素的默认样式
	*/
	Container.prototype.initStyle = function() {
		var w = this.rootElementWidth;
		var h = this.rootElementHeight;

		// 绘制canvas图表的div 
		this.parentElement.style.width = w + "px";
		this.parentElement.style.height = h + "px";
		this.parentElement.style.position = "relative";
		this.parentElement.css({
			userSelect: 'none'
		});
		this.tipElement.style.position = "absolute";
		this.tipElement.style.display = "none";
		this.tipElement.style.background = "rgba(50, 50, 50, 0.498039)";
		this.tipElement.style.borderRadius = "4px";
		this.tipElement.style.webkitBorderRadius = "4px";
		this.tipElement.style.zIndex = "100";
		this.tipElement.style.whiteSpace = "nowrap";
		this.tipElement.style.padding = "5px";
		this.tipElement.style.transition = "left .4s,top .4s";
		this.tipElement.style.webkitTransition = "left .4s,top .4s";
		this.tipElement.style.color = "white";
		this.tipElement.css({
			userSelect: 'none'
		});

		// 设置装坐标轴画布容器的样式
		this.middleCanvas.width = w * 2 - 4;
		this.middleCanvas.height = h * 2 - 4;
		this.middleCanvas.style.width = w - 2 + "px";
		this.middleCanvas.style.height = h - 2 + "px";
		this.middleCanvas.style.position = "absolute";
		this.middleCanvas.style.zIndex = 1;

	};

	/*
		重新设置位置大小属性
	*/
	Container.prototype.reset = function() {
		this.rootElementWidth = this.rootElement.offsetWidth;
		this.rootElementHeight = this.rootElement.offsetHeight;

		this.initStyle();
		this.scale(this.middleCanvas);
	};

	/*
		缩放200% 高清显示
	*/
	Container.prototype.scale = function() {
		for (var i = 0; i < arguments.length; i++) {
			arguments[i].getContext("2d").scale(2, 2);
		}
	};

	/*
		设置图表区域的画布的样式
	*/
	Container.prototype.setMiddleCanvasStyle = function(style) {
		if (style.w) {
			this.middleCanvas.width = style.w * 2;
			this.middleCanvas.style.width = style.w + "px";
		}
		if (style.h) {
			this.middleCanvas.height = style.h * 2;
			this.middleCanvas.style.height = style.h + "px";
		}
		if (style.top) {
			this.middleCanvas.style.top = style.top + "px";
		}
		if (style.left) {
			this.middleCanvas.style.left = style.left + "px";
		}
	}

	/*
		图形
	*/
	var Series = function(option, touch, parameters) {
		this.option = option;

		this.touch = touch;
		this.parameters = parameters;
	};

	Series.prototype.draw = function(canvas, option) {
		var serie = option.series;
		var indicator = option.polar[0].indicator;
		var radius = option.polar[0].radius;
		var centerX = this.parameters.radarCenter.x,
			centerY = this.parameters.radarCenter.y;

		var context = canvas.getContext("2d");

		//每个角的弧度
		var degree = 2 * Math.PI / indicator.length;
		// 圆心到各个边的距离
		var distance = radius * Math.cos(degree * 0.5);

		var points = []; //记录每个拐角的点的坐标
		var datas = serie[0].data;

		//绑定点击事件的区域
		if (this.parameters.progress == 1) {
			//每次的touch内容都要重新绑定，绑定之前删除之前绑定的数据
			for (var j = this.touch.clickElement.length - 1; j >= 0; j--) {
				if (this.touch.clickElement[j] && this.touch.clickElement[j].type == 0) {
					this.touch.clickElement.splice(j, 1);
				}
			}

			for (var j = 0; j < indicator.length; j++) {
				// 当前的角度
				var currentDegree = -Math.PI * 0.5 - j * degree;

				//当前的点击区域的开始角度
				var clickBeginDegree = currentDegree + degree * 0.5;
				//当前的点击区域的结束角度
				var clickEndDegree = currentDegree - degree * 0.5;

				var point = {};
				// 画出实际值的区域
				if (j == 0) {
					point = {
						x: centerX + radius * Math.cos(-Math.PI * 0.5),
						y: centerY + radius * Math.sin(-Math.PI * 0.5)
					};
				} else {
					point = {
						x: centerX + radius * Math.cos(currentDegree),
						y: centerY + radius * Math.sin(currentDegree)
					};
				}

				// touch中放入四边形的各个点的坐标和应该显示的数据
				var obj = {};
				obj.type = 0; //点击在雷达图上的type
				obj.rect = {
					"p1": [centerX, centerY],
					"p2": [centerX + distance * Math.cos(clickBeginDegree), centerY + distance * Math.sin(clickBeginDegree)],
					"p3": [point.x, point.y],
					"p4": [centerX + distance * Math.cos(clickEndDegree), centerY + distance * Math.sin(clickEndDegree)]
				};
				obj.udata = '';
				for (var k = 0; k < datas.length; k++) {
					if (datas[k].show == false)
						continue;
					if (obj.udata.length != 0)
						obj.udata += "</br>";
					obj.udata += datas[k].name + "</br>" + datas[k].text[j] + ":" + datas[k].value[j];
				}
				this.touch.clickElement.push(obj);
			}
		}

		context.save();
		for (var i = 0; i < datas.length; i++) {
			var lineStyle = (datas[i].itemStyle) ? datas[i].itemStyle.lineStyle : null;

			var itemStyle = datas[i].itemStyle ? datas[i].itemStyle : null;
			if (datas[i].show == false) //当legend上面点击取消的时候，这个区域图就不画出来
				continue;

			var values = datas[i].value;
			context.beginPath();
			for (var j = 0; j < indicator.length; j++) {
				// 当前的角度
				var currentDegree = -Math.PI * 0.5 - j * degree;
				var currentRadius = indicator[j].vtp * values[j] * this.parameters.progress;
				var point = {};

				// 画出实际值的区域
				if (j == 0) {
					point = {
						x: centerX + currentRadius * Math.cos(-Math.PI * 0.5),
						y: centerY + currentRadius * Math.sin(-Math.PI * 0.5),
						lineStyle: lineStyle,
						itemStyle: itemStyle
					};
					context.moveTo(point.x, point.y);

				} else {
					point = {
						x: centerX + currentRadius * Math.cos(currentDegree),
						y: centerY + currentRadius * Math.sin(currentDegree),
						lineStyle: lineStyle,
						itemStyle: itemStyle
					};
					context.lineTo(point.x, point.y);
				}
				points.push(point);
			}
			context.closePath();
			context.strokeStyle = (lineStyle && lineStyle.color) ? lineStyle.color : ((itemStyle && itemStyle.color) ? colorInvert(itemStyle.color) : 'rgba(182,162,222,1)');
			context.lineWidth = 2;
			context.stroke();

			if(datas[i].hasStyle){
				context.fillStyle = itemStyle.color;//(itemStyle && itemStyle.color) ? itemStyle.color : 'rgba(216,206,235,0.5)';
				context.fill();
			}
		}
		context.restore();

		// 画出拐角的小圆点
		for (var i = 0; i < points.length; i++) {
			context.save();
			context.beginPath();
			context.arc(points[i].x, points[i].y, this.parameters.valuseRadius, 0, Math.PI * 2, true);
			context.closePath();
			context.fillStyle = 'white';
			context.fill();
			context.lineWidth = 2;
			context.strokeStyle = (points[i].lineStyle && points[i].lineStyle.color) ? points[i].lineStyle.color : ((points[i].itemStyle && points[i].itemStyle.color) ? colorInvert(points[i].itemStyle.color) : 'rgba(182,162,222,1)');
			context.stroke();
			context.restore();
		}
	};

	/*
		标题
	*/
	var Title = function(option, parameters) {
		this.default = {
			style: {
				color: "rgb(0,138,205)"
			},
			subStyle: {
				color: "rgb(175,175,175)"
			}
		};
		util.extend(true, option, this.default);

		this.option = option;
		this.parameters = parameters;
		this.fontStyleObject = new FontStyle(option.style);
		this.subFontStyleObject = new FontStyle(option.subStyle);
	};
	Title.prototype.drawTitle = function(canvas) {
		var context = canvas.getContext("2d");
		context.save();

		this.fontStyleObject && this.fontStyleObject.useStyle(context);
		context.font = "14px Arial";
		context.textAlign = 'center';
		context.fillText(this.option.text, this.parameters.rootElementWH.w * 0.5, 18);
		context.restore();

		context.save();
		this.subFontStyleObject && this.subFontStyleObject.useStyle(context);
		context.font = "12px Arial";
		context.textAlign = 'center';
		context.fillText(this.option.subText, this.parameters.rootElementWH.w * 0.5, 18 + 18);
		context.restore();
	};

	/*
		tip
	*/
	var Tip = function(element, parameters) {
		this.element = element;
		this.parameters = parameters;
		// 判断当前div是否显示
		this.show = false;
	};
	Tip.prototype.showTip = function(textContent, point) {
		// 如果legend一个也没有选中，那么雷达为空，不显示tip
		if (textContent.length == 0)
			return;
		if (!this.show) {
			this.element.style.display = "block";
		}

		var udata = textContent;
		this.element.innerHTML = udata;

		var top = point.y + 10;
		var left = point.x + 10;
		var clientWidth = this.element.clientWidth;
		var clientHeight = this.element.clientHeight;
		if (left + clientWidth > this.parameters.canvasWidth) {
			left = this.parameters.canvasWidth - clientWidth;
		}
		if (top + clientHeight > this.parameters.canvasHeight) {
			top = this.parameters.canvasHeight - clientHeight;
		}
		this.element.style.top = top + "px";
		this.element.style.left = left + "px";

		// 设置当前div为显示的状态
		this.show = true;
	};
	Tip.prototype.hideTip = function() {
		this.element.style.display = "none";
		this.show = false;
	}

	/*
		图例
	*/

	var Legend = function(option, touch, parameters) {
		this.option = option;
		this.touch = touch;
		this.parameters = parameters;
		this.isFirstDraw = true;
		this.legendWidth = null;
		this.lineWidth = 3;
		this.legendWidthPercent = parameters.legendWidthPercent;
		this.icon = {
			width: 15,
			height: 8,
			top: 5,
			marginRight: 5,
			marginLeft: 5,
			marginTop: 3,
			marginBottom: 3
		};

	};

	Legend.prototype.drawLegend = function(canvas, series) {
		this.series = series;
		if (!this.option.show)
			return;

		this.legendY = this.option.vertical;
		if (!this.option.align || this.option.align === "center")
			this.drawLegendInCenter(canvas);
		else if (this.option.align === "right")
			this.drawLegendInRight(canvas);
		else if (this.option.align === "left")
			this.drawLegendInLeft(canvas);
	};
	Legend.prototype.drawLegendInCenter = function(canvas) {

		var context = canvas.getContext("2d");

		// 雷达的半径
		var radius = this.parameters.radarCenter.radius;
		var centerX = this.parameters.rootElementWH.w * 0.5;
		var centerY = this.parameters.rootElementWH.h * 0.5;

		var legendLength = 0;
		var sumLength = 0; // 图例总长度

		var datas = this.series[0].data;
		// 取得legend的总得长度是多少
		for (var i = 0; i < datas.length; i++) {
			legendLength += this.parameters.legendRadius * 2 + this.icon.marginLeft + context.measureText(datas[i].name).width + this.icon.marginRight;
		}
		context.save();
		var textWidth = 0,
			currentWidth = 0;
		var widthArray = [];
		for (var i = 0; i < datas.length; i++) {
			widthArray[i] = this.parameters.legendRadius * 2 + this.icon.marginLeft + context.measureText(datas[i].name).width + this.icon.marginRight;
		}

		//每次的touch内容都要重新绑定，绑定之前删除之前绑定的数据
		for (var j = this.touch.clickElement.length - 1; j >= 0; j--) {
			if (this.touch.clickElement[j] && this.touch.clickElement[j].type == 1) {
				this.touch.clickElement.splice(j, 1);
			}
		}

		for (var i = 0; i < datas.length; i++) {
			var itemStyle = datas[i].itemStyle ? datas[i].itemStyle : null;
			var obj = {};
			obj.type = 1; // type此时表示为点击的是legend
			obj.rect = {
				"x": centerX - legendLength * 0.5 + sumLength - this.parameters.legendRadius,
				"y": this.legendY - 10,
				"w": widthArray[i],
				"h": this.parameters.legendRadius * 2
			};
			obj.dataIndex = i;
			this.touch.clickElement.push(obj);

			this.drawLegendIcon(canvas, {
				"x": centerX - legendLength * 0.5 + sumLength,
				"y": this.legendY,
			}, datas[i].show, itemStyle);
			this.drawLegendText(canvas, {
				"x": centerX - legendLength * 0.5 + sumLength + this.parameters.legendRadius * 1.2,
				"y": this.legendY + 5,
			}, datas[i].name, datas[i].show, itemStyle);

			textWidth = this.icon.marginLeft + context.measureText(datas[i].name).width + this.icon.marginRight;
			currentWidth = this.parameters.legendRadius * 2 + textWidth;
			sumLength += currentWidth;
		}
		context.restore();

	};
	Legend.prototype.drawLegendInRight = function(canvas) {
		var context = canvas.getContext("2d");

		// canvas的总得宽度
		var canvasWidth = this.parameters.rootElementWH.w;

		var legendLength = 0;
		var sumLength = 0; // 图例总长度
		var textWidth = 0,
			currentWidth = 0;
		var widthArray = [];
		var datas = this.series[0].data;
		for (var i = 0; i < datas.length; i++) {
			widthArray[i] = this.parameters.legendRadius * 2 + this.icon.marginLeft + context.measureText(datas[i].name).width + this.icon.marginRight;
		}
		// 取得legend的总得长度是多少
		for (var i = 0; i < datas.length; i++) {
			legendLength += this.parameters.legendRadius * 2 + this.icon.marginLeft + context.measureText(datas[i].name).width + this.icon.marginRight;
		}

		//每次的touch内容都要重新绑定，绑定之前删除之前绑定的数据
		for (var j = this.touch.clickElement.length - 1; j >= 0; j--) {
			if (this.touch.clickElement[j] && this.touch.clickElement[j].type == 1) {
				this.touch.clickElement.splice(j, 1);
			}
		}

		for (var i = 0; i < datas.length; i++) {
			var itemStyle = datas[i].itemStyle ? datas[i].itemStyle : null;
			var obj = {};
			obj.type = 1; // type此时表示为点击的是legend
			obj.rect = {
				"x": canvasWidth - legendLength + sumLength - 10,
				"y": this.legendY - 10,
				"w": widthArray[i],
				"h": this.parameters.legendRadius * 2
			};
			obj.dataIndex = i;
			this.touch.clickElement.push(obj);

			this.drawLegendIcon(canvas, {
				"x": canvasWidth - legendLength + sumLength,
				"y": this.legendY
			}, datas[i].show, itemStyle);
			this.drawLegendText(canvas, {
				"x": canvasWidth - legendLength + sumLength + this.parameters.legendRadius * 1.2,
				"y": this.legendY + 5
			}, datas[i].name, datas[i].show, itemStyle);

			textWidth = this.icon.marginLeft + context.measureText(datas[i].name).width + this.icon.marginRight;
			currentWidth = this.parameters.legendRadius * 2 + textWidth;
			sumLength += currentWidth;
		}

		context.save();
		context.restore();

	};
	Legend.prototype.drawLegendInLeft = function(canvas) {
		var context = canvas.getContext("2d");


		// 雷达的半径
		var radius = this.parameters.radarCenter.radius;
		var datas = this.series[0].data;

		var widthArray = [];
		for (var i = 0; i < datas.length; i++) {
			widthArray[i] = this.parameters.legendRadius * 2 + this.icon.marginLeft + context.measureText(datas[i].name).width + this.icon.marginRight;
		}

		//每次的touch内容都要重新绑定，绑定之前删除之前绑定的数据
		for (var j = this.touch.clickElement.length - 1; j >= 0; j--) {
			if (this.touch.clickElement[j] && this.touch.clickElement[j].type == 1) {
				this.touch.clickElement.splice(j, 1);
			}
		}

		var sumLength = 0; // 图例总长度
		for (var i = 0; i < datas.length; i++) {
			var itemStyle = datas[i].itemStyle ? datas[i].itemStyle : null;
			var obj = {};
			obj.type = 1; // type此时表示为点击的是legend
			obj.rect = {
				"x": sumLength - this.parameters.legendRadius + 20,
				"y": this.legendY - 10,
				"w": widthArray[i],
				"h": this.parameters.legendRadius * 2
			};
			obj.dataIndex = i;
			this.touch.clickElement.push(obj);

			this.drawLegendIcon(canvas, {
				"x": sumLength + 20,
				"y": this.legendY
			}, datas[i].show, itemStyle);
			this.drawLegendText(canvas, {
				"x": sumLength + 20 + this.parameters.legendRadius * 1.2,
				"y": this.legendY + 5
			}, datas[i].name, datas[i].show, itemStyle);

			textWidth = this.icon.marginLeft + context.measureText(datas[i].name).width + this.icon.marginRight;
			currentWidth = this.parameters.legendRadius * 2 + textWidth;
			sumLength += currentWidth;
		}
	};
	Legend.prototype.drawLegendIcon = function(canvas, point, isChecked, itemStyle) {

		// 小图标的半径
		var radius = this.parameters.legendRadius;

		var context = canvas.getContext("2d");
		// 画出小六边形
		context.save();
		context.beginPath();
		for (var i = 0; i < 6; i++) {
			var degree = (Math.PI / 3) * i + (Math.PI / 2);
			context.lineTo(point.x + radius * Math.cos(degree), point.y + radius * Math.sin(degree));
		}
		context.closePath();

		if (isChecked)
			context.fillStyle = (itemStyle && itemStyle.color) ? colorInvert(itemStyle.color) : 'rgba(182,162,222,0.8)';
		else
			context.fillStyle = 'gray';
		context.fill();
		context.restore();
	};
	Legend.prototype.drawLegendText = function(canvas, point, text, isChecked, itemStyle) {
		var context = canvas.getContext("2d");
		context.save();

		if (isChecked)
			context.fillStyle = (itemStyle && itemStyle.color) ? colorInvert(itemStyle.color) : 'rgba(182,162,222,0.8)';
		else
			context.fillStyle = 'gray';
		context.fillText(text, point.x, point.y);
		context.restore();

	};


	/*
		公用的一些数据
	*/

	var Parameters = function() {
		// 动画进度（0~1）
		this.progress = 1;

		// 根容器的宽高
		this.rootElementWH = {
			w: 0,
			h: 0
		};

		// 保存绘制坐标轴区域的canvas的大小
		this.middleCanvasWH = {
			w: 0,
			h: 0
		};

		//雷达的段数
		this.radarStep = 5;

		// 雷达的圆心的位置
		this.radarCenter = {
			"x": 0,
			"y": 0,
			"radius": 0
		}

		// legend的小图标的大小（六边形的半径）
		this.legendRadius = 10;

		//拐角的小圆点的的半径大小
		this.valuseRadius = 4;

		this.backgroundColor = 'rgba(255,255,255,1)';

	};


	/*
		字体样式
	*/
	var FontStyle = function(style) {
		this.default = {
			color: "black",
			font: "normal 12px arial"
		};
		this.style = util.extend(true, {}, this.default, style);
	};
	FontStyle.prototype.useStyle = function(context) {
		context.font = this.style.font;
		context.fillStyle = this.style.color;
	};



	/*
		触摸事件
	*/
	var Touch = function(element, parameters) {
		this.parameters = parameters;
		this.element = element;
		this.touchType = {
			CLICK: 0,
			SCROLL: 1,
			CANCEL: 2
		};
		this.enforceScroll = true;

		this.clickElement = [];
		this.clickItems = {
			"legend": {
				"rect": {},
				"leaf": []
			},
			"series": {
				"rect": {},
				"leaf": []
			}
		};
	};

	Touch.prototype.getPosition = function(ele) {
		var x = ele.offsetLeft + (ele.curentStyle ? (parseInt(ele.curentStyle.borderLeftWidth).NaN0()) : 0);
		var y = ele.offsetTop + (ele.curentStyle ? (parentInt(ele.curentStyle.borderTopWidth).NaN0()) : 0);
		while (ele.offsetParent) {
			ele = ele.offsetParent;
			x += ele.offsetLeft + (ele.curentStyle ? (parseInt(ele.curentStyle.borderLeftWidth).NaN0()) : 0);
			y += ele.offsetTop + (ele.curentStyle ? (parentInt(ele.curentStyle.borderTopWidth).NaN0()) : 0);
		}
		return {
			x: x,
			y: y
		};
	}

	Touch.prototype.bindTouchEvent = function(tip, callback, endCall) {
		var _self = this;
		// 开始点的坐标
		var startPoint = {};
		var currentPoint = {};
		// 开始时间毫秒
		var startTime = 0;
		// 结束时间毫秒
		var endTime = 0;
		// 判断是否为点击
		var rangePow = 0;
		var isBeginTouch = false;
		var isClick = true;

		this.touchBegin = function(e) {
			//e.preventDefault();
			isBeginTouch = false;

			var point = {
				x: 0,
				y: 0
			};
			if (e.touches) {
				var pos = _self.getPosition(_self.element.parentElement);
				point.x = e.touches[0].pageX - pos.x;
				point.y = e.touches[0].pageY - pos.y;
			} else {
				if (e.target.nodeName == 'DIV') {
					point.x = e.x - divPoint.x;
					point.y = e.y - divPoint.y;
				} else {
					divPoint = _self.getPosition(_self.element.parentElement);
					point.x = e.offsetX;
					point.y = e.offsetY;
				}
			}

			startPoint = point;
			currentPoint = point;
			isClick = true;
			isBeginTouch = true;
		};

		this.touchEnd = function(e) {
			currentPoint = {};
			if (isBeginTouch == false)
				return;
			e.preventDefault();
			if (isClick) {
				var showTips = true;
				for (var i in _self.clickElement) {
					var item = _self.clickElement[i];
					if (item.type == 0) { //检索点击的点是否在雷达图区域类
						if (_self.isInFourPointArea(startPoint, item.rect)) {
							callback && callback(_self.touchType.CLICK, item, startPoint);
							showTips = false;
							break;
						}
					} else if (item.type == 1) {
						if (_self.isPointInRect(startPoint, item.rect)) {
							callback && callback(_self.touchType.CLICK, item, startPoint);
							showTips = true;
							break;
						}
					}
				}
				if (showTips)
					tip.hideTip();

				endCall && endCall(_self.touchType.CANCEL, startPoint);
			} else { //滑动结束回调方法
				endCall && endCall(_self.touchType.SCROLL, startPoint);
			}
			startPoint = {};
		};

		if (window.navigator.platform.indexOf("Win") != -1 || window.navigator.platform.indexOf("Mac") != -1) {
			_self.bindMouse(_self.element.parentElement, _self.touchBegin, _self.touchMove, _self.touchEnd);
		} else {
			_self.bindTouch(_self.element.parentElement, this.touchBegin, this.touchMove, this.touchEnd);
		}
	};
	/*
		判断一个点是否在一个标签的范围之内
	*/
	Touch.prototype.isPointInRect = function(point, rect) {
		var x = rect.x;
		var y = rect.y;
		var w = rect.w;
		var h = rect.h;
		if (point.x > x && point.x < x + w && point.y > y && point.y < y + h)
			return true;
		return false;
	};

	//判断点击的点是否在不规则的四边形区域之类
	Touch.prototype.isInFourPointArea = function(point, rect) {
		var tempCanvas = document.createElement("canvas");
		var context = tempCanvas.getContext("2d");
		context.beginPath();
		context.moveTo(rect.p1[0], rect.p1[1]);
		context.lineTo(rect.p2[0], rect.p2[1]);
		context.lineTo(rect.p3[0], rect.p3[1]);
		context.lineTo(rect.p4[0], rect.p4[1]);
		context.closePath();

		return context.isPointInPath(point.x, point.y);

	}


	/*
		移动端滑动事件
	*/
	Touch.prototype.bindTouch = function(element, startCb, moveCb, endCb) {
		element.addEventListener("touchstart", function(e) {
			startCb(e);
			this.addEventListener("touchmove", moveCb, false);
		}, false);
		element.addEventListener("touchend", function(e) {
			endCb(e);
			this.removeEventListener("touchmove", moveCb, false);
		}, false);
	};

	/*
		web端滑动事件
	*/
	Touch.prototype.bindMouse = function(element, startCb, moveCb, endCb) {
		element.addEventListener("mousedown", function(e) {
			startCb(e);
			this.addEventListener("mousemove", moveCb, false);
		}, false);
		element.addEventListener("mouseup", function(e) {
			endCb(e);
			this.removeEventListener("mousemove", moveCb, false);
		}, false);
	};



	/*
		时间补间动画
	*/
	var Tween = function() {
		this.animateBegin = null;
		this.animateStep = null;
		this.animateEnd = null;
		this.udata = null;
		this.startTime = null;
		// this.frame = null;
		// 动画执行多久结束 timeout = 0的时候是无线调用
		this.timeout = 1000;
		// 是否需要停止循环执行操作
		this.needTerminate = false;
		// 动画指针（代表当前的动画，用于停止动画）
		this.handle = null;
		// this.repeat = null;
	};
	Tween.prototype.start = function(beginCall, stepCall, endCall, data) {
		this.needTerminate = false;
		this.animateBegin = beginCall;
		this.animateStep = stepCall;
		this.animateEnd = endCall;
		this.udata = data;
		this.startTime = new Date().getTime();
		this.animateBegin && this.animateBegin(this.udata);
		this.handle = requestAnimationFrame(this.step.bind(this));
	};
	Tween.prototype.stop = function() {
		if (this.handle)
			cancelAnimationFrame(this.handle);
		this.handle = null;
		this.needTerminate = true;
	};
	Tween.prototype.step = function(dt) {
		if (this.timeout == 0) { // 无限循环
			if (this.needTerminate == false) {
				this.animateStep && this.animateStep(0, this.udata);
				this.handle = requestAnimationFrame(this.step.bind(this));
			}
		} else {
			var now = new Date().getTime();
			if (now - this.startTime > this.timeout) {
				this.animateStep && this.animateStep(1, this.udata);
				this.animateEnd && this.animateEnd(this.udata);
			} else {
				if (this.needTerminate == false) {
					this.animateStep && this.animateStep(1 - Math.pow(1 - (now - this.startTime) / this.timeout, 6), this.udata);
					this.handle = requestAnimationFrame(this.step.bind(this));
				}
			}
		}
	};



	/*
		速度逐渐衰减动画
	*/
	var PhyTween = function() {
		this.animateBegin = null;
		this.animateStep = null;
		this.animateEnd = null;
		this.tween = new Tween();
		this.tween.timeout = 0;
		this.frame = 60;
		// 阻尼 每秒力度衰减
		this.damping = 6;
		this.udata = null;
		// 初速度
		this.velocity = 0;
		// 最小速度
		this.minVelocity = 5;
	};
	PhyTween.prototype.start = function(velocity, beginCall, stepCall, endCall, data) {
		this.animateBegin = beginCall;
		this.animateStep = stepCall;
		this.animateEnd = endCall;
		this.udata = data;
		this.velocity = velocity;
		this.tween.start(this.begin.bind(this), this.step.bind(this), this.end.bind(this), data);
	};
	PhyTween.prototype.step = function(progress, udata) {
		// 计算当前速度
		this.velocity = this.velocity - this.velocity * this.damping / this.frame;
		// 当前速度小于最小的默认速度时候调用stop
		if (Math.abs(this.velocity) < this.minVelocity) {
			this.tween.stop();
		}
		this.animateStep && this.animateStep(this.velocity);
	};

	PhyTween.prototype.begin = function() {
		this.animateBegin && this.animateBegin();
	};

	PhyTween.prototype.end = function() {
		this.animateEnd && this.animateEnd();
	};


	/*
		处理数据的util
	*/
	var util = {
		isEmpty: function(object) {
			if (!object)
				return true;
			for (var i in object) {};
			return i === undefined;
		},
		extend: function() {
			var src, copyIsArray, copy, name, options, clone,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length,
				deep = false;

			if (typeof target === "boolean") {
				deep = target;
				target = arguments[1] || {};
				i = 2;
			}

			if (typeof target !== "object" && typeof target !== "function") {
				target = {};
			}

			if (length === i) {
				target = this;
				--i;
			}

			for (; i < length; i++) {
				if ((options = arguments[i]) != null) {
					for (name in options) {
						src = target[name];
						copy = options[name];

						if (target === copy) {
							continue;
						}

						if (deep && copy && (this.isPlainObject(copy) || (this.isArray(copy)))) {
							copyIsArray = this.isArray(copy);
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && this.isArray(src) ? src : [];

							} else {
								clone = src && this.isPlainObject(src) ? src : {};
							}

							target[name] = this.extend(deep, clone, copy);

						} else if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}
			}

			return target;
		},
		isPlainObject: function(obj) {
			if (!obj || typeof obj !== "object" || obj == obj.window)
				return false;

			var key;
			for (key in obj) {}
			return key === undefined || {}.hasOwnProperty.call(obj, key);
		},
		isArray: function(obj) {
			return obj != null && obj instanceof Array;
		}
	};

	/*
		反转效果
		pixels = [rgb(255,255,255,1?),(255,255,255,1?)];
	*/
	function colorInvert(pixels) {
		function getPixelArray(pixel) {
			return pixel.replace("rgba", "")
				.replace("rgb", "")
				.replace("(", "")
				.replace(")", "")
				.split(",");
		}
		var array = getPixelArray(pixels);
		return "rgb(" + array[0] + "," + array[1] + "," + array[2] + ")";
	};

	/**
		获取线条色相对应的填充色
	*/
	function getFillColorByIndex(globalIndex, alpha) {
		_alpha = alpha ? alpha : 0.5;
		var i = globalIndex % 9;
		switch (i) {
			case 0:
				return "rgba(171,195,116," + _alpha + ")";
			case 1:
				return "rgba(46,199,201," + _alpha + ")";
			case 2:
				return "rgba(182,162,222," + _alpha + ")";
			case 3:
				return "rgba(123,192,242," + _alpha + ")";
			case 4:
				return "rgba(255,199,153," + _alpha + ")";
			case 5:
				return "rgba(223,148,153," + _alpha + ")";
			case 6:
				return "rgba(141,152,179," + _alpha + ")";
			case 7:
				return "rgba(234,216,61," + _alpha + ")";
			case 8:
				return "rgba(149,112,109," + _alpha + ")";
			case 9:
				return "rgba(227,135,187," + _alpha + ")";
			case 10:
				return "rgba(7,162,164," + _alpha + ")";
			case 11:
				return "rgba(154,127,209," + _alpha + ")";
			case 12:
				return "rgba(121,163,221," + _alpha + ")";
			default:
				return "rgba(255,255,255," + _alpha + ")";
		}
	}


	if (!window.Mobilechart)
		window.Mobilechart = new Object();
	window.Mobilechart.radar = Radar;
})();