(function() {
	// 开发模式
	var debug = true;
	// 颜色下标
	var globalIndex = 0;
	// 16进制颜色正则
	var hexReg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	// canvas画布对象
	var canvasPrototype = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
	canvasPrototype.dottedLine = function(x1, y1, x2, y2) {
		var interval = 12;
		var isHorizontal = true;
		if (x1 == x2) {
			isHorizontal = false;
		}
		var len = isHorizontal ? x2 - x1 : y2 - y1;
		var progress = 0;
		this.beginPath();
		while (len > progress) {
			if (progress > len) {
				progress = len;
			}
			if (isHorizontal) {
				this.moveTo(parseInt(x1 + progress), parseInt(y1));
				this.lineTo(parseInt(x1 + progress + 7), parseInt(y1));
			} else {
				this.moveTo(parseInt(x1), parseInt(y1 + progress));
				this.lineTo(parseInt(x1), parseInt(y1 + progress + 6));
			}
			progress += interval;
		}
		this.stroke();
		this.closePath();
	};
	canvasPrototype.fillRoundRect = function(x1, y1, w, h, radius) {
		if (w < radius || h < radius)
			return;
		if (!radius)
			radius = 0;
		// radius = Math.floor(w + h)>>4;
		this.beginPath();
		this.moveTo(x1, y1 + h - radius);
		this.lineTo(x1, y1 + radius);
		this.arcTo(x1, y1, x1 + radius, y1, radius);
		this.lineTo(x1 + w - radius, y1);
		this.arcTo(x1 + w, y1, x1 + w, y1 + radius, radius);
		this.lineTo(x1 + w, y1 + h - radius);

		this.arcTo(x1 + w, y1 + h, x1 + w - radius, y1 + h, radius);
		this.lineTo(x1 + radius, y1 + h);
		this.arcTo(x1, y1 + h, x1, y1 + h - radius, radius);

		this.closePath();
		this.fill();
	};
	canvasPrototype.strokeRoundRect = function(x1, y1, w, h, radius) {
		if (w < radius || h < radius)
			return;
		if (!radius)
			radius = 0;
		// radius = Math.floor(w + h)>>4;
		this.beginPath();
		this.moveTo(x1, y1 + h - radius);
		this.lineTo(x1, y1 + radius);
		this.arcTo(x1, y1, x1 + radius, y1, radius);
		this.lineTo(x1 + w - radius, y1);
		this.arcTo(x1 + w, y1, x1 + w, y1 + radius, radius);
		this.lineTo(x1 + w, y1 + h - radius);

		this.arcTo(x1 + w, y1 + h, x1 + w - radius, y1 + h, radius);
		this.lineTo(x1 + radius, y1 + h);
		this.arcTo(x1, y1 + h, x1, y1 + h - radius, radius);

		this.closePath();
		this.stroke();
	};

	/*16进制颜色转为RGB格式*/
	String.prototype.toRgb = function() {
		var sColor = this.toLowerCase();
		if (sColor && hexReg.test(sColor)) {
			if (sColor.length === 4) {
				var sColorNew = "#";
				for (var i = 1; i < 4; i += 1) {
					sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
				}
				sColor = sColorNew;
			}
			//处理六位的颜色值  
			var sColorChange = [];
			for (var i = 1; i < 7; i += 2) {
				sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
			}
			return "rgb(" + sColorChange.join(",") + ")";
		} else {
			return sColor;
		}
	};
	/*16进制颜色转为RGBA格式*/
	String.prototype.toRgba = function(alpha) {
		if (!this)
			return this;

		// 16进制颜色正则
		var hexReg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;

		var _this = this.toLowerCase();
		if (hexReg.test(_this)) {
			// 把形如#ABC转成 #aabbcc
			if (_this.length === 4) {
				var newColor = '#';
				for (var i = 1; i < 4; i++)
					newColor += _this.slice(i, i + 1).concat(_this.slice(i, i + 1));
				_this = newColor;
			}

			// 处理转换的6位颜色值
			var colorArray = [];
			for (var i = 1; i < 7; i += 2) {
				colorArray.push(parseInt("0x" + _this.slice(i, i + 2)));
			}
			return 'rgba(' + colorArray.join(',') + ',' + (alpha || 1) + ')';
		}
		return this.toString();
	}



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
			if (style[i] === prop) {
				delete style[i];
				style[prop] = '';
			}
		}
		return this;
	};

	function getStyle(el, styleName) {
		var style = el.style[styleName] ? el.style[styleName] : el.currentStyle ? el.currentStyle[styleName] : window.getComputedStyle(el, null)[styleName];
		if (styleName == 'width') {
			if (style == 'auto') {
				style = window.innerWidth;
			} else {
				style = parseInt(style);
			}
		} else if (styleName == 'height') {
			style = parseInt(style);
		}

		return style;
	}



	/*
		供外面调用的对象
	*/
	var Basic = function(element) {

		// 根容器
		if (typeof element == "string")
			this.element = document.querySelector(element);
		else
			this.element = element;

		// 判断页面是否加载过
		this.loaded = false;
		this.option = null;
		// 判断是是否是第一次加载，有些绘制操作只需要操作一次
		this.defaultOption = {
			animation: {
				show: true,
				timeout: 1000
			},
			grid: {
				x: 60,
				y: 60,
				x2: 60,
				y2: 0,
				show: false
			},
			tip: {
				showLevel: 3 // 设置tip显示级别0(都不显示),1（显示点数据）,2（显示逻辑数据）,3（显示全部）
			}
		};
		this.parameters = new Parameters();
		this.container = null;
		this.axisTop = null;
		this.axisBottom = null;
		this.axisLeft = null;
		this.axisRight = null;
		this.touch = null;
		this.tween = null;
		this.series = null;
		this.grid = null;
		this.title = null;
		this.legend = null;
		this.tip = null;
		this.arrowLogo = null;
		this.toolbox = null;
		this.type = 'basic';
		this.originalOption = null;
		// 别的图转换
		this.fromOption = null;
		globalIndex = 0;
		console.group(this);
	};
	Basic.prototype.init = function(option, fromOption) {
		this.loaded = false;
		globalIndex = 0;

		this.fromOption = fromOption;
		// 整合用户设置和默认的值
		this.option = util.extend(true, {}, this.defaultOption, option);

		// 解析option数据
		this.parseOption();

		// 如果页面本身没有元素,则创建需要的html元素（因为从pie图转换为bar图出现问题）
		this.container = new Container(this.element, this.parameters);
		this.container.drawHTML();
		// 计算必要的数据
		this.calculateCommonData();
		// 创建对象
		this.series = new Series(this.option.series, this.parameters);
		this.touch = new Touch(this.container.parentElement, this.parameters);
		this.title = new Title(this.option.title, this.parameters);
		this.option.legend && (this.legend = new Legend(this.option.legend, this.series, this.parameters));
		this.grid = new Grid(this.option.grid, this.parameters);
		this.tip = new Tip(this.option.tip, this.container.tipElement, this.parameters);
		this.arrowLogo = new ArrowLogo(this.parameters);
		if (!util.isEmpty(this.option.toolbox) && (this.option.toolbox.show === undefined || this.option.toolbox.show === true)) {
			this.toolbox = new Mobilechart.toolbox(this);
			this.originalOption = util.extend(true, {
				type: this.type
			}, this.option);
		}

		// 开始绘制页面(判断是否需要动画)
		this.load(function() {
			// 绑定事件
			this.bind();
		}.bind(this));

		// this.translate2Pie();
		// this.translate2Radar();
	};
	/*
		画布开始渲染
	*/
	Basic.prototype.load = function(callback) {
		callback = callback || function() {};
		// 设置legend为第一次加载
		if (!this.loaded) {
			this.legend && (this.legend.isFirstDraw = true);
			this.tip.show = false;
		}

		if (this.option.animation.show == true) {
			if (!this.tween)
				this.tween = new Tween(this.option.animation.timeout);
			this.parameters.progress = 0;
			this.tween.start(null, this.step.bind(this), callback, null);
		} else {
			this.parameters.progress = 1;
			this.draw();
			callback();
		}
	};
	/*
		解析option
	*/
	Basic.prototype.parseOption = function() {
		var _this = this;

		// 初始化x轴数据
		function parseXAxis(xAxisArray) {
			if (xAxisArray.length == 1) {
				var position = xAxisArray[0].position || "bottom";
				var type = xAxisArray[0].type;
				// x轴的位置
				if ("top" === position) {
					if (type === "category") {
						_this.parameters.seriesClick = xAxisArray[0].click;
						_this.parameters.axisConfig.top = _this.parameters.axisType.CATEGORY;
						_this.axisTop = new CategoryAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.T);

					} else if (type === "value") {
						_this.parameters.axisConfig.top = _this.parameters.axisType.VALUE;
						_this.axisTop = new ValueAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.T);
					}
				} else {
					if (type === "category") {
						_this.parameters.seriesClick = xAxisArray[0].click;
						_this.parameters.axisConfig.bottom = _this.parameters.axisType.CATEGORY;
						_this.axisBottom = new CategoryAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.B);
					} else if (type === "value") {
						_this.parameters.axisConfig.bottom = _this.parameters.axisType.VALUE;
						_this.axisBottom = new ValueAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.B);
					}
				}
			} else if (xAxisArray.length === 2) {
				var position1 = xAxisArray[0].position;
				var position2 = xAxisArray[1].position;
				var type1 = xAxisArray[0].type;
				var type2 = xAxisArray[1].type;
				// 轴里面的2个数据都没有配位置属性
				if (!position1 && !position2 || "bottom" === position1) {
					if ("category" === type1) {
						_this.parameters.seriesClick = xAxisArray[0].click;
						_this.axisBottom = new CategoryAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.B);
						_this.parameters.axisConfig.bottom = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type1) {
						_this.axisBottom = new ValueAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.B);
						_this.parameters.axisConfig.bottom = _this.parameters.axisType.VALUE;
					}

					if ("category" === type2) {
						_this.parameters.seriesClick = xAxisArray[1].click;
						_this.axisTop = new CategoryAxis(xAxisArray[1], _this.parameters, _this.parameters.orientation.T);
						_this.parameters.axisConfig.top = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type2) {
						_this.axisTop = new ValueAxis(xAxisArray[1], _this.parameters, _this.parameters.orientation.T);
						_this.parameters.axisConfig.top = _this.parameters.axisType.VALUE;
					}

				} else if ("bottom" === position2) {
					if ("category" === type2) {
						_this.parameters.seriesClick = xAxisArray[1].click;
						_this.axisBottom = new CategoryAxis(xAxisArray[1], _this.parameters, _this.parameters.orientation.B);
						_this.parameters.axisConfig.bottom = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type2) {
						_this.axisBottom = new ValueAxis(xAxisArray[1], _this.parameters, _this.parameters.orientation.B);
						_this.parameters.axisConfig.bottom = _this.parameters.axisType.VALUE;
					}

					if ("category" === type1) {
						_this.parameters.seriesClick = xAxisArray[0].click;
						_this.axisTop = new CategoryAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.T);
						_this.parameters.axisConfig.top = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type1) {
						_this.parameters.seriesClick = xAxisArray[0].click;
						_this.axisTop = new ValueAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.T);
						_this.parameters.axisConfig.top = _this.parameters.axisType.VALUE;
					}
				}
			}
		}

		// 初始化y轴数据
		function parseYAxis(yAxisArray) {
			var yAxisArray = _this.option.yAxis;
			if (yAxisArray.length == 1) {
				var position = yAxisArray[0].position || "left";
				var type = yAxisArray[0].type;
				if ("right" === position) {
					if (type === "category") {
						_this.parameters.seriesClick = yAxisArray[0].click;
						_this.parameters.axisConfig.right = _this.parameters.axisType.CATEGORY;
						_this.axisRight = new CategoryAxis(yAxisArray[0], _this.parameters, _this.parameters.orientation.R);
					} else if (type === "value") {
						_this.parameters.axisConfig.right = _this.parameters.axisType.VALUE;
						_this.axisRight = new ValueAxis(yAxisArray[0], _this.parameters, _this.parameters.orientation.R);
					}
				} else {
					if (type === "category") {
						_this.parameters.seriesClick = yAxisArray[0].click;
						_this.parameters.axisConfig.left = _this.parameters.axisType.CATEGORY;
						_this.axisLeft = new CategoryAxis(yAxisArray[0], _this.parameters, _this.parameters.orientation.L);
					} else if (type === "value") {
						_this.parameters.axisConfig.left = _this.parameters.axisType.VALUE;
						_this.axisLeft = new ValueAxis(yAxisArray[0], _this.parameters, _this.parameters.orientation.L);
					}
				}
			} else if (yAxisArray.length === 2) {
				var position1 = yAxisArray[0].position;
				var position2 = yAxisArray[1].position;
				var type1 = yAxisArray[0].type;
				var type2 = yAxisArray[1].type;
				// 轴里面的2个数据都没有配位置属性
				if (!position1 && !position2 || "left" === position1) {
					if ("category" === type1) {
						_this.parameters.seriesClick = yAxisArray[0].click;
						_this.axisLeft = new CategoryAxis(yAxisArray[0], _this.parameters, _this.parameters.orientation.L);
						_this.parameters.axisConfig.left = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type1) {
						_this.axisLeft = new ValueAxis(yAxisArray[0], _this.parameters, _this.parameters.orientation.L);
						_this.parameters.axisConfig.left = _this.parameters.axisType.VALUE;
					}

					if ("category" === type2) {
						_this.parameters.seriesClick = yAxisArray[1].click;
						_this.axisRight = new CategoryAxis(yAxisArray[1], _this.parameters, _this.parameters.orientation.R);
						_this.parameters.axisConfig.right = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type2) {
						_this.axisRight = new ValueAxis(yAxisArray[1], _this.parameters, _this.parameters.orientation.R);
						_this.parameters.axisConfig.right = _this.parameters.axisType.VALUE;
					}

				} else if ("left" === position2) {
					if ("category" === type2) {
						_this.parameters.seriesClick = yAxisArray[1].click;
						_this.axisLeft = new CategoryAxis(yAxisArray[1], _this.parameters, _this.parameters.orientation.L);
						_this.parameters.axisConfig.left = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type2) {
						_this.axisLeft = new ValueAxis(yAxisArray[1], _this.parameters, _this.parameters.orientation.L);
						_this.parameters.axisConfig.left = _this.parameters.axisType.VALUE;
					}

					if ("category" === type1) {
						_this.parameters.seriesClick = yAxisArray[0].click;
						_this.axisRight = new CategoryAxis(yAxisArray[0], _this.parameters, _this.parameters.orientation.R);
						_this.parameters.axisConfig.right = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type1) {
						_this.axisRight = new ValueAxis(yAxisArray[0], _this.parameters, _this.parameters.orientation.R);
						_this.parameters.axisConfig.right = _this.parameters.axisType.VALUE;
					}
				}
			}
		}

		parseXAxis(this.option.xAxis);
		parseYAxis(this.option.yAxis);

		// 保存grid的设置
		this.parameters.grid = this.option.grid;
		// 保存背景色
		this.parameters.backgroundColor = this.option.backgroundColor || this.parameters.backgroundColor;


		// 保存当前运行js的平台 mobile // web
		if (window.navigator.platform.indexOf("Win") != -1 || window.navigator.platform.indexOf("Mac") != -1) {
			this.parameters.runPlatform = "web";
		} else {
			this.parameters.runPlatform = "mobile";
		}
	};
	/*
		计算通用的一些数据
		翻转的时候需要调用该函数，所以有需要重新计算的放到这个函数里面，
		不需要重新计算的可以放到parseOption函数里
	*/
	Basic.prototype.calculateCommonData = function() {
		// 计算偏移量(左右为逻辑轴)
		function getHorizontalCategoryOffset(array) {
			var res = [];
			var canvas = document.createElement('canvas');
			var context = canvas.getContext("2d");
			for (var i = 0; i < array.length; i++) {
				var measure = context.measureText(array[i]);
				res.push(measure.width);
			}
			return util.getMaxValueFromArray(res);
		}

		// 计算偏移量(左右为逻辑轴)
		function getVerticalCategoryOffset(array) {
			var res = [];
			for (var i = 0; i < array.length; i++) {
				res.push(measureTextSize(array[i]).height);
			}
			return util.getMaxValueFromArray(res);
		}


		// 保存绘制坐标轴可见区域的位置
		this.parameters.visualArea = this.container.visualArea;
		// 保存根容器的宽高
		this.parameters.rootElementWH = {
			w: this.container.rootElementWidth,
			h: this.container.rootElementHeight
		};
		// 保存middleCanvas的宽高
		this.parameters.middleCanvasWH = {
			w: this.container.middleCanvas.offsetWidth || getStyle(this.container.middleCanvas, 'width'),
			h: this.container.middleCanvas.offsetHeight || getStyle(this.container.middleCanvas, 'height')
		};


		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		if (axisConfig.bottom === axisType.CATEGORY) {
			// this.parameters.categoryOffset = this.axisBottom.option.offset;
			this.parameters.categoryOffset = getVerticalCategoryOffset(this.axisBottom.option.data) + this.parameters.ruleLength;


			// 用户逻辑轴分几页显示 默认是1
			// 在调用页数变化之后调用别的工具会改变页数
			if (this.parameters.page == null)
				this.parameters.page = this.axisBottom.option.page || 1;

			// 逻辑轴data数据的总长度
			this.parameters.categoryDataLength = this.axisBottom.option.data.length;
			// 一页显示多少个端点
			this.parameters.categoryPageCapacity = Math.ceil(this.axisBottom.option.data.length / this.parameters.page);
			// 通过计算得到的实际页数
			this.parameters.realPage = Math.ceil(this.axisBottom.option.data.length / this.parameters.categoryPageCapacity);
			// 逻辑轴每段间隔长度
			this.parameters.categorySegmentLength = (this.parameters.visualArea.w - this.parameters.grid.x * 0.5 - this.parameters.grid.x2 * 0.5) / this.parameters.categoryPageCapacity;
			// 默认偏移量
			this.parameters.touchOffset.current = this.parameters.visualArea.w + this.parameters.grid.x * 0.5;
			// canvas画布默认偏移量
			this.parameters.scrollOffset = -this.parameters.visualArea.w + this.parameters.grid.x * 0.5;

		} else if (axisConfig.top === axisType.CATEGORY) {
			// this.parameters.categoryOffset = this.axisTop.option.offset;
			this.parameters.categoryOffset = getVerticalCategoryOffset(this.axisTop.option.data) + this.parameters.ruleLength;

			if (this.parameters.page == null)
				this.parameters.page = this.axisTop.option.page || 1;

			this.parameters.categoryDataLength = this.axisTop.option.data.length;
			this.parameters.categoryPageCapacity = Math.ceil(this.axisTop.option.data.length / this.parameters.page);
			this.parameters.realPage = Math.ceil(this.axisTop.option.data.length / this.parameters.categoryPageCapacity);
			this.parameters.categorySegmentLength = (this.parameters.visualArea.w - this.parameters.grid.x * 0.5 - this.parameters.grid.x2 * 0.5) / this.parameters.categoryPageCapacity;
			this.parameters.touchOffset.current = this.parameters.visualArea.w + this.parameters.grid.x * 0.5;
			this.parameters.scrollOffset = -this.parameters.visualArea.w + this.parameters.grid.x * 0.5;
		} else if (axisConfig.left === axisType.CATEGORY) {
			// this.parameters.categoryOffset = this.axisLeft.option.offset;
			this.parameters.categoryOffset = getHorizontalCategoryOffset(this.axisLeft.option.data) + this.parameters.ruleLength;

			if (this.parameters.page == null)
				this.parameters.page = this.axisLeft.option.page || 1;
			this.parameters.categoryDataLength = this.axisLeft.option.data.length;
			this.parameters.categoryPageCapacity = Math.ceil(this.axisLeft.option.data.length / this.parameters.page);
			this.parameters.realPage = Math.ceil(this.axisLeft.option.data.length / this.parameters.categoryPageCapacity);
			this.parameters.categorySegmentLength = this.parameters.visualArea.h / this.parameters.categoryPageCapacity;
			this.parameters.touchOffset.current = this.parameters.visualArea.h;
			this.parameters.scrollOffset = -this.parameters.visualArea.h;
		} else if (axisConfig.right === axisType.CATEGORY) {
			// this.parameters.categoryOffset = this.axisRight.option.offset;
			this.parameters.categoryOffset = getHorizontalCategoryOffset(this.axisRight.option.data) + this.parameters.ruleLength;


			if (this.parameters.page == null)
				this.parameters.page = this.axisRight.option.page || 1;
			this.parameters.categoryDataLength = this.axisRight.option.data.length;
			this.parameters.categoryPageCapacity = Math.ceil(this.axisRight.option.data.length / this.parameters.page);
			this.parameters.realPage = Math.ceil(this.axisRight.option.data.length / this.parameters.categoryPageCapacity);
			this.parameters.categorySegmentLength = this.parameters.visualArea.h / this.parameters.categoryPageCapacity;
			this.parameters.touchOffset.current = this.parameters.visualArea.h;
			this.parameters.scrollOffset = -this.parameters.visualArea.h;
		}
	};
	/*
		初始化动画调用函数
	*/
	Basic.prototype.step = function(progress) {
		this.parameters.progress = progress;
		this.draw(progress);

	};
	Basic.prototype.draw = function() {
		this.series.clear(this.container.middleCanvas);
		// 绘制splitline
		this.drawExtendsLine(this.container.middleCanvas);
		this.drawCategoryAxis(this.container.middleCanvas);
		this.drawSeries(this.container.middleCanvas);
		if (!this.loaded) {
			this.drawLegend(this.container.bottomCanvas);
			this.drawTitle(this.container.bottomCanvas);
			//			this.container.bottomCanvas
			this.grid.drawGrid(this.container.topCanvas);
			this.drawValueAxis(this.container.topCanvas);
			this.drawAxisName(this.container.topCanvas);
			this.drawArrowLogo(this.container.backArrowCanvas, this.container.forwardArrowCanvas);
			this.loaded = true;

			// 注册事件
			this.registEvent();
		}

		// 注册事件
		if (arguments[0] == 1) {
			this.registEvent();
		}

	};
	/*
		清空画布
	*/
	Basic.prototype.clear = function(canvas, rect) {
		var context = canvas.getContext("2d");
		if (rect)
			context.clearRect(rect.x, rect.y, rect.w, rect.h);
		else
			context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	};
	/*
		绘制逻辑轴
	*/
	Basic.prototype.drawCategoryAxis = function(canvas) {
		this.axisBottom instanceof CategoryAxis && this.axisBottom.drawInBottom(canvas);
		this.axisTop instanceof CategoryAxis && this.axisTop.drawInTop(canvas);
		this.axisLeft instanceof CategoryAxis && this.axisLeft.drawInLeft(canvas);
		this.axisRight instanceof CategoryAxis && this.axisRight.drawInRight(canvas);
	};
	/*
		绘制值轴
	*/
	Basic.prototype.drawValueAxis = function(canvas) {
		this.axisBottom instanceof ValueAxis && this.axisBottom.drawInBottom(canvas);
		this.axisTop instanceof ValueAxis && this.axisTop.drawInTop(canvas);
		this.axisLeft instanceof ValueAxis && this.axisLeft.drawInLeft(canvas);
		this.axisRight instanceof ValueAxis && this.axisRight.drawInRight(canvas);
	};
	/*
		绘制值轴0线
	*/
	Basic.prototype.drawExtendsLine = function(canvas) {
		this.axisBottom instanceof ValueAxis && this.axisBottom.drawExtendsLine(canvas);
		this.axisTop instanceof ValueAxis && this.axisTop.drawExtendsLine(canvas);
		this.axisLeft instanceof ValueAxis && this.axisLeft.drawExtendsLine(canvas);
		this.axisRight instanceof ValueAxis && this.axisRight.drawExtendsLine(canvas);
	};

	/*
		绘制图标标题
	*/
	Basic.prototype.drawTitle = function(canvas) {
		this.title.drawTitle(canvas);
	};

	/*
		绘制图例
	*/
	Basic.prototype.drawLegend = function(canvas) {
		this.legend && this.legend.drawLegend(canvas);
	};

	/*
		绘制轴名称
	*/
	Basic.prototype.drawAxisName = function(canvas) {
		this.axisBottom instanceof ValueAxis && this.axisBottom.drawAxisName(canvas);
		this.axisTop instanceof ValueAxis && this.axisTop.drawAxisName(canvas);
		this.axisLeft instanceof ValueAxis && this.axisLeft.drawAxisName(canvas);
		this.axisRight instanceof ValueAxis && this.axisRight.drawAxisName(canvas);

		this.axisBottom instanceof CategoryAxis && this.axisBottom.drawCategoryName(canvas);
		this.axisTop instanceof CategoryAxis && this.axisTop.drawCategoryName(canvas);
		this.axisLeft instanceof CategoryAxis && this.axisLeft.drawCategoryName(canvas);
		this.axisRight instanceof CategoryAxis && this.axisRight.drawCategoryName(canvas);
	};

	/*
		绘制图形
	*/
	Basic.prototype.drawSeries = function(canvas) {
		this.series.draw(canvas);
	};

	/*
		绘制箭头
	*/
	Basic.prototype.drawArrowLogo = function(backCanvas, forwardCanvas) {
		if (this.parameters.realPage == 1)
			return;

		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		if (axisConfig.bottom === axisType.CATEGORY || axisConfig.top === axisType.CATEGORY) {
			this.arrowLogo.drawBackdArrow(backCanvas, this.parameters.orientation.L);
			this.arrowLogo.drawForwardArrow(forwardCanvas, this.parameters.orientation.R);
		} else if (axisConfig.left === axisType.CATEGORY || axisConfig.right === axisType.CATEGORY) {
			this.arrowLogo.drawBackdArrow(backCanvas, this.parameters.orientation.T);
			this.arrowLogo.drawForwardArrow(forwardCanvas, this.parameters.orientation.B);
		}
	};

	/*
		注册区域事件
		（在load第一次的时候注册一下，在progress为1的最后一次注册一下。防止中间用户点击操作）
	*/
	Basic.prototype.registEvent = function() {
		// 注册图例的点击区域
		this.legend && this.touch.registEvent(this.parameters.touchTargetType.LEGENDS, this.legend.area);
		// 注册series的点击区域
		this.touch.registEvent(this.parameters.touchTargetType.SERIES, this.series.area);

	};
	/*
		绑定事件
	*/
	Basic.prototype.bind = function() {
		var _this = this;
		// 分页大于1启用滑动
		if (this.parameters.page > 1) {
			this.touch.enforceScroll = true;
		}
		this.touch.trigger(function(touchType, touchObject, point) {
			// 滑动回调
			_this.tip.hideTip();
			if (touchType == _this.touch.touchType.SCROLL) {
				_this.scroll(touchObject);
			}
		}, function(touchType, touchObject, point) {
			// 点击回调
			if (touchType == _this.touch.touchType.SCROLL) {
				_this.scrollEnd(touchType, point);
			} else if (touchType == _this.touch.touchType.CLICK) {
				_this.click(touchObject, point);
			}
		});



		/*
			监听屏幕变化重新加载画布 resize	 orientationchange
			"onorientationchange" in window ? "orientationchange" : "resize"
		*/
		window.addEventListener("resize", function() {
			_this.refresh();
		}, false);
	};


	/*
		滑动事件
	*/
	Basic.prototype.scroll = function(offsetObject) {
		if (this.parameters.progress != 1)
			return;

		this.clearStaff();
		this.drawValueAxis(this.container.topCanvas);
		var categoryDataLength = this.parameters.categoryDataLength;
		var categoryPageCapacity = this.parameters.categoryPageCapacity;
		var categorySegmentLength = this.parameters.categorySegmentLength;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var grid = this.parameters.grid;
		var offset = 0;

		//		console.log(this.parameters.scrollOffset + "," + this.parameters.touchOffset.current + "," + categoryDataLength * categorySegmentLength);


		if (axisConfig.bottom == axisType.CATEGORY || axisConfig.top == axisType.CATEGORY) {
			this.parameters.scrollOffset += offsetObject.x;
			this.parameters.touchOffset.current += offsetObject.x;

			if (this.parameters.touchOffset.current > this.parameters.visualArea.w + grid.x * 0.5) {
				this.parameters.scrollOffset -= this.parameters.touchOffset.current - (this.parameters.visualArea.w + grid.x * 0.5);
				this.parameters.touchOffset.current = this.parameters.visualArea.w + grid.x * 0.5;

				// 隐藏箭头
				this.arrowLogo.hide(this.container.backArrowCanvas);
			} else if (this.parameters.touchOffset.current + categoryDataLength * categorySegmentLength - (this.parameters.visualArea.w * 2 - grid.x * 0.5) < 0) {
				this.parameters.scrollOffset -= this.parameters.touchOffset.current + (categoryDataLength * categorySegmentLength - this.parameters.visualArea.w * 2 + grid.x * 0.5);
				this.parameters.touchOffset.current = -(categoryDataLength * categorySegmentLength - this.parameters.visualArea.w * 2 + grid.x * 0.5);

				// 隐藏箭头
				this.arrowLogo.hide(this.container.forwardArrowCanvas);
			} else {
				this.arrowLogo.show(this.container.backArrowCanvas);
				this.arrowLogo.show(this.container.forwardArrowCanvas);
			}

			this.container.setMiddleCanvasStyle({
				"left": this.parameters.scrollOffset
			});
		} else if (axisConfig.left == axisType.CATEGORY || axisConfig.right == axisType.CATEGORY) {
			this.parameters.scrollOffset += offsetObject.y;
			this.parameters.touchOffset.current += offsetObject.y;

			if (this.parameters.touchOffset.current > this.parameters.visualArea.h) {
				this.parameters.scrollOffset -= this.parameters.touchOffset.current - this.parameters.visualArea.h;
				this.parameters.touchOffset.current = this.parameters.visualArea.h;

				this.arrowLogo.hide(this.container.backArrowCanvas);
			} else if (this.parameters.touchOffset.current + categoryDataLength * categorySegmentLength - this.parameters.visualArea.h * 2 < 0) {
				this.parameters.scrollOffset -= this.parameters.touchOffset.current + (categoryDataLength * categorySegmentLength - this.parameters.visualArea.h * 2);
				this.parameters.touchOffset.current = -(categoryDataLength * categorySegmentLength - this.parameters.visualArea.h * 2);

				this.arrowLogo.hide(this.container.forwardArrowCanvas);
			} else {
				this.arrowLogo.show(this.container.backArrowCanvas);
				this.arrowLogo.show(this.container.forwardArrowCanvas);
			}

			this.container.setMiddleCanvasStyle({
				"top": this.parameters.scrollOffset
			});
		}
	};

	/*
		滑动结束调用函数
	*/
	Basic.prototype.scrollEnd = function(type, point) {
		if (this.parameters.progress != 1)
			return;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var grid = this.parameters.grid;
		var range = this.parameters.traversalRange();
		var categoryPageCapacity = this.parameters.categoryPageCapacity;
		var categorySegmentLength = this.parameters.categorySegmentLength;
		var begin = range.begin;
		var middle = range.middle;
		var leafArr = this.series.area.leaf;

		for (var i = 0; i < categoryPageCapacity + 1; i++) {
			var leaf = leafArr[i];
			if (axisConfig.left === axisType.VALUE || axisConfig.right === axisType.VALUE) {
				leaf.rect.x = grid.x + i * categorySegmentLength + ((this.parameters.touchOffset.current - grid.x * 0.5 > 0 ? Math.floor(this.parameters.touchOffset.current - grid.x * 0.5 + 0.5) : Math.floor(this.parameters.touchOffset.current - grid.x * 0.5 - 0.5)) - this.parameters.visualArea.w) % categorySegmentLength;
				leaf.data = middle + i;
			} else if (axisConfig.top === axisType.VALUE || axisConfig.bottom === axisType.VALUE) {
				leaf.rect.y = grid.y + i * categorySegmentLength + ((this.parameters.touchOffset.current > 0 ? Math.floor(this.parameters.touchOffset.current + 0.5) : Math.floor(this.parameters.touchOffset.current - 0.5)) - this.parameters.visualArea.h) % categorySegmentLength;
				leaf.data = middle + i;
			}
		}

		this.draw();

		if (axisConfig.bottom == axisType.CATEGORY || axisConfig.top == axisType.CATEGORY) {
			//			this.container.middleCanvas.style.left = -this.parameters.visualArea.w + "px";
			this.container.setMiddleCanvasStyle({
				"left": -this.parameters.visualArea.w + grid.x * 0.5
			});
			this.parameters.scrollOffset = this.container.middleCanvas.offsetLeft;
		} else if (axisConfig.left == axisType.CATEGORY || axisConfig.right == axisType.CATEGORY) {
			this.container.middleCanvas.style.top = -this.parameters.visualArea.h + "px";
			this.parameters.scrollOffset = this.container.middleCanvas.offsetTop;
		}


	};


	Basic.prototype.click = function(data, point) {
		if (!data)
			return;

		if (data.type == this.parameters.touchTargetType.LEGEND) {
			this.tip.hideTip();
			if (data.data.show != undefined) {
				data.data.show = !data.data.show;
				this.load();
				this.drawLegend(this.container.bottomCanvas);
			}
		} else if (data.type == this.parameters.touchTargetType.SERIES) { // 区域块
			var axisConfig = this.parameters.axisConfig;
			var axisType = this.parameters.axisType;
			var categoryAxis = null;
			var index = data.data;
			if (axisConfig.bottom === axisType.CATEGORY) {
				categoryAxis = this.axisBottom;
			} else if (axisConfig.top === axisType.CATEGORY) {
				categoryAxis = this.axisTop;
			} else if (axisConfig.left === axisType.CATEGORY) {
				categoryAxis = this.axisLeft;
			} else if (axisConfig.right === axisType.CATEGORY) {
				categoryAxis = this.axisRight;
			}

			// 当用户在逻辑轴上配置click回调函数的时候
			if (data.click) {
				var obj = [];
				if (data.leaf.length > 0) {
					for (var i = 0; i < data.leaf.length; i++) {
						obj.push([categoryAxis.option.data[index], data.leaf[i].data.serie.data[index]]);
					}
				}
				data.click(obj);
			}


			if (this.tip.option.showLevel != 2 && this.tip.option.showLevel != 3)
				return;

			this.drawStaff(data);
			this.drawValueAxis(this.container.topCanvas);

			var formatter = "";
			var tip = categoryAxis.option.data[index] + "<br/>";
			for (var i = 0; i < this.series.option.length; i++) {
				var serie = this.series.option[i];
				var xAxisIndex = serie.xAxisIndex == undefined ? 1 : serie.xAxisIndex;
				var yAxisIndex = serie.yAxisIndex || 0;

				if (xAxisIndex == 0 && axisConfig.bottom === axisType.VALUE) {
					if (this.axisBottom.option.axisLabel) {
						formatter = this.axisBottom.option.axisLabel.formatter;
					}
				} else if (xAxisIndex == 1 && axisConfig.top === axisType.VALUE) {
					if (this.axisTop.option.axisLabel) {
						formatter = this.axisTop.option.axisLabel.formatter;
					}
				}

				if (yAxisIndex == 0 && axisConfig.left === axisType.VALUE) {
					if (this.axisLeft.option.axisLabel) {
						formatter = this.axisLeft.option.axisLabel.formatter;
					}
				} else if (yAxisIndex == 1 && axisConfig.right === axisType.VALUE) {
					if (this.axisRight.option.axisLabel) {
						formatter = this.axisRight.option.axisLabel.formatter;
					}
				}

				if (typeof formatter === "string") {
					formatter = formatter.replace(this.parameters.valueAxisFormatter, serie.data[index] || "-");
				} else if (typeof formatter === "function") {
					formatter = formatter(serie.data[index] || "-");
				}

				tip += serie.name + ": " + formatter + "<br/>";
			}
			this.tip.showTip(tip, point);
		} else if (data.type == this.parameters.touchTargetType.SERIE) { // 每个图形
			var axisConfig = this.parameters.axisConfig;
			var axisType = this.parameters.axisType;
			var categoryAxis = null;
			var index = data.data;
			if (axisConfig.bottom === axisType.CATEGORY) {
				categoryAxis = this.axisBottom;
			} else if (axisConfig.top === axisType.CATEGORY) {
				categoryAxis = this.axisTop;
			} else if (axisConfig.left === axisType.CATEGORY) {
				categoryAxis = this.axisLeft;
			} else if (axisConfig.right === axisType.CATEGORY) {
				categoryAxis = this.axisRight;
			}

			// 当用户在逻辑轴上配置click回调函数的时候
			if (data.click) {
				data.click([categoryAxis.option.data[data.data.index], data.data.serie.data[data.data.index]]);
			}


			if (this.tip.option.showLevel != 1 && this.tip.option.showLevel != 3)
				return;


			this.clearStaff();
			this.drawValueAxis(this.container.topCanvas);
			//			this.drawStaff(data);

			var index = data.data.index;
			var serie = data.data.serie;
			var axisConfig = this.parameters.axisConfig;
			var axisType = this.parameters.axisType;
			var xAxisIndex = serie.xAxisIndex == undefined ? 1 : serie.xAxisIndex;
			var yAxisIndex = serie.yAxisIndex || 0;
			var formatter = "";
			if (xAxisIndex == 0 && axisConfig.bottom === axisType.VALUE) {
				if (this.axisBottom.option.axisLabel) {
					formatter = this.axisBottom.option.axisLabel.formatter;
				}
			} else if (xAxisIndex == 1 && axisConfig.top === axisType.VALUE) {
				if (this.axisTop.option.axisLabel) {
					formatter = this.axisTop.option.axisLabel.formatter;
				}
			}

			if (yAxisIndex == 0 && axisConfig.left === axisType.VALUE) {
				if (this.axisLeft.option.axisLabel) {
					formatter = this.axisLeft.option.axisLabel.formatter;
				}
			} else if (yAxisIndex == 1 && axisConfig.right === axisType.VALUE) {
				if (this.axisRight.option.axisLabel) {
					formatter = this.axisRight.option.axisLabel.formatter;
				}
			}

			if (typeof formatter === "string") {
				formatter = formatter.replace(this.parameters.valueAxisFormatter, serie.data[index]);
			} else if (typeof formatter === "function") {
				formatter = formatter(serie.data[index]);
			}
			var tip = serie.name + "<br/>" + formatter;
			this.tip.showTip(tip, point);
		}
	};

	/**
	 * 绘制点击的图形标尺
	 * @param {Object} data
	 */
	Basic.prototype.drawStaff = function(data) {
		var grid = this.parameters.grid;
		var rootElementWH = this.parameters.rootElementWH;
		var ctx = this.container.topCanvas.getContext('2d');
		this.clearStaff();
		ctx.save();
		ctx.beginPath();
		//		ctx.strokeRect(data.rect.x, data.rect.y, data.rect.w, data.rect.h);
		ctx.moveTo(data.rect.x + data.rect.w * 0.5, data.rect.y);
		ctx.lineTo(data.rect.x + data.rect.w * 0.5, data.rect.y + data.rect.h - this.parameters.categoryOffset);
		ctx.strokeStyle = 'rgba(0,138,205,1)';
		ctx.stroke();
		//		ctx.closePath();
		ctx.restore();
	}

	Basic.prototype.clearStaff = function() {
		var ctx = this.container.topCanvas.getContext('2d');
		var grid = this.parameters.grid;
		var rootElemenetWH = this.parameters.rootElementWH;
		ctx.clearRect(grid.x + 1, grid.y, rootElemenetWH.w - grid.x - grid.x2, rootElemenetWH.h - grid.y - grid.y2);
	}

	Basic.prototype.toLine = function() {
		for (var i = 0; i < this.series.option.length; i++) {
			var serie = this.series.option[i];
			serie.type = 'line';
			serie.smooth = false;
			var color = serie.serieStyle.style.color;
			serie.serieStyle = new LineStyle(serie.style);
			serie.serieStyle.style.color = color;
		}

		this.series.init();
		this.load();
	};


	Basic.prototype.toBar = function() {
		for (var i = 0; i < this.series.option.length; i++) {
			var serie = this.series.option[i];
			serie.type = 'bar';
			var color = serie.serieStyle.style.color;
			serie.serieStyle = new ShapeStyle(serie.style);
			serie.serieStyle.style.color = color;
		}

		this.legend && (this.legend.series = this.series);
		this.drawLegend(this.container.bottomCanvas);

		this.series.init();
		this.load();
	};


	/*
		使用堆叠
	*/
	Basic.prototype.stackable = function(open) {
		var _this = this;
		this.series.isSupportStack = !this.series.isSupportStack;
		if (this.series.isSupportStack) {
			for (var i = 0; i < this.series.option.length; i++) {
				this.series.option[i].stack = 'def_';
			}
		} else {
			for (var i = 0; i < this.series.option.length; i++) {
				this.series.option[i].stack = null;
			}
		}
		this.refresh();
	};


	Basic.prototype.swap = function() {
		for (var i = 0; i < this.series.option.length; i++) {
			if (this.series.option[i].stack == 'def_')
				delete this.series.option[i].stack;
		}
		this.series.isSupportStack = false;
		this.refresh();
	};

	/*
		折线转曲线
	*/
	Basic.prototype.toSmooth = function(open, array) {
		for (var i = 0; i < this.series.option.length; i++) {
			var serie = this.series.option[i];
			serie.type = 'line';
			serie.smooth = true;
			var color = serie.serieStyle.style.color;
			serie.serieStyle = new LineStyle(serie.style);
			serie.serieStyle.style.color = color;
		}

		this.series.init();
		this.load();
	};


	/*
		
	*/
	Basic.prototype.pageZoom = function(number) {
		if (this.parameters.categoryPageCapacity === Math.ceil(this.axisBottom.option.data.length / number))
			return;

		this.parameters.page = number;
		this.refresh();
	};


	Basic.prototype.refresh = function() {
		// 重设是否第一次加载
		this.loaded = false;

		// 重设容器大小
		this.container.reset();

		// 可能option发生变化，则需要重新计算
		this.parseOption();

		// 重新计算需要的值
		this.calculateCommonData();

		// 重新计算series相关数据
		this.series.init(this.option.series);

		// 重新绘制画布
		this.load();
	};

	/*
		还原
	*/
	Basic.prototype.restore = function() {
		// 如果从别的图转过来的。
		if (this.fromOption && this.fromOption.type != this.type) {
			if (this.fromOption.type == 'pie') {
				new Mobilechart.pie(this.element).init(this.fromOption);
			} else if (this.fromOption.type == 'radar') {
				new Mobilechart.radar(this.element).init(this.fromOption);
			} else if (this.fromOption.type == 'rose') {
				new Mobilechart.rose(this.element).init(this.fromOption);
			}
		} else {
			this.option = util.extend(true, {}, this.originalOption);
			this.parameters.page = null;
			this.refresh();
		}
	};


	/*
		保存为图片
	*/
	Basic.prototype.saveAsImage = function() {
		// 0.创建保存需要元素
		function createImageDiv() {
			var imgDiv = document.createElement("div");
			imgDiv.css({
				width: document.body.scrollWidth + 'px',
				height: document.body.scrollHeight + 'px',
				position: 'absolute',
				zIndex: 100,
				left: '0',
				top: '0',
				backgroundColor: 'rgba(0,0,0,0.5)'
			});
			return imgDiv;
		}

		function createImage() {
			var image = document.createElement("img");
			image.width = canvas.width * 0.5;
			image.height = canvas.height * 0.5;
			image.css({
				position: 'absolute',
				top: (document.body.scrollHeight - image.height) * 0.5 + 'px',
				left: (document.body.scrollWidth - image.width) * 0.5 + 'px'

			});
			return image;
		}

		function createCloseButton() {
			//关闭按钮的处理
			var closeBtn = document.createElement("img");

			var imageSrc = '';
			var scripts = document.getElementsByTagName('script');
			for (var i = 0; i < scripts.length; i++) {
				var path = scripts[i].src;
				if (path.lastIndexOf('mobilechart-tools.js') != -1) {
					imageSrc = path.replace('mobilechart-tools.js', '');
					break;
				}
			}

			closeBtn.src = imageSrc + "res/close.png";
			closeBtn.css({
				position: 'absolute',
				width: '30px',
				height: '30px',
				left: (document.body.scrollWidth + image.width) * 0.5 - 40 + 'px',
				top: (document.body.scrollHeight - image.height) * 0.5 + 10 + 'px'
			});
			return closeBtn;
		}



		// 1.将所有内容绘制到一个canvas上
		var canvas = document.createElement('canvas');
		var context = canvas.getContext("2d");
		canvas.width = this.parameters.rootElementWH.w * 2;
		canvas.height = this.parameters.rootElementWH.h * 2;
		canvas.css({
			width: this.parameters.rootElementWH.w + 'px',
			height: this.parameters.rootElementWH.h + 'px'
		});

		// 绘制bottomCanvas
		var bottomCanvas = this.container.bottomCanvas;
		context.drawImage(bottomCanvas, 0, 0);

		// 绘制中间区域
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var visualArea = this.parameters.visualArea;
		if (axisConfig.bottom === axisType.CATEGORY || axisConfig.top === axisType.CATEGORY) {
			context.drawImage(this.container.middleCanvas, visualArea.w * 2, 0, visualArea.w * 2, visualArea.h * 2, visualArea.x * 2, visualArea.y * 2, visualArea.w * 2, visualArea.h * 2);
		} else if (axisConfig.left === axisType.CATEGORY || axisConfig.right === axisType.CATEGORY) {
			context.drawImage(this.container.middleCanvas, 0, visualArea.h * 2, visualArea.w * 2, visualArea.h * 2, visualArea.x * 2, visualArea.y * 2, visualArea.w * 2, visualArea.h * 2);
		}



		var imageDiv = createImageDiv();
		var image = createImage();
		var closeBtn = createCloseButton();
		image.src = canvas.toDataURL("image/png");
		imageDiv.appendChild(image);
		imageDiv.appendChild(closeBtn);
		document.body.appendChild(imageDiv);


		/*
			bind事件
		*/
		imageDiv.addEventListener("click", function(e) {
			e.stopPropagation();
			if (e.target.nodeName == "DIV") {
				this.removeChild(image);
				document.body.removeChild(this);
			}
		}, false);

		if (this.parameters.runPlatform == 'web') {
			closeBtn.addEventListener("click", function(e) {
				e.stopPropagation();
				document.body.removeChild(imageDiv);
			}, false);
		} else if (this.parameters.runPlatform == 'mobile') {
			closeBtn.addEventListener("touchend", function(e) {
				e.stopPropagation();
				document.body.removeChild(imageDiv);
			}, false);
		}
	};


	Basic.prototype.toPie = function() {
		this.translate2Pie();
		new Mobilechart.pie(this.element).init(this.option, this.fromOption || this.originalOption);
	};


	Basic.prototype.toRadar = function() {
		this.translate2Radar();
		new Mobilechart.radar(this.element).init(this.option, this.originalOption);
	};


	Basic.prototype.toTable = function() {
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var seriesOption = this.series.option;
		var categoryOption = axisConfig.bottom === axisType.CATEGORY ? this.axisBottom.option : axisConfig.top === axisType.CATEGORY ? this.axisTop.option : axisConfig.left === axisType.CATEGORY ? this.axisLeft.option : axisConfig.right === axisType.CATEGORY ? this.axisRight.option : [];
		var dataLength = categoryOption.data.length;

		var tdStyle = {
			boxSizing: 'border-box',
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
		Array.prototype.push.apply(right_width_data, categoryOption.data);
		for (var i = 0; i < seriesOption.length; i++) {
			Array.prototype.push.apply(right_width_data, seriesOption[i].data);
			left_width_data.push(seriesOption[i].name);
		}
		left_width_data.push(categoryOption.name);

		var leftWidth = getMaxWordWidthFromArray(left_width_data);
		var rightWidth = getMaxWordWidthFromArray(right_width_data);
		if (rightWidth * dataLength + leftWidth < this.container.parentElement.clientWidth) {
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
				width: leftWidth + 'px'
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
				width: leftWidth + 'px'
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
				i == 0 && td.css('width', rightWidth + 'px');
				tr.appendChild(td);
			}
			right_top_table.appendChild(tr);
		}
		right_top_table.css(tableStyle).css('width', rightWidth * j + 'px');



		// 右下边的区域
		var right_bottom_table = document.createElement('table');
		for (var i = 0; i < seriesOption.length; i++) {
			var tr = document.createElement('tr');
			for (var j = 0; j < seriesOption[i].data.length; j++) {
				var td = document.createElement('td');
				td.innerHTML = seriesOption[i].data[j] || '无';
				td.css(tdStyle);
				i == 0 && td.css('width', rightWidth + 'px');
				tr.appendChild(td);
			}
			right_bottom_table.appendChild(tr);
		}
		right_bottom_table.css(tableStyle).css('width', rightWidth * j + 'px');;


		// 最外层的table
		var contentTable = document.createElement('table');
		for (var i = 0; i < 2; i++) {
			var tr = document.createElement('tr');
			for (var j = 0; j < 2; j++) {
				var td = document.createElement('td');
				if (i === 0) {
					if (j === 0) {
						td.appendChild(left_top_table);
						td.css('width', leftWidth + 'px');
					} else {
						td.appendChild(right_top_table);
					}

					td.css(tdStyle).css({
						position: 'relative',
						overflow: 'hidden',
						height: '36px',
						border: '1px solid black'
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
						border: '1px solid black'
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
			for (var i = 0; i < array.length; i++) {
				var w = measureTextSize(array[i], '12px', '"微软雅黑","宋体",Arial').width;
				if (width == Math.MAX_VALUE || width < w)
					width = w;
			}

			var now = new Date().getTime();
			return width + 10;
		}

		var df = document.createDocumentFragment();
		df.appendChild(contentTable);
		return df;
	};



	/*
		转换为pie图
	*/
	Basic.prototype.translate2Pie = function() {
		var series = this.option.series;

		var pieSeries = [];

		var sectorNames = this.option.xAxis[0].type == 'category' ? this.option.xAxis[0].data : this.option.yAxis[0].data;

		var radius = 0;
		if (this.parameters.rootElementWH.h > this.parameters.rootElementWH.w) {
			radius = this.parameters.rootElementWH.w / 4;
		} else {
			radius = this.parameters.rootElementWH.h / 4;
		}

		var increase = 1 / series.length;
		for (var i = 0; i < series.length; i++) {
			var centerPoint = {
				'x': (i + 1) * (this.parameters.rootElementWH.w / (series.length + 1)),
				'y': this.parameters.rootElementWH.h * 0.5
			};

			var obj = {};
			obj['name'] = series[i].name;
			obj['center'] = [centerPoint.x, centerPoint.y];
			obj['radius'] = radius;
			obj['type'] = 'pie';
			obj['cursor'] = true;
			obj['show'] = true;
			obj['text'] = true;

			var dataArray = [];
			for (var j = 0; j < sectorNames.length; j++) {
				var item = {};
				var data = series[i].data;
				item['value'] = data[j];
				item['name'] = sectorNames[j];
				dataArray.push(item);
			}
			obj['data'] = dataArray;

			pieSeries.push(obj);

		}


		this.option.series = pieSeries;


		// console.log(JSON.stringify(this.option));
	}

	/*
		转换为radar图
	*/
	Basic.prototype.translate2Radar = function() {
		var series = this.option.series;
		var pieSeries = [];
		var sectorNames = this.option.xAxis[0].type == 'category' ? this.option.xAxis[0].data : this.option.yAxis[0].data;
		var radius = 0;
		if (this.parameters.rootElementWH.h > this.parameters.rootElementWH.w) {
			radius = this.parameters.rootElementWH.w / 3;
		} else {
			radius = this.parameters.rootElementWH.h / 3;
		}

		// 计算每个属性的最大值
		{
			var maxValues = [];
			for (var i = 0; i < sectorNames.length; i++) {
				var maxValue = 0;
				for (var j = 0; j < series.length; j++) {
					maxValue = series[j].data[i] > maxValue ? series[j].data[i] : maxValue;
				}
				maxValues.push(maxValue);
			}
		}

		var polar = [];
		var objPolar = {};
		var indicatorData = [];
		for (var i = 0; i < sectorNames.length; i++) {
			var item = {};
			item['text'] = sectorNames[i];
			item['max'] = maxValues[i];
			indicatorData.push(item);
		}
		objPolar['indicator'] = indicatorData;
		objPolar['radius'] = radius;
		polar.push(objPolar);
		this.option['polar'] = polar;

		var obj = {};
		// obj['name'] = '1123';
		obj['type'] = 'radar';
		var datas = [];
		for (var i = 0; i < series.length; i++) {
			var item = {};
			item['value'] = series[i].data;
			item['name'] = series[i].name;
			datas.push(item);
		}
		obj['data'] = datas;

		pieSeries.push(obj);

		this.option.series = pieSeries;

		// console.log(JSON.stringify(this.option));
	}


	/*
		创建页面容器
	*/
	var Container = function(element, parameters) {
		this.parameters = parameters;
		// 用户配置用来装图标的容器
		this.rootElement = element;
		// 保存总容器的宽高
		// this.rootElementWidth = this.rootElement.offsetWidth;
		// this.rootElementHeight = this.rootElement.offsetHeight;
		//		this.rootElementWidth = this.rootElement.clientWidth;
		//		this.rootElementHeight = this.rootElement.clientHeight;
		this.rootElementWidth = this.rootElement.clientWidth || getStyle(this.rootElement, 'width');
		this.rootElementHeight = this.rootElement.clientHeight || getStyle(this.rootElement, 'height');
		// 创建的在容器里面最外层的容器
		this.parentElement = null;
		this.containElement = null;
		// 放置坐标轴画布的容器
		this.middleElement = null;
		// 放置tip的容器
		this.tipElement = null;
		// 最上层的画布
		this.topCanvas = null;
		// 绘制中间坐标轴区域的canvas
		this.middleCanvas = null;
		// 绘制值轴，标题，图例的canvas
		this.bottomCanvas = null;
		// 保存放置坐标轴画布的容器的可视区域大小
		this.visualArea = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};
		this.forwardArrowCanvas = null;
		this.backArrowCanvas = null;
		this.scaleCanvasArray = null;
	};
	Container.prototype.drawHTML = function() {
		// 从饼图转为住图需要创建，但是tools的元素不要删除
		while (this.rootElement.firstChild)
			this.rootElement.removeChild(this.rootElement.firstChild);

		this.parentElement = this.createElement(this.rootElement, "div");
		this.containElement = this.createElement(this.parentElement, "div");
		this.middleElement = this.createElement(this.containElement, "div");
		this.tipElement = this.createElement(this.containElement, "div");
		this.middleCanvas = this.createElement(this.middleElement, "canvas");
		this.bottomCanvas = this.createElement(this.containElement, "canvas");
		this.topCanvas = this.createElement(this.containElement, "canvas");
		this.forwardArrowCanvas = this.createElement(this.middleElement, "canvas");
		this.backArrowCanvas = this.createElement(this.middleElement, "canvas");
		this.scaleCanvasArray = [
			this.bottomCanvas,
			this.middleCanvas,
			this.topCanvas,
			this.backArrowCanvas,
			this.forwardArrowCanvas
		];

		// 初始化默认样式
		this.setAllStyle();

		// 缩放
		this.scale();
	};
	Container.prototype.createElement = function(parentElement, tag) {
		var element = document.createElement(tag);
		parentElement.appendChild(element);
		return element;
	};
	/*
		设置创建的元素的默认样式
		容器水平方向的样式（逻辑轴在上下）
	*/
	Container.prototype.initStyleByHorizontally = function() {
		//		var w = this.rootElement.clientWidth;
		//		var h = this.rootElement.clientHeight;
		var w = this.rootElementWidth,
			h = this.rootElementHeight;

		var grid = this.parameters.grid;
		var x = grid.x;
		var y = grid.y;
		var x2 = grid.x2;
		var y2 = grid.y2;

		this.parentElement.css({
			width: w + 'px',
			height: h + 'px',
			position: 'relative'
		});


		this.tipElement.css({
			position: 'absolute',
			display: 'none',
			background: 'rgba(50, 50, 50, 0.5)',
			borderRadius: '4px',
			zIndex: 2,
			padding: '5px',
			transition: 'left .4s,top .4s',
			color: 'white',
			wordWrap: 'break-word',
			overflow: 'hidden',
			maxWidth: w * 0.2 + 'px',
			fontSize: '12px'
		});

		this.middleElement.css({
			position: 'absolute',
			top: y + 'px',
			left: x * 0.5 + 'px',
			width: w - x * 0.5 - x2 * 0.5 + 'px',
			height: h - y - y2 + 'px',
			overflow: 'hidden',
			zIndex: 1
		});

		this.containElement.css({
			width: w + 'px',
			height: h + 'px',
			top: 0,
			left: 0,
			position: 'absolute',
			overflow: 'hidden',
		});



		this.middleCanvas.width = (w - x * 0.5 - x2 * 0.5) * 3 * 2;
		this.middleCanvas.height = (h - y - y2) * 2;
		this.setCanvasBackground(this.middleCanvas);
		// this.middleCanvas.tabIndex = '1';
		this.middleCanvas.css({
			position: 'absolute',
			left: -(w - x - x2 * 0.5) + 'px',
			width: (w - x * 0.5 - x2 * 0.5) * 3 + 'px',
			height: h - y - y2 + 'px'
		});

		this.bottomCanvas.width = w * 2;
		this.bottomCanvas.height = h * 2;
		this.setCanvasBackground(this.bottomCanvas);
		this.bottomCanvas.css({
			position: 'absolute',
			zIndex: 0,
			width: w + 'px',
			height: h + 'px'
		});

		this.topCanvas.width = w * 2;
		this.topCanvas.height = h * 2;
		this.topCanvas.css({
			position: 'absolute',
			zIndex: 2,
			width: w + 'px',
			height: h + 'px'
		});

		this.forwardArrowCanvas.width = w - x - x2;
		this.forwardArrowCanvas.height = (h - y) * 2;
		this.forwardArrowCanvas.css({
			position: 'absolute',
			display: 'block',
			right: grid.x2 * 0.5 + 'px',
			zIndex: 3,
			width: (w - x - x2) * 0.5 + 'px',
			height: h - y + 'px'
		});

		this.backArrowCanvas.width = w - x - x2;
		this.backArrowCanvas.height = (h - y) * 2;
		this.backArrowCanvas.css({
			position: 'absolute',
			left: grid.x * 0.5 + 'px',
			display: 'none',
			zIndex: 3,
			width: (w - x - x2) * 0.5 + 'px',
			height: h - y + 'px'
		});

		this.visualArea.x = x;
		this.visualArea.y = y;
		//		this.visualArea.w = this.middleElement.offsetWidth;
		//		this.visualArea.h = this.middleElement.offsetHeight;
		this.visualArea.w = this.middleElement.offsetWidth || getStyle(this.middleElement, 'width');
		this.visualArea.h = this.middleElement.offsetHeight || getStyle(this.middleElement, 'height');
	};

	Container.prototype.setCanvasBackground = function(canvas) {
		var context = canvas.getContext('2d');
		context.save();
		context.fillStyle = this.parameters.backgroundColor;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.restore();
	}

	/*
		容器的垂直方向样式（逻辑轴在左右）
	*/
	Container.prototype.initStyleByVertically = function() {
		//		var w = this.rootElement.clientWidth;
		//		var h = this.rootElement.clientHeight;
		var w = this.rootElementWidth,
			h = this.rootElementHeight;

		var grid = this.parameters.grid;
		var x = grid.x;
		var y = grid.y;
		var x2 = grid.x2;
		var y2 = grid.y2;

		// 绘制canvas图表的div 
		this.parentElement.css({
			width: w + 'px',
			height: h + 'px',
			position: 'relative'
		});

		this.containElement.css({
			width: w + 'px',
			height: h + 'px',
			top: 0,
			left: 0,
			position: 'absolute',
			overflow: 'hidden',
		});


		// tip的div
		this.tipElement.css({
			position: 'absolute',
			display: 'none',
			background: 'rgba(50, 50, 50, 0.5)',
			borderRadius: '3px',
			zIndex: 2,
			padding: '5px',
			transition: 'all .3s',
			color: 'white',
			wordWrap: 'break-word',
			overflow: 'hidden',
			maxWidth: w * 0.2 + 'px',
			fontSize: '12px'
		});

		this.middleElement.css({
			position: 'absolute',
			top: y + 'px',
			left: x + 'px',
			width: w - x - x2 + 'px',
			height: h - y - y2 + 'px',
			overflow: 'hidden',
			zIndex: 1
		});


		this.middleCanvas.width = (w - x - x2) * 2;
		this.middleCanvas.height = (h - y - y2) * 3 * 2;
		this.middleCanvas.css({
			position: 'absolute',
			top: -(h - y - y2) + 'px',
			width: w - x - x2 + 'px',
			height: (h - y - y2) * 3 + 'px'
		})

		this.bottomCanvas.width = w * 2;
		this.bottomCanvas.height = h * 2;
		this.bottomCanvas.css({
			position: 'absolute',
			width: w + 'px',
			height: h + 'px',
			zIndex: 0
		});
		this.setCanvasBackground(this.bottomCanvas);


		this.forwardArrowCanvas.width = (w - x - x2) * 2;
		this.forwardArrowCanvas.height = h - y;
		this.forwardArrowCanvas.css({
			position: 'absolute',
			bottom: '0',
			width: w - x - x2 + 'px',
			height: (h - y) / 2 + 'px',
			zIndex: 3
		});

		this.backArrowCanvas.width = (w - x - x2) * 2;
		this.backArrowCanvas.height = h - y;
		this.backArrowCanvas.css({
			position: 'absolute',
			top: '0',
			width: w - x - x2 + 'px',
			height: (h - y) / 2 + 'px',
			display: 'none',
			zIndex: 3
		});

		this.visualArea.x = x;
		this.visualArea.y = y;
		this.visualArea.w = this.middleElement.offsetWidth;
		this.visualArea.h = this.middleElement.offsetHeight;
	};
	/*
		重新设置位置大小属性
	*/
	Container.prototype.reset = function() {
		//		this.rootElementWidth = this.rootElement.clientWidth;
		//		this.rootElementHeight = this.rootElement.clientHeight;
		this.rootElementWidth = this.rootElement.clientWidth || getStyle(this.rootElement, 'width');
		this.rootElementHeight = this.rootElement.clientHeight || getStyle(this.rootElement, 'height');
		this.setAllStyle();
		this.scale();
	};
	Container.prototype.setAllStyle = function() {
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		if (axisConfig.bottom === axisType.CATEGORY || axisConfig.top === axisType.CATEGORY) {
			this.initStyleByHorizontally();
		} else if (axisConfig.left === axisType.CATEGORY || axisConfig.right === axisType.CATEGORY) {
			this.initStyleByVertically();
		}
	};

	/*
		缩放200% 高清显示
	*/
	Container.prototype.scale = function() {
		for (var i = 0; i < this.scaleCanvasArray.length; i++) {
			this.scaleCanvasArray[i].getContext("2d").scale(2, 2);
		}
	};
	/*
		设置图表区域的画布的样式
	*/
	Container.prototype.setMiddleCanvasStyle = function(style) {
		if (style.w != undefined) {
			this.middleCanvas.width = style.w * 2;
			this.middleCanvas.style.width = style.w + "px";
		}
		if (style.h != undefined) {
			this.middleCanvas.height = style.h * 2;
			this.middleCanvas.style.height = style.h + "px";
		}
		if (style.top != undefined) {
			this.middleCanvas.style.top = style.top + "px";
		}
		if (style.left != undefined) {
			this.middleCanvas.style.left = style.left + "px";
		}
	}



	/*
		逻辑轴
	*/
	var CategoryAxis = function(option, parameters, position) {
		this.position = position;
		this.parameters = parameters;
		this.axisStyle = null;
		this.rect = null;
		this.splitLineStyle = null;
		this.defaultStyle = {
			splitLine: {
				show: true,
				style: {
					color: "rgba(220,220,220,1)",
					type: "solid"
				}
			},
			style: {
				show: true,
				color: "rgba(220,220,220,1)"
			}
		};
		this.option = util.extend(true, {}, this.defaultStyle, option);
		this.step = this.option.step || 1; // 默认间隔多少个显示逻辑轴点
		if (this.option.splitLine.show)
			this.splitLineStyle = new LineStyle(this.option.splitLine.style);
		if (this.option.style)
			this.axisStyle = new AxisStyle(this.option.style);
		else
			this.axisStyle = new AxisStyle();
	};
	CategoryAxis.prototype.drawInBottom = function(canvas) {
		// 实际画布大小
		var realWidth = this.parameters.middleCanvasWH.w;
		var realHeight = this.parameters.middleCanvasWH.h;
		// var axisConfig = this.parameters.axisConfig;
		// var axisType = this.parameters.axisType;
		// 可视区域大小
		var visualWidth = this.parameters.visualArea.w;
		var visualHeight = this.parameters.visualArea.h;
		var categoryOffset = this.parameters.categoryOffset;
		var categorySegmentLength = this.parameters.categorySegmentLength;
		// 端点的标记长短
		var ruleLength = this.parameters.ruleLength;
		var touchOffset = this.parameters.touchOffset;
		var range = this.parameters.traversalRange();
		var begin = range.begin;
		var end = range.end;
		var context = canvas.getContext("2d");

		this.rect = {
			x: 0,
			y: visualHeight - categoryOffset,
			w: realWidth,
			h: categoryOffset
		};
		this.clear(context, this.rect);

		context.save();
		context.beginPath();
		this.axisStyle.useStyle(context);
		context.moveTo(0, visualHeight - categoryOffset);
		context.lineTo(realWidth, visualHeight - categoryOffset);
		context.stroke();
		context.closePath();

		context.textAlign = "center";
		context.textBaseline = "top";
		for (var i = begin; i < end; i++) {
			if (i === 0 || i % this.step === 0) {
				context.beginPath();
				context.fillText(this.option.data[i], categorySegmentLength / 2 + categorySegmentLength * i + touchOffset.current - this.parameters.grid.x * 0.5, visualHeight - categoryOffset + ruleLength);

				if (this.option.splitLine.show) {
					context.save();
					context.beginPath();
					context.shadowBlur = null;
					context.shadowColor = null;
					context.shadowOffsetX = null;
					context.shadowOffsetY = null;
					this.splitLineStyle.useStyle(context);
					context.moveTo(categorySegmentLength * (i + 1) + touchOffset.current - this.parameters.grid.x * 0.5, visualHeight - categoryOffset);
					context.lineTo(categorySegmentLength * (i + 1) + touchOffset.current - this.parameters.grid.x * 0.5, 0);
					context.stroke();
					context.closePath();
					context.restore();
				}

				// update by dj at 20150114
				if (i == 0) // 在原点不显示标尺
					continue;
				//				context.moveTo(categorySegmentLength * i + touchOffset.current, visualHeight - categoryOffset);
				//				context.lineTo(categorySegmentLength * i + touchOffset.current, visualHeight - categoryOffset + ruleLength);
				//				context.stroke();
				context.save();
				context.fillStyle = context.strokeStyle;
				context.arc(categorySegmentLength * i + touchOffset.current - this.parameters.grid.x * 0.5, visualHeight - categoryOffset, 3, Math.PI * 2, false);
				context.fill();
				context.restore();
				//				context.closePath();



			}
		}
		context.restore();
	};
	CategoryAxis.prototype.drawInTop = function(canvas) {
		// 实际画布大小
		var realWidth = this.parameters.middleCanvasWH.w;
		var realHeight = this.parameters.middleCanvasWH.h;
		// 可视区域大小
		var visualArea = this.parameters.visualArea;
		// var grid = this.parameters.grid;
		var categoryOffset = this.parameters.categoryOffset;
		var categorySegmentLength = this.parameters.categorySegmentLength;
		// 端点的标记长短
		var ruleLength = this.parameters.ruleLength;
		var touchOffset = this.parameters.touchOffset;
		var range = this.parameters.traversalRange();
		var begin = range.begin;
		var end = range.end;
		var context = canvas.getContext("2d");

		this.rect = {
			x: 0,
			y: 0,
			w: realWidth,
			h: categoryOffset
		};

		context.save();
		this.clear(context, this.rect);
		context.beginPath();
		this.axisStyle.useStyle(context);
		context.moveTo(0, categoryOffset);
		context.lineTo(realWidth, categoryOffset);
		context.stroke();
		context.closePath();

		context.textAlign = "center";
		context.textBaseline = "bottom";
		for (var i = begin; i < end; i++) {
			if (i === 0 || i % this.step === 0) {
				context.beginPath();
				context.fillText(this.option.data[i], categorySegmentLength / 2 + categorySegmentLength * i + touchOffset.current - this.parameters.grid.x * 0.5, categoryOffset - ruleLength);
				if (i == 0) // 在原点不显示标尺
					continue;
				//				context.moveTo(categorySegmentLength * i + touchOffset.current - this.parameters.grid.x * 0.5, categoryOffset);
				//				context.lineTo(categorySegmentLength * i + touchOffset.current - this.parameters.grid.x * 0.5, categoryOffset + ruleLength);
				//				context.stroke();
				//				context.closePath();
				context.save();
				context.fillStyle = context.strokeStyle;
				context.arc(categorySegmentLength * i + touchOffset.current - this.parameters.grid.x * 0.5, categoryOffset, 3, Math.PI * 2, false);
				context.fill();
				context.restore();

				if (this.option.splitLine.show) {
					context.save();
					context.beginPath();
					this.splitLineStyle.useStyle(context);
					context.moveTo(categorySegmentLength * i + touchOffset.current, categoryOffset);
					context.lineTo(categorySegmentLength * i + touchOffset.current, visualArea.h);
					context.stroke();
					context.closePath();
					context.restore();
				}

			}
		}
		context.restore();
	};
	CategoryAxis.prototype.drawInRight = function(canvas) {
		var context = canvas.getContext("2d");
		var realWidth = this.parameters.middleCanvasWH.w;
		var realHeight = this.parameters.middleCanvasWH.h;
		var visualArea = this.parameters.visualArea;
		var categoryOffset = this.parameters.categoryOffset;
		var categorySegmentLength = this.parameters.categorySegmentLength;
		var ruleLength = this.parameters.ruleLength;
		var touchOffset = this.parameters.touchOffset;
		var range = this.parameters.traversalRange();
		var begin = range.begin;
		var end = range.end;

		this.rect = {
			x: 0,
			y: 0,
			w: categoryOffset,
			h: realHeight
		};

		this.clear(context, this.rect);
		context.save();
		context.beginPath();
		this.axisStyle.useStyle(context);
		context.moveTo(visualArea.w - categoryOffset, 0);
		context.lineTo(visualArea.w - categoryOffset, realHeight);
		context.stroke();
		context.closePath();

		context.textAlign = "left";
		context.textBaseline = "middle";
		for (var i = begin; i < end; i++) {
			if (i === 0 || i % this.step === 0) {
				context.fillText(
					this.option.data[i],
					visualArea.w - categoryOffset + ruleLength,
					categorySegmentLength / 2 + categorySegmentLength * i + touchOffset.current
				);

				if (i == 0) // 在原点不显示标尺
					continue;
				context.beginPath();
				context.moveTo(visualArea.w - categoryOffset, categorySegmentLength * i + touchOffset.current);
				context.lineTo(visualArea.w - categoryOffset + ruleLength, categorySegmentLength * i + touchOffset.current);
				context.stroke();
				context.closePath();

				if (this.option.splitLine.show) {
					context.save();
					context.beginPath();
					this.splitLineStyle.useStyle(context);
					context.moveTo(0, categorySegmentLength * i + touchOffset.current);
					context.lineTo(visualArea.w - categoryOffset, categorySegmentLength * i + touchOffset.current);
					context.stroke();
					context.closePath();
					context.restore();
				}
			}
		}
		context.restore();
	};
	CategoryAxis.prototype.drawInLeft = function(canvas) {
		var context = canvas.getContext("2d");
		var realWidth = this.parameters.middleCanvasWH.w;
		var realHeight = this.parameters.middleCanvasWH.h;
		var visualArea = this.parameters.visualArea;
		var categoryOffset = this.parameters.categoryOffset;
		var categorySegmentLength = this.parameters.categorySegmentLength;
		var ruleLength = this.parameters.ruleLength;
		var touchOffset = this.parameters.touchOffset;
		var range = this.parameters.traversalRange();
		var begin = range.begin;
		var end = range.end;

		this.rect = {
			x: 0,
			y: 0,
			w: categoryOffset,
			h: realHeight
		};

		this.clear(context, this.rect);
		context.save();
		context.beginPath();
		this.axisStyle.useStyle(context);
		context.moveTo(categoryOffset, 0);
		context.lineTo(categoryOffset, realHeight);
		context.stroke();
		context.closePath();

		context.textAlign = "right";
		context.textBaseline = "middle";
		for (var i = begin; i < end; i++) {
			if (i === 0 || i % this.step === 0) {
				context.beginPath();
				context.fillText(
					this.option.data[i],
					categoryOffset - ruleLength,
					categorySegmentLength / 2 + categorySegmentLength * i + touchOffset.current
				);

				if (i == 0) // 在原点不显示标尺
					continue;

				context.moveTo(categoryOffset, categorySegmentLength * i + touchOffset.current);
				context.lineTo(categoryOffset - ruleLength, categorySegmentLength * i + touchOffset.current);
				context.stroke();
				context.closePath();

				if (this.option.splitLine.show) {
					context.save();
					context.beginPath();
					this.splitLineStyle.useStyle(context);
					context.moveTo(categoryOffset, categorySegmentLength * i + touchOffset.current);
					context.lineTo(visualArea.w, categorySegmentLength * i + touchOffset.current);
					context.stroke();
					context.closePath();
					context.restore();
				}
			}
		}
		context.restore();
	};
	CategoryAxis.prototype.drawCategoryName = function(canvas) {
		var axisName = this.option.name;
		if (!axisName)
			return;

		var context = canvas.getContext("2d");
		var ruleLength = this.parameters.ruleLength;
		var rootElementWH = this.parameters.rootElementWH;
		var orientation = this.parameters.orientation;
		var grid = this.parameters.grid;
		var categoryOffset = this.parameters.categoryOffset;
		context.save();
		context.fillStyle = this.axisStyle.lineStyle.style.color;
		if (this.position == orientation.L) {
			context.textAlign = "center";
			context.textBaseline = "bottom";
			context.fillText(axisName, grid.x + categoryOffset, grid.y - ruleLength);
		} else if (this.position == orientation.R) {
			context.textAlign = "center";
			context.textBaseline = "top";
			context.fillText(axisName, rootElementWH.w - grid.x2 - categoryOffset, rootElementWH.h - grid.y2 + ruleLength);
		} else if (this.position == orientation.T) {
			context.textAlign = "left";
			context.textBaseline = "middle";
			context.fillText(axisName, rootElementWH.w - grid.x2 + ruleLength, grid.y + categoryOffset);
		} else if (this.position == orientation.B) {
			context.textAlign = "left";
			context.textBaseline = "middle";
			context.fillText(axisName, rootElementWH.w - grid.x2 + ruleLength, rootElementWH.h - grid.y2 - categoryOffset);
		}
		context.restore();
	};
	CategoryAxis.prototype.clear = function(context, rect) {
		if (!rect) {
			context.clearRect(0, 0, this.parameters.middleCanvasWH.w, this.parameters.middleCanvasWH.h);
		} else {
			context.clearRect(rect.x, rect.y, rect.w, rect.h);
		}
	};



	/*
		值轴
	*/
	var ValueAxis = function(option, parameters, position) {
		this.parameters = parameters;
		this.axisStyle = null;
		this.position = position;
		this.zeroLineStyle = null;
		this.splitLineStyle = null;
		this.defaultStyle = {
			splitLine: {
				show: true,
				style: {
					color: "rgba(220,220,220,1)",
					type: "solid"
				}
			},
			zeroLine: {
				show: true,
				style: {
					color: "rgba(0,153,204,0.8)",
					type: "dotted",
					width: 1
				}
			},
			axisLabel: {
				formatter: parameters.valueAxisFormatter,
				rotate: 0,
				offset: {
					x: 0,
					y: 0
				}
			}
		};

		this.option = util.extend(true, {}, this.defaultStyle, option);
		if (this.option.splitLine.show)
			this.splitLineStyle = new LineStyle(this.option.splitLine.style);
		if (this.option.zeroLine.show)
			this.zeroLineStyle = new LineStyle(this.option.zeroLine.style);
		if (this.option.style)
			this.axisStyle = new AxisStyle(this.option.style);
		else
			this.axisStyle = new AxisStyle();

		this.area = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};
	};
	ValueAxis.prototype.drawInBottom = function(canvas) {
		var valuePageCapacity = this.parameters.valuePageCapacity;
		var visualArea = this.parameters.visualArea;
		var grid = this.parameters.grid;
		var formatter = this.option.axisLabel.formatter;
		var offset = this.option.axisLabel.offset;

		var categoryOffset = this.parameters.categoryOffset; // 逻辑轴偏移
		var ruleLength = this.parameters.ruleLength;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var valueStepLength = (visualArea.w - categoryOffset) / valuePageCapacity;
		var precision = this.option.precision || 0;
		var zeroLineStyle = null;
		var context = canvas.getContext("2d");
		var vtp = this.parameters.vtp.bottom;
		var min = this.parameters.valueAxisMaxMin.bottom.min;
		var max = this.parameters.valueAxisMaxMin.bottom.max;
		var stepSize = (max - min) / valuePageCapacity;

		context.save();
		this.axisStyle && this.axisStyle.useStyle(context);
		if (axisConfig.left === axisType.CATEGORY) {
			context.beginPath();
			context.moveTo(visualArea.x + categoryOffset, visualArea.y + visualArea.h + 1);
			context.lineTo(visualArea.x + visualArea.w, visualArea.y + visualArea.h + 1);
			context.stroke();
			context.closePath();

			context.textAlign = "center";
			context.textBaseline = "top";
			for (var i = 0; i < valuePageCapacity; i++) {
				context.fillText(
					formatter.replace(this.parameters.valueAxisFormatter, (max - stepSize * i).toFixed(precision)),
					visualArea.x + visualArea.w - valueStepLength * i + offset.x,
					visualArea.y + visualArea.h + ruleLength + offset.y
				);
				context.beginPath();
				context.moveTo(visualArea.x + valueStepLength * i + categoryOffset, visualArea.y + visualArea.h);
				context.lineTo(visualArea.x + valueStepLength * i + categoryOffset, visualArea.y + visualArea.h + ruleLength);
				context.stroke();
				context.closePath();
			}
			context.fillText(
				formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)),
				visualArea.x + visualArea.w - valueStepLength * valuePageCapacity + offset.x,
				visualArea.y + visualArea.h + ruleLength + offset.y
			);
		} else if (axisConfig.right === axisType.CATEGORY) {
			context.beginPath();
			context.moveTo(visualArea.x, visualArea.y + visualArea.h + 1);
			context.lineTo(visualArea.x + visualArea.w - categoryOffset, visualArea.y + visualArea.h + 1);
			context.stroke();
			context.closePath();

			context.textAlign = "center";
			context.textBaseline = "top";
			for (var i = 0; i < valuePageCapacity; i++) {
				context.fillText(
					formatter.replace(this.parameters.valueAxisFormatter, (max - stepSize * i).toFixed(precision)),
					visualArea.x + valueStepLength * i,
					visualArea.y + visualArea.h + ruleLength
				);

				context.beginPath();
				context.moveTo(visualArea.x + valueStepLength * i, visualArea.y + visualArea.h);
				context.lineTo(visualArea.x + valueStepLength * i, visualArea.y + visualArea.h + ruleLength);
				context.stroke();
				context.closePath();
			}
			context.fillText(
				formatter.replace(this.parameters.valueAxisFormatter,
					min.toFixed(precision)),
				visualArea.x + visualArea.w - categoryOffset,
				visualArea.y + visualArea.h + ruleLength
			);
		}
		context.restore();
	};
	ValueAxis.prototype.drawInTop = function(canvas) {
		var context = canvas.getContext("2d");
		var valuePageCapacity = this.parameters.valuePageCapacity;
		var formatter = this.option.axisLabel.formatter;
		var visualArea = this.parameters.visualArea;
		var categoryOffset = this.parameters.categoryOffset;
		var ruleLength = this.parameters.ruleLength;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var valueStepLength = (visualArea.w - categoryOffset) / valuePageCapacity;
		var precision = this.option.precision || 0;
		var zeroLineStyle = null;
		var vtp = this.parameters.vtp.top;
		var min = this.parameters.valueAxisMaxMin.top.min;
		var max = this.parameters.valueAxisMaxMin.top.max;
		var stepSize = (max - min) / valuePageCapacity;

		context.save();
		this.axisStyle && this.axisStyle.useStyle(context);
		if (axisConfig.left === axisType.CATEGORY) {
			context.beginPath();
			context.moveTo(visualArea.x + categoryOffset, visualArea.y - 1);
			context.lineTo(visualArea.x + visualArea.w, visualArea.y - 1);
			context.stroke();
			context.closePath();

			context.textAlign = "center";
			context.textBaseline = "bottom";
			for (var i = 0; i < valuePageCapacity; i++) {
				context.fillText(
					formatter.replace(this.parameters.valueAxisFormatter, (max - stepSize * i).toFixed(precision)),
					visualArea.x + visualArea.w - valueStepLength * i,
					visualArea.y - ruleLength
				);

				context.beginPath();
				context.moveTo(visualArea.x + valueStepLength * i + categoryOffset, visualArea.y - ruleLength);
				context.lineTo(visualArea.x + valueStepLength * i + categoryOffset, visualArea.y);
				context.stroke();
				context.closePath();
			}
			context.fillText(
				formatter.replace(this.parameters.valueAxisFormatter,
					min.toFixed(precision)),
				visualArea.x + categoryOffset,
				visualArea.y - ruleLength
			);
		} else if (axisConfig.right === axisType.CATEGORY) {
			context.beginPath();
			context.moveTo(visualArea.x, visualArea.y - 1);
			context.lineTo(visualArea.x + visualArea.w - categoryOffset, visualArea.y - 1);
			context.stroke();
			context.closePath();

			context.textAlign = "center";
			context.textBaseline = "bottom";
			for (var i = 0; i < valuePageCapacity; i++) {
				context.fillText(
					formatter.replace(this.parameters.valueAxisFormatter, (max - stepSize * i).toFixed(precision)),
					visualArea.x + valueStepLength * i,
					visualArea.y - ruleLength
				);

				context.beginPath();
				context.moveTo(visualArea.x + valueStepLength * i, visualArea.y - ruleLength);
				context.lineTo(visualArea.x + valueStepLength * i, visualArea.y);
				context.stroke();
				context.closePath();
			}
			context.fillText(
				formatter.replace(this.parameters.valueAxisFormatter,
					min.toFixed(precision)),
				visualArea.x + visualArea.w - categoryOffset,
				visualArea.y - ruleLength
			);
		}
		context.restore();
	};
	ValueAxis.prototype.drawInRight = function(canvas) {
		var valuePageCapacity = this.parameters.valuePageCapacity;
		var visualArea = this.parameters.visualArea;
		var grid = this.parameters.grid;
		var formatter = this.option.axisLabel.formatter;
		var categoryOffset = this.parameters.categoryOffset; // 逻辑轴偏移
		var ruleLength = this.parameters.ruleLength;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var min = this.parameters.valueAxisMaxMin.right.min;
		var max = this.parameters.valueAxisMaxMin.right.max;
		var valueStepLength = (visualArea.h - categoryOffset) / valuePageCapacity;
		var yStepSize = (max - min) / valuePageCapacity; // 计算出数值轴 的一个间距代表的值为多少
		var precision = this.option.precision || 0; // 值轴保留几位小数
		var vtp = this.parameters.vtp.right;
		var zeroLineStyle = null;
		var context = canvas.getContext("2d");

		context.save();
		if (axisConfig.bottom === axisType.CATEGORY) {
			// 遮住中间图表区域的两边，处理顶端看不全数据的问题
			context.save();
			context.fillStyle = this.parameters.backgroundColor.toRgba(1);
			context.fillRect(0, grid.y + categoryOffset - 5, grid.x, visualArea.h - categoryOffset);
			context.fillRect(this.parameters.rootElementWH.w - grid.x2,
				grid.y + categoryOffset - 5,
				grid.x2,
				visualArea.h - categoryOffset);
			context.restore();


			context.beginPath();
			this.axisStyle && this.axisStyle.useStyle(context);
			context.moveTo(visualArea.x + visualArea.w - grid.x2, visualArea.y);
			context.lineTo(visualArea.x + visualArea.w - grid.x2, visualArea.y + visualArea.h - categoryOffset);
			context.stroke();
			context.closePath();

			context.textAlign = "left";
			context.textBaseline = "middle";
			for (var i = 0; i < valuePageCapacity; i++) {
				context.save();
				context.translate(visualArea.x + visualArea.w + ruleLength - grid.x2, visualArea.y + valueStepLength * i);
				context.rotate(this.option.axisLabel.rotate * Math.PI / 180);
				//				context.fillText(formatter.replace(this.parameters.valueAxisFormatter, (max - yStepSize * i).toFixed(precision)), visualArea.x + visualArea.w - grid.x2  + ruleLength, visualArea.y + valueStepLength * i);
				context.fillText(formatter.replace(this.parameters.valueAxisFormatter, (max - yStepSize * i).toFixed(precision)), 0, 0);
				context.restore();

				context.beginPath();
				context.moveTo(visualArea.x + this.parameters.ruleLength + visualArea.w - grid.x2, visualArea.y + valueStepLength * i);
				context.lineTo(visualArea.x + visualArea.w - grid.x2, visualArea.y + valueStepLength * i);
				context.stroke();
				context.closePath();
			}

			context.save();
			context.translate(visualArea.x + visualArea.w + ruleLength - grid.x2, visualArea.y + visualArea.h - categoryOffset);
			context.rotate(this.option.axisLabel.rotate * Math.PI / 180);
			//			context.fillText(formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)), visualArea.x + visualArea.w + ruleLength, visualArea.y + visualArea.h - categoryOffset);
			context.fillText(formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)), 0, 0);
			context.restore();
		} else if (axisConfig.top === axisType.CATEGORY) {
			context.beginPath();
			this.axisStyle && this.axisStyle.useStyle(context);
			context.moveTo(visualArea.x + visualArea.w + 1, visualArea.y + categoryOffset);
			context.lineTo(visualArea.x + visualArea.w + 1, visualArea.y + visualArea.h);
			context.stroke();
			context.closePath();

			context.textAlign = "left";
			context.textBaseline = "middle";
			for (var i = 0; i < valuePageCapacity; i++) {
				context.fillText(formatter.replace(this.parameters.valueAxisFormatter, (max - yStepSize * i).toFixed(precision)), visualArea.x + visualArea.w + 1 + this.parameters.ruleLength, visualArea.y + visualArea.h - valueStepLength * i);
				context.beginPath();
				context.moveTo(visualArea.x + visualArea.w + 1, visualArea.y + categoryOffset + valueStepLength * i);
				context.lineTo(visualArea.x + visualArea.w + 1 + this.parameters.ruleLength, visualArea.y + categoryOffset + valueStepLength * i);
				context.stroke();
				context.closePath();
			}
			context.fillText(formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)), visualArea.x + visualArea.w + 1 + this.parameters.ruleLength, visualArea.y + categoryOffset);
		}
		context.restore();
	};
	ValueAxis.prototype.drawInLeft = function(canvas) {
		var valuePageCapacity = this.parameters.valuePageCapacity;
		var min = this.parameters.valueAxisMaxMin.left.min;
		var max = this.parameters.valueAxisMaxMin.left.max;
		var formatter = this.option.axisLabel.formatter;
		var offset = this.option.axisLabel.offset;
		//		if (this.option.axisLabel.offset) {
		//			var offset = util.extend({
		//				x: 0,
		//				y: 0
		//			}, this.option.axisLabel.offset);
		//		} else {
		//			var offset = {
		//				x: 0,
		//				y: 0
		//			};
		//		}
		var visualArea = this.parameters.visualArea;
		var rootElementWH = this.parameters.rootElementWH;
		var grid = this.parameters.grid;
		// 逻辑轴偏移
		var categoryOffset = this.parameters.categoryOffset;
		var ruleLength = this.parameters.ruleLength;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var valueStepLength = (visualArea.h - categoryOffset) / valuePageCapacity;
		// 值轴保留几位小数
		var precision = this.option.precision || 0;
		//计算出数值轴 的一个间距代表的值为多少
		var yStepSize = (max - min) / valuePageCapacity;
		var vtp = this.parameters.vtp.left;
		var zeroLineStyle = null;
		var context = canvas.getContext("2d");


		this.area = {
			x: 1,
			y: visualArea.y - ruleLength,
			w: visualArea.x - ruleLength,
			h: visualArea.h - categoryOffset + ruleLength
		};
		// context.strokeRect(this.area.x,this.area.y,this.area.w,this.area.h);
		// this.clear(canvas);


		context.save();
		if (axisConfig.bottom === axisType.CATEGORY) {
			// 绘制值轴
			context.save();
			// 处理逻辑轴看不全的问题
			context.fillStyle = this.parameters.backgroundColor.toRgba(1);
			context.fillRect(0, grid.y, grid.x, visualArea.h - categoryOffset + 5);
			context.fillRect(rootElementWH.w - grid.x2,
				grid.y,
				grid.x2,
				visualArea.h - categoryOffset + 5);
			context.restore();

			context.beginPath();
			this.axisStyle && this.axisStyle.useStyle(context);
			context.moveTo(grid.x, grid.y + visualArea.h - categoryOffset);
			context.lineTo(grid.x, grid.y);
			context.stroke();
			context.closePath();

			context.textAlign = "right";
			context.textBaseline = "middle";
			for (var i = 0; i < valuePageCapacity; i++) {
				context.save();
				context.translate(visualArea.x - this.parameters.ruleLength + offset.x, visualArea.y + valueStepLength * i + offset.y);
				context.rotate(this.option.axisLabel.rotate * Math.PI / 180);
				if (typeof formatter === "string") {
					//					context.fillText(formatter.replace(this.parameters.valueAxisFormatter, (max - yStepSize * i).toFixed(precision)), visualArea.x - this.parameters.ruleLength + offset.x, visualArea.y + valueStepLength * i + offset.y);
					context.fillText(formatter.replace(this.parameters.valueAxisFormatter, (max - yStepSize * i).toFixed(precision)), 0, 0);
				} else if (typeof formatter === "function") {
					var value = formatter((max - yStepSize * i));
					//					context.fillText(value, visualArea.x - this.parameters.ruleLength, visualArea.y + valueStepLength * i);
					context.fillText(value, 0, 0);
				}
				context.restore();

				context.beginPath();
				context.moveTo(visualArea.x - this.parameters.ruleLength, visualArea.y + valueStepLength * i);
				context.lineTo(visualArea.x, visualArea.y + valueStepLength * i);
				context.stroke();
				context.closePath();
			}

			// 绘制数值轴的起点
			context.save();
			context.translate(visualArea.x - ruleLength + offset.x, visualArea.y + visualArea.h - categoryOffset + offset.y);
			context.rotate(this.option.axisLabel.rotate * Math.PI / 180);
			if (typeof formatter === "string") {
				//				context.fillText(formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)), visualArea.x - ruleLength + offset.x, visualArea.y + visualArea.h - categoryOffset + offset.y);
				context.fillText(formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)), 0, 0);
			} else if (typeof formatter === "function") {
				var value = formatter(min);
				//				context.fillText(value, visualArea.x - ruleLength, visualArea.y + visualArea.h - categoryOffset);
				context.fillText(value, 0, 0);
			}
			context.restore();
		} else if (axisConfig.top === axisType.CATEGORY) {
			// 处理逻辑轴看不全的问题
			context.save();
			context.fillStyle = this.parameters.backgroundColor.toRgba(1);
			context.fillRect(0, grid.y + categoryOffset - 5, grid.x, visualArea.h - categoryOffset);
			context.fillRect(rootElementWH.w - grid.x2,
				grid.y + categoryOffset - 5,
				grid.x2,
				visualArea.h - categoryOffset);
			context.restore();

			context.beginPath();
			this.axisStyle && this.axisStyle.useStyle(context);
			context.moveTo(visualArea.x - 1, visualArea.y + categoryOffset);
			context.lineTo(visualArea.x - 1, visualArea.y + visualArea.h);
			context.stroke();
			context.closePath();

			context.textAlign = "right";
			context.textBaseline = "middle";
			for (var i = 0; i < valuePageCapacity; i++) {
				context.fillText(formatter.replace(this.parameters.valueAxisFormatter, (max - yStepSize * i).toFixed(precision)), visualArea.x - this.parameters.ruleLength, visualArea.y + visualArea.h - valueStepLength * i);
				context.beginPath();
				context.moveTo(visualArea.x - this.parameters.ruleLength, visualArea.y + categoryOffset + valueStepLength * i);
				context.lineTo(visualArea.x, visualArea.y + categoryOffset + valueStepLength * i);
				context.stroke();
				context.closePath();
			}
			context.fillText(formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)), visualArea.x - ruleLength, visualArea.y + categoryOffset);
		}
		context.restore();
	};
	ValueAxis.prototype.drawExtendsLine = function(canvas) {
		var context = canvas.getContext("2d");
		var orientation = this.parameters.orientation;
		var visualArea = this.parameters.visualArea;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var vtpObject = this.parameters.vtp;
		var valueAxisMaxMin = this.parameters.valueAxisMaxMin;
		var valuePageCapacity = this.parameters.valuePageCapacity;
		var categoryOffset = this.parameters.categoryOffset;
		var valueStepLength = (visualArea.h - categoryOffset) / valuePageCapacity;
		var vtp = 0;
		var max = 0;
		var min = 0;

		if (this.position === orientation.L) {
			vtp = vtpObject.left;
			min = valueAxisMaxMin.left.min;
			max = valueAxisMaxMin.left.max;
		} else if (this.position === orientation.R) {
			vtp = vtpObject.right;
			min = valueAxisMaxMin.right.min;
			max = valueAxisMaxMin.right.max;
		} else if (this.position === orientation.T) {
			vtp = vtpObject.top;
			min = valueAxisMaxMin.top.min;
			max = valueAxisMaxMin.top.max;
		} else if (this.position === orientation.B) {
			vtp = vtpObject.bottom;
			min = valueAxisMaxMin.bottom.min;
			max = valueAxisMaxMin.bottom.max;
		}


		if (this.option.splitLine.show) {
			context.save();
			if (axisConfig.bottom === axisType.CATEGORY) {
				for (var i = 0; i < valuePageCapacity; i++) {
					//					if (i == 0)
					//						continue;
					this.splitLineStyle.useStyle(context);
					if (this.option.splitLine.style.type == "solid") {
						context.beginPath();
						context.moveTo(0, i == 0 ? 1 : valueStepLength * i)
						context.lineTo(visualArea.w * 3, i == 0 ? 1 : valueStepLength * i);
						context.stroke();
						context.closePath();
					} else if (this.option.splitLine.style.type == "dotted") {
						context.dottedLine(0, valueStepLength * i, visualArea.w * 3, valueStepLength * i);
					}
				}
			} else if (axisConfig.top === axisType.CATEGORY) {
				for (var i = 0; i < valuePageCapacity; i++) {
					if (i == 0)
						continue;
					this.splitLineStyle.useStyle(context);
					if (this.option.splitLine.style.type == "solid") {
						context.beginPath();
						context.moveTo(0, categoryOffset + valueStepLength * i)
						context.lineTo(visualArea.w * 3, categoryOffset + valueStepLength * i);
						context.stroke();
						context.closePath();
					} else if (this.option.splitLine.style.type == "dotted") {
						context.dottedLine(0, valueStepLength * i, visualArea.w * 3, categoryOffset + valueStepLength * i);
					}
				}
			}
			context.restore();
		}

		if (this.option.zeroLine.show && min < 0) {
			context.save();
			this.zeroLineStyle.useStyle(context);
			if (this.option.zeroLine.style.type == "dotted") {
				if (axisConfig.bottom === axisType.CATEGORY) {
					context.dottedLine(0, vtp * max, visualArea.w * 3, vtp * max);
				} else if (axisConfig.top === axisType.CATEGORY) {
					context.dottedLine(0, visualArea.h - vtp * max, visualArea.w * 3, visualArea.h - vtp * max);
				} else if (axisConfig.left === axisType.CATEGORY) {
					context.dottedLine(visualArea.w - vtp * max, 0, visualArea.w - vtp * max, visualArea.h * 3);
				} else if (axisConfig.right === axisType.CATEGORY) {
					context.dottedLine(vtp * max, 0, vtp * max, visualArea.h * 3);
				}
			} else if (this.option.zeroLine.style.type == "solid") {
				context.beginPath();
				if (axisConfig.bottom === axisType.CATEGORY) {
					context.moveTo(0, vtp * max);
					context.lineTo(visualArea.w * 3, vtp * max);
				} else if (axisConfig.top === axisType.CATEGORY) {
					context.moveTo(0, visualArea.h - vtp * max);
					context.lineTo(visualArea.w * 3, visualArea.h - vtp * max);
				} else if (axisConfig.left === axisType.CATEGORY) {
					context.moveTo(visualArea.w - vtp * max, 0);
					context.lineTo(visualArea.w - vtp * max, visualArea.h * 3)
				} else if (axisConfig.right === axisType.CATEGORY) {
					context.moveTo(vtp * max, 0);
					context.lineTo(vtp * max, visualArea.h * 3);
				}
				context.stroke();
				context.closePath();
			}
			context.restore();
		}
	};
	ValueAxis.prototype.drawAxisName = function(canvas) {
		var axisName = this.option.name;
		if (!axisName)
			return;

		var context = canvas.getContext("2d");
		var ruleLength = this.parameters.ruleLength;
		var rootElementWH = this.parameters.rootElementWH;
		var orientation = this.parameters.orientation;
		var grid = this.parameters.grid;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var categoryOffset = this.parameters.categoryOffset;

		context.save();
		context.fillStyle = this.axisStyle.lineStyle.style.color;
		if (this.position == orientation.L) {
			context.textAlign = "center";
			if (axisConfig.bottom === axisType.CATEGORY) {
				context.textBaseline = "bottom";
				var textWidth = context.measureText(axisName).width;
				context.fillText(axisName, grid.x, grid.y - ruleLength);
			} else if (axisConfig.top === axisType.CATEGORY) {
				context.textBaseline = "top";
				var textWidth = context.measureText(axisName).width;
				context.fillText(axisName, grid.x, rootElementWH.h - grid.y2 + ruleLength);
			}
		} else if (this.position == orientation.R) {
			context.textAlign = "center";
			if (axisConfig.bottom === axisType.CATEGORY) {
				context.textBaseline = "bottom";
				var textWidth = context.measureText(axisName).width;
				context.fillText(axisName, rootElementWH.w - grid.x2, grid.y - ruleLength);
			} else if (axisConfig.top === axisType.CATEGORY) {
				context.textBaseline = "top";
				var textWidth = context.measureText(axisName).width;
				context.fillText(axisName, rootElementWH.w - grid.x2, rootElementWH.h - grid.y2 + ruleLength);
			}
		} else if (this.position == orientation.T) {
			context.textBaseline = "middle";
			if (axisConfig.left === axisType.CATEGORY) {
				context.textAlign = "left";
				var textWidth = context.measureText(axisName).width;
				context.fillText(axisName, rootElementWH.w - grid.x2 + ruleLength, grid.y);
			} else if (axisConfig.right === axisType.CATEGORY) {
				context.textAlign = "right";
				var textWidth = context.measureText(axisName).width;
				context.fillText(axisName, grid.x - ruleLength, grid.y);
			}
		} else if (this.position == orientation.B) {
			context.textBaseline = "middle";
			if (axisConfig.left === axisType.CATEGORY) {
				context.textAlign = "left";
				var textWidth = context.measureText(axisName).width;
				context.fillText(axisName, rootElementWH.w - grid.x2 + ruleLength, rootElementWH.h - grid.y2);
			} else if (axisConfig.right === axisType.CATEGORY) {
				context.textAlign = "right";
				var textWidth = context.measureText(axisName).width;
				context.fillText(axisName, grid.x - ruleLength, rootElementWH.h - grid.y2);
			}
		}
		context.restore();
	};
	ValueAxis.prototype.clear = function(canvas, rect) {
		rect = rect || this.area;
		var context = canvas.getContext('2d');
		context.clearRect(rect.x, rect.y, rect.w, rect.y);
		context.save();
		context.fillStyle = this.parameters.backgroundColor;
		context.fillRect(rect.x, rect.y, rect.w, rect.y);
		context.restore();
	}


	/*
		图形
	*/
	var Series = function(option, parameters) {
		// 是否启用堆叠
		this.isSupportStack = false;
		// 保存按序列分组的数据
		this.seriesGroup = [];
		this.line = null;
		this.bar = null;
		this.k = null;
		this.option = option;
		this.parameters = parameters;
		this.area = {
			rect: {},
			leaf: []
		};

		this.init();
	};
	Series.prototype.init = function(option) {
		this.option = option || this.option;
		this.groupByAxisIndex();
		this.initEventArea();
	};
	/*
		计算vtp
	*/
	Series.prototype.parseVtp = function() {
		// 计算vtp
		if (this.parameters.valueAxisMaxMin.top)
			this.parameters.vtp.top = (this.parameters.visualArea.w - this.parameters.categoryOffset) / (this.parameters.valueAxisMaxMin.top.max - this.parameters.valueAxisMaxMin.top.min);
		if (this.parameters.valueAxisMaxMin.bottom)
			this.parameters.vtp.bottom = (this.parameters.visualArea.w - this.parameters.categoryOffset) / (this.parameters.valueAxisMaxMin.bottom.max - this.parameters.valueAxisMaxMin.bottom.min);
		if (this.parameters.valueAxisMaxMin.left)
			this.parameters.vtp.left = (this.parameters.visualArea.h - this.parameters.categoryOffset) / (this.parameters.valueAxisMaxMin.left.max - this.parameters.valueAxisMaxMin.left.min);
		if (this.parameters.valueAxisMaxMin.right)
			this.parameters.vtp.right = (this.parameters.visualArea.h - this.parameters.categoryOffset) / (this.parameters.valueAxisMaxMin.right.max - this.parameters.valueAxisMaxMin.right.min);
	};
	/*
		初始化series的点击区域
	*/
	Series.prototype.initEventArea = function() {
		this.area.leaf = [];
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var visualArea = this.parameters.visualArea;
		//		var grid = this.parameters.grid;
		var categoryPageCapacity = this.parameters.categoryPageCapacity;
		var categorySegmentLength = this.parameters.categorySegmentLength;
		// var categoryOffset = this.parameters.categoryOffset;
		this.area.rect = {
			x: visualArea.x,
			y: visualArea.y,
			w: visualArea.w,
			h: visualArea.h
		};


		/*
			计算serie点击事件的区域数组
		*/
		for (var i = 0; i < categoryPageCapacity + 1; i++) {
			var object = {};
			// object.data = "";
			// for(var j = 0;j < this.option.length;j++) {
			// 	var serie = this.option[j];
			// 	object.data += serie.name + ":" + serie.data[i] + "<br/>";
			// }
			object.type = this.parameters.touchTargetType.SERIES;
			object.data = i;
			object.leaf = [];
			object.click = this.parameters.seriesClick
			var x = 0,
				y = 0,
				w = 0,
				h = 0;
			if (axisConfig.left === axisType.VALUE || axisConfig.right === axisType.VALUE) {
				x = visualArea.x + categorySegmentLength * i;
				y = visualArea.y;
				w = categorySegmentLength;
				h = visualArea.h;
			} else if (axisConfig.top === axisType.VALUE || axisConfig.bottom === axisType.VALUE) {
				x = visualArea.x;
				y = visualArea.y + categorySegmentLength * i;
				w = visualArea.w;
				h = categorySegmentLength;
			}
			object.rect = {
				x: x,
				y: y,
				w: w,
				h: h
			};
			this.area.leaf.push(object);
		}

		// 初始化点击区域数组
		for (var i = 0; i < this.area.leaf.length; i++) {
			for (var j = 0; j < this.option.length; j++) {
				this.area.leaf[i].leaf[j] = {};
			}
		}
	};
	/*
		根据轴的位置分组
	*/
	Series.prototype.groupByAxisIndex = function() {
		this.seriesGroup = [];
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var valueAxisMaxMin = this.parameters.valueAxisMaxMin;
		var left = [];
		var right = [];
		var top = [];
		var bottom = [];
		for (var i = 0; i < this.option.length; i++) {
			var serie = this.option[i];
			var yAxisIndex = serie.yAxisIndex || 0;
			var xAxisIndex = serie.xAxisIndex === undefined ? 1 : serie.xAxisIndex;
			// 根据轴类型进行分组，为了计算最大值和最小值
			if (axisConfig.left === axisType.VALUE) {
				if (yAxisIndex === 0)
					left.push(serie);
			}
			if (axisConfig.right === axisType.VALUE) {
				if (yAxisIndex === 1)
					right.push(serie);
			}
			if (axisConfig.top === axisType.VALUE) {
				if (xAxisIndex === 1)
					top.push(serie);
			}
			if (axisConfig.bottom === axisType.VALUE) {
				if (xAxisIndex === 0)
					bottom.push(serie);
			}
		}

		/*
			获取每个数值轴的最大值和最小值
		*/
		if (left.length > 0) {
			valueAxisMaxMin.left = this.groupByStack(left);
			if (valueAxisMaxMin.left.min > 0) {
				valueAxisMaxMin.left.max += (valueAxisMaxMin.left.max - valueAxisMaxMin.left.min) * 0.2;
			} else {
				valueAxisMaxMin.left.max *= 1.2;
			}
		}

		if (right.length > 0) {
			valueAxisMaxMin.right = this.groupByStack(right);
			if (valueAxisMaxMin.right.min > 0) {
				valueAxisMaxMin.right.max += (valueAxisMaxMin.right.max - valueAxisMaxMin.right.min) * 0.2
			} else {
				valueAxisMaxMin.right.max *= 1.2;
			}
		}

		if (top.length > 0) {
			valueAxisMaxMin.top = this.groupByStack(top);
			if (valueAxisMaxMin.top.min > 0) {
				valueAxisMaxMin.top.max += (valueAxisMaxMin.top.max - valueAxisMaxMin.top.min) * 0.2
			} else {
				valueAxisMaxMin.top.max *= 1.2;
			}
		}

		if (bottom.length > 0) {
			valueAxisMaxMin.bottom = this.groupByStack(bottom);
			if (valueAxisMaxMin.bottom.min > 0) {
				valueAxisMaxMin.bottom.max += (valueAxisMaxMin.bottom.max - valueAxisMaxMin.bottom.min) * 0.2
			} else {
				valueAxisMaxMin.bottom.max *= 1.2;
			}
		}

		this.parseVtp();
	};
	/**
		根据堆叠分组 
		option:根据series里面的index分组的数组
	*/
	Series.prototype.groupByStack = function(option) {
		var groups = {};
		var defaultStack = "def_";
		var defaultStackIndex = 0;
		for (var i = 0; i < option.length; i++) {
			var serie = option[i];

			// 控制是否显示
			if (serie.show != false)
				serie.show = true;


			// 给每个serie创建样式
			if (!serie.serieStyle) {
				if (serie.type == "line") {
					serie.serieStyle = new LineStyle(serie.style);
				} else if (serie.type == "bar") {
					serie.serieStyle = new ShapeStyle(serie.style);
				} else if (serie.type == "k") {
					serie.serieStyle = new KStyle(serie.style);
				}
			}


			var stack = serie.stack;
			if (serie.type == 'k' || !stack) {
				// 伪装为有stack的情况
				groups[defaultStack + defaultStackIndex++] = [serie];
			} else {
				if (!groups[stack]) {
					groups[stack] = [];
				}
				groups[stack].push(serie);
			}
		}
		this.seriesGroup.push(groups);
		return this.calculateMaxMinValue(groups);
	};
	/*
		计算最大值和最小值
	*/
	Series.prototype.calculateMaxMinValue = function(groups) {
		var j, k;
		// 图形最大值
		var max = Math.MAX_VALUE;
		// 图形最小值
		var min = 0;
		for (var i in groups) {
			var group = groups[i];
			// 当是K线图的时候
			if (group[0].type == 'k') {
				var datas = group[0].data;
				min = null;
				max = null;
				for (var k in datas) {
					var data = datas[k];
					if (datas[k][0] == "-")
						datas[k][0] = null;
					if (datas[k][1] == "-")
						datas[k][1] = null;
					if (datas[k][2] == "-")
						datas[k][2] = null;
					if (datas[k][3] == "-")
						datas[k][3] = null;

					minVal = datas[k][2];
					maxVal = datas[k][3];
					// var maxVal = util.getMaxValueFromArray(datas[k]);
					// var minVal = util.getMinValueFromArray(datas[k]);
					if (min == null && minVal != null) {
						min = minVal;
					} else {
						if (minVal != null && min > minVal)
							min = minVal;
					}
					if (max == null && maxVal != null) {
						max = maxVal;
					} else {
						if (maxVal != null && max < maxVal)
							max = maxVal;
					}


				}
				// 当是非K线图的时候
			} else {
				// 堆叠组最大值
				var tempMax = Math.MAX_VALUE;
				// 堆叠组最小值
				var tempMin = 0;
				for (var h = 0; h < group[0].data.length; h++) {
					// 每列最大值
					var tempSumMax = 0;
					// 每列最小值
					var tempSumMin = 0;
					for (j = 0; j < group.length; j++) {
						var serieData = null;
						if (group[j].data[h] == "-") {
							group[j].data[h] = null;
						} else {
							serieData = group[j].data[h] = parseInt(group[j].data[h]);
						}

						if (!serieData)
							serieData = 0;
						tempSumMax += serieData;

						if (serieData < 0) {
							tempSumMin += serieData;
						}
					}
					if (tempMax == Math.MAX_VALUE)
						tempMax = tempSumMax;
					else if (tempSumMax > tempMax)
						tempMax = tempSumMax;
					if (tempSumMin < 0 && tempSumMin < tempMin)
						tempMin = tempSumMin;
				}

				if (max == Math.MAX_VALUE)
					max = tempMax;
				else if (tempMax > max)
					max = tempMax;

				if (tempMin < min)
					min = tempMin;
			}
		}
		return {
			"max": max,
			"min": min
		};
	};
	/*
		绘制图形
	*/
	Series.prototype.draw = function(canvas) {
		this.parameters.barCountInSection = 0;
		for (var i = 0; i < this.seriesGroup.length; i++) {
			for (var key in this.seriesGroup[i]) {
				var series = this.seriesGroup[i][key];
				for (var j = 0; j < series.length; j++) {
					var serie = series[j];
					if (!serie.show)
						continue;
					if (serie.type == "bar") {
						this.parameters.barCountInSection++;
						break;
					}
				}

			}
		}

		/*
			遍历轴分组
		*/
		var serieIndex = 0;
		for (var i = 0; i < this.seriesGroup.length; i++) {
			// 记录有几个分组stack
			var count = 0;
			for (var key in this.seriesGroup[i]) {
				// 保存堆叠分组的值，[0]是正值相加，[1]是负值相加
				var stackValue = null; //[[],[]]
				var hasBar = false;
				var series = this.seriesGroup[i][key];
				for (var j = 0; j < series.length; j++) {
					var returnStackValue = null;
					var serie = series[j];

					if (!serie.show)
						continue;

					if (serie.type == "line") {
						if (!this.line) {
							this.line = new Line(this.parameters);
						}
						if (serie.smooth) {
							returnStackValue = this.line.drawSmoothLine(canvas, serie, stackValue, serieIndex++, this.area);
						} else {
							returnStackValue = this.line.drawLine(canvas, serie, stackValue, serieIndex++, this.area);
						}
					} else if (serie.type == "bar") {
						if (!this.bar)
							this.bar = new Bar(this.parameters);
						returnStackValue = this.bar.drawBar(canvas, serie, stackValue, count, serieIndex++, this.area)
						hasBar = true;
					} else if (serie.type == "k") {
						if (!this.k)
							this.k = new K(this.parameters);
						returnStackValue = this.k.drawK(canvas, serie, stackValue, count, serieIndex++, this.area)
						continue;
					}

					if (stackValue == null) {
						stackValue = returnStackValue;
					} else if (returnStackValue != null) {
						for (var idx = 0; idx < returnStackValue[0].length; idx++) {
							stackValue[0][idx] += returnStackValue[0][idx];
						}
						for (var idx = 0; idx < returnStackValue[1].length; idx++) {
							stackValue[1][idx] += returnStackValue[1][idx];
						}
					}
				}
				if (hasBar) {
					count++;
				}
			}
		}
	};
	Series.prototype.clear = function(canvas, rect) {
		var context = canvas.getContext("2d");
		context.save();
		context.fillStyle = this.parameters.backgroundColor;
		if (!rect) {
			context.clearRect(0, 0, this.parameters.middleCanvasWH.w, this.parameters.middleCanvasWH.h);
			context.fillRect(0, 0, this.parameters.middleCanvasWH.w, this.parameters.middleCanvasWH.h);
		} else {
			context.clearRect(rect.x, rect.y, rect.w, rect.h);
			context.fillRect(rect.x, rect.y, rect.w, rect.h);
		}
		context.restore();
	};


	/*
		线型图	
	*/
	var Line = function(parameters) {
		this.parameters = parameters;
		this.option = null;
		this.radius = 3;
		this.fillAlpha = 0.3;
	};
	/*
		折线
	*/
	Line.prototype.drawLine = function(canvas, serie, stackValue, serieIndex, area) {
		var visualArea = this.parameters.visualArea;
		var axisConfig = this.parameters.axisConfig;
		var touchOffset = this.parameters.touchOffset;
		var axisType = this.parameters.axisType;
		var grid = this.parameters.grid;
		var valueAxisMaxMin = this.parameters.valueAxisMaxMin;
		var categorySegmentLength = this.parameters.categorySegmentLength;
		var categoryPageCapacity = this.parameters.categoryPageCapacity;
		var categoryOffset = this.parameters.categoryOffset;
		var vtpObject = this.parameters.vtp;
		var startEnd = this.parameters.traversalRange();
		var begin = startEnd.begin;
		var end = startEnd.end;
		var middle = startEnd.middle;
		var progress = this.parameters.progress;

		var returnStackValue = [
			[],
			[]
		];
		if (stackValue == null) {
			stackValue = [
				[],
				[]
			];
			for (var i = begin; i < end; i++) {
				stackValue[0].push(0);
				stackValue[1].push(0);
			}
		}

		// 判断使用哪种vtp
		var vtp = 0;
		var min = 0;
		var max = 0;
		var yAxisIndex = serie.yAxisIndex || 0;
		var xAxisIndex = serie.xAxisIndex == undefined ? 1 : serie.xAxisIndex;
		if (yAxisIndex == 0 && axisConfig.left === axisType.VALUE) {
			vtp = vtpObject.left;
			min = valueAxisMaxMin.left.min;
			max = valueAxisMaxMin.left.max;
		} else if (yAxisIndex == 1 && axisConfig.right === axisType.VALUE) {
			vtp = vtpObject.right;
			min = valueAxisMaxMin.right.min;
			max = valueAxisMaxMin.right.max;
		}

		if (xAxisIndex == 1 && axisConfig.top === axisType.VALUE) {
			vtp = vtpObject.top;
			min = valueAxisMaxMin.top.min;
			max = valueAxisMaxMin.top.max;
		} else if (xAxisIndex == 0 && axisConfig.bottom === axisType.VALUE) {
			vtp = vtpObject.bottom;
			min = valueAxisMaxMin.bottom.min;
			max = valueAxisMaxMin.bottom.max;
		}


		// 计算平均值
		function getAverage() {
			var total = 0;
			for (var index = begin; index < end; index++) {
				var t = serie.data[index];
				if (t == null) {
					t = 0;
				}
				total += t;
			}
			return total / (end - begin);
		}
		var average = getAverage();


		var context = canvas.getContext("2d");
		context.save();
		context.beginPath();
		serie.serieStyle.useStyle(context);
		// 循环画图
		// 保存点的坐标
		var pointArray = [];
		var dataIsNull = -1;
		for (var i = begin; i < end; i++) {
			var serieData = serie.data[i];
			if (serieData == null) {
				serieData = 0;
				dataIsNull = i;
				context.stroke();
			}

			if (serieData >= 0) {
				returnStackValue[0].push(serieData);
				returnStackValue[1].push(0);
			} else {
				returnStackValue[0].push(0);
				returnStackValue[1].push(serieData);
			}


			// 1 叠加上次堆叠保存的值
			if (serieData > 0) {
				serieData += stackValue[0][i - begin];

			} else {
				serieData += stackValue[1][i - begin];
			}

			if (dataIsNull == i)
				continue;


			var x = 0;
			var y = 0;
			var symbol = 1;
			serieData = average + (serieData - average) * progress;
			if (axisConfig.bottom === axisType.CATEGORY) {
				x = (i + 0.5) * categorySegmentLength + touchOffset.current - this.parameters.grid.x * 0.5;
				y = visualArea.h - (serieData - min) * vtp - categoryOffset;
				symbol = 1;
			} else if (axisConfig.top === axisType.CATEGORY) {
				x = (i + 0.5) * categorySegmentLength + touchOffset.current - this.parameters.grid.x * 0.5;
				y = (serieData - min) * vtp + categoryOffset;
				symbol = -1;
			} else if (axisConfig.left === axisType.CATEGORY) {
				y = (i + 0.5) * categorySegmentLength + touchOffset.current;
				x = (serieData - min) * vtp + categoryOffset;
				symbol = -1;
			} else if (axisConfig.right === axisType.CATEGORY) {
				y = (i + 0.5) * categorySegmentLength + touchOffset.current;
				x = visualArea.w - categoryOffset - (serieData - min) * vtp;
				symbol = 1;
			}


			// 是否需要显示区域图 serie 里面需要配置area为true
			if (serie.area) {
				if (axisConfig.bottom === axisType.CATEGORY || axisConfig.top === axisType.CATEGORY) {
					if (i == begin) {
						context.moveTo(x, y + serieData * vtp * symbol);
						context.lineTo(x, y);
					} else {
						if (serie.data[i - 1] == null) {
							context.moveTo(x, y + serieData * vtp * symbol);
							context.lineTo(x, y);
						} else {
							context.lineTo(x, y);
						}
					}

					if (i == end - 1 || serie.data[i + 1] == null) {
						context.lineTo(x, y + serieData * vtp * symbol);
						context.save();
						context.fillStyle = context.strokeStyle.toRgba(this.fillAlpha);
						context.fill();
						context.restore();
					}
				} else if (axisConfig.left === axisType.CATEGORY || axisConfig.right === axisType.CATEGORY) {
					if (i == begin) {
						context.moveTo(x + serieData * vtp * symbol, y);
						context.lineTo(x, y);
					} else {
						context.lineTo(x, y);
					}

					if (i == end - 1) {
						context.lineTo(x + serieData * vtp * symbol, y);
						context.fillStyle = context.strokeStyle;
						context.save();
						context.globalAlpha = this.fillAlpha;
						context.fill();
						context.restore();
					}
				}
			} else {
				if (i == begin || dataIsNull == i - 1) {
					context.moveTo(x, y);
				} else {
					context.lineTo(x, y);
				}
			}

			pointArray[i] = {
				x: x,
				y: y
			};
		}
		context.stroke();
		context.closePath();

		// 绘制点
		if (serie.joint === true) {
			context.fillStyle = "rgba(255,255,255,1)";
			for (var i in pointArray) {
				context.save();
				var point = pointArray[i];
				context.beginPath();
				context.arc(point.x, point.y, this.radius, 0, Math.PI * 2, false);
				context.closePath();
				context.clip();
				context.clearRect(point.x - this.radius * 0.5, point.y - this.radius * 0.5, this.radius * 2, this.radius * 2);
				context.fill();

				context.restore();
				context.beginPath();
				context.arc(point.x, point.y, this.radius, 0, Math.PI * 2, false);
				context.stroke();
				context.closePath();
			}
		}


		context.restore();

		// 当动画加载完之后需要计算区域，用于注册点击事件
		if (this.parameters.progress == 1) {
			for (var i = 0; i < categoryPageCapacity + 1; i++) {
				var point = pointArray[middle + i];
				if (!point)
					break;

				if (axisConfig.left === axisType.VALUE || axisConfig.right === axisType.VALUE) {
					area.leaf[i].leaf[serieIndex] = {
						rect: {
							x: (i + 0.5) * categorySegmentLength + (ifloor(touchOffset.current) - visualArea.w) % categorySegmentLength + visualArea.x - this.radius * 2 - grid.x * 0.5,
							y: point.y + visualArea.y - this.radius * 2,
							w: this.radius * 4,
							h: this.radius * 4
						},
						data: {
							serie: serie,
							index: middle + i
						},
						type: this.parameters.touchTargetType.SERIE
					};
				} else if (axisConfig.top === axisType.VALUE || axisConfig.bottom === axisType.VALUE) {
					area.leaf[i].leaf[serieIndex] = {
						rect: {
							x: point.x + visualArea.x - this.radius * 2,
							y: (i + 0.5) * categorySegmentLength + (ifloor(touchOffset.current) - visualArea.h) % categorySegmentLength + visualArea.y - this.radius * 2,
							w: this.radius * 4,
							h: this.radius * 4
						},
						data: {
							serie: serie,
							index: middle + i
						},
						type: this.parameters.touchTargetType.SERIE
					};
				}
				if (serie.click && typeof serie.click === 'function')
					area.leaf[i].leaf[serieIndex].click = serie.click;
			}
		}

		return returnStackValue;
	};
	/*
		曲线
	*/
	Line.prototype.drawSmoothLine = function(canvas, serie, stackValue, serieIndex, area) {
		var visualArea = this.parameters.visualArea;
		var axisConfig = this.parameters.axisConfig;
		var touchOffset = this.parameters.touchOffset;
		var axisType = this.parameters.axisType;
		var valueAxisMaxMin = this.parameters.valueAxisMaxMin;
		var categorySegmentLength = this.parameters.categorySegmentLength;
		var categoryPageCapacity = this.parameters.categoryPageCapacity;


		var categoryOffset = this.parameters.categoryOffset;
		var vtpObject = this.parameters.vtp;
		var startEnd = this.parameters.traversalRange();
		var begin = startEnd.begin;
		var end = startEnd.end;
		var middle = startEnd.middle;
		var progress = this.parameters.progress;



		var returnStackValue = [
			[],
			[]
		];
		if (stackValue == null) {
			stackValue = [
				[],
				[]
			];
			for (var i = begin; i < end; i++) {
				stackValue[0].push(0);
				stackValue[1].push(0);
			}
		}

		// 判断使用哪种vtp
		var vtp = 0;
		var min = 0;
		var max = 0;
		var yAxisIndex = serie.yAxisIndex || 0;
		var xAxisIndex = serie.xAxisIndex == undefined ? 1 : serie.xAxisIndex;
		if (yAxisIndex == 0 && axisConfig.left === axisType.VALUE) {
			vtp = vtpObject.left;
			min = valueAxisMaxMin.left.min;
			max = valueAxisMaxMin.left.max;
		} else if (yAxisIndex == 1 && axisConfig.right === axisType.VALUE) {
			vtp = vtpObject.right;
			min = valueAxisMaxMin.right.min;
			max = valueAxisMaxMin.right.max;
		}

		if (xAxisIndex == 1 && axisConfig.top === axisType.VALUE) {
			vtp = vtpObject.top;
			min = valueAxisMaxMin.top.min;
			max = valueAxisMaxMin.top.max;
		} else if (xAxisIndex == 0 && axisConfig.bottom === axisType.VALUE) {
			vtp = vtpObject.bottom;
			min = valueAxisMaxMin.bottom.min;
			max = valueAxisMaxMin.bottom.max;
		}

		// 计算平均值
		function getAverage() {
			var total = 0;
			for (var index = begin; index < end; index++) {
				var t = serie.data[index];
				if (t == null) {
					t = 0;
				}
				total += t;
			}
			return total / (end - begin);
		}
		var average = getAverage();


		// 循环画图
		// 保存点的坐标
		var pointArray = [];
		var pointMap = [];
		var dataIsNull = -1;
		var curveArray = [];
		for (var i = begin; i < end; i++) {
			/*===========处理返回的堆叠数据==============*/
			var serieData = serie.data[i];
			if (serieData == null) {
				serieData = 0;
				dataIsNull = i;
			}

			if (serieData >= 0) {
				returnStackValue[0].push(serieData);
				returnStackValue[1].push(0);
			} else {
				returnStackValue[0].push(0);
				returnStackValue[1].push(serieData);
			}


			// 1 叠加上次堆叠保存的值
			if (serieData > 0) {
				serieData += stackValue[0][i - begin];

			} else {
				serieData += stackValue[1][i - begin];
			}


			var x = 0;
			var y = 0;
			var symbol = 1;
			serieData = average + (serieData - average) * progress;
			// 2 判断绘制的方向
			if (axisConfig.bottom === axisType.CATEGORY) {
				x = (i + 0.5) * categorySegmentLength + touchOffset.current - this.parameters.grid.x * 0.5;
				y = visualArea.h - (serieData - min) * vtp - categoryOffset;
				symbol = 1;
			} else if (axisConfig.top === axisType.CATEGORY) {
				x = (i + 0.5) * categorySegmentLength + touchOffset.current - this.parameters.grid.x * 0.5;
				y = (serieData - min) * vtp + categoryOffset;
				symbol = -1;
			} else if (axisConfig.left === axisType.CATEGORY) {
				y = (i + 0.5) * categorySegmentLength + touchOffset.current;
				x = (serieData - min) * vtp + categoryOffset;
				symbol = -1;
			} else if (axisConfig.right === axisType.CATEGORY) {
				y = (i + 0.5) * categorySegmentLength + touchOffset.current;
				x = visualArea.w - (serieData - min) * vtp - categoryOffset;
				symbol = 1;
			}

			if (dataIsNull == i) {
				pointArray.length > 0 && curveArray.push(smoothLine(pointArray, 10));
				pointArray = [];
				continue;
			}

			pointArray.push({
				x: x,
				y: y,
				index: i
			});
			pointMap[i] = {
				x: x,
				y: y
			};
			if (i == end - 1) {
				curveArray.push(smoothLine(pointArray, 10));
			}

		}

		var context = canvas.getContext("2d");
		context.save();
		context.beginPath();
		serie.serieStyle.useStyle(context);
		// 画曲线
		var arr = smoothLine(pointArray, 10);


		for (var idx = 0; idx < curveArray.length; idx++) {
			var arr = curveArray[idx];
			if (serie.area) {
				if (axisConfig.bottom === axisType.CATEGORY) {
					arr.unshift({
						x: arr[0].x,
						y: vtp * max
					});
					arr.push({
						x: arr[arr.length - 1].x,
						y: vtp * max
					});
				} else if (axisConfig.top === axisType.CATEGORY) {
					arr.unshift({
						x: arr[0].x,
						y: Math.abs(vtp * min) + categoryOffset
					});
					arr.push({
						x: arr[arr.length - 1].x,
						y: Math.abs(vtp * min) + categoryOffset
					});
				} else if (axisConfig.left === axisType.CATEGORY) {
					arr.unshift({
						x: Math.abs(vtp * min) + categoryOffset,
						y: arr[0].y
					});
					arr.push({
						x: Math.abs(vtp * min) + categoryOffset,
						y: arr[arr.length - 1].y
					});
				} else if (axisConfig.right === axisType.CATEGORY) {
					arr.unshift({
						x: Math.abs(vtp * max),
						y: arr[0].y
					});
					arr.push({
						x: Math.abs(vtp * max),
						y: arr[arr.length - 1].y
					});
				}
			}



			for (var i = 0; i < arr.length; i++) {
				if (i == 0) {
					context.moveTo(arr[i].x, arr[i].y);
				} else {
					context.lineTo(arr[i].x, arr[i].y);
				}
			}
		}
		context.stroke();
		context.closePath();
		if (serie.area) {
			context.save();
			context.fillStyle = context.strokeStyle.toRgba(this.fillAlpha);
			context.fill();
			context.restore();
		}
		// 画点
		if (serie.joint === true) {
			context.fillStyle = "rgba(255,255,255,0.5)";
			for (var i in pointMap) {
				var point = pointMap[i];
				context.beginPath();
				context.arc(point.x, point.y, this.radius, 0, Math.PI * 2, false);
				context.fill();
				context.stroke();
				context.closePath();
			}
		}


		context.restore();



		if (this.parameters.progress == 1) {
			for (var i = 0; i < categoryPageCapacity + 1; i++) {
				var point = pointMap[middle + i];
				if (!point)
					break;

				if (axisConfig.left === axisType.VALUE || axisConfig.right === axisType.VALUE) {
					area.leaf[i].leaf[serieIndex] = {
						rect: {
							x: (i + 0.5) * categorySegmentLength + (ifloor(touchOffset.current) - visualArea.w) % categorySegmentLength + visualArea.x - this.radius * 2 - grid.x * 0.5,
							y: point.y + visualArea.y - this.radius * 2,
							w: this.radius * 4,
							h: this.radius * 4
						},
						data: {
							serie: serie,
							index: middle + i
						},
						type: this.parameters.touchTargetType.SERIE
					};
				} else if (axisConfig.top === axisType.VALUE || axisConfig.bottom === axisType.VALUE) {
					area.leaf[i].leaf[serieIndex] = {
						rect: {
							x: point.x + visualArea.x - this.radius * 2,
							y: (i + 0.5) * categorySegmentLength + (ifloor(touchOffset.current) - visualArea.h) % categorySegmentLength + visualArea.y - this.radius * 2 - grid.y * 0.5,
							w: this.radius * 4,
							h: this.radius * 4
						},
						data: {
							serie: serie,
							index: middle + i
						},
						type: this.parameters.touchTargetType.SERIE
					};
				}
				if (serie.click && typeof serie.click === 'function')
					area.leaf[i].leaf[serieIndex].click = serie.click;
			}
		}



		function smoothLine(points, granularity) {

			var retArray = [];

			if (points.length < 3) {
				return points;
			} else {

				points.unshift(points[0]);
				points.push(points[points.length - 1]);


				var x, y, p0, p1, p2, p3, t, tt, ttt;


				retArray.push({
					x: points[0].x,
					y: points[0].y
				});
				for (var index = 1; index < points.length - 2; index++) {
					p0 = points[index - 1];
					p1 = points[index];
					p2 = points[index + 1];
					p3 = points[index + 2];

					for (var i = 1; i < granularity; i++) {
						t = i * (1.0 / granularity);
						tt = t * t;
						ttt = tt * t;

						x = 0.5 * (2 * p1.x + (p2.x - p0.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt + (3 * p1.x - p0.x - 3 * p2.x + p3.x) * ttt);
						y = 0.5 * (2 * p1.y + (p2.y - p0.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt + (3 * p1.y - p0.y - 3 * p2.y + p3.y) * ttt);

						retArray.push({
							x: x,
							y: y
						});
					}
					retArray.push({
						x: p2.x,
						y: p2.y
					});
				}

				retArray.push({
					x: points[points.length - 1].x,
					y: points[points.length - 1].y
				});

				return retArray;
			}
		}


		return returnStackValue;
	};



	/*
		柱形图
	*/
	var Bar = function(parameters) {
		this.parameters = parameters;
		this.option = null;
		this.shapeStyle = null;
		this.touchOffset = null;
	};
	Bar.prototype.drawBar = function(canvas, serie, stackValue, barIndex, serieIndex, area) {
		var context = canvas.getContext("2d");
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var touchOffset = this.parameters.touchOffset;
		var grid = this.parameters.grid;

		var startEnd = this.parameters.traversalRange();
		var visualArea = this.parameters.visualArea;
		var categoryOffset = this.parameters.grid.y2;
		var begin = startEnd.begin;
		var end = startEnd.end;
		var middle = startEnd.middle;
		var categorySegmentLength = this.parameters.categorySegmentLength;
		var categoryPageCapacity = this.parameters.categoryPageCapacity;
		var barCountInSection = this.parameters.barCountInSection;
		// 间隙的宽度，也就是柱子宽度的 this.parameters.riftInBarWidth 分之一
		var littleBarWidth = categorySegmentLength / (this.parameters.barCountInSection * this.parameters.riftInBarWidth + (this.parameters.barCountInSection + 1));
		// 柱的宽度
		var barWidth = littleBarWidth * this.parameters.riftInBarWidth;
		var vtp = 0;
		var min = 0;
		var max = 0;
		var returnStackValue = [
			[],
			[]
		];

		if (stackValue == null) {
			stackValue = [
				[],
				[]
			];
			for (var i = begin; i < end; i++) {
				stackValue[0].push(0);
				stackValue[1].push(0);
			}
		}

		var yAxisIndex = serie.yAxisIndex || 0;
		var xAxisIndex = serie.xAxisIndex == undefined ? 1 : serie.xAxisIndex;
		if (yAxisIndex == 0 && axisConfig.left === axisType.VALUE) {
			vtp = this.parameters.vtp.left;
			min = this.parameters.valueAxisMaxMin.left.min;
			max = this.parameters.valueAxisMaxMin.left.max;
		} else if (yAxisIndex == 1 && axisConfig.right === axisType.VALUE) {
			vtp = this.parameters.vtp.right;
			min = this.parameters.valueAxisMaxMin.right.min;
			max = this.parameters.valueAxisMaxMin.right.max;
		}

		if (xAxisIndex == 0 && axisConfig.bottom === axisType.VALUE) {
			vtp = this.parameters.vtp.bottom;
			min = this.parameters.valueAxisMaxMin.bottom.min;
			max = this.parameters.valueAxisMaxMin.bottom.max;
		} else if (xAxisIndex == 1 && axisConfig.top === axisType.VALUE) {
			vtp = this.parameters.vtp.top;
			min = this.parameters.valueAxisMaxMin.top.min;
			max = this.parameters.valueAxisMaxMin.top.max;
		}


		context.save();
		serie.serieStyle.useStyle(context);
		context.globalAlpha = 0.8;
		var barArray = [];
		for (var i = begin; i < end; i++) {
			var serieData = serie.data[i];
			var stackData = 0;
			serieData = serieData || 0;
			if (serieData >= 0) {
				stackData = serieData + stackValue[0][i - begin];
				returnStackValue[0].push(serieData);
				returnStackValue[1].push(0);
			} else {
				stackData = serieData + stackValue[1][i - begin];
				returnStackValue[0].push(0);
				returnStackValue[1].push(serieData);
			}


			var x = y = w = h = 0;
			if (axisConfig.bottom === axisType.CATEGORY) {
				x = littleBarWidth + (barWidth + littleBarWidth) * barIndex + i * categorySegmentLength + touchOffset.current - this.parameters.grid.x * 0.5;
				w = barWidth;
				if (serieData > 0) {
					h = serieData * vtp * this.parameters.progress;
					y = max * vtp - stackData * vtp * this.parameters.progress;
				} else {
					h = -1 * serieData * vtp * this.parameters.progress;
					y = max * vtp - stackData * vtp * this.parameters.progress - h;
				}
				context.fillRoundRect(x, y, w, h);
			} else if (axisConfig.top === axisType.CATEGORY) {
				x = littleBarWidth + (barWidth + littleBarWidth) * barIndex + i * categorySegmentLength + touchOffset.current - this.parameters.grid.x * 0.5;
				w = barWidth;
				if (serieData > 0) {
					h = serieData * vtp * this.parameters.progress;
					y = (visualArea.h - h) - (max * vtp - stackData * vtp * this.parameters.progress);
				} else {
					h = -1 * serieData * vtp * this.parameters.progress;
					y = visualArea.h - (max * vtp - stackData * vtp * this.parameters.progress);
				}
				context.fillRect(x, y, w, h);
			} else if (axisConfig.left === axisType.CATEGORY) {
				y = littleBarWidth + (barWidth + littleBarWidth) * barIndex + i * categorySegmentLength + touchOffset.current;
				h = barWidth;
				if (serieData > 0) {
					w = serieData * vtp * this.parameters.progress;
					x = (visualArea.w - w) - (max * vtp - stackData * vtp * this.parameters.progress);
				} else {
					w = -1 * serieData * vtp * this.parameters.progress;
					x = visualArea.w - (max * vtp - stackData * vtp * this.parameters.progress);
				}
				context.fillRect(x, y, w, h);
			} else if (axisConfig.right === axisType.CATEGORY) {
				y = littleBarWidth + (barWidth + littleBarWidth) * barIndex + i * categorySegmentLength + touchOffset.current;
				h = barWidth;
				if (serieData > 0) {
					w = serieData * vtp * this.parameters.progress;
					x = max * vtp - stackData * vtp * this.parameters.progress;
				} else {
					w = -1 * serieData * vtp * this.parameters.progress;
					x = w - (max * vtp - stackData * vtp * this.parameters.progress);
				}
				context.fillRect(x, y, w, h);
			}

			if (this.parameters.progress == 1) {
				barArray[i] = {
					x: x,
					y: y,
					w: w,
					h: h
				};
			}
		}
		context.restore();

		if (this.parameters.progress == 1) {
			for (var i = 0; i < categoryPageCapacity + 1; i++) {
				var bar = barArray[middle + i];
				if (!bar)
					break;

				if (axisConfig.left === axisType.VALUE || axisConfig.right === axisType.VALUE) {
					area.leaf[i].leaf[serieIndex] = {
						rect: {
							x: littleBarWidth + (barWidth + littleBarWidth) * barIndex + i * categorySegmentLength + (ifloor(touchOffset.current) - visualArea.w) % categorySegmentLength + visualArea.x - grid.x * 0.5,
							y: bar.y + visualArea.y,
							w: bar.w,
							h: bar.h
						},
						data: {
							serie: serie,
							index: middle + i
						},
						type: this.parameters.touchTargetType.SERIE
					};
				} else if (axisConfig.top === axisType.VALUE || axisConfig.bottom === axisType.VALUE) {
					area.leaf[i].leaf[serieIndex] = {
						rect: {
							x: bar.x + visualArea.x,
							y: littleBarWidth + (barWidth + littleBarWidth) * barIndex + i * categorySegmentLength + (ifloor(touchOffset.current) - visualArea.h) % categorySegmentLength + visualArea.y - grid.y * 0.5,
							w: bar.w,
							h: bar.h
						},
						data: {
							serie: serie,
							index: middle + i
						},
						type: this.parameters.touchTargetType.SERIE
					};
				}
				if (serie.click && typeof serie.click === 'function')
					area.leaf[i].leaf[serieIndex].click = serie.click;
			}
		}
		return returnStackValue;
	};



	/*
		K线图
	*/
	var K = function(parameters) {
		this.parameters = parameters;
		// 柱形的占比
		this.gravity = 0.2;
	};
	K.prototype.drawK = function(canvas, serie, stackValue, barIndex, serieIndex, area) {
		var context = canvas.getContext("2d");
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var vtpObject = this.parameters.vtp;
		var valueAxisMaxMin = this.parameters.valueAxisMaxMin;
		var categoryPageCapacity = this.parameters.categoryPageCapacity;
		var categorySegmentLength = this.parameters.categorySegmentLength;
		var categoryOffset = this.parameters.categoryOffset;
		var barWidth = (serie.gravity || this.gravity) * categorySegmentLength;
		var visualArea = this.parameters.visualArea;
		var touchOffset = this.parameters.touchOffset;
		var range = this.parameters.traversalRange();
		var begin = range.begin;
		var end = range.end;
		var middle = range.middle;


		var vtp = 0;
		var min = 0;
		var max = 0;
		var yAxisIndex = serie.yAxisIndex || 0;
		var xAxisIndex = serie.xAxisIndex == undefined ? 1 : serie.xAxisIndex;
		if (yAxisIndex == 0 && axisConfig.left === axisType.VALUE) {
			vtp = vtpObject.left;
			min = valueAxisMaxMin.left.min * vtp;
			max = valueAxisMaxMin.left.max * vtp;
		} else if (yAxisIndex == 1 && axisConfig.right === axisType.VALUE) {
			vtp = vtpObject.right;
			min = valueAxisMaxMin.right.min * vtp;
			max = valueAxisMaxMin.right.max * vtp;
		}

		if (xAxisIndex == 0 && axisConfig.bottom === axisType.VALUE) {
			vtp = vtpObject.bottom;
			min = valueAxisMaxMin.bottom.min * vtp;
			max = valueAxisMaxMin.bottom.max * vtp;
		} else if (xAxisIndex == 1 && axisConfig.top === axisType.VALUE) {
			vtp = vtpObject.top;
			min = valueAxisMaxMin.top.min * vtp;
			max = valueAxisMaxMin.top.max * vtp;
		}


		context.save();
		var kArray = [];
		for (var i = begin; i < end; i++) {
			var serieData = serie.data[i];
			if (serieData == null) {
				return;
			} else {
				var flag = false;
				for (var k = 0; k < serieData.length; k++) {
					if (!serieData[k]) {
						flag = true;
						break;
					}
				}
				if (flag)
					continue;
			}


			var beginData = serieData[0] * vtp,
				endData = serieData[1] * vtp,
				dataMin = serieData[2] * vtp,
				dataMax = serieData[3] * vtp;


			if (beginData < endData) {
				serie.serieStyle.useStyle(context, true);
			} else {
				serie.serieStyle.useStyle(context, false);
			}

			var x = y = w = h = 0;
			context.beginPath();
			if (axisConfig.bottom === axisType.CATEGORY) {
				context.moveTo(
					(i + 0.5) * categorySegmentLength + touchOffset.current - this.parameters.grid.x * 0.5, (max - min) - (beginData < endData ? (dataMin - min) : (dataMax - min))
				);
				x = (i + 0.5) * categorySegmentLength + touchOffset.current - barWidth * 0.5 - this.parameters.grid.x * 0.5;
				y = max - dataMax;
				w = barWidth;
				h = dataMax - dataMin;
				if (beginData < endData) {
					context.lineTo((i + 0.5) * categorySegmentLength + touchOffset.current - this.parameters.grid.x * 0.5, (max - min) - (dataMin - min) - (dataMax - dataMin) * this.parameters.progress);
					context.rect(
						x, (max - min) - (beginData - min) - (endData - beginData) * this.parameters.progress,
						w,
						Math.abs(endData - beginData) * this.parameters.progress
					);


				} else {
					context.lineTo((i + 0.5) * categorySegmentLength + touchOffset.current - this.parameters.grid.x * 0.5, (max - min) - (dataMax - min) + (dataMax - dataMin) * this.parameters.progress);
					context.rect(
						x, (max - min) - (beginData - min),
						w,
						Math.abs(endData - beginData) * this.parameters.progress
					)
				}
			} else if (axisConfig.top === axisType.CATEGORY) {
				context.moveTo(
					(i + 0.5) * categorySegmentLength + touchOffset.current - this.parameters.grid.x * 0.5,
					beginData > endData ? dataMax - min + categoryOffset : dataMin - min + categoryOffset
				)

				if (beginData > endData) {
					context.lineTo(
						(i + 0.5) * categorySegmentLength + touchOffset.current - this.parameters.grid.x * 0.5,
						dataMax - min + categoryOffset - (dataMax - dataMin) * this.parameters.progress
					);
					context.rect(
						(i + 0.5) * categorySegmentLength + touchOffset.current - barWidth * 0.5 - this.parameters.grid.x * 0.5,
						beginData - min + categoryOffset - Math.abs(endData - beginData) * this.parameters.progress,
						barWidth,
						Math.abs(endData - beginData) * this.parameters.progress
					);
				} else {
					context.lineTo(
						(i + 0.5) * categorySegmentLength + touchOffset.current - this.parameters.grid.x * 0.5,
						dataMin - min + categoryOffset + (dataMax - dataMin) * this.parameters.progress
					);
					context.rect(
						(i + 0.5) * categorySegmentLength + touchOffset.current - barWidth * 0.5 - this.parameters.grid.x * 0.5,
						beginData - min + categoryOffset,
						barWidth,
						Math.abs(endData - beginData) * this.parameters.progress
					);
				}

				x = (i + 0.5) * categorySegmentLength + touchOffset.current - barWidth * 0.5 - this.parameters.grid.x * 0.5;
				y = dataMin - min + categoryOffset;
				w = barWidth;
				h = dataMax - dataMin;
			} else if (axisConfig.left === axisType.CATEGORY) {
				context.moveTo(
					(beginData > endData ? dataMax - min : dataMin - min) + categoryOffset, (i + 0.5) * categorySegmentLength + touchOffset.current
				)

				if (beginData > endData) {
					context.lineTo(
						dataMax - min + categoryOffset - (dataMax - dataMin) * this.parameters.progress, (i + 0.5) * categorySegmentLength + touchOffset.current
					);
					context.rect(
						beginData - min + categoryOffset - Math.abs(endData - beginData) * this.parameters.progress, (i + 0.5) * categorySegmentLength + touchOffset.current - barWidth * 0.5,
						Math.abs(endData - beginData) * this.parameters.progress,
						barWidth
					);
				} else {
					context.lineTo(
						dataMin - min + categoryOffset + (dataMax - dataMin) * this.parameters.progress, (i + 0.5) * categorySegmentLength + touchOffset.current
					);
					context.rect(
						beginData - min + categoryOffset, (i + 0.5) * categorySegmentLength + touchOffset.current - barWidth * 0.5,
						Math.abs(endData - beginData) * this.parameters.progress,
						barWidth
					);
				}

				x = dataMin - min + categoryOffset;
				y = (i + 0.5) * categorySegmentLength + touchOffset.current - barWidth * 0.5;
				w = dataMax - dataMin;
				h = barWidth;
			} else if (axisConfig.right === axisType.CATEGORY) {
				context.moveTo(
					visualArea.w - (beginData > endData ? dataMax - min : dataMin - min) - categoryOffset, (i + 0.5) * categorySegmentLength + touchOffset.current
				)

				if (beginData > endData) {
					context.lineTo(
						visualArea.w - (dataMax - min - (dataMax - dataMin) * this.parameters.progress + categoryOffset), (i + 0.5) * categorySegmentLength + touchOffset.current
					);
					context.rect(
						visualArea.w - categoryOffset - (beginData - min), (i + 0.5) * categorySegmentLength + touchOffset.current - barWidth * 0.5,
						Math.abs(endData - beginData) * this.parameters.progress,
						barWidth
					);
				} else {
					context.lineTo(
						visualArea.w - (dataMin - min + (dataMax - dataMin) * this.parameters.progress + categoryOffset), (i + 0.5) * categorySegmentLength + touchOffset.current
					);
					context.rect(
						visualArea.w - categoryOffset - (beginData - min + Math.abs(endData - beginData) * this.parameters.progress), (i + 0.5) * categorySegmentLength + touchOffset.current - barWidth * 0.5,
						Math.abs(endData - beginData) * this.parameters.progress,
						barWidth
					);
				}

				x = visualArea.w - categoryOffset - (dataMax - min);
				y = (i + 0.5) * categorySegmentLength + touchOffset.current - barWidth * 0.5;
				w = dataMax - dataMin;
				h = barWidth;
				// context.strokeRect(x, y, w, h);
			}

			context.stroke();
			context.fill();
			context.closePath();
			if (this.parameters.progress == 1) {
				kArray[i] = {
					x: x,
					y: y,
					w: w,
					h: h
				};
			}
		}
		context.restore();


		// 保存事件区域数组
		if (this.parameters.progress == 1) {
			for (var i = 0; i < categoryPageCapacity + 1; i++) {
				var k = kArray[middle + i];
				if (!k)
					break;

				if (axisConfig.left === axisType.VALUE || axisConfig.right === axisType.VALUE) {
					area.leaf[i].leaf[serieIndex] = {
						rect: {
							x: (i + 0.5) * categorySegmentLength - k.w * 0.5 + (ifloor(touchOffset.current) - visualArea.w) % categorySegmentLength + visualArea.x,
							y: k.y + visualArea.y,
							w: k.w,
							h: k.h
						},
						data: {
							serie: serie,
							index: middle + i
						},
						type: this.parameters.touchTargetType.SERIE
					};
				} else if (axisConfig.top === axisType.VALUE || axisConfig.bottom === axisType.VALUE) {
					area.leaf[i].leaf[serieIndex] = {
						rect: {
							x: k.x + visualArea.x,
							y: (i + 0.5) * categorySegmentLength - k.h * 0.5 + (ifloor(touchOffset.current) - visualArea.h) % categorySegmentLength + visualArea.y,
							w: k.w,
							h: k.h
						},
						data: {
							serie: serie,
							index: middle + i
						},
						type: this.parameters.touchTargetType.SERIE
					};
				}
				if (serie.click && typeof serie.click === 'function')
					area.leaf[i].leaf[serieIndex].click = serie.click;
			}
		}

	};


	/*
		箭头（判断存在是否滑动）
	*/
	var ArrowLogo = function(parameters) {
		this.parameters = parameters;
		this.width = 3;
		this.angle = 6;
		this.gravity = 1.6;
		// 箭头的中心点（尖角中点）
		this.offset = 1;
		// 箭头的绘制区域  前进和后退
		this.area = {
			back: {},
			forward: {}
		};
		this.globalAlpha = 0.3;
	};
	ArrowLogo.prototype.drawBackdArrow = function(canvas) {
		var context = canvas.getContext("2d");
		var orientation = this.parameters.orientation;
		var visualArea = this.parameters.visualArea;
		var categoryOffset = this.parameters.categoryOffset;
		var centerPoint = null;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var symbol = 1;
		if (axisConfig.bottom === axisType.CATEGORY) {
			symbol = -1;
		} else if (axisConfig.top === axisType.CATEGORY) {
			symbol = 1;
		} else if (axisConfig.left === axisType.CATEGORY) {
			symbol = -1;
		} else if (axisConfig.right === axisType.CATEGORY) {
			symbol = 1;
		}

		context.save();
		context.strokeStyle = invert(this.parameters.backgroundColor, this.globalAlpha);
		context.fillStyle = invert(this.parameters.backgroundColor, this.globalAlpha);
		for (var i = 1; i < arguments.length; i++) {
			if (arguments[i] == orientation.L) {
				centerPoint = {
					x: this.offset,
					y: (visualArea.h + categoryOffset * symbol) * 0.5
				};

				this.area.back = {
					x: centerPoint.x,
					y: centerPoint.y - this.angle * this.gravity,
					w: centerPoint.x + this.angle + this.width,
					h: this.angle * this.gravity * 2
				};
				this.clear(canvas, this.area.back);

				context.beginPath();
				context.moveTo(centerPoint.x, centerPoint.y);
				context.lineTo(centerPoint.x + this.angle, centerPoint.y - this.angle * this.gravity);
				context.lineTo(centerPoint.x + this.angle + this.width, centerPoint.y - this.angle * this.gravity);
				context.lineTo(centerPoint.x + this.width, centerPoint.y);
				context.lineTo(centerPoint.x + this.angle + this.width, centerPoint.y + this.angle * this.gravity);
				context.lineTo(centerPoint.x + this.angle, centerPoint.y + this.angle * this.gravity);
				context.closePath();
				context.fill();
			} else if (arguments[i] == orientation.T) {
				centerPoint = {
					x: (visualArea.w + categoryOffset * symbol) * 0.5,
					y: this.offset
				};
				this.area.back = {
					x: centerPoint.x - this.angle * this.gravity,
					y: centerPoint.y,
					w: this.angle * this.gravity * 2,
					h: centerPoint.y + this.angle + this.width,
				};

				context.beginPath();
				context.moveTo(centerPoint.x, centerPoint.y);
				context.lineTo(centerPoint.x + this.angle * this.gravity, centerPoint.y + this.angle);
				context.lineTo(centerPoint.x + this.angle * this.gravity, centerPoint.y + this.angle + this.width);
				context.lineTo(centerPoint.x, centerPoint.y + this.width);
				context.lineTo(centerPoint.x - this.angle * this.gravity, centerPoint.y + this.width + this.angle);
				context.lineTo(centerPoint.x - this.angle * this.gravity, centerPoint.y + this.angle);
				context.closePath();
				context.fill();
				// context.strokeRect(this.area.back.x,this.area.back.y,this.area.back.w,this.area.back.h);
			}
		}
		context.restore();
	};
	ArrowLogo.prototype.drawForwardArrow = function(canvas) {
		var context = canvas.getContext("2d");
		var orientation = this.parameters.orientation;
		var visualArea = this.parameters.visualArea;
		var categoryOffset = this.parameters.categoryOffset;
		var centerPoint = null;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var symbol = 1;
		if (axisConfig.bottom === axisType.CATEGORY) {
			symbol = -1;
		} else if (axisConfig.top === axisType.CATEGORY) {
			symbol = 1;
		} else if (axisConfig.left === axisType.CATEGORY) {
			symbol = -1;
		} else if (axisConfig.right === axisType.CATEGORY) {
			symbol = 1;
		}

		context.save();
		context.strokeStyle = invert(this.parameters.backgroundColor, this.globalAlpha);
		context.fillStyle = invert(this.parameters.backgroundColor, this.globalAlpha);
		for (var i = 1; i < arguments.length; i++) {
			if (arguments[i] == orientation.R) {
				centerPoint = {
					x: canvas.offsetWidth - this.offset,
					y: (visualArea.h + categoryOffset * symbol) * 0.5
				};
				this.area.forward = {
					x: centerPoint.x - this.angle - this.width,
					y: centerPoint.y - this.angle * this.gravity,
					w: centerPoint.x + this.angle + this.width,
					h: this.angle * this.gravity * 2
				};
				this.clear(canvas, this.area.forward);

				context.beginPath();
				context.moveTo(centerPoint.x, centerPoint.y);
				context.lineTo(centerPoint.x - this.angle, centerPoint.y - this.angle * this.gravity);
				context.lineTo(centerPoint.x - this.angle - this.width, centerPoint.y - this.angle * this.gravity);
				context.lineTo(centerPoint.x - this.width, centerPoint.y);
				context.lineTo(centerPoint.x - this.angle - this.width, centerPoint.y + this.angle * this.gravity);
				context.lineTo(centerPoint.x - this.angle, centerPoint.y + this.angle * this.gravity);
				context.closePath();
				context.fill();
				// context.strokeRect(this.area.right.x,this.area.right.y,this.area.right.w,this.area.right.h);
			} else if (arguments[i] == orientation.B) {
				centerPoint = {
					x: (visualArea.w + categoryOffset * symbol) * 0.5,
					y: canvas.offsetHeight - this.offset
				};
				this.area.forward = {
					x: centerPoint.x - this.angle - this.width,
					y: centerPoint.y - this.angle * this.gravity,
					w: centerPoint.x + this.angle + this.width,
					h: this.angle * this.gravity * 2
				};
				this.clear(canvas, this.area.forward);

				context.beginPath();
				context.moveTo(centerPoint.x, centerPoint.y);
				context.lineTo(centerPoint.x + this.angle * this.gravity, centerPoint.y - this.angle);
				context.lineTo(centerPoint.x + this.angle * this.gravity, centerPoint.y - this.angle - this.width);
				context.lineTo(centerPoint.x, centerPoint.y - this.width);
				context.lineTo(centerPoint.x - this.angle * this.gravity, centerPoint.y - this.angle - this.width);
				context.lineTo(centerPoint.x - this.angle * this.gravity, centerPoint.y - this.angle);
				context.closePath();
				context.fill();
			}
		}
		context.restore();
	};
	ArrowLogo.prototype.clear = function(canvas, rect) {
		if (!rect)
			return;

		var context = canvas.getContext("2d");
		context.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
		// context.fillRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
	};
	ArrowLogo.prototype.hide = function(element) {
		element.style.display = "none";
	};
	ArrowLogo.prototype.show = function(element) {
		element.style.display = "block";
	};


	/*
		标题
	*/
	var Title = function(option, parameters) {
		this.defaultStyle = {
			style: {
				color: "rgba(0,138,205,1)"
			},
			subStyle: {
				color: "rgba(0,138,205,1)"
			}
		};
		option = util.extend(true, this.defaultStyle, option);
		this.option = option;
		this.parameters = parameters;
		this.fontStyleObject = new FontStyle(option.style);
		this.subFontStyleObject = new FontStyle(option.subStyle);
		this.rect = null;
	};
	Title.prototype.drawTitle = function(canvas) {
		this.rect && this.clear(canvas, this.rect);
		var x = 8;
		var y = 9;
		var h = 16;
		var context = canvas.getContext("2d");
		context.save();
		context.textAlign = 'left';
		context.textBaseline = 'top';
		this.fontStyleObject && this.fontStyleObject.useStyle(context);
		var w = context.measureText(this.option.text).width;
		context.fillText(this.option.text || "", x, y);
		context.restore();

		context.save();
		context.textAlign = 'left';
		context.textBaseline = 'top';
		this.subFontStyleObject && this.subFontStyleObject.useStyle(context);
		context.fillText(this.option.subText || "", x, y + h);
		context.restore();

		this.rect = {
			x: x,
			y: y,
			w: w,
			h: h * 2
		};
	};
	Title.prototype.clear = function(canvas, rect) {
		rect = rect || {
			x: 0,
			y: 0,
			w: canvas.offsetWidth,
			h: canvas.offsetHeight
		};
		var context = canvas.getContext("2d");
		context.clearRect(rect.x, rect.y, rect.w, rect.h);
		context.fillStyle = this.parameters.backgroundColor;
		context.fillRect(rect.x, rect.y, rect.w, rect.h);
	}


	/*
		图例
	*/
	var Legend = function(option, series, parameters) {
		this.option = option;
		this.series = series;
		this.parameters = parameters;
		this.isFirstDraw = true;
		this.legendWidth = null;
		this.lineWidth = 3;
		this.legendWidthPercent = parameters.legendWidthPercent;
		this.icon = {
			width: 18,
			height: 9,
			top: 3,
			marginRight: 8,
			marginLeft: 1,
			marginTop: 6,
			marginBottom: 3
		};
		if (this.option.style)
			this.fontStyle = new FontStyle(this.option.style);
		else
			this.fontStyle = new FontStyle({
				color: "black"
			});

		// 保存legend的位置信息
		//		this.TYPE = parameters.touchTargetType.LEGENDS;
		this.area = {
			rect: {},
			leaf: [],
			type: parameters.touchTargetType.LEGENDS
		};
		this.isFirstDraw = true;
	};
	Legend.prototype.drawLegend = function(canvas) {
		var context = canvas.getContext("2d");
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		if (this.option.show == false)
			return;

		this.clear(canvas, this.area.rect);
		if (this.isFirstDraw) {
			this.area = {
				rect: {},
				leaf: [],
				type: this.parameters.touchTargetType.LEGENDS
			};
		}

		//		context.strokeRect(this.area.x,this.area.y,this.area.w,this.area.h);


		/*
			计算每一行有几个图例，每一行占用宽度
			[[num,width],[]]
		*/

		var legendWidth = this.parameters.rootElementWH.w * this.legendWidthPercent;
		var count = 0;
		var countLength = 0;
		var countArray = [];


		var seriesArray = [];
		for (var i = 0; i < this.series.option.length; i++) {
			var serie = this.series.option[i];
			var yAxisIndex = serie.yAxisIndex || 0;
			var xAxisIndex = serie.xAxisIndex == undefined ? 1 : serie.xAxisIndex;
			if (yAxisIndex === 0 && axisConfig.left === axisType.VALUE || yAxisIndex === 1 && axisConfig.right === axisType.VALUE) {
				seriesArray.push(serie);
			}
			if (xAxisIndex === 0 && axisConfig.bottom === axisType.VALUE || xAxisIndex === 1 && axisConfig.top === axisType.VALUE) {
				seriesArray.push(serie);
			}
		}
		for (var i = 0; i < seriesArray.length; i++) {
			count++;
			var textWidth = this.icon.marginLeft + context.measureText(seriesArray[i].name).width + this.icon.marginRight;
			var picWidth = this.icon.marginLeft + this.icon.width + this.icon.marginRight;
			var currentWidth = picWidth + textWidth;
			countLength += currentWidth;

			// 当当前行长度大于指定长度时
			if (countLength > legendWidth) {
				countArray.push([count - 1, countLength - currentWidth]);
				countLength = currentWidth;
				count = 1;
			}
			if (i == seriesArray.length - 1) {
				countArray.push([count, countLength]);
			}
		}


		if (!this.option.align || this.option.align === "center")
			this.drawLegendInCenter(context, countArray, seriesArray);
		else // if (this.option.align === "right")
			this.drawLegendInRight(context, countArray, seriesArray);

		// context.strokeRect(this.area.rect.x, this.area.rect.y, this.area.rect.w, this.area.rect.h);
		this.isFirstDraw = false;
	};
	Legend.prototype.drawLegendInCenter = function(context, countArray, seriesArray) {

		var position = this.option.align || "center";
		var rootElementWH = this.parameters.rootElementWH;
		var legendWidth = rootElementWH.w * this.legendWidthPercent;
		context.save();
		var j = 0;
		for (var i = 0; i < countArray.length; i++) {
			var sumLength = 0; // 图例总长度
			var currentLineWidth = countArray[i][1]; // 每一行所占的宽度
			var cnt = countArray[i][0] + j;

			var picWidth = this.icon.marginLeft + this.icon.width + this.icon.marginRight;
			var picHeight = this.icon.marginTop + this.icon.height + this.icon.marginBottom;

			var x = 0;
			var y = this.icon.top + this.icon.marginTop + picHeight * i;

			for (j; j < cnt; j++) {
				var serie = this.series.option[j];
				var name = serie.name;
				var type = serie.type;
				var textWidth = this.icon.marginLeft + context.measureText(name).width + this.icon.marginRight;
				var currentWidth = picWidth + textWidth;
				sumLength += currentWidth;
				x = ((rootElementWH.w - currentLineWidth) >> 1) + (sumLength - currentWidth);

				if (serie.show) {
					// TODO
					serie.serieStyle.useStyle(context);
				} else {
					context.fillStyle = "gray";
					context.strokeStyle = "gray";
					textColor = "gray";
				}
				context.textAlign = "left";
				context.textBaseline = "middle";
				if (type == "line") {
					context.beginPath();
					context.moveTo(x, y + this.icon.height * 0.5);
					context.lineTo(x + this.icon.width, y + this.icon.height * 0.5);
					context.lineWidth = this.lineWidth;
					context.stroke();
					context.closePath();
					this.fontStyle.useStyle(context);
					context.fillText(name, x + picWidth + this.icon.marginLeft, y + this.icon.height * 0.5, textWidth);
				} else if (type == "bar") {
					context.fillRect(x, y, this.icon.width, this.icon.height);
					this.fontStyle.useStyle(context);
					context.fillText(name, x + picWidth + this.icon.marginLeft, y + this.icon.height * 0.5, textWidth);
				} else if (type == "k") {

				}
				if (this.isFirstDraw) {
					var object = {};
					object.rect = {
						x: x,
						y: y,
						w: picWidth + this.icon.marginLeft + textWidth,
						h: picHeight
					};
					object.data = serie;
					object.type = this.parameters.touchTargetType.LEGEND;
					this.area.leaf.push(object);
				}
			}

			if (this.isFirstDraw) {
				if (i == 0)
					this.area.rect.y = y - this.icon.marginTop;
			}
		}

		if (this.isFirstDraw) {
			this.area.rect.h = picHeight * countArray.length;
			this.area.rect = {
				x: (rootElementWH.w - legendWidth) / 2,
				w: legendWidth
			};
		}
		context.restore();
	};
	Legend.prototype.drawLegendInRight = function(context, countArray, seriesArray) {
		var position = this.option.align || "center";
		var rootElementWH = this.parameters.rootElementWH;
		var legendWidth = rootElementWH.w * this.legendWidthPercent;
		var j = 0;
		var picWidth = this.icon.marginLeft + this.icon.width + this.icon.marginRight;
		var picHeight = this.icon.marginTop + this.icon.height + this.icon.marginBottom;
		context.save();
		for (var i = 0; i < countArray.length; i++) {
			var sumLength = 0; // 图例总长度
			var currentLineWidth = countArray[i][1]; // 每一行所占的宽度
			var cnt = countArray[i][0] + j;

			var x = 0;
			var y = this.icon.top + this.icon.marginTop + picHeight * i;

			for (j; j < cnt; j++) {
				var serie = seriesArray[j];
				var name = serie.name;
				var type = serie.type;
				this.fontStyle.useStyle(context);
				var textWidth = this.icon.marginLeft + context.measureText(name).width + this.icon.marginRight;
				var currentWidth = picWidth + textWidth;
				sumLength += currentWidth;
				x = rootElementWH.w - sumLength;

				if (serie.show) {
					serie.serieStyle.useStyle(context, true);
				} else {
					context.fillStyle = "gray";
					context.strokeStyle = "gray";
					textColor = "gray";
				}
				context.textAlign = "left";
				context.textBaseline = "middle";
				if (type == "line") {
					context.beginPath();
					context.moveTo(x, y + this.icon.height * 0.5);
					context.lineTo(x + this.icon.width, y + this.icon.height * 0.5);
					context.lineWidth = this.lineWidth;
					context.stroke();
					context.closePath();
					context.lineWidth = 2;
					context.fillStyle = context.strokeStyle;
					context.arc(x + this.icon.width / 2, y + this.icon.height * 0.5, 3, 0, Math.PI * 2, false);
					context.fill();
					this.fontStyle.useStyle(context);
					context.fillText(name, x + picWidth + this.icon.marginLeft, y + this.icon.height * 0.5, textWidth);
				} else if (type == "bar") {
					context.fillRoundRect(x, y, this.icon.width, this.icon.height, 1);
					this.fontStyle.useStyle(context);
					context.fillText(name, x + picWidth + this.icon.marginLeft, y + this.icon.height * 0.5, textWidth);
				} else if (type == "k") {
					context.fillRoundRect(x, y, this.icon.width, this.icon.height, 1);
					context.moveTo(x + this.icon.width * 0.5, y + this.icon.height);
					context.lineTo(x + this.icon.width * 0.5, y + this.icon.height + 6);
					context.stroke();
					this.fontStyle.useStyle(context);
					context.fillText(name, x + picWidth + this.icon.marginLeft, y + this.icon.height * 0.5, textWidth);
				}

				if (this.isFirstDraw) {
					var object = {};
					object.rect = {
						x: x,
						y: y - this.icon.marginTop,
						w: picWidth + this.icon.marginLeft + textWidth,
						h: picHeight
					};
					object.data = serie;
					object.type = this.parameters.touchTargetType.LEGEND;
					// context.strokeRect(object.rect.x, object.rect.y, object.rect.w, object.rect.h)
					this.area.leaf.push(object);
				}
			}
			if (this.isFirstDraw) {
				if (i == 0)
					this.area.rect.y = y - this.icon.marginTop;
			}
		}

		if (this.isFirstDraw) {
			this.area.rect.x = rootElementWH.w - legendWidth;
			this.area.rect.w = legendWidth;
			this.area.rect.h = picHeight * countArray.length;
		}
		context.restore();
	};
	Legend.prototype.clear = function(canvas, rect) {
		var context = canvas.getContext("2d");
		context.fillStyle = this.parameters.backgroundColor;
		if (!rect) {
			context.clearRect(0, 0, this.parameters.middleCanvasWH.w, this.parameters.middleCanvasWH.h);
			context.fillRect(0, 0, this.parameters.middleCanvasWH.w, this.parameters.middleCanvasWH.h);
		} else {
			context.clearRect(rect.x, rect.y, rect.w - 2, rect.h);
			context.fillRect(rect.x, rect.y, rect.w - 2, rect.h);
		}
	}


	/*
		布局
	*/
	var Grid = function(option, parameters) {
		this.parameters = parameters;
		this.option = option;
		if (!util.isEmpty(option.style))
			this.lineStyle = new LineStyle(option.style);
		else
			this.lineStyle = new LineStyle({
				color: "rgba(220,220,220,1)"
			});
	};
	Grid.prototype.drawGrid = function(canvas) {
		if (this.option.show == false)
			return;

		var context = canvas.getContext("2d");
		var visualArea = this.parameters.visualArea;
		var rootElementWH = this.parameters.rootElementWH;
		var grid = this.parameters.grid;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var categoryOffset = this.parameters.categoryOffset;
		context.save();
		this.lineStyle && this.lineStyle.useStyle(context);
		if (axisConfig.bottom === axisType.CATEGORY) {
			context.strokeRect(
				grid.x,
				grid.y,
				rootElementWH.w - grid.x - grid.x2,
				visualArea.h - categoryOffset
			);
		} else if (axisConfig.top === axisType.CATEGORY) {
			context.strokeRect(
				visualArea.x - 1,
				visualArea.y + categoryOffset,
				visualArea.w,
				visualArea.h - categoryOffset
			)
		} else if (axisConfig.left === axisType.CATEGORY) {
			context.strokeRect(
				visualArea.x + categoryOffset,
				visualArea.y,
				visualArea.w - categoryOffset + 1,
				visualArea.h
			)
		} else if (axisConfig.right === axisType.CATEGORY) {
			context.strokeRect(
				visualArea.x,
				visualArea.y,
				visualArea.w - categoryOffset + 1,
				visualArea.h
			)
		}
		context.restore();
	};


	/*
		图例
	*/
	var Tip = function(option, element, parameters) {
		this.option = option;
		this.element = element;
		this.parameters = parameters;
		// 判断当前div是否显示
		this.show = false;
	};
	Tip.prototype.showTip = function(object, point) {
		if (!this.show) {
			this.element.style.display = "block";
		}
		this.element.innerHTML = object;

		var top = point.y + 10;
		var left = point.x + 10;
		var clientWidth = this.element.clientWidth;
		var clientHeight = this.element.clientHeight;
		var grid = this.parameters.grid;
		var visualArea = this.parameters.visualArea;
		var categoryOffset = this.parameters.categoryOffset;

		if (left + clientWidth > grid.x + visualArea.w) {
			left = grid.x + visualArea.w - clientWidth;
		}
		if (top + clientHeight > grid.y + visualArea.h - categoryOffset) {
			top = grid.y + visualArea.h - categoryOffset - clientHeight;
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
		公用数据
	*/
	var Parameters = function() {
		// 动画进度（0~1）
		this.progress = 1;

		// 用户配置的页数 默认为1
		this.page = null;

		// 图表背景
		this.backgroundColor = "rgba(255,255,255,1)";

		// 通过数据计算得到实际页数
		this.realPage = 1;

		// 根容器的宽高
		this.rootElementWH = {
			w: 0,
			h: 0
		};

		// 保存轴类型
		this.axisConfig = {
			left: "",
			right: "",
			bottom: "",
			top: ""
		};

		// 轴类型常量
		this.axisType = {
			VALUE: 0,
			CATEGORY: 1
		};

		// 保存grid的配置 便于别的地方使用
		this.grid = {
			x: 0,
			y: 0,
			x2: 0,
			y2: 0
		};

		// 每个值轴的最大值最小值{max:0,min:0}
		this.valueAxisMaxMin = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		};

		// value to pixel 像素和值的转换
		this.vtp = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		};

		// 逻辑轴显示的点数
		// this.categoryConfig = {pageCapacity:0,segmentLength:0:dataLength:0};
		this.categoryPageCapacity = 0;

		// 逻辑轴的段长
		this.categorySegmentLength = 0;

		// 逻辑轴数据长度
		this.categoryDataLength = 0;

		// 值轴显示的点数 默认6
		this.valuePageCapacity = 3;

		// 偏移量 最小值，当前值，最大值
		this.touchOffset = {
			min: 0,
			current: 0,
			max: 0
		};
		// 图形偏移量
		this.scrollOffset = 0;

		// 保存绘制坐标轴区域的canvas的大小
		this.middleCanvasWH = {
			w: 0,
			h: 0
		};

		// 坐标轴段点的长度 默认设为2
		this.ruleLength = 6;

		/*
			默认设置逻辑轴坐标轴偏移28像素，
			因为初始化画布大小与容器大小一样，为了把逻辑轴显示出来，需要偏移一定的像素
		*/
		this.categoryOffset = 60;

		// 一段逻辑段中bar的个数
		this.barCountInSection = 0;

		//定位bar的宽度是bar之间间隙宽度的3倍
		this.riftInBarWidth = 3;

		// legend占用canvas宽度的百分比
		this.legendWidthPercent = 0.9;

		// series的点击事件 根据逻辑轴配置的click属性
		this.seriesClick = null;

		// 事件类型
		this.touchType = {
			CLICK: 0,
			SCROLL: 1,
			CANCEL: 2
		};

		// 触发事件的对象
		this.touchTargetType = {
			LEGENDS: "legends",
			LEGEND: "legend",
			SERIES: "series",
			SERIE: "serie"
		};

		// 方向
		this.orientation = {
			L: 1,
			R: 2,
			T: 3,
			B: 4
		};
		this.valueAxisFormatter = "{value}";

		// 运行平台
		this.runPlatform = "mobile";

	};
	/*
		绘制图形的时候起点和终点的区间(遍历范围)
	*/
	Parameters.prototype.traversalRange = function() {
		if (this.axisConfig.bottom === this.axisType.CATEGORY || this.axisConfig.top === this.axisType.CATEGORY)
			var middle = Math.floor((Math.abs(this.touchOffset.current - this.visualArea.w) / this.categorySegmentLength));
		else if (this.axisConfig.left === this.axisType.CATEGORY || this.axisConfig.right === this.axisType.CATEGORY)
			var middle = Math.floor((Math.abs(this.touchOffset.current - this.visualArea.h) / this.categorySegmentLength));
		var begin = middle - this.categoryPageCapacity - 1;
		var end = middle + this.categoryPageCapacity * 2 + 1;

		if (begin < 0)
			begin = 0;
		if (end > this.categoryDataLength)
			end = this.categoryDataLength;

		return {
			begin: begin,
			end: end,
			middle: middle
		};
	};


	/*
		线条样式
	*/
	var LineStyle = function(style) {
		this.defaultStyle = {
			color: getStrokeColorByIndex(globalIndex++),
			width: 1,
			type: "solid", // dotted
			cap: "butt"
		};
		this.style = util.extend(true, {}, this.defaultStyle, style);
		if (!util.isEmpty(this.style.shadowStyle))
			this.shadowStyle = new ShadowStyle(this.style.shadowStyle);
	};
	LineStyle.prototype.useStyle = function(context) {
		context.strokeStyle = this.style.color;
		context.lineWidth = this.style.width;
		context.lineCap = this.style.cap;
		this.shadowStyle && this.shadowStyle.useStyle(context);
	};


	/*
		字体样式
	*/
	var FontStyle = function(style) {
		this.defaultStyle = {
			color: "black",
			font: "normal 12px arial"
		};
		this.style = util.extend(true, {}, this.defaultStyle, style);
	};
	FontStyle.prototype.useStyle = function(context) {
		context.font = this.style.font;
		context.fillStyle = this.style.color;
	};


	/*
		形状样式
	*/
	var ShapeStyle = function(style) {
		this.lineStyle = null;
		this.shadowStyle = null;
		this.type = "rect";
		this.defaultStyle = {
			color: getStrokeColorByIndex(globalIndex++),
			lineStyle: {},
			shadowStyle: {}
		};
		this.style = util.extend(true, {}, this.defaultStyle, style);
		if (!util.isEmpty(this.style.lineStyle))
			this.lineStyle = new LineStyle(this.style.lineStyle);
		if (!util.isEmpty(this.style.shadowStyle))
			this.shadowStyle = ShadowStyle(this.style.shadowStyle);
	};
	ShapeStyle.prototype.useStyle = function(context) {
		context.fillStyle = this.style.color;
		this.lineStyle && this.lineStyle.useStyle(context);
		this.shadowStyle && this.shadowStyle.useStyle(context);
	};


	/*
		阴影样式
	*/
	var ShadowStyle = function(style) {
		this.defaultStyle = {
			x: 0,
			y: 0,
			color: "black",
			blur: 2
		};
		this.style = util.extend(true, {}, this.defaultStyle, style);
	};
	ShadowStyle.prototype.useStyle = function(context) {
		context.shadowBlur = this.style.blur;
		context.shadowColor = this.style.color;
		context.shadowOffsetX = this.style.x;
		context.shadowOffsetY = this.style.y;
	};


	/*
		轴样式
	*/
	var AxisStyle = function(style) {
		this.defaultStyle = {
			lineStyle: {
				width: 1,
				color: "rgba(0,138,205,1)"
			},
			fontStyle: {

			},
			shadowStyle: {

			}
		};
		this.style = util.extend(true, {}, this.defaultStyle, style);
		if (this.style.lineStyle)
			this.lineStyle = new LineStyle(this.style.lineStyle);
		if (this.style.fontStyle)
			this.fontStyle = new FontStyle(this.style.fontStyle);
		if (!util.isEmpty(this.style.shadowStyle))
			this.shadowStyle = new ShadowStyle(this.style.shadowStyle);
	};
	AxisStyle.prototype.useStyle = function(context) {
		this.lineStyle && this.lineStyle.useStyle(context);
		this.fontStyle && this.fontStyle.useStyle(context);
		this.shadowStyle && this.shadowStyle.useStyle(context);
	};


	/*
		k线图样式
	*/
	var KStyle = function(style) {
		this.defaultStyle = {
			normal: {
				color: 'rgba(216,122,128,1)',
				color0: 'rgba(46,199,201,1)',
				lineStyle: {
					width: 2,
					color: 'rgba(216,122,128,1)',
					color0: 'rgba(46,199,201,1)'
				}
			}
		};
		this.style = util.extend(true, {}, this.defaultStyle, style);
		this.fillColor = this.style.normal.color;
		this.fillColor0 = this.style.normal.color0;
		this.strokeColor = this.style.normal.lineStyle.color;
		this.strokeColor0 = this.style.normal.lineStyle.color0;
		this.lineWidth = this.style.normal.lineStyle.width;
	}
	KStyle.prototype.useStyle = function(context, isIncrease) {
		context.lineWidth = this.lineWidth;
		if (isIncrease) {
			context.fillStyle = this.fillColor;
			context.strokeStyle = this.strokeColor;
		} else {
			context.fillStyle = this.fillColor0;
			context.strokeStyle = this.strokeColor0;
		}
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
		this.clickItems = {
			"legends": {
				"rect": {},
				"leaf": []
			},
			"series": {
				"rect": {},
				"leaf": []
			}
		};
	};
	/*
		注册事件函数，用来添加需要被加入事件的元素
	*/
	Touch.prototype.registEvent = function(key, object) {
		this.clickItems[key] = object;
	};
	Touch.prototype.trigger = function(callback, endCall) {
		var _this = this;
		// 开始点的坐标
		var startPoint = {};
		var currentPoint = {};
		// 开始时间毫秒
		var startTime = 0;
		// 结束时间毫秒
		var endTime = 0;
		var range = 0;
		// 判断是否为点击
		var isClick = true;


		function getXY(obj) {
			var parObj = obj;
			var left = obj.offsetLeft;
			var top = obj.offsetTop;
			while (parObj = parObj.offsetParent) {
				top += parObj.offsetTop;
				left += parObj.offsetLeft;
			}
			return {
				x: left,
				y: top
			};
		}

		function getPoint(e) {
			var point = {
				x: 0,
				y: 0
			};
			point = getXY(_this.element);

			if (e.touches) {
				point = {
					x: e.touches[0].pageX - point.x,
					y: e.touches[0].pageY - point.y
				};
			} else {
				point = {
					x: e.pageX - point.x,
					y: e.pageY - point.y
				};
			}
			return point;
		}



		this.touchBegin = function(e) {
			var point = getPoint(e);
			startPoint = point;
			currentPoint = point;
			isClick = true;
		};

		this.touchMove = function(e) {
			var point = getPoint(e);

			// 如果滑动区域超过指定区域则不响应;
			if (!_this.isPointInRect(point, _this.clickItems.series.rect)) {
				_this.element.onmouseup();
				return;
			}

			// 在允许滑动的情况下
			if (_this.enforceScroll) {
				var axisConfig = _this.parameters.axisConfig;
				var axisType = _this.parameters.axisType;
				if (axisConfig.top === axisType.CATEGORY || axisConfig.bottom === axisType.CATEGORY) {
					if (Math.abs(currentPoint.x - startPoint.x) > Math.abs(currentPoint.y - startPoint.y) && Math.abs(currentPoint.x - startPoint.x) > range) {
						e.preventDefault();
						//						document.querySelector('.console').innerHTML = Date.now();
						isClick = false;
						callback && callback(_this.touchType.SCROLL, {
							x: point.x - currentPoint.x,
							y: point.y - currentPoint.y
						});
					}

				} else {
					if (Math.abs(currentPoint.y - startPoint.y) > Math.abs(currentPoint.x - startPoint.x) && Math.abs(currentPoint.y - startPoint.y) > range) {
						e.preventDefault();
						isClick = false;
						callback && callback(_this.touchType.SCROLL, {
							x: point.x - currentPoint.x,
							y: point.y - currentPoint.y
						});
					}
				}
			}

			currentPoint = point;
		};

		this.touchEnd = function(e) {
			currentPoint = {};
			if (isClick) {
				/*
					递归点击函数
				*/
				function clickFunc(point, obj) {
					// 当点击区域在最里面的叶子
					//					console.log(obj);
					if (!obj.leaf || obj.leaf.length == 0) {
						endCall && endCall(_this.touchType.CLICK, obj, point);
						return;
					}

					for (var i = 0; i < obj.leaf.length; i++) {
						var item = obj.leaf[i];
						if (!item.rect)
							continue;
						if (_this.isPointInRect(point, item.rect)) {
							clickFunc(point, item);
							return;
						}
					}

					endCall && endCall(_this.touchType.CLICK, obj, point);
				}

				for (var key in _this.clickItems) {
					var item = _this.clickItems[key];
					if (_this.isPointInRect(startPoint, item.rect)) {
						clickFunc(startPoint, item);
						return;
					}
				}
			} else { //滑动结束回调方法
				endCall && endCall(_this.touchType.SCROLL, null, startPoint);
			}
			startPoint = {};
		};

		this.removeEvent();
		if (window.navigator.platform.indexOf("Win") != -1 || window.navigator.platform.indexOf("Mac") != -1) {
			this.bindMouse(this.element, this.touchBegin, this.touchMove, this.touchEnd);
		} else {
			this.bindTouch(this.element, this.touchBegin, this.touchMove, this.touchEnd);
		}
	};
	Touch.prototype.removeEvent = function() {
		this.element.removeEventListener('mousedown', this.touchBegin, false);
		this.element.removeEventListener('mouseup', this.touchEnd, false);
		this.element.removeEventListener('touchstart', this.touchBegin, false);
		this.element.removeEventListener('touchend', this.touchEnd, false);
	};
	/*
		判断一个点是否在一个标签的范围之内
	*/
	Touch.prototype.isPointInElement = function(point, element) {
		var x = element.offsetLeft;
		var y = element.offsetTop;
		var w = element.clientWidth;
		var h = element.clientHeight;

		if (point.x > x && point.x < x + w && point.y > y && point.y < y + h)
			return true;
		return false;
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
	/*
		移动端滑动事件
	*/
	Touch.prototype.bindTouch = function(element, startCb, moveCb, endCb) {
		element.addEventListener("touchstart", function(e) {
			startCb(e);
			this.addEventListener("touchmove", function(e) {
				moveCb(e);
			}, false);
		}, false);
		element.addEventListener("touchend", function(e) {
			endCb(e);
			this.removeEventListener("touchmove", moveCb, false);
		}, false);


		//		element.addEventListener("touchstart", startCb, false);
		//		element.addEventListener("touchmove", moveCb, false);
		//		element.addEventListener("touchend", endCb, false);


	};
	/*
		web端滑动事件
	*/
	Touch.prototype.bindMouse = function(element, startCb, moveCb, endCb) {
		element.addEventListener("mousedown", function(e) {
			startCb(e);
			this.addEventListener("mousemove", moveCb, false);
		}, false);
		// element.addEventListener("mouseup", function(e) {
		// 	endCb(e);
		// 	this.removeEventListener("mousemove", moveCb, false);
		// }, false);
		element.onmouseup = function(e) {
			endCb(e);
			this.removeEventListener("mousemove", moveCb, false);
		};
	};



	// /*
	// 	时间补间动画 (原来没有问题的匀速动画)
	// */
	// var Tween = function() {
	// 	this.animateBegin = null;
	// 	this.animateStep = null;
	// 	this.animateEnd = null;
	// 	this.udata = null;
	// 	this.startTime = null;
	// 	// this.frame = null;
	// 	// 动画执行多久结束 timeout = 0的时候是无线调用
	// 	this.timeout = 1000;
	// 	// 是否需要停止循环执行操作
	// 	this.needTerminate = false;
	// 	// 动画指针（代表当前的动画，用于停止动画）
	// 	this.handle = null;
	// 	// this.repeat = null;
	// };
	// Tween.prototype.start = function(beginCall, stepCall, endCall, data) {
	// 	this.needTerminate = false;
	// 	this.animateBegin = beginCall;
	// 	this.animateStep = stepCall;
	// 	this.animateEnd = endCall;
	// 	this.udata = data;
	// 	this.startTime = new Date().getTime();
	// 	this.animateBegin && this.animateBegin(this.udata);
	// 	this.handle = requestAnimationFrame(this.step.bind(this));
	// };
	// Tween.prototype.stop = function() {
	// 	if (this.handle)
	// 		cancelAnimationFrame(this.handle);
	// 	this.handle = null;
	// 	this.needTerminate = true;
	// };
	// Tween.prototype.step = function(dt) {
	// 	if (this.timeout == 0) { // 无限循环
	// 		if (this.needTerminate == false) {
	// 			this.animateStep && this.animateStep(0, this.udata);
	// 			this.handle = requestAnimationFrame(this.step.bind(this));
	// 		}
	// 	} else {
	// 		var now = new Date().getTime();
	// 		if (now - this.startTime > this.timeout) {
	// 			this.animateStep && this.animateStep(1, this.udata);
	// 			this.animateEnd && this.animateEnd(this.udata);
	// 		} else {
	// 			if (this.needTerminate == false) {
	// 				this.animateStep && this.animateStep((now - this.startTime) / this.timeout, this.udata);
	// 				this.handle = requestAnimationFrame(this.step.bind(this));
	// 			}
	// 		}
	// 	}
	// };



	/*
		时间补间动画
	*/
	var Tween = function(time) {
		this.animateBegin = null;
		this.animateStep = null;
		this.animateEnd = null;
		this.udata = null;
		this.startTime = null;
		this.timeout = time || 2000;
		this.handle = null;
	};
	Tween.prototype.start = function(beginCall, stepCall, endCall, data) {
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
	};
	Tween.prototype.step = function(dt) {
		if (this.timeout == 0) { // 无限循环
			this.animateStep && this.animateStep(0, this.udata);
			this.handle = requestAnimationFrame(this.step.bind(this));
		} else {
			var now = new Date().getTime();
			this.handle = requestAnimationFrame(this.step.bind(this));
			var progress = 1 - Math.pow(1 - (now - this.startTime) / this.timeout, 6);
			if (now - this.startTime >= this.timeout || progress == 1) {
				this.stop();
				this.animateStep && this.animateStep(1, this.udata);
				this.animateEnd && this.animateEnd(this.udata);
			} else {
				this.animateStep && this.animateStep(progress, this.udata);
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
		this.animateStep && this.animateStep(this.velocity);
		// 当前速度小于最小的默认速度时候调用stop
		if (Math.abs(this.velocity) < this.minVelocity) {
			this.tween.stop();
		}
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
		},
		getMaxValueFromArray: function(array) {
			array = array || [];
			var max = 0;
			if (array.length > 0) {
				max = array[0];
				for (var i = 0; i < array.length; i++) {
					if (max == null) {
						max = array[i];
					} else {
						if (max < array[i])
							max = array[i];
					}
				}
			}
			return max;
		},
		getMinValueFromArray: function(array) {
			array = array || [];
			var min = 0;
			if (array.length > 0) {
				min = array[0];
				for (var i = 1; i < array.length; i++) {
					if (min == null) {
						min = array[i];
					} else {
						if (min > array[i])
							min = array[i];
					}
				}
			}
			return min;
		},
		getAverageFromArray: function(array) {
			array = array || [];
			var average = 0;
			if (array.length > 0) {
				for (var i = 1; i < array.length; i++) {
					average += array[i];
				}
			}
			return parseInt(average / array.length);
		}
	};


	function ifloor(num) {
		return num > 0 ? Math.floor(num + 0.5) : Math.floor(num - 0.5);
	}

	/*
		反转效果
		pixels = [rgb(255,255,255,1?),(255,255,255,1?)];
	*/
	function invert(pixels, alpha) {
		function inner(array) {
			array[0] = 255 - array[0];
			array[1] = 255 - array[1];
			array[2] = 255 - array[2];
			array[3] = alpha || array[3] || -1;
			return (array[3] == -1 ? "rgb(" : "rgba(") + array[0] + "," + array[1] + "," + array[2] + (array[3] == -1 ? ")" : "," + array[3] + ")");
		}

		function getPixelArray(pixel) {
			return pixel.replace("rgba", "")
				.replace("rgb", "")
				.replace("(", "")
				.replace(")", "")
				.split(",");
		}

		var res = null;
		if (typeof pixels == "string") {
			if (hexReg.test(pixels)) {
				pixels = pixels.toRgb();
			}
			var d = getPixelArray(pixels);
			res = inner(d);
		} else if (pixels instanceof Array) {
			res = [];
			for (var i = 0; i < pixels.length; i++) {
				if (hexReg.test(pixels)) {
					pixels = pixels.toRgb();
				}
				var d = getPixelArray(pixels);
				res.push(inner(d));
			}
		}
		return res;
	};

	/**
		获取不同的线条颜色
	*/
	function getStrokeColorByIndex(globalIndex) {
		var i = (globalIndex) % 13;
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
				return "rgba(121,163,221,1)";
			case 8:
				return "rgba(149,112,109,1)";
			case 9:
				return "rgba(227,135,187,1)";
			case 10:
				return "rgba(7,162,164,1)";
			case 11:
				return "rgba(154,127,209,1)";
			case 12:
				return "rgba(234,216,61,1)";
			default:
				return "white"; //never
		}
	}

	/**
		获取线条色相对应的填充色
	*/
	function getFillColorByIndex(globalIndex) {
		var i = (globalIndex) % 13;
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


	function measureTextSize(word, fontSize, fontFamily) {

		var div = document.createElement('div');
		div.css({
			position: 'fixed',
			fontSize: fontSize,
			fontFamily: fontFamily,
			display: 'inline-block',
			visibility: 'hidden'
		});
		div.appendChild(document.createTextNode(word));
		document.body.appendChild(div);
		var width = div.offsetWidth;
		var height = div.offsetHeight;
		document.body.removeChild(div);


		return {
			width: width,
			height: height
		}
	}

	// 获取文字大小
	function measureTextSize(word, fontSize, fontFamily) {
		var div = document.createElement('div');
		div.css({
			position: 'fixed',
			fontSize: fontSize,
			fontFamily: fontFamily,
			display: 'inline-block',
			visibility: 'hidden'
		});
		div.appendChild(document.createTextNode(word));
		document.body.appendChild(div);
		var width = div.offsetWidth;
		var height = div.offsetHeight;
		document.body.removeChild(div);


		return {
			width: width,
			height: height
		}
	}


	if (!window.Mobilechart)
		window.Mobilechart = new Object();
	window.Mobilechart.basic = Basic;
})();