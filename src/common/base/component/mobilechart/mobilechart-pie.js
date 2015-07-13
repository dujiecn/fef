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
	var Pie = function(element) {
		// 判断页面是否加载过
		this.loaded = false;
		// 判断是是否是第一次加载，有些绘制操作只需要操作一次
		this.option = {
			animation: {
				show: true,
				timeout: 2000
			}
		};
		this.element = element;
		this.parameters = new Parameters();
		this.container = null;
		this.touch = null;
		this.tween = new Tween();
		this.series = null;
		this.title = null;
		this.legend = null;
		this.tip = null;
		this.type = 'pie';
		this.parameters.divElement = this.element;
		this.originalOption = null;
		this.toolbox = null;
		this.fromOption = null;
	};
	Pie.prototype.init = function(option, fromOption) {
		this.loaded = false;
		globalIndex = 0;

		this.fromOption = fromOption;
		// 整合用户设置和默认的值
		util.extend(true, this.option, option);
		// 创建对象


		this.container = new Container(this.element);
		this.title = new Title(this.option.title, this.parameters);

		// 创建需要的html元素
		this.container.drawHTML();

		this.touch = new Touch(this.container.middleCanvas, this.parameters);
		this.series = new Series(this.option.series, this.touch, this.parameters);
		this.legend = new Legend(this.option.legend, this.touch, this.series, this.parameters);
		this.calculateCommonData();
		this.tip = new Tip(this.container.tipElement, this.parameters);
		if (!util.isEmpty(this.option.toolbox) && (this.option.toolbox.show === undefined || this.option.toolbox.show === true)) {
			this.toolbox = new Mobilechart.toolbox(this);
			this.originalOption = util.extend(true, {type:this.type}, this.option);
		}



		this.load(function() {
			// 绑定事件
			this.bindEvent();
		}.bind(this));


		return this;
	};


	Pie.prototype.toTable = function() {
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




	Pie.prototype.toBar = function() {
		var option = this.translate2BarOpiton();
		new Mobilechart.basic(this.element).init(option, this.fromOption || this.originalOption);
	};


	Pie.prototype.restore = function() {
		if (this.fromOption  && this.fromOption.type != this.type) {
			if (this.fromOption.type == 'basic') {
				new Mobilechart.basic(this.element).init(this.fromOption);
			}
		} else {
			this.option = util.extend(true, {}, this.originalOption);
			this.refresh();
		}
	};

	Pie.prototype.refresh = function() {
		// 重设是否第一次加载
		this.loaded = false;

		// 重设容器大小
		this.container.reset();

		// 重新计算需要的值
		this.calculateCommonData();

		// 重新绘制画布
		this.load();
	};




	// 将当前的canvas保存为图片
	Pie.prototype.saveAsImage = function() {

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
				imgDiv.removeChild(image);
				document.body.removeChild(imgDiv);
			}, false);
		} else {
			imageClose.addEventListener("touchend", function(e) {
				e.stopPropagation();
				imgDiv.removeChild(image);
				document.body.removeChild(imgDiv);
			}, false);
		}

	};


	Pie.prototype.translate2BarOpiton = function() {
		var tempOption = util.extend(true, {}, this.option);
		var xAxis = {},
			xData = []; //x轴对象的封装
		var yAxis = { // y轴对象的封装
			'type': 'value'
		};
		var series = []; // 待封装的新的series对象
		for (var i = 0; i < tempOption.series[0].data.length; i++)
			xData.push(tempOption.series[0].data[i].name);

		xAxis['data'] = xData;
		xAxis['type'] = 'category';

		var oldSeries = tempOption.series;
		for (var i = 0; i < oldSeries.length; i++) {
			var itemSerie = {};
			itemSerie['name'] = oldSeries[i].name;
			itemSerie['type'] = 'bar';
			var data = [];
			for (var j = 0; j < oldSeries[i].data.length; j++) {
				data.push(oldSeries[i].data[j].value);
			}
			itemSerie['data'] = data;
			series.push(itemSerie);
		}

		tempOption['xAxis'] = [];
		tempOption['yAxis'] = [];
		tempOption['xAxis'].push(xAxis);
		tempOption['yAxis'].push(yAxis);

		var oldSeries2 = tempOption.series;
		tempOption.series = series;

		// var last =JSON.stringify(tempOption);
		return tempOption;
	}


	/*
		画布开始渲染
	*/
	Pie.prototype.load = function(callback) {
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
	Pie.prototype.calculateCommonData = function() {
		// 保存根容器的宽高
		this.parameters.rootElementWH = {
			w: this.container.rootElementWidth,
			h: this.container.rootElementHeight
		};
		// 保存canvas的背景颜色
		this.parameters.backgroundColor = this.option.backgroundColor || this.parameters.backgroundColor;

		// 将每个扇形区域的半径根据roseType计算出来，包装在data数组中去
		var series = this.option.series;

		for (var i = 0; i < series.length; i++) {
			//半径模式
			var data = series[i].data;
			var total = 0;
			for (var j = 0; j < data.length; j++) {
				total += data[j].value;
			}
			for (var j = 0; j < data.length; j++) {
				var rate = 0;
				if(total != 0)
					rate = data[j].value / total;
				var radian = Math.PI * 2 * rate;
				data[j]['radian'] = radian; //弧度
				if(util.isEmpty(data[j].itemStyle) || util.isEmpty(data[j].itemStyle.color)){
					data[j]['color'] = this.parameters.colorArrayObj[data[j].name]; //每个扇形的颜色
				}else{
					data[j]['color'] = data[j].itemStyle.color;
				}
				data[j]['show'] = true; //每个扇形是否去显示出来
				data[j]['checked'] = false; //每个扇形是否处于选中状态
				data[j]['rate'] = rate==0 ? "0%" : (rate*100).toFixed(2) + "%"; 
				data[j]['itemStyle'] = data[j].itemStyle;
				data[j]['total'] = total;
			}
		}
	};

	/*
		重新计算扇形的角度
	*/
	Pie.prototype.reCalculateRadian = function(param) {
		var data = param.data;
		//半径模式
		var total = 0;
		for (var j = 0; j < data.length; j++) {
			if (data[j].show == false)
				continue;
			total += data[j].value;
		}
		for (var j = 0; j < data.length; j++) {
			if (data[j].show == false) {
				continue;
			}
			var rate = data[j].value / total;
			var radian = Math.PI * 2 * rate;
			data[j].radian = radian; //弧度
		}
	};



	/*
		初始化动画调用函数
	*/
	Pie.prototype.step = function(progress) {
		this.parameters.progress = progress;
		this.draw(progress);
	};
	Pie.prototype.draw = function() {

		// clear
		var context = this.container.middleCanvas.getContext("2d");
		context.save();
		context.clearRect(0, 0, this.container.middleCanvas.width * 0.5, this.container.middleCanvas.height * 0.5);
		context.beginPath();
		context.fillStyle = this.parameters.backgroundColor;
		context.rect(0, 0, this.container.middleCanvas.width * 0.5 - 2, this.container.middleCanvas.height * 0.5 - 2);
		context.fill();
		context.closePath();
		// context.stroke();
		context.restore();

		this.drawTitle(this.container.middleCanvas);
		this.drawLegend(this.container.middleCanvas);
		this.drawSeries(this.container.middleCanvas);
	};

	/*
		清空画布
	*/
	Pie.prototype.clear = function(canvas, rect) {
		var context = canvas.getContext("2d");
		if (rect)
			context.clearRect(rect.x, rect.y, rect.w, rect.h);
		else
			context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	};

	/*
		绘制图标标题
	*/
	Pie.prototype.drawTitle = function(canvas) {
		this.title.drawTitle(canvas);
	};

	/*
		绘制图例
	*/
	Pie.prototype.drawLegend = function(canvas) {
		this.legend.drawLegend(canvas);
	};

	/*
		绘制图形
	*/
	Pie.prototype.drawSeries = function(canvas) {
		var series = this.series.option;
		this.series.draw(canvas, null);
	};

	/*
		绑定事件
	*/
	Pie.prototype.bindEvent = function(canvas) {
		var _this = this;
		var hideTipTime=null;
		this.touch.bindTouchEvent(
			function(touchType, item, param) {
				if (touchType == _this.touch.touchType.CLICK) {
					if (item.type == 0) { //点击的是饼图本身
						_this.tip.showTip(item.serie, param);
						clearTimeout(hideTipTime);
						hideTipTime = setTimeout(function(){
							_this.tip.hideTip();
						}, 3000);
						_this.draw();
					} else if (item.type == 1) { //点击的是按钮
						var data = item.serie.data;
						var showDataLength = 0;
						var index = 0;
						var temp = [];
						for (var i = 0; i < data.length; i++) {
							if (data[i].show) {
								temp.push(data[i]);
								if (data[i].checked)
									index = temp.length - 1;
							}
						}

						// 后退
						temp[index].checked = false;
						if (item.button[param].changeType == 0) {
							if (index == 0)
								index = temp.length - 1;
							else
								index -= 1;
						} else { //前进
							if (index == temp.length - 1) {
								index = 0;
							} else {
								index += 1;
							}
						}
						temp[index].checked = true;

						_this.tip.showTip(item.serie, item.point);
						clearTimeout(hideTipTime);
						setTimeout(function(){
							_this.tip.hideTip();
						}, 3000);
						_this.draw();

					} else { //点击的是legend
						item.data.show = !item.data.show;
						_this.tip.hideTip();
						for (var k in item.data) {
							if (k != 'show') {
								for (var i = 0; i < item.data[k].length; i++) {
									var serie = item.data[k][i].serie;
									var index = item.data[k][i].index;
									serie.data[index].show = !serie.data[index].show;
									_this.reCalculateRadian(serie); //重计算各个扇形的弧度
									_this.draw();
								}
							}
						}
					}
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
			_this.load();
		}, false);
	};


	/*
		创建页面容器
	*/
	var Container = function(element) {
		// 用户配置用来装图标的容器
		if (typeof element == "string")
			this.rootElement = document.querySelector(element);
		else
			this.rootElement = element;

		// 保存总容器的宽高
		this.rootElementWidth = this.rootElement.offsetWidth;
		this.rootElementHeight = this.rootElement.offsetHeight;
		// 创建的在容器里面最外层的容器
		this.parentElement = null;
		// 放置画布的容器
		this.containElement = null;
		// 放置坐标轴画布的容器
		this.middleElement = null;
		// 放置tip的容器
		this.tipElement = null;
		// 绘制中间坐标轴区域的canvas
		this.middleCanvas = null;
		// 绘制值轴，标题，图例的canvas
	};
	Container.prototype.drawHTML = function() {
		while (this.rootElement.firstChild)
			this.rootElement.removeChild(this.rootElement.firstChild);

		this.parentElement = this.createElement(this.rootElement, "div");
		this.containElement = this.createElement(this.parentElement, "div");
		this.tipElement = this.createElement(this.containElement, "div");
		this.middleCanvas = this.createElement(this.containElement, "canvas");
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

		this.containElement.css({
			width: w + 'px',
			height: h + 'px',
			top : 0,
			left : 0,
			position: 'absolute',
			overflow: 'hidden',
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
		this.middleCanvas.width = w * 2;
		this.middleCanvas.height = h * 2;
		this.middleCanvas.style.width = w + "px";
		this.middleCanvas.style.height = h + "px";
		this.middleCanvas.style.position = "absolute";
		this.middleCanvas.style.zIndex = 0;
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
		this.line = null;
		this.pie = [];
		this.changeButton = [];
		this.option = option;

		this.touch = touch;
		this.parameters = parameters;
		this.init();
	};


	Series.prototype.init = function() {
		for (var i in this.option) {
			this.pie[i] = new PieSerie(this.parameters, this.renderBkg);
			this.changeButton[i] = new ChangeButton(this.parameters);
		}
	};

	Series.prototype.draw = function(canvas, serie) {
		for (var i in this.pie) {
			var pie = this.pie[i];
			pie.drawPie(canvas, this.touch, this.option[i]);

			if (this.option[i].cursor) {
				var button = this.changeButton[i];
				button.drawButton(canvas, this.touch, this.option[i]);
				this.isFirstDrawButton = false;
			}
		}
	};

	/*
		扇形图
	*/
	var PieSerie = function(parameters) {
		this.parameters = parameters;
		this.option = null;
		this.shapeStyle = null;
		this.isFirstDraw = true;

	};
	PieSerie.prototype.drawPie = function(canvas, touch, serie) {
		if (serie.show == false) {
			return;
		}

		// 计算圆心的位置
		var centerX = serie.center[0] > 1 ? serie.center[0] : this.parameters.rootElementWH.w * serie.center[0];
		var centerY = serie.center[1] > 1 ? serie.center[1] : this.parameters.rootElementWH.h * serie.center[1];

		var radiusOut = 0,
			radiusInner = 0;
		// pie的半径
		if (typeof(serie.radius) == 'number') {
			radiusOut = serie.radius > 1 ? serie.radius : serie.radius * this.parameters.rootElementWH.w;
		} else {
			radiusOut = serie.radius[0] > 1 ? serie.radius[0] : serie.radius[0] * this.parameters.rootElementWH.w;
			radiusInner = serie.radius[1] > 1 ? serie.radius[1] : serie.radius[1] * this.parameters.rootElementWH.w;
		}

		var dataArray = [];
		var totalValue=0;
		for (var i in serie.data) {
			if (serie.data[i].show == true){
				dataArray.push(serie.data[i]);
				totalValue += serie.data[i].value;
			}
		}
		var context = canvas.getContext("2d");

		context.save();

		var rotateRange = Math.PI * this.parameters.progress;

		var obj = {
			"type": 0,
			"serie": serie,
			"sector": []
		};
		var degree = rotateRange;
		var textDegree = Math.PI;

		for (var i = 0; i < dataArray.length; i++) {
			context.beginPath();
			var x, y;
			// 选中的扇形样式不同
			if (dataArray[i].checked) {
				context.fillStyle = getHightLightColor(dataArray[i].color);
			} else {
				context.fillStyle = dataArray[i].color;
			}

			context.moveTo(centerX, centerY);
			x = centerX + radiusOut * Math.cos(degree) * this.parameters.progress;
			y = centerY + radiusOut * Math.sin(degree) * this.parameters.progress;
			context.lineTo(x, y);
			context.arc(centerX, centerY, radiusOut * this.parameters.progress,
				degree, dataArray[i].radian + degree, false);
			context.closePath();
			context.lineWidth=2;
			if(dataArray[i].total != 0)
				context.stroke();
			context.fill();

			var _degree = degree * 180 / Math.PI;
			if (serie.text != false && dataArray[i].total !=0) {
				this.drawText(context, centerX + radiusOut * Math.cos(textDegree + dataArray[i].radian * 0.5),
					centerY + radiusOut * Math.sin(textDegree + dataArray[i].radian * 0.5),
					centerX + (radiusOut + 28) * Math.cos(textDegree + dataArray[i].radian * 0.5),
					centerY + (radiusOut + 28) * Math.sin(textDegree + dataArray[i].radian * 0.5), textDegree + dataArray[i].radian * 0.5, dataArray[i].name,dataArray[i].rate);
			}

			if (this.parameters.progress == 1) {
				//绑定touch上的点击事件的范围
				var sectorObj = {
					"index": dataArray[i].name,
					"rect": {
						"moveTo": [centerX, centerY],
						"lineTo": [x, y],
						"arc": [radiusOut,
							degree, degree + dataArray[i].radian
						]
					}
				};
				obj.sector.push(sectorObj);
			}
			degree += dataArray[i].radian;
			textDegree += dataArray[i].radian;
		}

		if (this.parameters.progress == 1) {
			//每次的touch内容都要重新绑定，绑定之前删除之前绑定的数据
			for (var i in touch.clickElement) {
				if (touch.clickElement[i].type == 0 && touch.clickElement[i].serie.name == serie.name) {
					touch.clickElement.splice(i, 1);
				}
			}
			touch.clickElement.push(obj);
		}
		context.restore();

		//环形图的时候画空内部圆
		if (typeof(serie.radius) != 'number') {
			context.save();
			context.beginPath();
			context.fillStyle = this.parameters.backgroundColor || 'white';
			context.strokeStyle="black";
			context.arc(centerX, centerY, radiusInner, 0, 2 * Math.PI, false);
			context.closePath();

			context.fill();
			context.lineWidth=1;
			context.stroke();
			context.restore();

			context.save();
			context.fillStyle="white";
			context.font = "15px Arial";
			context.textAlign="center";
			context.textBaseline="bottom";
			context.fillText(formatNumber(totalValue * this.parameters.progress), centerX, centerY);
			context.textBaseline="top";
			context.font = "12px Arial";
			context.fillText("Total", centerX, centerY + 8);
			context.restore();

			// context.save();
			// context.beginPath();
			// context.arc(centerX, centerY, radiusInner, 0, 2 * Math.PI, false);
			// context.closePath();
			// context.clip();
			// context.stroke();
			// context.fillStyle = this.parameters.backgroundColor || 'white';
			// context.clearRect(centerX - radiusInner, centerY - radiusInner, radiusInner * 2, radiusInner * 2);
			// context.fillRect(centerX - radiusInner, centerY - radiusInner, radiusInner * 2, radiusInner * 2);
			// context.lineWidth = 2;
			// context.strokeStyle = "black";
			// context.stroke();
			// context.restore();


		}
		if (serie.name)
			this.drawPieTitle(context, centerX, centerY, radiusOut, serie.name, serie.text);
		this.isFirstDraw = false;
	};

	PieSerie.prototype.init = function(option) {
		this.option = option;
		this.shapeStyle = new ShapeStyle(this.option.style);
	};

	PieSerie.prototype.drawPieTitle = function(context, x, y, radius, name, showText) {
		var range = 40 - 40 * this.parameters.progress;
		context.save();
		context.font = "15px Arial";
		context.textAlign = 'center';
		context.textBaseline = 'top';
		context.fillStyle = 'RGB(8,141,206)';
		if (showText != false)
			context.fillText(name, x, y + radius + range + 40);
		else
			context.fillText(name, x, y + radius + range + 30);
		context.restore();
	};

	// 画出线和各个扇形标题
	PieSerie.prototype.drawText = function(context, moveToX, moveToY, lineToX, lineToY, degree, textContext, rateContent) {
		var textX = 0,
			textY = lineToY;
		context.save();
		context.beginPath();
		context.fillStyle = "white";

		context.moveTo(moveToX, moveToY);
		// context.lineTo(lineToX, lineToY);

		// 弧度转换为角度来判断
		degree = (degree - Math.PI) * 180 / Math.PI;
		var range = 30 - 30 * this.parameters.progress;
		if ((degree >= 0 && degree < 90) || (degree <= 360 && degree > 270)) {
			// context.lineTo(lineToX - range, textY);
			textX = lineToX - range;
			// context.textAlign = 'right';
		} else if (degree != 90 && degree != 270) {
			// context.lineTo(lineToX + range, textY);
			textX = lineToX + range;
			// context.textAlign = 'left';
		} else {
			// context.lineTo(lineToX + range, textY);
			textX = lineToX + range;;
			// context.textAlign = 'left';
		}
		// if (degree == 90) {
		// 	context.textBaseline = 'middle';
		// } else if (degree == 270) {
		// 	context.textBaseline = 'top';
		// } else {
		// 	context.textBaseline = 'middle';
		// }
		context.textAlign = "center";
		
		context.stroke();

		// 当占比为0的时候，不显示出数据来
		if(rateContent != '0%'){
			context.textBaseline = 'bottom';
			context.font = "normal small-caps bold 14px arial";
			context.fillText(rateContent, textX, textY);
			context.textBaseline = 'top';
			context.font = "normal small-caps bold 10px arial";
			context.fillText(textContext, textX, textY);
			context.closePath();
			context.restore();
		}
		
	};

	var ChangeButton = function(parameters) {
		this.isFirstDraw = true;
		this.parameters = parameters;
	};
	ChangeButton.prototype.drawButton = function(canvas, touch, serie, sectorIndex) {
		if (serie.show == false) {
			return;
		}

		var context = canvas.getContext("2d");
		// 计算圆心的位置
		var centerX = serie.center[0] > 1 ? serie.center[0] : this.parameters.rootElementWH.w * serie.center[0];
		var centerY = serie.center[1] > 1 ? serie.center[1] : this.parameters.rootElementWH.h * serie.center[1];


		var radiusOut = 0;
		// pie的半径
		if (typeof(serie.radius) == 'number') {
			radiusOut = serie.radius > 1 ? serie.radius : serie.radius * this.parameters.rootElementWH.w;
		} else {
			radiusOut = serie.radius[0] > 1 ? serie.radius[0] : serie.radius[0] * this.parameters.rootElementWH.w;
		}

		context.save();
		context.strokeStyle = 'black';

		// 画出左边的箭头
		var range = 40 - 40 * this.parameters.progress;
		context.beginPath();
		var xLeft = centerX - radiusOut;
		var yLeft;
		if (serie.text != false)
			yLeft = centerY + radiusOut + 40;
		else
			yLeft = centerY + radiusOut + 30;

		context.moveTo(xLeft - range, yLeft);
		context.lineTo(xLeft - range - Math.sqrt(3) * this.parameters.changeButtonLength * 0.5, yLeft + this.parameters.changeButtonLength * 0.5);

		context.lineTo(xLeft - range, yLeft + this.parameters.changeButtonLength);
		context.closePath();
		context.stroke();

		// 画出右边的箭头
		context.beginPath();
		var xRight = centerX + radiusOut;
		var yRight;
		if (serie.text != false)
			yRight = centerY + radiusOut + 40;
		else
			yRight = centerY + radiusOut + 30;
		context.moveTo(xRight + range, yRight);
		context.lineTo(xRight + range + Math.sqrt(3) * this.parameters.changeButtonLength * 0.5, yRight + this.parameters.changeButtonLength * 0.5);
		context.lineTo(xRight + range, yRight + this.parameters.changeButtonLength);
		context.closePath();

		context.stroke();
		context.restore();



		if (this.parameters.progress === 1) {
			var obj = {
				"type": 1,
				"serie": serie,
				"button": [],
				"point": {
					"x": centerX,
					"y": centerY
				}
			};
			var buttonLeft = {
				"changeType": 0,
				"rect": {
					"moveTo": [xLeft - this.parameters.changeButtonLength, yLeft, this.parameters.changeButtonLength],
					"lineTo1": [xLeft - Math.sqrt(3) * this.parameters.changeButtonLength * 0.5, yLeft + this.parameters.changeButtonLength * 0.5],
					"lineTo2": [xLeft, yLeft + this.parameters.changeButtonLength]
				}
			};
			var buttonRight = {
				"changeType": 1,
				"rect": {
					"moveTo": [xRight, yRight, this.parameters.changeButtonLength],
					"lineTo1": [xRight + Math.sqrt(3) * this.parameters.changeButtonLength * 0.5, yRight + this.parameters.changeButtonLength * 0.5],
					"lineTo2": [xRight, yRight + this.parameters.changeButtonLength]
				}
			};
			obj.button.push(buttonLeft);
			obj.button.push(buttonRight);


			//每次的touch内容都要重新绑定，绑定之前删除之前绑定的数据
			for (var j = touch.clickElement.length - 1; j >= 0; j--) {
				if (touch.clickElement[j] && touch.clickElement[j].type == 1 && touch.clickElement[j].serie.name == serie.name) {
					touch.clickElement.splice(j, 1);
				}
			}
			touch.clickElement.push(obj);
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
	Tip.prototype.showTip = function(object, point) {
		if (!this.show) {
			this.element.style.display = "block";
		}
		var data = object.data,
			rate = 0,
			total = 0,
			datas = [];
		for (var i in data) {
			if (data[i].show) {
				datas.push(data[i]);
				total += data[i].value;

			}
		}

		var focusObj = {};
		for (var i in datas) {
			if (datas[i].checked) {
				focusObj['name'] = datas[i].name;
				focusObj['value'] = datas[i].value;
			}
		}

		rate = (focusObj.value / total) * 100;
		rate = rate.toFixed(2) + "%";

		// var udata = focusObj.name + ":" + "</br>" + focusObj.value;
		var udata = formatNumber(focusObj.value) +"</br>" + "(" + rate + ")";

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
	var Legend = function(option, touch, series, parameters) {
		this.option = option;
		this.touch = touch;
		this.series = series;
		this.parameters = parameters;
		this.isFirstDraw = true;
		this.fontStyle = "14px Arial";
		this.legendWidth = null;
		this.lineWidth = 3;
		this.legendWidthPercent = parameters.legendWidthPercent;
		this.icon = {
			width: 15,
			height: 8,
			top: 5,
			marginRight: 3,
			marginLeft: 10,
			marginTop: 5,
			marginBottom: 3
		};

		this.sectorNameGroup = this.groupBySectorName();
	};


	//按照sector的name来封装数据结构 [{"sectorName":[{'serie':serie,'index':j}]}]
	Legend.prototype.groupBySectorName = function() {
		var array = [];
		var seriesOption = this.series.option;
		for (var i = 0; i < seriesOption.length; i++) {
			//不展示的pie不封装在legend的结构里面
			if (seriesOption[i].show == false)
				continue;

			var datas = seriesOption[i].data;
			for (var j = 0; j < datas.length; j++) {
				var isHave = false;
				for (var k in array) {
					for (var key in array[k]) {
						if (key == datas[j].name) {
							array[k][key].push({
								'serie': seriesOption[i],
								'index': j
							});
							isHave = true;
						}
					}
				}
				if (!isHave) {
					var obj = {};
					obj[datas[j].name] = [{
						'serie': seriesOption[i],
						'index': j
					}];
					obj["show"] = true;
					array.push(obj);
				}
			}
		}

		// 按sectorname将color封装在this.parameters.colorArrayObj对象中去
		for (var i = 0; i < array.length; i++) {
			for (var k in array[i]) {
				if (k != 'color' && k != 'show')
					this.parameters.colorArrayObj[k] = getStrokeColorByIndex(i);
			}
		}
		return array;
	};

	Legend.prototype.drawLegend = function(canvas) {
		if (!this.option.show)
			return;
		if (!this.option.align || this.option.align === "left")
			this.drawLegendInLeft(canvas);
		else if (this.option.align === "right")
			this.drawLegendInRight(canvas);
	};
	Legend.prototype.drawLegendInRight = function(canvas) {
		var context = canvas.getContext("2d");
		var rootElementWH = this.parameters.rootElementWH;

		var count = 0; // 记录换行次数
		var picWidth = this.icon.marginLeft + this.icon.width + this.icon.marginRight;
		var picHeight = this.icon.marginTop + this.icon.height + this.icon.marginBottom;
		var maxCaption = Math.floor(rootElementWH.h / (picHeight + this.icon.top));

		// 记录换列次数
		var column = Math.floor(this.sectorNameGroup.length / maxCaption) + 1;

		//计算每一列中宽度最大的那个，放在对象maxWidths中去，key为列数
		context.save();
		context.font = this.fontStyle;
		var maxWidths = {};
		for (var i = 0; i < column; i++) {
			var maxWidth = 0;
			for (var j = i * maxCaption; j < (i + 1) * maxCaption; j++) {
				var obj = this.sectorNameGroup[j];
				var keyname;
				for (var k in obj) {
					if (k != 'show')
						keyname = k;
				}
				var textWidth = this.icon.marginLeft + context.measureText(keyname).width + this.icon.marginRight;
				var currentWidth = picWidth + textWidth;
				maxWidth = currentWidth > maxWidth ? currentWidth : maxWidth;
			}
			maxWidths[i] = maxWidth;
		}

		//每次的touch内容都要重新绑定，绑定之前删除之前绑定的数据
		if (this.parameters.progress === 1) {
			for (var j = this.touch.clickElement.length - 1; j >= 0; j--) {
				if (this.touch.clickElement[j] && this.touch.clickElement[j].type == 2) {
					this.touch.clickElement.splice(j, 1);
				}
			}
		}

		for (var i = 0; i < this.sectorNameGroup.length; i++) {
			var currentColumn = Math.floor(i / maxCaption);
			var currentColumnWidth = 0;
			var obj = this.sectorNameGroup[i];
			var keyname;
			for (var k in obj) {
				if (k != 'show')
					keyname = k;
			}

			var textWidth = this.icon.marginLeft + context.measureText(keyname).width + this.icon.marginRight;
			var currentWidth = picWidth + textWidth;

			//计算当前x轴离右边框的距离
			for (var j = 0; j < currentColumn + 1; j++) {
				currentColumnWidth += maxWidths[j];
			}

			var x = rootElementWH.w - currentColumnWidth;
			var y = (count % maxCaption) * (picHeight + this.icon.top);

			if (obj.show) {
				context.fillStyle = this.parameters.colorArrayObj[keyname];
				context.strokeStyle = "gray";
				textColor = "gray";
			} else {
				context.fillStyle = "gray";
				context.strokeStyle = "gray";
				textColor = "gray";
			}

			context.textBaseline = 'middle';
			context.fillRect(x, y + 10, picWidth, picHeight - 5);
			context.fillText(keyname, x + picWidth + 3, y + 15);


			if (this.parameters.progress === 1) {
				var object = {};
				object.rect = {
					x: x,
					y: y + 10,
					w: picWidth + this.icon.marginLeft + textWidth,
					h: picHeight
				};

				object.data = obj;
				object.type = 2;
				this.touch.clickElement.push(object);
			}
			count++;
		}
		context.restore();
	};


	Legend.prototype.drawLegendInLeft = function(canvas) {
		var context = canvas.getContext("2d");
		var rootElementWH = this.parameters.rootElementWH;

		var count = 0; // 记录换行次数
		var maxWidth = 0; // 图例最大的长度
		context.save();

		context.font = this.fontStyle;
		var picWidth = this.icon.marginLeft + this.icon.width + this.icon.marginRight;
		var picHeight = this.icon.marginTop + this.icon.height + this.icon.marginBottom;
		var maxCaption = Math.floor(rootElementWH.h / (picHeight + this.icon.top));
		// 记录换列次数
		var column = Math.floor(this.sectorNameGroup.length / maxCaption) + 1;

		var maxWidths = {};
		for (var i = 0; i < column; i++) {
			var maxWidth = 0;
			for (var j = i * maxCaption; j < (i + 1) * maxCaption; j++) {
				var obj = this.sectorNameGroup[j];
				var keyname;
				for (var k in obj) {
					if (k != 'show')
						keyname = k;
				}
				var textWidth = this.icon.marginLeft + context.measureText(keyname).width + this.icon.marginRight;
				var currentWidth = picWidth + textWidth;
				maxWidth = currentWidth > maxWidth ? currentWidth : maxWidth;
			}
			maxWidths[i] = maxWidth;
		}

		//每次的touch内容都要重新绑定，绑定之前删除之前绑定的数据
		if (this.parameters.progress === 1) {
			for (var j = this.touch.clickElement.length - 1; j >= 0; j--) {
				if (this.touch.clickElement[j] && this.touch.clickElement[j].type == 2) {
					this.touch.clickElement.splice(j, 1);
				}
			}
		}

		for (var i = 0; i < this.sectorNameGroup.length; i++) {
			var currentColumn = Math.floor(i / maxCaption);

			var obj = this.sectorNameGroup[i];
			var keyname;
			for (var k in obj) {
				if (k != 'show')
					keyname = k;
			}

			var textWidth = this.icon.marginLeft + context.measureText(keyname).width + this.icon.marginRight;
			var currentWidth = picWidth + textWidth;

			maxWidth = currentWidth > maxWidth ? currentWidth : maxWidth;

			var x = 5 + currentColumn * maxWidths[currentColumn];
			var y = (count % maxCaption) * (picHeight + this.icon.top);

			if (obj.show) {
				context.fillStyle = this.parameters.colorArrayObj[keyname];;
				context.strokeStyle = "gray";
				textColor = "gray";
			} else {
				context.fillStyle = "gray";
				context.strokeStyle = "gray";
				textColor = "gray";
			}

			context.textBaseline = 'middle';
			context.fillRect(x, y + 10, picWidth, picHeight - 5);
			context.fillText(keyname, x + picWidth + 3, y + 15);


			if (this.parameters.progress === 1) {
				var object = {};
				object.rect = {
					x: x,
					y: y + 10,
					w: picWidth + this.icon.marginLeft + textWidth,
					h: picHeight
				};

				object.data = obj;
				object.type = 2;
				this.touch.clickElement.push(object);
			}

			count++;
		}

		this.isFirstDraw = false;
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

		// 偏移量 最小值，当前值，最大值
		this.touchOffset = {
			min: 0,
			current: 0,
			max: 0
		};

		// 保存绘制坐标轴区域的canvas的大小
		this.middleCanvasWH = {
			w: 0,
			h: 0
		};

		// legend占用canvas宽度的百分比
		this.legendWidthPercent = 0.2;

		// 设置小突出的选择块上面的小指示图标的半径
		this.cursorRadius = 6;

		// 小指针的弧度大小
		this.cursorAngle = 0.15 * Math.PI;

		this.divElement = null;

		//箭头按钮的大小（等角三角形的边长）
		this.changeButtonLength = 20;

		this.sectorColorObj = {};

		//canvas的背景颜色
		this.backgroundColor = 'rgba(255,255,255,1)';

		//按sector的name存储不同的颜色
		this.colorArrayObj = {};
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
		this.clickElement = [];
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

	Touch.prototype.bindTouchEvent = function(callback) {
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
		var divPoint = {
			x: 0,
			y: 0
		};

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
			if (isClick) {
				for (var i in _self.clickElement) {
					var item = _self.clickElement[i];
					if (item.type == 0) { //检索点击的点是否在饼图上
						for (var k in item.sector) {
							var isInArea = _self.isPointInSector(startPoint, item.sector[k].rect);
							if (isInArea) {
								for (var j in item.serie.data) {
									if (item.serie.data[j].name == item.sector[k].index)
										item.serie.data[j].checked = true;
									else
										item.serie.data[j].checked = false;
								}
								callback && callback(_self.touchType.CLICK, item, startPoint);
								return;
							}
						}
					} else if (item.type == 1) { //检索点击的点是否在切换按钮上
						for (var j in item.button) {
							var isInArea = _self.isPointInButton(startPoint, item.button[j].rect);
							if (isInArea) {
								callback && callback(_self.touchType.CLICK, item, j);
								return;
							}
						}
					} else if (item.type == 2) { //检索点击的点是否在legend
						if (_self.isPointInRect(startPoint, item.rect)) {
							callback && callback(_self.touchType.CLICK, item, null);
							return;
						}
					}
				}
			}
			startPoint = {};
		};

		if (window.navigator.platform.indexOf("Win") != -1 || window.navigator.platform.indexOf("Mac") != -1) {
			_self.bindMouse(_self.element.parentElement, _self.touchBegin, _self.touchEnd);
		} else {
			_self.bindTouch(_self.element.parentElement, this.touchBegin, this.touchEnd);
		}
	};
	Touch.prototype.isPointInRect = function(point, rect) {
		var x = rect.x;
		var y = rect.y;
		var w = rect.w;
		var h = rect.h;
		if (point.x > x && point.x < x + w && point.y > y && point.y < y + h)
			return true;
		return false;
	};
	//判断点击的点是否在扇形区域内
	Touch.prototype.isPointInSector = function(point, rect) {

		var tempCanvas = document.createElement("canvas");
		var context = tempCanvas.getContext("2d");
		context.beginPath();
		context.moveTo(rect.moveTo[0], rect.moveTo[1]);
		context.lineTo(rect.lineTo[0], rect.lineTo[1]);
		context.arc(rect.moveTo[0], rect.moveTo[1], rect.arc[0], rect.arc[1], rect.arc[2], false);
		context.closePath();

		return context.isPointInPath(point.x, point.y);
	};
	//判断点击的点是否在等角三角形区域内
	Touch.prototype.isPointInButton = function(point, rect) {
		var tempCanvas = document.createElement("canvas");
		var context = tempCanvas.getContext("2d");
		context.beginPath();
		context.rect(rect.moveTo[0], rect.moveTo[1], rect.moveTo[2], rect.moveTo[2]);
		context.closePath();
		return context.isPointInPath(point.x, point.y);
	};

	/*
		移动端滑动事件
	*/
	Touch.prototype.bindTouch = function(element, startCb, endCb) {
		element.addEventListener("touchstart", function(e) {
			startCb(e);
			endCb(e);
		}, false);
	};

	/*
		web端滑动事件
	*/
	Touch.prototype.bindMouse = function(element, startCb, endCb) {
		element.addEventListener("click", function(e) {
			startCb(e);
			endCb(e);
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
					//this.animateStep && this.animateStep(1 - Math.pow(1 - (now - this.startTime) / this.timeout, 6), this.udata);
					this.animateStep && this.animateStep(EltaseOut((now - this.startTime) / this.timeout), this.udata);
					this.handle = requestAnimationFrame(this.step.bind(this));
				}
			}
		}
	};
	var M_PI_X_2 = Math.PI * 2;
	function EltaseOut(time)
	{
		var period = 0.35;
		var newT = 0;
	    if (time == 0 || time == 1)
	    {
	        newT = time;
	    }
	    else
	    {
	        var s = period / 4;
	        newT = Math.pow(2, -10 * time) * Math.sin((time - s) * M_PI_X_2 / period) + 1;
	    }
	    
	    return newT;
	}

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

	/**
		获取不同的线条颜色
	*/
	function getStrokeColorByIndex(globalIndex) {
		var i = globalIndex % 13;
		switch (i) {
			case 0:
				return "rgba(171,195,116,1)";
			case 1:
				return "rgba(46,199,201,1)";
			case 2:
				return "rgba(182,162,222,1)";
			case 3:
				return "rgba(123,192,242,1)";
			case 4:
				return "rgba(255,199,153,1)";
			case 5:
				return "rgba(223,148,153,1)";
			case 6:
				return "rgba(141,152,179,1)";
			case 7:
				return "rgba(234,216,61,1)";
			case 8:
				return "rgba(149,112,109,1)";
			case 9:
				return "rgba(227,135,187,1)";
			case 10:
				return "rgba(7,162,164,1)";
			case 11:
				return "rgba(154,127,209,1)";
			case 12:
				return "rgba(121,163,221,1)";
			default:
				return "white"; //never
		}
	}



	/*
	 * 获取随机颜色值
	 * @param min，最小取值，取值范围0-255
	 * @param max，最大取值，取值范围0-255
	 */
	function getColor(min, max) {
		var co = "";
		co += (getRandom(min, max) + ",");
		co += (getRandom(min, max) + ",");
		co += getRandom(min, max);
		return RGB2Hex(co);
	}

	/*
	 * 获取指定范围随机数
	 * @param min，最小取值
	 * @param max，最大取值
	 */

	function getRandom(min, max) {
		//x上限，y下限  
		var x = max;
		var y = min;
		if (x < y) {
			x = min;
			y = max;
		}
		var rand = parseInt(Math.random() * (x - y + 1) + y);
		return rand;
	}

	/*
	 * 获取颜色值
	 * @param rgb, RGB颜色值，如 "23,189,246"
	 */
	function RGB2Hex(rgb) {
		var re = rgb.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(","); //利用正则表达式去掉多余的部分 
		var hexColor = "#";
		var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
		for (var i = 0; i < 3; i++) {
			var r = null;
			var c = re[i];
			var hexAr = [];
			while (c > 16) {
				r = c % 16;
				c = (c / 16) >> 0;
				hexAr.push(hex[r]);
			}
			hexAr.push(hex[c]);
			hexColor += hexAr.reverse().join('');
		}
		return hexColor;
	}

	//将颜色高亮显示
	function getHightLightColor(rgba) {
		var st = rgba.indexOf('(');
		var valueStr = rgba.substring(st + 1, rgba.length - 1).split(',');
		return 'rgba(' + (parseInt(valueStr[0]) + 20) + ',' + (parseInt(valueStr[1]) + 20) + ',' + (parseInt(valueStr[2]) + 20) + ',' + '1)';
	}

	// 将数字每三位加逗号格式显示
	function formatNumber(n) {
		if(n == undefined)
			return "0";
		var b = parseInt(n).toString();
		var len = b.length;
		if (len <= 3) {
			return b;
		}
		var r = len % 3;
		return r > 0 ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g).join(",") : b.slice(r, len).match(/\d{3}/g).join(",");
	}

	if (!window.Mobilechart)
		window.Mobilechart = new Object();
	window.Mobilechart.pie = Pie;
})();