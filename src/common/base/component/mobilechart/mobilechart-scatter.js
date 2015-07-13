(function(window) {
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
			radius = 3;
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
			radius = 3;
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
	String.prototype.colorRgb = function() {
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
			if (style[i] == prop) {
				delete style[i];
				style[prop] = '';
			}
		}
	};


	/*
		供外面调用的对象
	*/
	var Scatter = function(element) {
		// 根容器
		if (typeof element == "string")
			this.element = document.querySelector(element);
		else
			this.element = element;

		// 判断页面是否加载过
		this.loaded = false;
		this.option = {
			animation: {
				show: true,
				timeout: 1000
			},
			grid: {
				x: 60,
				y: 60,
				x2: 60,
				y2: 0
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
		this.ruler = null;
		this.zoom = null;
		this.toolbox = null;
		this.type = 'scatter';
	};
	/*
		初始化函数
	*/
	Scatter.prototype.init = function(option) {
		this.loaded = false;
		globalIndex = 0;

		// 整合用户设置和默认的值
		util.extend(true, this.option, option);

		// 解析option数据
		this.parseOption();

		this.container = new Container(this.element, this.parameters);
		// 创建需要的html元素
		this.container.drawHTML();
		// 计算必要的数据
		this.calculateCommonData();

		this.parameters.gridQuery = new GridQuery({
			x: 0,
			y: 0,
			width: this.parameters.rootElementWH.w,
			height: this.parameters.rootElementWH.h
		}, 10, 20);

		// 创建对象
		this.series = new Series(this.option.series, this.parameters);
		this.touch = new Touch(this.container.parentElement, this.parameters);
		this.title = new Title(this.option.title, this.parameters);
		this.legend = new Legend(this.option.legend, this.series, this.parameters);
		this.grid = new Grid(this.option.grid, this.parameters);
		this.tip = new Tip(this.container.tipElement, this.parameters);
		this.ruler = new Ruler(this.parameters);
		this.zoom = new Zoom(this.parameters);
		if (!util.isEmpty(this.option.toolbox) && (this.option.toolbox.show === undefined || this.option.toolbox.show === true)) {
			this.toolbox = new Mobilechart.toolbox(this);
		}



		// 开始绘制页面(判断是否需要动画)
		this.load(function() {
			// 注册事件
			// this.registEvent();
			// 绑定事件
			this.bind();
		}.bind(this));

		// delete window.Scatter;
	};
	/*
		画布开始渲染
	*/
	Scatter.prototype.load = function(callback) {
		callback = callback || function() {};

		if (this.option.animation.show == true) {
			this.tween = this.tween || new Tween();
			this.tween.timeout = this.option.animation.timeout;
			this.parameters.progress = 0;
			this.tween.start(null, this.step.bind(this), callback, null);
		} else {
			this.parameters.progress = 1;
			this.draw();
			callback();
			// this.parameters.gridQuery.testDraw(this.container.bottomCanvas);
		}
	};
	/*
		解析option
	*/
	Scatter.prototype.parseOption = function() {
		var _this = this;

		// 初始化x轴数据
		function parseXAxis(xAxisArray) {
			if (xAxisArray.length == 1) {
				var position = xAxisArray[0].position || "bottom";
				var type = xAxisArray[0].type;
				// x轴的位置
				if ("top" === position) {
					if (type === "category") {
						_this.parameters.axisConfig.top = _this.parameters.axisType.CATEGORY;
						_this.axisTop = new CategoryAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.T);
					} else if (type === "value") {
						_this.parameters.axisConfig.top = _this.parameters.axisType.VALUE;
						_this.axisTop = new ValueAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.T);
					}
				} else {
					if (type === "category") {
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
						_this.axisBottom = new CategoryAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.B);
						_this.parameters.axisConfig.bottom = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type1) {
						_this.axisBottom = new ValueAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.B);
						_this.parameters.axisConfig.bottom = _this.parameters.axisType.VALUE;
					}

					if ("category" === type2) {
						_this.axisTop = new CategoryAxis(xAxisArray[1], _this.parameters, _this.parameters.orientation.T);
						_this.parameters.axisConfig.top = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type2) {
						_this.axisTop = new ValueAxis(xAxisArray[1], _this.parameters, _this.parameters.orientation.T);
						_this.parameters.axisConfig.top = _this.parameters.axisType.VALUE;
					}

				} else if ("bottom" === position2) {
					if ("category" === type2) {
						_this.axisBottom = new CategoryAxis(xAxisArray[1], _this.parameters, _this.parameters.orientation.B);
						_this.parameters.axisConfig.bottom = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type2) {
						_this.axisBottom = new ValueAxis(xAxisArray[1], _this.parameters, _this.parameters.orientation.B);
						_this.parameters.axisConfig.bottom = _this.parameters.axisType.VALUE;
					}

					if ("category" === type1) {
						_this.axisTop = new CategoryAxis(xAxisArray[0], _this.parameters, _this.parameters.orientation.T);
						_this.parameters.axisConfig.top = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type1) {
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
						_this.parameters.axisConfig.right = _this.parameters.axisType.CATEGORY;
						_this.axisRight = new CategoryAxis(yAxisArray[0], _this.parameters, _this.parameters.orientation.R);
					} else if (type === "value") {
						_this.parameters.axisConfig.right = _this.parameters.axisType.VALUE;
						_this.axisRight = new ValueAxis(yAxisArray[0], _this.parameters, _this.parameters.orientation.R);
					}
				} else {
					if (type === "category") {
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
						_this.axisLeft = new CategoryAxis(yAxisArray[0], _this.parameters, _this.parameters.orientation.L);
						_this.parameters.axisConfig.left = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type1) {
						_this.axisLeft = new ValueAxis(yAxisArray[0], _this.parameters, _this.parameters.orientation.L);
						_this.parameters.axisConfig.left = _this.parameters.axisType.VALUE;
					}

					if ("category" === type2) {
						_this.axisRight = new CategoryAxis(yAxisArray[1], _this.parameters, _this.parameters.orientation.R);
						_this.parameters.axisConfig.right = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type2) {
						_this.axisRight = new ValueAxis(yAxisArray[1], _this.parameters, _this.parameters.orientation.R);
						_this.parameters.axisConfig.right = _this.parameters.axisType.VALUE;
					}

				} else if ("left" === position2) {
					if ("category" === type2) {
						_this.axisLeft = new CategoryAxis(yAxisArray[1], _this.parameters, _this.parameters.orientation.L);
						_this.parameters.axisConfig.left = _this.parameters.axisType.CATEGORY;
					} else if ("value" === type2) {
						_this.axisLeft = new ValueAxis(yAxisArray[1], _this.parameters, _this.parameters.orientation.L);
						_this.parameters.axisConfig.left = _this.parameters.axisType.VALUE;
					}

					if ("category" === type1) {
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
	Scatter.prototype.calculateCommonData = function() {
		// 保存绘制坐标轴可见区域的位置
		this.parameters.visualArea = this.container.visualArea;
		// 保存根容器的宽高
		this.parameters.rootElementWH = {
			w: this.container.rootElementWidth,
			h: this.container.rootElementHeight
		};

		// 设置气泡图的最大半径
		// this.parameters.BUBBLE_MAX_RADIUS = this.parameters.visualArea.w > this.parameters.visualArea.h ? this.parameters.visualArea.h / 20 : this.parameters.visualArea.w / 20;
		this.parameters.BUBBLE_MAX_RADIUS = (this.parameters.visualArea.w + this.parameters.visualArea.h) / 50;

		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		if (axisConfig.bottom === axisType.CATEGORY) {
			// this.parameters.categoryOffset = this.axisBottom.option.offset;
			// 用户逻辑轴分几页显示 默认是1
			this.parameters.page = this.axisBottom.option.page || 1;
			// 逻辑轴data数据的总长度
			this.parameters.categoryDataLength = this.axisBottom.option.data.length;
			// 一页显示多少个端点
			this.parameters.categoryPageCapacity = Math.ceil(this.axisBottom.option.data.length / this.parameters.page);
			// 通过计算得到的实际页数
			this.parameters.realPage = Math.ceil(this.axisBottom.option.data.length / this.parameters.categoryPageCapacity);
			// 逻辑轴每段间隔长度
			this.parameters.categorySegmentLength = this.parameters.visualArea.w / this.parameters.categoryPageCapacity;
			// 默认偏移量
			this.parameters.touchOffset.current = this.parameters.visualArea.w;
			// canvas画布默认偏移量
			this.parameters.scrollOffset = -this.parameters.visualArea.w;
		} else if (axisConfig.top === axisType.CATEGORY) {
			// this.parameters.categoryOffset = this.axisTop.option.offset;
			this.parameters.page = this.axisTop.option.page || 1;
			this.parameters.categoryDataLength = this.axisTop.option.data.length;
			this.parameters.categoryPageCapacity = Math.ceil(this.axisTop.option.data.length / this.parameters.page);
			this.parameters.realPage = Math.ceil(this.axisTop.option.data.length / this.parameters.categoryPageCapacity);
			this.parameters.categorySegmentLength = this.parameters.visualArea.w / this.parameters.categoryPageCapacity;
			this.parameters.touchOffset.current = this.parameters.visualArea.w;
			this.parameters.scrollOffset = -this.parameters.visualArea.w;
		} else if (axisConfig.left === axisType.CATEGORY) {
			this.parameters.categoryOffset = this.axisLeft.option.offset;
			this.parameters.page = this.axisLeft.option.page || 1;
			this.parameters.categoryDataLength = this.axisLeft.option.data.length;
			this.parameters.categoryPageCapacity = Math.ceil(this.axisLeft.option.data.length / this.parameters.page);
			this.parameters.realPage = Math.ceil(this.axisLeft.option.data.length / this.parameters.categoryPageCapacity);
			this.parameters.categorySegmentLength = this.parameters.visualArea.h / this.parameters.categoryPageCapacity;
			this.parameters.touchOffset.current = this.parameters.visualArea.h;
			this.parameters.scrollOffset = -this.parameters.visualArea.h;
		} else if (axisConfig.right === axisType.CATEGORY) {
			this.parameters.categoryOffset = this.axisRight.option.offset;
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
	Scatter.prototype.step = function(progress) {
		this.parameters.progress = progress;
		this.draw(progress);
	};
	/*
		绘制图形
	*/
	Scatter.prototype.draw = function() {
		this.clear(this.container.bottomCanvas);
		this.drawValueAxis(this.container.bottomCanvas);
		this.drawLegend(this.container.bottomCanvas);
		this.drawGrid(this.container.bottomCanvas)
		this.drawSeries(this.container.bottomCanvas);
		this.drawTitle(this.container.bottomCanvas);

		if (this.loaded = !this.loaded) {
			this.ruler.drawHorizontally(this.container.horizontalCanvas);
			this.ruler.drawVertically(this.container.verticalCanvas);
			this.ruler.drawText(this.container.rulerElement);
			// this.loaded = true;
		}
	};
	/*
		清空画布
	*/
	Scatter.prototype.clear = function(canvas, rect) {
		if (!rect) {
			rect = {
				x: 0,
				y: 0,
				w: canvas.clientWidth,
				h: canvas.clientHeight
			};
		}

		var context = canvas.getContext("2d");
		context.clearRect(rect.x, rect.y, rect.w, rect.h);
		context.fillStyle = this.parameters.backgroundColor;
		context.fillRect(rect.x, rect.y, rect.w, rect.h);
	};
	/*
		绘制值轴
	*/
	Scatter.prototype.drawValueAxis = function(canvas) {
		this.axisBottom instanceof ValueAxis && this.axisBottom.drawInBottom(canvas);
		this.axisTop instanceof ValueAxis && this.axisTop.drawInTop(canvas);
		this.axisLeft instanceof ValueAxis && this.axisLeft.drawInLeft(canvas);
		this.axisRight instanceof ValueAxis && this.axisRight.drawInRight(canvas);
	};
	/*
		绘制网格
	*/
	Scatter.prototype.drawGrid = function(canvas) {
		this.grid.drawGrid(canvas);
	};
	/*
		绘制图表标题
	*/
	Scatter.prototype.drawTitle = function(canvas) {
		this.title.drawTitle(canvas);
	};
	/*
		绘制图例
	*/
	Scatter.prototype.drawLegend = function(canvas) {
		this.legend.drawLegend(canvas);
	};
	/*
		绘制图形
	*/
	Scatter.prototype.drawSeries = function(canvas) {
		var tempCanvas = document.createElement("canvas");
		tempCanvas.width = canvas.width;
		tempCanvas.height = canvas.height;
		tempCanvas.style.width = canvas.offsetWidth;
		tempCanvas.style.height = canvas.offsetHeight;
		this.series.draw(tempCanvas);
		canvas.getContext("2d").drawImage(tempCanvas, 0, 0);
	};
	Scatter.prototype.showRuler = function(p) {
		var grid = this.parameters.grid;
		this.container.horizontalCanvas.style.top = p.y - grid.y - this.parameters.visualArea.h / 2 + "px";
		this.container.verticalCanvas.style.left = p.x - grid.x - this.parameters.visualArea.w / 2 + "px";
		this.ruler.drawText(this.container.rulerElement, p);
		this.ruler.show();
	};
	Scatter.prototype.hideRuler = function(p) {
		this.ruler.hide();
	};
	Scatter.prototype.bind = function() {
		var _this = this;
		var id = null;

		this.touch.bind("move", function(p) {
			if (_this.touch.isInRect(p, _this.series.area.rect)) {
				_this.showRuler(p);
			} else {
				_this.hideRuler(p);
			}
		}).bind("click", function(p) {
			// 隐藏缩放橡皮筋选择区域
			_this.zoom.hide(_this.container.clipElement);
			_this.showRuler(p);

			var obj = _this.parameters.gridQuery.searchItem(p);
			if (!obj) {
				_this.tip.hideTip();
				return;
			}

			if (_this.touch.isInRect(p, _this.series.area.rect)) { // 点击在series区域
				_this.showRuler(p);
				var html = obj.data.serie.name + "<br/>" + obj.data.serie.data[obj.data.index].join(",");
				_this.tip.showTip(html, p);
				id && clearTimeout(id);
				id = setTimeout(function() {
					_this.tip.hideTip();
				}, 3000);
			} else if (_this.touch.isInRect(p, _this.legend.area.rect)) { // 点击在legend区域
				obj.data.serie.show = !obj.data.serie.show;
				_this.load();
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
		绑定缩放事件调用的函数(根据参数判断是否启用缩放)
	*/
	Scatter.prototype.bindZoom = function(open) {
		if (!open) {
			this.touch.unbind('scroll');

			this.container.verticalCanvas.css({
				cursor: 'default'
			});
			this.container.horizontalCanvas.css({
				cursor: 'default'
			});
			this.container.clipElement.css({
				cursor: 'default'
			});
			return;
		}



		var _this = this;
		var startPoint = null;
		var startTextArray = null;


		// 设置鼠标样式
		_this.container.verticalCanvas.css({
			cursor: 'crosshair'
		});
		_this.container.horizontalCanvas.css({
			cursor: 'crosshair'
		});
		_this.container.clipElement.css({
			cursor: 'crosshair'
		});

		this.touch.bind("scroll", function(e, p) {
			if (!_this.touch.isInRect(p, _this.series.area.rect))
				return;

			e.preventDefault();
			_this.showRuler(p);
			startPoint = p;
			startTextArray = _this.ruler.text;
		}, function(p) {
			if (startPoint == null)
				return;

			_this.showRuler(p);
			_this.zoom.show(_this.container.clipElement, startPoint, p);
		}, function(p) {
			scrollEnd(p);
			startPoint = null;
			startTextArray = null;
		});


		function scrollEnd(p) {
			if (startPoint == null)
				return;

			// 隐藏缩放区域
			_this.zoom.hide(_this.container.clipElement);
			_this.hideRuler(p);

			var endTextArray = _this.ruler.text;

			function updateValueAxisMaxMin(array1, array2) {
				function getMaxMin(value1, value2) {
					var res = {}; // [0]是最小值，[1]是最大值
					var n1 = parseFloat(value1);
					var n2 = parseFloat(value2);
					if (n1 > n2)
						res = {
							min: n2,
							max: n1
						};
					else
						res = {
							min: n1,
							max: n2
						};
					return res;
				}
				var axisConfig = _this.parameters.axisConfig;
				var axisType = _this.parameters.axisType;
				var valueAxisMaxMin = _this.parameters.valueAxisMaxMin;
				_this.parameters.gridQuery.clear();
				if (axisConfig.left === axisType.VALUE && axisConfig.bottom === axisType.VALUE) {
					// 保存上一次的最大最小值
					_this.parameters.zoomArray.push(util.extend(true, {}, valueAxisMaxMin));

					var res = getMaxMin(array1[0], array2[0]);
					valueAxisMaxMin.bottom.min = res.min;
					valueAxisMaxMin.bottom.max = res.max;
					res = getMaxMin(array1[1], array2[1]);
					valueAxisMaxMin.left.min = res.min;
					valueAxisMaxMin.left.max = res.max;

					_this.series.parseVtp();
					_this.series.scatter.largeRadius *= 2;
					_this.load();
				} else if (axisConfig.left === axisType.VALUE && axisConfig.top === axisType.VALUE) {
					// 保存上一次的最大最小值
					_this.parameters.zoomArray.push(util.extend(true, {}, valueAxisMaxMin));

					var res = getMaxMin(array1[0], array2[0]);
					valueAxisMaxMin.top.min = res.min;
					valueAxisMaxMin.top.max = res.max;
					res = getMaxMin(array1[1], array2[1]);
					valueAxisMaxMin.left.min = res.min;
					valueAxisMaxMin.left.max = res.max;

					_this.series.parseVtp();
					_this.series.scatter.largeRadius *= 2;
					_this.load();
				} else if (axisConfig.right === axisType.VALUE && axisConfig.bottom === axisType.VALUE) {
					// 保存上一次的最大最小值
					_this.parameters.zoomArray.push(util.extend(true, {}, valueAxisMaxMin));

					var res = getMaxMin(array1[0], array2[0]);
					valueAxisMaxMin.bottom.min = res.min;
					valueAxisMaxMin.bottom.max = res.max;
					res = getMaxMin(array1[1], array2[1]);
					valueAxisMaxMin.right.min = res.min;
					valueAxisMaxMin.right.max = res.max;

					_this.series.parseVtp();
					_this.series.scatter.largeRadius *= 2;
					_this.load();
				} else if (axisConfig.right === axisType.VALUE && axisConfig.top === axisType.VALUE) {
					// 保存上一次的最大最小值
					_this.parameters.zoomArray.push(util.extend(true, {}, valueAxisMaxMin));

					var res = getMaxMin(array1[0], array2[0]);
					valueAxisMaxMin.top.min = res.min;
					valueAxisMaxMin.top.max = res.max;
					res = getMaxMin(array1[1], array2[1]);
					valueAxisMaxMin.right.min = res.min;
					valueAxisMaxMin.right.max = res.max;

					_this.series.parseVtp();
					_this.series.scatter.largeRadius *= 2;
					_this.load();
				}
			}
			updateValueAxisMaxMin(startTextArray, endTextArray);
		}



	};
	Scatter.prototype.zoomBack = function() {
		if (this.parameters.zoomArray.length == 0)
			return;

		this.parameters.valueAxisMaxMin = this.parameters.zoomArray.pop();
		this.series.parseVtp();
		this.series.scatter.largeRadius /= 2;
		this.load();
	}


	/*
		保存为图片
	*/
	Scatter.prototype.saveAsImage = function() {
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
			closeBtn.src = "res/close.png";
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

		// // 绘制中间区域
		// var visualArea = this.parameters.visualArea;
		// context.drawImage(this.container.middleCanvas, visualArea.w * 2, 0, visualArea.w * 2, visualArea.h * 2, visualArea.x * 2, visualArea.y * 2, visualArea.w * 2, visualArea.h * 2);


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


	Scatter.prototype.restore = function() {
		this.refresh();
	};

	Scatter.prototype.refresh = function() {
		globalIndex = 0;
		// 重设是否第一次加载
		this.loaded = false;

		this.tip.show = false;

		// 重设容器大小
		this.container.reset();

		// 重新计算需要的值
		this.calculateCommonData();

		// 重新计算vtp
		this.series.init();
		// 重新计算区域
		this.series.resetArea();
		// 清空点击区域
		this.parameters.gridQuery.reset({
			x: 0,
			y: 0,
			width: this.parameters.rootElementWH.w,
			height: this.parameters.rootElementWH.h
		}, 10, 20);

		// 重新绘制画布
		this.load();
	};







	/*
		创建页面容器
	*/
	var Container = function(element, parameters) {
		this.parameters = parameters;
		// 用户配置用来装图标的容器
		this.rootElement = element;
		// 保存总容器的宽高
		this.rootElementWidth = this.rootElement.clientWidth;
		this.rootElementHeight = this.rootElement.clientHeight;
		// 创建的在容器里面最外层的容器
		this.parentElement = null;
		// 放置坐标轴画布的容器
		this.middleElement = null;
		// 放置tip的容器
		this.tipElement = null;
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
		this.horizontalCanvas = null;
		this.verticalCanvas = null;
		this.rulerElement = null;
		this.clipElement = null;
		this.scaleCanvasArray = null;
	};
	Container.prototype.drawHTML = function() {
		while (this.rootElement.firstChild)
			this.rootElement.removeChild(this.rootElement.firstChild);

		this.parentElement = this.createElement(this.rootElement, "div");
		this.middleElement = this.createElement(this.parentElement, "div");
		this.rulerElement = this.createElement(this.middleElement, "div");
		this.clipElement = this.createElement(this.parentElement, "div");
		this.tipElement = this.createElement(this.parentElement, "div");

		this.topCanvas = this.createElement(this.parentElement, "canvas");
		this.middleCanvas = this.createElement(this.parentElement, "canvas");
		this.bottomCanvas = this.createElement(this.parentElement, "canvas");
		this.horizontalCanvas = this.createElement(this.middleElement, "canvas");
		this.verticalCanvas = this.createElement(this.middleElement, "canvas");
		this.scaleCanvasArray = [
			this.topCanvas,
			this.bottomCanvas,
			this.middleCanvas,
			this.horizontalCanvas,
			this.verticalCanvas
		];

		// 初始化默认样式
		this.setStyle();

		// 缩放
		this.scale();
	};
	Container.prototype.createElement = function(parentElement, tag) {
		var element = document.createElement(tag);
		parentElement.appendChild(element);
		return element;
	};
	/*
		重新设置位置大小属性
	*/
	Container.prototype.reset = function() {
		this.rootElementWidth = this.rootElement.clientWidth;
		this.rootElementHeight = this.rootElement.clientHeight;
		this.setStyle();
		this.scale();
	};
	Container.prototype.setStyle = function() {
		var w = this.rootElementWidth;
		var h = this.rootElementHeight;
		var grid = this.parameters.grid;
		var x = grid.x;
		var y = grid.y;
		var x2 = grid.x2;
		var y2 = grid.y2;

		// 绘制canvas图表的div 
		this.parentElement.css({
			width: w + 'px',
			height: h + 'px',
			position: 'relative',
			overflow: 'hidden'
		});


		// tip的div
		this.tipElement.css({
			position: "absolute",
			display: "none",
			background: "rgba(50, 50, 50, 0.5)",
			borderRadius: "3px",
			zIndex: 4,
			padding: "5px",
			transition: "left .4s,top .4s",
			color: "white",
			wordWrap: "break-word",
			overflow: "hidden",
			maxWidth: w * 0.2 + "px",
			fontSize: "12px"
		});

		this.middleElement.css({
			position: "absolute",
			top: y + "px",
			left: x + "px",
			width: w - x - x2 + "px",
			height: h - y - y2 + "px",
			overflow: "hidden"
		});


		this.middleCanvas.width = w * 2;
		this.middleCanvas.height = h * 2;
		this.middleCanvas.css({
			position: "absolute",
			width: w + "px",
			height: h + "px"

		});

		this.bottomCanvas.width = w * 2;
		this.bottomCanvas.height = h * 2;
		this.bottomCanvas.css({
			position: "absolute",
			width: w + "px",
			height: h + "px",
			zIndex: 0
		});

		this.topCanvas.width = w * 2;
		this.topCanvas.height = h * 2;
		this.topCanvas.css({
			position: "absolute",
			width: w + "px",
			height: h + "px",
			zIndex: 2,
			display: 'none'
		});

		this.horizontalCanvas.width = (w - x - x2) * 2;
		this.horizontalCanvas.height = (h - y - y2) * 2;
		this.horizontalCanvas.css({
			position: "absolute",
			width: w - x - x2 + "px",
			height: h - y - y2 + "px",
			zIndex: 3,
			display: 'none',
			userSelect: 'none'
		});



		this.verticalCanvas.width = (w - x - x2) * 2;
		this.verticalCanvas.height = (h - y - y2) * 2;
		this.verticalCanvas.css({
			position: "absolute",
			width: w - x - x2 + "px",
			height: h - y - y2 + "px",
			zIndex: 3,
			display: 'none',
			userSelect: 'none'
		});

		this.rulerElement.css({
			position: "absolute",
			display: "none",
			zIndex: 3,
			color: "rgb(0,138,205)",
			fontSize: "12px",
			userSelect: 'none'
		});

		this.clipElement.css({
			position: "absolute",
			display: "none",
			zIndex: 5,
		});


		this.visualArea.x = x;
		this.visualArea.y = y;
		this.visualArea.w = w - x - x2;
		this.visualArea.h = h - y - y2;
	};
	/*
		缩放200% 高清显示
	*/
	Container.prototype.scale = function() {
		for (var i = 0; i < this.scaleCanvasArray.length; i++) {
			if (!this.scaleCanvasArray[i])
				continue;
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
		值轴
	*/
	var ValueAxis = function(option, parameters, position) {
		this.parameters = parameters;
		this.axisStyle = null;
		this.position = position;
		this.zeroLineStyle = null;
		this.splitLineStyle = null;
		this.default = {
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
				formatter: parameters.valueAxisFormatter
			}
		};

		this.option = util.extend(true, this.default, option);
		if (this.option.splitLine.show)
			this.splitLineStyle = new LineStyle(this.option.splitLine.style);
		if (this.option.zeroLine.show)
			this.zeroLineStyle = new LineStyle(this.option.zeroLine.style);
		if (this.option.style)
			this.axisStyle = new AxisStyle(this.option.style);
		else
			this.axisStyle = new AxisStyle();

		// 保存每个值轴的小数点个数配置
		if (option.precision) {
			var orientation = parameters.orientation;
			switch (position) {
				case orientation.L:
					parameters.precision.left = option.precision;
					break;
				case orientation.R:
					parameters.precision.right = option.precision;
					break;
				case orientation.B:
					parameters.precision.bottom = option.precision;
					break;
				case orientation.T:
					parameters.precision.top = option.precision;
					break;
			}
		}
	};
	ValueAxis.prototype.drawInBottom = function(canvas) {
		var context = canvas.getContext("2d");
		var valuePageCapacity = this.parameters.valuePageCapacity;
		var visualArea = this.parameters.visualArea;
		var rootElementWH = this.parameters.rootElementWH;
		var grid = this.parameters.grid;
		var formatter = this.option.axisLabel.formatter;
		var categoryOffset = this.parameters.categoryOffset; // 逻辑轴偏移
		var ruleLength = this.parameters.ruleLength;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var precision = this.parameters.precision.bottom;
		var vtp = this.parameters.vtp.bottom;
		var min = this.parameters.valueAxisMaxMin.bottom.min;
		var max = this.parameters.valueAxisMaxMin.bottom.max;
		var stepSize = (max - min) / valuePageCapacity;
		var valueStepLength = visualArea.w / valuePageCapacity;
		var axisName = this.option.name;

		context.save();
		this.axisStyle && this.axisStyle.useStyle(context);
		if (axisConfig.left === axisType.VALUE) {
			context.beginPath();
			context.moveTo(visualArea.x, visualArea.y + visualArea.h);
			context.lineTo(visualArea.x + visualArea.w, visualArea.y + visualArea.h);
			context.stroke();
			context.closePath();

			context.textAlign = "center";
			context.textBaseline = "top";
			for (var i = 0; i < valuePageCapacity; i++) {
				context.fillText(
					formatter.replace(this.parameters.valueAxisFormatter, (max - stepSize * i).toFixed(precision)),
					visualArea.x + visualArea.w - valueStepLength * i,
					visualArea.y + visualArea.h + ruleLength
				);

				context.beginPath();
				context.moveTo(visualArea.x + valueStepLength * i, visualArea.y + visualArea.h);
				context.lineTo(visualArea.x + valueStepLength * i, visualArea.y + visualArea.h + ruleLength);
				context.stroke();
				context.closePath();
			}

			context.fillText(
				formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)),
				visualArea.x + visualArea.w - valueStepLength * valuePageCapacity,
				visualArea.y + visualArea.h + ruleLength
			);


			// 绘制轴名称
			context.save();
			context.textAlign = "left";
			context.textBaseline = "middle";
			context.fillStyle = this.axisStyle.lineStyle.style.color;
			context.fillText(axisName, rootElementWH.w - grid.x2 + ruleLength, rootElementWH.h - grid.y2);
			context.restore();
		} else if (axisConfig.right === axisType.VALUE) {
			context.beginPath();
			context.moveTo(visualArea.x, visualArea.y + visualArea.h);
			context.lineTo(visualArea.x + visualArea.w, visualArea.y + visualArea.h);
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
				formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)),
				visualArea.x + valueStepLength * valuePageCapacity,
				visualArea.y + visualArea.h + ruleLength
			);


			// 绘制轴名称
			context.save();
			context.textAlign = "right";
			context.textBaseline = "middle";
			context.fillStyle = this.axisStyle.lineStyle.style.color;
			context.fillText(axisName, visualArea.x - ruleLength, rootElementWH.h - grid.y2);
			context.restore();
		}

		if (this.option.splitLine.show) {
			context.save();
			this.splitLineStyle.useStyle(context);
			for (var i = 0; i < valuePageCapacity; i++) {
				if (i == 0)
					continue;

				if (this.option.splitLine.style.type == "solid") {
					context.beginPath();
					context.moveTo(visualArea.x + valueStepLength * i, visualArea.y + visualArea.h);
					context.lineTo(visualArea.x + valueStepLength * i, visualArea.y);
					context.stroke();
					context.closePath();
				} else if (this.option.splitLine.style.type == "dotted") {
					context.dottedLine(0, valueStepLength * i, visualArea.w, valueStepLength * i);
				}
			}
			context.restore();
		}

		if (this.option.zeroLine.show && min < 0) {

		}



		context.restore();
	};
	ValueAxis.prototype.drawInTop = function(canvas) {
		var context = canvas.getContext("2d");
		var valuePageCapacity = this.parameters.valuePageCapacity;
		var visualArea = this.parameters.visualArea;
		var formatter = this.option.axisLabel.formatter;
		var ruleLength = this.parameters.ruleLength;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var precision = this.parameters.precision.top;
		var vtp = this.parameters.vtp.top;
		var min = this.parameters.valueAxisMaxMin.top.min;
		var max = this.parameters.valueAxisMaxMin.top.max;
		var stepSize = (max - min) / valuePageCapacity;
		var valueStepLength = visualArea.w / valuePageCapacity;
		var axisName = this.option.name;

		context.save();
		this.axisStyle && this.axisStyle.useStyle(context);
		if (axisConfig.left === axisType.VALUE) {
			context.beginPath();
			context.moveTo(visualArea.x, visualArea.y);
			context.lineTo(visualArea.x + visualArea.w, visualArea.y);
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
				context.moveTo(visualArea.x + valueStepLength * i, visualArea.y);
				context.lineTo(visualArea.x + valueStepLength * i, visualArea.y - ruleLength);
				context.stroke();
				context.closePath();
			}

			context.fillText(
				formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)),
				visualArea.x + visualArea.w - valueStepLength * valuePageCapacity,
				visualArea.y - ruleLength
			);


			// 绘制轴名称
			context.save();
			context.textAlign = "left";
			context.textBaseline = "middle";
			context.fillStyle = this.axisStyle.lineStyle.style.color;
			context.fillText(axisName, visualArea.x + visualArea.w + ruleLength, visualArea.y);
			context.restore();
		} else if (axisConfig.right === axisType.VALUE) {
			context.beginPath();
			context.moveTo(visualArea.x, visualArea.y);
			context.lineTo(visualArea.x + visualArea.w, visualArea.y);
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
				context.moveTo(visualArea.x + valueStepLength * i, visualArea.y);
				context.lineTo(visualArea.x + valueStepLength * i, visualArea.y - ruleLength);
				context.stroke();
				context.closePath();
			}

			context.fillText(
				formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)),
				visualArea.x + valueStepLength * valuePageCapacity,
				visualArea.y - ruleLength
			);


			// 绘制轴名称
			context.save();
			context.textAlign = "right";
			context.textBaseline = "middle";
			context.fillStyle = this.axisStyle.lineStyle.style.color;
			context.fillText(axisName, visualArea.x - ruleLength, visualArea.y);
			context.restore();
		}

		if (this.option.splitLine.show) {
			context.save();
			this.splitLineStyle.useStyle(context);
			for (var i = 0; i < valuePageCapacity; i++) {
				if (i == 0)
					continue;

				if (this.option.splitLine.style.type == "solid") {
					context.beginPath();
					context.moveTo(visualArea.x + valueStepLength * i, visualArea.y + visualArea.h);
					context.lineTo(visualArea.x + valueStepLength * i, visualArea.y);
					context.stroke();
					context.closePath();
				} else if (this.option.splitLine.style.type == "dotted") {
					context.dottedLine(0, valueStepLength * i, visualArea.w, valueStepLength * i);
				}
			}
			context.restore();
		}
		if (this.option.zeroLine.show && min < 0) {
			context.save();
			context.restore();
		}
		context.restore();
	};
	ValueAxis.prototype.drawInRight = function(canvas) {
		var context = canvas.getContext("2d");
		var valuePageCapacity = this.parameters.valuePageCapacity;
		var formatter = this.option.axisLabel.formatter;
		var visualArea = this.parameters.visualArea;
		var ruleLength = this.parameters.ruleLength;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var valueStepLength = visualArea.h / valuePageCapacity;
		var precision = this.parameters.precision.right; // 值轴保留几位小数
		var vtp = this.parameters.vtp.right;
		var min = this.parameters.valueAxisMaxMin.right.min;
		var max = this.parameters.valueAxisMaxMin.right.max;
		var stepSize = (max - min) / valuePageCapacity; //计算出数值轴 的一个间距代表的值为多少
		var axisName = this.option.name;

		context.save();
		this.axisStyle && this.axisStyle.useStyle(context);
		if (axisConfig.bottom === axisType.VALUE) {
			context.beginPath();
			context.moveTo(visualArea.x + visualArea.w, visualArea.y);
			context.lineTo(visualArea.x + visualArea.w, visualArea.y + visualArea.h);
			context.stroke();
			context.closePath();

			context.textAlign = "left";
			context.textBaseline = "middle";
			for (var i = 0; i < valuePageCapacity; i++) {
				if (typeof formatter === "string") {
					context.fillText(
						formatter.replace(this.parameters.valueAxisFormatter, (max - stepSize * i).toFixed(precision)),
						visualArea.x + visualArea.w + ruleLength,
						visualArea.y + valueStepLength * i
					);
				} else if (typeof formatter === "function") {
					var value = formatter((max - stepSize * i));
					context.fillText(value, visualArea.x + visualArea.w - ruleLength, visualArea.y + valueStepLength * i);
				}

				context.beginPath();
				context.moveTo(visualArea.x + visualArea.w + ruleLength, visualArea.y + valueStepLength * i);
				context.lineTo(visualArea.x + visualArea.w, visualArea.y + valueStepLength * i);
				context.stroke();
				context.closePath();
			}

			// 绘制数值轴的起点
			if (typeof formatter === "string") {
				context.fillText(formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)), visualArea.x + visualArea.w + ruleLength, visualArea.y + visualArea.h);
			} else if (typeof formatter === "function") {
				var value = formatter(min);
				context.fillText(value, visualArea.x + visualArea.w + ruleLength, visualArea.y + visualArea.h);
			}

			// 绘制轴名称
			context.save();
			context.textAlign = "center";
			context.textBaseline = "bottom";
			context.fillStyle = this.axisStyle.lineStyle.style.color;
			context.fillText(axisName, visualArea.x + visualArea.w, visualArea.y - ruleLength);
			context.restore();
		} else if (axisConfig.top === axisType.VALUE) {
			context.beginPath();
			context.moveTo(visualArea.x + visualArea.w, visualArea.y);
			context.lineTo(visualArea.x + visualArea.w, visualArea.y + visualArea.h);
			context.stroke();
			context.closePath();

			context.textAlign = "left";
			context.textBaseline = "middle";
			for (var i = 0; i < valuePageCapacity; i++) {
				if (typeof formatter === "string") {
					context.fillText(
						formatter.replace(this.parameters.valueAxisFormatter, (max - stepSize * i).toFixed(precision)),
						visualArea.x + visualArea.w + ruleLength,
						visualArea.y + visualArea.h - valueStepLength * i
					);
				} else if (typeof formatter === "function") {
					var value = formatter((max - stepSize * i));
					context.fillText(value, visualArea.x + visualArea.w + ruleLength, visualArea.y + visualArea.h - valueStepLength * i);
				}

				context.beginPath();
				context.moveTo(visualArea.x + visualArea.w + ruleLength, visualArea.y + valueStepLength * i);
				context.lineTo(visualArea.x + visualArea.w, visualArea.y + valueStepLength * i);
				context.stroke();
				context.closePath();
			}

			// 绘制数值轴的起点
			if (typeof formatter === "string") {
				context.fillText(formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)), visualArea.x + visualArea.w + ruleLength, visualArea.y);
			} else if (typeof formatter === "function") {
				var value = formatter(min);
				context.fillText(value, visualArea.x + visualArea.w + ruleLength, visualArea.y);
			}

			// 绘制轴名称
			context.save();
			context.textAlign = "center";
			context.textBaseline = "top";
			context.fillStyle = this.axisStyle.lineStyle.style.color;
			context.fillText(axisName, visualArea.x + visualArea.w, visualArea.y + visualArea.h + ruleLength);
			context.restore();
		}



		if (this.option.splitLine.show) {
			context.save();
			this.splitLineStyle.useStyle(context);
			for (var i = 0; i < valuePageCapacity; i++) {
				if (i == 0)
					continue;

				if (this.option.splitLine.style.type == "solid") {
					context.beginPath();
					context.moveTo(visualArea.x, visualArea.y + valueStepLength * i);
					context.lineTo(visualArea.x + visualArea.w, visualArea.y + valueStepLength * i);
					context.stroke();
					context.closePath();
				} else if (this.option.splitLine.style.type == "dotted") {
					context.dottedLine(0, valueStepLength * i, visualArea.w, valueStepLength * i);
				}
			}
			context.restore();
		}

		if (this.option.zeroLine.show && min < 0) {

		}
		context.restore();
	};
	ValueAxis.prototype.drawInLeft = function(canvas) {
		var valuePageCapacity = this.parameters.valuePageCapacity;
		var min = this.parameters.valueAxisMaxMin.left.min;
		var max = this.parameters.valueAxisMaxMin.left.max;
		var formatter = this.option.axisLabel.formatter;
		var visualArea = this.parameters.visualArea;
		// 逻辑轴偏移
		var categoryOffset = this.parameters.categoryOffset;
		var ruleLength = this.parameters.ruleLength;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var valueStepLength = visualArea.h / valuePageCapacity;
		// 值轴保留几位小数
		var precision = this.parameters.precision.left;
		//计算出数值轴 的一个间距代表的值为多少
		var stepSize = (max - min) / valuePageCapacity;
		var vtp = this.parameters.vtp.left;
		var context = canvas.getContext("2d");
		var axisName = this.option.name;

		context.save();
		this.axisStyle && this.axisStyle.useStyle(context);
		if (axisConfig.bottom === axisType.VALUE) {
			context.beginPath();
			context.moveTo(visualArea.x, visualArea.y);
			context.lineTo(visualArea.x, visualArea.y + visualArea.h);
			context.stroke();
			context.closePath();

			context.textAlign = "right";
			context.textBaseline = "middle";
			for (var i = 0; i < valuePageCapacity; i++) {
				if (typeof formatter === "string") {
					context.fillText(
						formatter.replace(this.parameters.valueAxisFormatter, (max - stepSize * i).toFixed(precision)),
						visualArea.x - this.parameters.ruleLength,
						visualArea.y + valueStepLength * i
					);
				} else if (typeof formatter === "function") {
					var value = formatter((max - stepSize * i));
					context.fillText(value, visualArea.x - this.parameters.ruleLength, visualArea.y + valueStepLength * i);
				}

				context.beginPath();
				context.moveTo(visualArea.x - this.parameters.ruleLength, visualArea.y + valueStepLength * i);
				context.lineTo(visualArea.x, visualArea.y + valueStepLength * i);
				context.stroke();
				context.closePath();
			}

			// 绘制数值轴的起点
			if (typeof formatter === "string") {
				context.fillText(formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)), visualArea.x - ruleLength, visualArea.y + visualArea.h);
			} else if (typeof formatter === "function") {
				var value = formatter(min);
				context.fillText(value, visualArea.x - ruleLength, visualArea.y + visualArea.h);
			}

			// 绘制轴名称
			context.save();
			context.textAlign = "center";
			context.textBaseline = "bottom";
			context.fillStyle = this.axisStyle.lineStyle.style.color;
			context.fillText(axisName, visualArea.x, visualArea.y - ruleLength);
			context.restore();
		} else if (axisConfig.top === axisType.VALUE) {
			context.beginPath();
			context.moveTo(visualArea.x, visualArea.y);
			context.lineTo(visualArea.x, visualArea.y + visualArea.h);
			context.stroke();
			context.closePath();

			context.textAlign = "right";
			context.textBaseline = "middle";
			for (var i = 0; i < valuePageCapacity; i++) {
				if (typeof formatter === "string") {
					context.fillText(
						formatter.replace(this.parameters.valueAxisFormatter, (max - stepSize * i).toFixed(precision)),
						visualArea.x - this.parameters.ruleLength,
						visualArea.y + visualArea.h - valueStepLength * i
					);
				} else if (typeof formatter === "function") {
					var value = formatter((max - stepSize * i));
					context.fillText(value, visualArea.x - this.parameters.ruleLength, visualArea.y + visualArea.h - valueStepLength * i);
				}

				context.beginPath();
				context.moveTo(visualArea.x - this.parameters.ruleLength, visualArea.y + valueStepLength * i);
				context.lineTo(visualArea.x, visualArea.y + valueStepLength * i);
				context.stroke();
				context.closePath();
			}

			// 绘制数值轴的起点
			if (typeof formatter === "string") {
				context.fillText(formatter.replace(this.parameters.valueAxisFormatter, min.toFixed(precision)), visualArea.x - ruleLength, visualArea.y);
			} else if (typeof formatter === "function") {
				var value = formatter(min);
				context.fillText(value, visualArea.x - ruleLength, visualArea.y);
			}

			// 绘制轴名称
			context.save();
			context.textAlign = "center";
			context.textBaseline = "top";
			context.fillStyle = this.axisStyle.lineStyle.style.color;
			context.fillText(axisName, visualArea.x, visualArea.y + visualArea.h + ruleLength);
			context.restore();
		}



		if (this.option.splitLine.show) {
			context.save();
			this.splitLineStyle.useStyle(context);
			for (var i = 0; i < valuePageCapacity; i++) {
				if (i == 0)
					continue;

				if (this.option.splitLine.style.type == "solid") {
					context.beginPath();
					context.moveTo(visualArea.x, visualArea.y + valueStepLength * i);
					context.lineTo(visualArea.x + visualArea.w, visualArea.y + valueStepLength * i);
					context.stroke();
					context.closePath();
				} else if (this.option.splitLine.style.type == "dotted") {
					context.dottedLine(0, valueStepLength * i, visualArea.w, valueStepLength * i);
				}
			}
			context.restore();
		}

		if (this.option.zeroLine.show && min < 0) {

		}
		context.restore();
	};



	/*
		图形
	*/
	var Series = function(option, parameters) {
		this.option = option;
		this.parameters = parameters;
		this.scatter = null;
		this.area = null;

		this.resetArea();
		this.init();
	};
	Series.prototype.init = function() {
		this.groupByAxisIndex();
		this.parseVtp();
	};
	Series.prototype.resetArea = function() {
		this.area = {
			rect: {
				x: this.parameters.visualArea.x,
				y: this.parameters.visualArea.y,
				w: this.parameters.visualArea.w,
				h: this.parameters.visualArea.h
			}
		};
	};
	/*
		计算vtp
	*/
	Series.prototype.parseVtp = function() {
		var valueAxisMaxMin = this.parameters.valueAxisMaxMin;
		var visualArea = this.parameters.visualArea;
		var vtp = this.parameters.vtp;
		if (valueAxisMaxMin.top)
			vtp.top = visualArea.w / (valueAxisMaxMin.top.max - valueAxisMaxMin.top.min);
		if (valueAxisMaxMin.bottom)
			vtp.bottom = visualArea.w / (valueAxisMaxMin.bottom.max - valueAxisMaxMin.bottom.min);
		if (valueAxisMaxMin.left)
			vtp.left = visualArea.h / (valueAxisMaxMin.left.max - valueAxisMaxMin.left.min);
		if (valueAxisMaxMin.right)
			vtp.right = visualArea.h / (valueAxisMaxMin.right.max - valueAxisMaxMin.right.min);
		if (valueAxisMaxMin.value) {
			this.parameters.bubble_vtr = this.parameters.BUBBLE_MAX_RADIUS / (valueAxisMaxMin.value.max - valueAxisMaxMin.value.min);
		}
	};
	/*
		根据轴的位置分组
	*/
	Series.prototype.groupByAxisIndex = function() {
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var left = [];
		var right = [];
		var value = [];
		var top = [];
		var bottom = [];
		var series = this.option;

		for (var i = 0; i < series.length; i++) {
			// 判断data是否是function类型 
			var serie = series[i];
			serie.show = true;
			if (serie.data instanceof Function) {
				serie.data = serie.data();
			}

			if (serie.type == "scatter") {
				serie.serieStyle = new ScatterStyle(serie.style);
			}
			for (var j = 0; j < serie.data.length; j++) {
				var data = serie.data[j];
				if (axisConfig.left === axisType.VALUE && axisConfig.bottom === axisType.VALUE) {
					left.push(data[1]);
					bottom.push(data[0]);

				}
				if (axisConfig.left === axisType.VALUE && axisConfig.top === axisType.VALUE) {
					left.push(data[1]);
					top.push(data[0]);
				}
				if (axisConfig.right === axisType.VALUE && axisConfig.bottom === axisType.VALUE) {
					right.push(data[1]);
					bottom.push(data[0]);
				}
				if (axisConfig.right === axisType.VALUE && axisConfig.top === axisType.VALUE) {
					right.push(data[1]);
					top.push(data[0]);
				}
				if (data.length == 3)
					value.push(data[2]);
			}
		}

		/*
			获取每个数值轴的最大值和最小值
		*/
		var orientation = this.parameters.orientation;
		if (left.length > 0) {
			this.parameters.valueAxisMaxMin.left = this.calculateMaxMinValue(left);
		}

		if (right.length > 0) {
			this.parameters.valueAxisMaxMin.right = this.calculateMaxMinValue(right);
		}

		if (top.length > 0) {
			this.parameters.valueAxisMaxMin.top = this.calculateMaxMinValue(top);
		}
		if (bottom.length > 0) {
			this.parameters.valueAxisMaxMin.bottom = this.calculateMaxMinValue(bottom);
		}
		if (value.length > 0) {
			this.parameters.valueAxisMaxMin.value = this.calculateMaxMinValue(value);
		}
	};
	/*
		计算最大值和最小值
	*/
	Series.prototype.calculateMaxMinValue = function(data) {
		var min = util.getMinValueFromArray(data);
		var max = util.getMaxValueFromArray(data);
		return {
			max: max,
			min: min
		};
	};
	/*
		绘制图形
	*/
	Series.prototype.draw = function(canvas) {
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var seriesArray = [];
		for (var i = 0; i < this.option.length; i++) {
			var serie = this.option[i];
			var yAxisIndex = serie.yAxisIndex || 0;
			var xAxisIndex = serie.xAxisIndex || 0;

			if (yAxisIndex === 0 && axisConfig.left === axisType.VALUE || yAxisIndex === 1 && axisConfig.right === axisType.VALUE) {
				seriesArray.push(serie);
			} else if (xAxisIndex === 0 && axisConfig.bottom === axisType.VALUE || xAxisIndex === 1 && axisConfig.top === axisType.VALUE) {
				seriesArray.push(serie);
			}
		}

		for (var i = 0; i < seriesArray.length; i++) {
			var serie = this.option[i];
			if (serie.show == false)
				continue;
			if (!this.scatter)
				this.scatter = new ScatterSerie(this.parameters);
			this.scatter.drawScatter(canvas, serie);
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
		散点图
	*/
	var ScatterSerie = function(parameters) {
		this.parameters = parameters;
		this.largeRadius = 1; // 最大不超过5
		this.scatterRadius = 3;
		this.MAX_LARGE_RADIUS = 9;
		this.ignoreBubble = false;
	};
	ScatterSerie.prototype.drawScatter = function(canvas, serie) {
		var context = canvas.getContext("2d");
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var visualArea = this.parameters.visualArea;
		var valueAxisMaxMin = this.parameters.valueAxisMaxMin;
		var gridQuery = this.parameters.gridQuery;

		var vtp = this.parameters.vtp;
		if (axisConfig.left === axisType.VALUE) {
			var vtpLeft = vtp.left;
			var minLeft = valueAxisMaxMin.left.min * vtpLeft;
			var maxLeft = valueAxisMaxMin.left.max * vtpLeft;
		}
		if (axisConfig.right === axisType.VALUE) {
			var vtpRight = vtp.right;
			var minRight = valueAxisMaxMin.right.min * vtpRight;
			var maxRight = valueAxisMaxMin.right.max * vtpRight;
		}
		if (axisConfig.top === axisType.VALUE) {
			var vtpTop = vtp.top;
			var minTop = valueAxisMaxMin.top.min * vtpTop;
			var maxTop = valueAxisMaxMin.top.max * vtpTop;
		}
		if (axisConfig.bottom === axisType.VALUE) {
			var vtpBottom = vtp.bottom;
			var minBottom = valueAxisMaxMin.bottom.min * vtpBottom;
			var maxBottom = valueAxisMaxMin.bottom.max * vtpBottom;
		}


		var x = 0;
		var y = 0;
		var radius = 0;
		var defaultRadius = serie.large ? serie.serieStyle.style.normal.radius || this.largeRadius : serie.serieStyle.style.normal.radius || this.scatterRadius;
		this.largeRadius = defaultRadius;
		if (this.largeRadius > this.MAX_LARGE_RADIUS)
			defaultRadius = this.MAX_LARGE_RADIUS;

		context.save();
		serie.serieStyle.useStyle(context);
		context.globalAlpha = 0.5;
		if (axisConfig.left === axisType.VALUE && axisConfig.bottom === axisType.VALUE) {
			for (var i = 0; i < serie.data.length; i++) {
				var data = serie.data[i];

				if (data[0] * vtpBottom > maxBottom || data[0] * vtpBottom < minBottom)
					continue;
				if (data[1] * vtpLeft > maxLeft || data[1] * vtpLeft < minLeft)
					continue;


				x = visualArea.x + (data[0] * vtpBottom - minBottom);
				y = visualArea.y + visualArea.h - (data[1] * vtpLeft - minLeft);
				// radius = (data[2] || defaultRadius) * this.parameters.progress;
				if (data[2] && !this.ignoreBubble) {
					radius = data[2] * this.parameters.bubble_vtr * this.parameters.progress;
				} else {
					radius = defaultRadius * this.parameters.progress;
				}
				context.beginPath();
				context.arc(x, y, radius, 0, Math.PI * 2, false);
				context.closePath();
				context.fill();
				gridQuery.insertRadius({
					bounds: {
						x: x,
						y: y,
						radius: radius
					},
					data: {
						index: i,
						serie: serie
					}
				});
			}
		} else if (axisConfig.left === axisType.VALUE && axisConfig.top === axisType.VALUE) {
			for (var i = 0; i < serie.data.length; i++) {
				var data = serie.data[i];

				if (data[0] * vtpTop > maxTop || data[0] * vtpTop < minTop)
					continue;
				if (data[1] * vtpLeft > maxLeft || data[1] * vtpLeft < minLeft)
					continue;


				x = visualArea.x + (data[0] * vtpTop - minTop);
				y = visualArea.y + (data[1] * vtpLeft - minLeft);
				// radius = (data[2] || defaultRadius) * this.parameters.progress;
				if (data[2] && !this.ignoreBubble) {
					radius = data[2] * this.parameters.bubble_vtr * this.parameters.progress;
				} else {
					radius = defaultRadius * this.parameters.progress;
				}

				context.beginPath();
				context.arc(x, y, radius, 0, Math.PI * 2, false);
				context.closePath();
				context.fill();
				gridQuery.insertRadius({
					bounds: {
						x: x,
						y: y,
						radius: radius
					},
					data: {
						index: i,
						serie: serie
					}
				});
			}
		} else if (axisConfig.right === axisType.VALUE && axisConfig.bottom === axisType.VALUE) {
			for (var i = 0; i < serie.data.length; i++) {
				var data = serie.data[i];

				if (data[0] * vtpBottom > maxBottom || data[0] * vtpBottom < minBottom)
					continue;
				if (data[1] * vtpRight > maxRight || data[1] * vtpRight < minRight)
					continue;


				x = visualArea.x + visualArea.w - (data[0] * vtpBottom - minBottom);
				y = visualArea.y + visualArea.h - (data[1] * vtpRight - minRight);
				// radius = (data[2] || defaultRadius) * this.parameters.progress;
				if (data[2] && !this.ignoreBubble) {
					radius = data[2] * this.parameters.bubble_vtr * this.parameters.progress;
				} else {
					radius = defaultRadius * this.parameters.progress;
				}
				context.beginPath();
				context.arc(x, y, radius, 0, Math.PI * 2, false);
				context.closePath();
				context.fill();
				gridQuery.insertRadius({
					bounds: {
						x: x,
						y: y,
						radius: radius
					},
					data: {
						index: i,
						serie: serie
					}
				});
			}
		} else if (axisConfig.right === axisType.VALUE && axisConfig.top === axisType.VALUE) {
			for (var i = 0; i < serie.data.length; i++) {
				var data = serie.data[i];

				if (data[0] * vtpTop > maxTop || data[0] * vtpTop < minTop)
					continue;
				if (data[1] * vtpRight > maxRight || data[1] * vtpRight < minRight)
					continue;


				x = visualArea.x + visualArea.w - (data[0] * vtpTop - minTop);
				y = visualArea.y + (data[1] * vtpRight - minRight);
				// radius = (data[2] || defaultRadius) * this.parameters.progress;
				if (data[2] && !this.ignoreBubble) {
					radius = data[2] * this.parameters.bubble_vtr * this.parameters.progress;
				} else {
					radius = defaultRadius * this.parameters.progress;
				}
				context.beginPath();
				context.arc(x, y, radius, 0, Math.PI * 2, false);
				context.closePath();
				context.fill();
				gridQuery.insertRadius({
					bounds: {
						x: x,
						y: y,
						radius: radius
					},
					data: {
						index: i,
						serie: serie
					}
				});
			}
		}

		context.restore();
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
				color: "rgba(170,170,170,1)"
			}
		};
		option = util.extend(true, this.defaultStyle, option);
		this.option = option;
		this.parameters = parameters;
		this.fontStyleObject = new FontStyle(option.style);
		this.subFontStyleObject = new FontStyle(option.subStyle);
	};
	Title.prototype.drawTitle = function(canvas) {
		var context = canvas.getContext("2d");
		context.save();
		this.fontStyleObject && this.fontStyleObject.useStyle(context);
		context.fillText(this.option.text || "", 8, 18);
		context.restore();

		context.save();
		this.subFontStyleObject && this.subFontStyleObject.useStyle(context);
		context.fillText(this.option.subtext || "", 8, 18 + 18);
		context.restore();
	};


	/*
		图例
	*/
	var Legend = function(option, series, parameters) {
		this.option = option;
		this.series = series;
		this.parameters = parameters;
		// this.isFirstDraw = true;
		this.legendWidth = null;
		this.lineWidth = 3;
		this.legendWidthPercent = parameters.legendWidthPercent;
		this.icon = {
			radius: 6,
			padding: 6,
			margin: 16,
			top: 10,
			bottom: 10
		};

		if (this.option.style)
			this.fontStyle = new FontStyle(this.option.style);
		else
			this.fontStyle = new FontStyle({
				color: "black"
			});

		// 保存legend的位置信息
		this.TYPE = parameters.touchTargetType.LEGEND;
		this.area = {
			rect: {},
			leaf: [],
			type: this.TYPE
		};

		this.loaded = false;
	};
	Legend.prototype.drawLegend = function(canvas) {
		var context = canvas.getContext("2d");
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		if (this.option.show == false)
			return;

		if (this.loaded) {
			// this.clear(canvas, this.area.rect);
		} else {
			this.area = {
				rect: {},
				leaf: [],
				type: this.TYPE
			};
		}



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
			var xAxisIndex = serie.xAxisIndex || 0;

			if (yAxisIndex === 0 && axisConfig.left === axisType.VALUE || yAxisIndex === 1 && axisConfig.right === axisType.VALUE) {
				seriesArray.push(serie);
			} else if (xAxisIndex === 0 && axisConfig.bottom === axisType.VALUE || xAxisIndex === 1 && axisConfig.top === axisType.VALUE) {
				seriesArray.push(serie);
			}
		}

		for (var i = 0; i < seriesArray.length; i++) {
			count++;
			var currentWidth = this.icon.margin + this.icon.radius * 2 + this.icon.padding + context.measureText(seriesArray[i].name).width + this.icon.margin;

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
		else if (this.option.align === "right")
			this.drawLegendInRight(context, countArray, seriesArray);

		this.loaded = true;
	};
	Legend.prototype.drawLegendInCenter = function(context, countArray, seriesArray) {
		/*
			countArray为每一行有几个图例，每一行占用宽度
			[[num,width]]
		*/
		var rootElementWH = this.parameters.rootElementWH;
		var legendWidth = rootElementWH.w * this.legendWidthPercent;
		context.save();
		var j = 0;
		for (var i = 0; i < countArray.length; i++) {
			var sumLength = 0; // 图例总长度
			var currentLineWidth = countArray[i][1]; // 每一行所占的宽度
			var cnt = countArray[i][0] + j;

			var x = 0;
			var y = this.icon.top + this.icon.radius + (this.icon.top + this.icon.radius * 2 + this.icon.bottom) * i;

			for (j; j < cnt; j++) {
				var serie = seriesArray[j];
				var name = serie.name;
				var type = serie.type;
				var textWidth = context.measureText(name).width;
				var currentWidth = this.icon.margin + this.icon.radius * 2 + this.icon.padding + textWidth + this.icon.margin;
				sumLength += currentWidth;
				x = ((rootElementWH.w - currentLineWidth) >> 1) + (sumLength - currentWidth);
				if (serie.show) {
					serie.serieStyle.useStyle(context);
				} else {
					context.fillStyle = "gray";
					context.strokeStyle = "gray";
					textColor = "gray";
				}
				context.textAlign = "left";
				context.textBaseline = "middle";
				if (type == "scatter") {
					context.beginPath();
					context.arc(x, y, 6, 0, Math.PI * 2, false);
					context.closePath();
					context.fill();
					context.fillText(name, x + this.icon.radius + this.icon.padding, y);
				}


				if (this.parameters.progress == 1) {
					var object = {};
					object.rect = {
						x: x - this.icon.radius - this.icon.margin,
						y: y - this.icon.radius - this.icon.top,
						width: currentWidth,
						height: this.icon.top + this.icon.radius * 2 + this.icon.bottom
					};

					this.parameters.gridQuery.insert({
						bounds: object.rect,
						data: {
							type: this.parameters.touchTargetType.LEGEND,
							serie: serie
						}
					});
				}
			}
		}

		if (this.parameters.progress == 1) {
			this.area.rect = {
				x: (rootElementWH.w - legendWidth) / 2,
				y: 0,
				w: legendWidth,
				h: (this.icon.top + this.icon.radius * 2 + this.icon.bottom) * countArray.length
			};
		}
		context.restore();
	};
	Legend.prototype.drawLegendInRight = function(context, countArray, seriesArray) {
		var rootElementWH = this.parameters.rootElementWH;
		var legendWidth = rootElementWH.w * this.legendWidthPercent;

		context.save();
		var j = 0;
		for (var i = 0; i < countArray.length; i++) {
			var sumLength = 0; // 图例总长度
			var currentLineWidth = countArray[i][1]; // 每一行所占的宽度
			var cnt = countArray[i][0] + j;

			var x = 0;
			var y = this.icon.top + this.icon.radius + (this.icon.top + this.icon.radius * 2 + this.icon.bottom) * i;



			for (j; j < cnt; j++) {
				var serie = seriesArray[j];
				var name = serie.name;
				var type = serie.type;
				var textWidth = context.measureText(name).width;
				var currentWidth = this.icon.margin + this.icon.radius * 2 + this.icon.padding + textWidth + this.icon.margin;
				sumLength += currentWidth;
				// x = ((rootElementWH.w - currentLineWidth) >> 1) + (sumLength - currentWidth);
				x = rootElementWH.w - currentLineWidth + (sumLength - currentWidth);
				if (serie.show) {
					serie.serieStyle.useStyle(context);
				} else {
					context.fillStyle = "gray";
					context.strokeStyle = "gray";
					textColor = "gray";
				}
				context.textAlign = "left";
				context.textBaseline = "middle";
				if (type == "scatter") {
					context.beginPath();
					context.arc(x, y, 6, 0, Math.PI * 2, false);
					context.closePath();
					context.fill();
					context.fillText(name, x + this.icon.radius + this.icon.padding, y);
				}


				if (this.parameters.progress == 1) { //
					var object = {};
					object.rect = {
						x: x - this.icon.radius - this.icon.margin,
						y: y - this.icon.radius - this.icon.top,
						width: currentWidth,
						height: this.icon.top + this.icon.radius * 2 + this.icon.bottom
					};
					// console.log(object.rect);
					// context.strokeStyle = 'red';
					// context.strokeRect(object.rect.x, object.rect.y, object.rect.width, object.rect.height);
					// context.strokeRect(1234, 0, 86, 32)


					this.parameters.gridQuery.insert({
						bounds: object.rect,
						data: {
							// type: this.parameters.touchTargetType.LEGEND,
							serie: serie
						}
					});
				}
			}
		}

		if (this.parameters.progress == 1) {
			this.area.rect = {
				x: rootElementWH.w - legendWidth,
				y: 0,
				w: legendWidth,
				h: (this.icon.top + this.icon.radius * 2 + this.icon.bottom) * countArray.length
			};
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
		网格布局
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
		var context = canvas.getContext("2d");
		var visualArea = this.parameters.visualArea;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var categoryOffset = this.parameters.categoryOffset;

		context.save();
		this.lineStyle && this.lineStyle.useStyle(context);
		context.strokeRect(visualArea.x + 1, visualArea.y + 1, visualArea.w - 2, visualArea.h - 2);
		context.restore();
	};



	/*
		缩放
	*/
	var Zoom = function(parameters) {
		this.parameters = parameters;
		this.fillColor = "rgba(182,162,222,0.2)";
		this.strokeColor = "rgb(0,138,205)";
		this.enable = false;
	};
	Zoom.prototype.draw = function(canvas, startPoint, endPoint) {
		this.show(canvas);
		this.clear(canvas);
		var context = canvas.getContext("2d");
		context.save();
		context.fillStyle = this.fillColor;
		context.strokeStyle = this.strokeColor;
		context.beginPath();
		context.rect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y);
		context.closePath();
		context.fill();
		context.stroke();
		context.restore();
	};
	Zoom.prototype.show = function(element, startPoint, endPoint) {
		element.style.display = "block";
		element.style.top = startPoint.y + "px";
		element.style.left = startPoint.x + "px";
		element.style.background = this.fillColor;
		element.style.border = "1px solid " + this.strokeColor;

		var x = endPoint.x - startPoint.x;
		var y = endPoint.y - startPoint.y;
		if (x < 0 && y < 0) {
			element.style.top = startPoint.y - Math.abs(y) + "px";
			element.style.left = startPoint.x - Math.abs(x) + "px";
		} else if (x > 0 && y > 0) {
			element.style.top = startPoint.y + "px";
			element.style.left = startPoint.x + "px";
		} else if (x > 0 && y < 0) {
			element.style.top = startPoint.y - Math.abs(y) + "px";
			element.style.left = startPoint.x + "px";
		} else if (x < 0 && y > 0) {
			element.style.top = startPoint.y + "px";
			element.style.left = startPoint.x - Math.abs(x) + "px";
		}
		element.style.width = Math.abs(x) + "px";
		element.style.height = Math.abs(y) + "px";
	};
	Zoom.prototype.hide = function(element) {
		element.style.display = "none";
		element.style.top = "";
		element.style.left = "";
		element.style.width = "";
		element.style.height = "";
		element.style.background = "";
		element.style.border = "";
	};



	/*
		标尺
	*/
	var Ruler = function(parameters) {
		this.parameters = parameters;
		this.defaultStyle = {
			color: "rgba(0,138,205,1)"
		}
		this.elementArray = [];
		this.text = [];
		this.loaded = false;
	};
	Ruler.prototype.drawHorizontally = function(canvas) {
		this.elementArray.push(canvas);
		var context = canvas.getContext("2d");
		var visualArea = this.parameters.visualArea;
		context.save();
		context.strokeStyle = this.defaultStyle.color;
		// context.moveTo(0, 1);
		// context.lineTo(visualArea.w, 1);
		context.dottedLine(0, visualArea.h / 2, visualArea.w, visualArea.h / 2);
		context.stroke();
		context.restore();
	};
	Ruler.prototype.drawVertically = function(canvas) {
		this.elementArray.push(canvas);
		var context = canvas.getContext("2d");
		var visualArea = this.parameters.visualArea;
		context.save();
		context.strokeStyle = this.defaultStyle.color;
		// context.moveTo(1, 0);
		// context.lineTo(1, visualArea.h);
		context.dottedLine(visualArea.w / 2, 0, visualArea.w / 2, visualArea.h);
		context.stroke();
		context.restore();
	};
	Ruler.prototype.drawText = function(element, point) {
		if (!this.loaded)
			this.elementArray.push(element);
		if (!point)
			return;

		var grid = this.parameters.grid;
		var axisConfig = this.parameters.axisConfig;
		var axisType = this.parameters.axisType;
		var vtp = this.parameters.vtp;
		var valueAxisMaxMin = this.parameters.valueAxisMaxMin;
		var rootElementWH = this.parameters.rootElementWH;
		var visualArea = this.parameters.visualArea;
		var valuePageCapacity = this.parameters.valuePageCapacity;
		var precision = this.parameters.precision;

		var x = point.x - grid.x;
		var y = point.y - grid.y;
		if (axisConfig.left === axisType.VALUE && axisConfig.bottom === axisType.VALUE) {
			var maxLeft = valueAxisMaxMin.left.max;
			var minLeft = valueAxisMaxMin.left.min;
			var maxBottom = valueAxisMaxMin.bottom.max;
			var minBottom = valueAxisMaxMin.bottom.min;

			var x0 = (minBottom + x * (maxBottom - minBottom) / visualArea.w).toFixed(precision.bottom);
			var y0 = (maxLeft - (y * (maxLeft - minLeft) / visualArea.h)).toFixed(precision.left);
		} else if (axisConfig.left === axisType.VALUE && axisConfig.top === axisType.VALUE) {
			var maxLeft = valueAxisMaxMin.left.max;
			var minLeft = valueAxisMaxMin.left.min;
			var maxTop = valueAxisMaxMin.top.max;
			var minTop = valueAxisMaxMin.top.min;

			var x0 = (minTop + x * (maxTop - minTop) / visualArea.w).toFixed(precision.top);
			var y0 = (minLeft + (y * (maxLeft - minLeft) / visualArea.h)).toFixed(precision.left);
		} else if (axisConfig.right === axisType.VALUE && axisConfig.bottom === axisType.VALUE) {
			var maxRight = valueAxisMaxMin.right.max;
			var minRight = valueAxisMaxMin.right.min;
			var maxBottom = valueAxisMaxMin.bottom.max;
			var minBottom = valueAxisMaxMin.bottom.min;

			var x0 = (maxBottom - x * (maxBottom - minBottom) / visualArea.w).toFixed(precision.bottom);
			var y0 = (maxRight - (y * (maxRight - minRight) / visualArea.h)).toFixed(precision.right);
		} else if (axisConfig.right === axisType.VALUE && axisConfig.top === axisType.VALUE) {
			var maxRight = valueAxisMaxMin.right.max;
			var minRight = valueAxisMaxMin.right.min;
			var maxTop = valueAxisMaxMin.top.max;
			var minTop = valueAxisMaxMin.top.min;

			var x0 = (maxTop - x * (maxTop - minTop) / visualArea.w).toFixed(precision.top);
			var y0 = (minRight + (y * (maxRight - minRight) / visualArea.h)).toFixed(precision.right);
		}

		element.innerHTML = "(" + x0 + "," + y0 + ")";
		this.text = [x0, y0];
		element.style.top = point.y - grid.y - element.offsetHeight - 10 + "px";
		element.style.left = point.x - grid.x + 10 + "px";

		this.loaded = true;
	};
	Ruler.prototype.show = function() {
		for (var i = 0; i < this.elementArray.length; i++) {
			this.elementArray[i].style.display = "block";
		}
	};
	Ruler.prototype.hide = function() {
		for (var i = 0; i < this.elementArray.length; i++) {
			this.elementArray[i].style.display = "none";
		}
	};



	/*
		tip框
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
		this.element.innerHTML = object;

		var top = point.y + 10;
		var left = point.x + 10;
		var clientWidth = this.element.clientWidth;
		var clientHeight = this.element.clientHeight;
		var grid = this.parameters.grid;
		var visualArea = this.parameters.visualArea;

		if (left + clientWidth > grid.x + visualArea.w) {
			left = grid.x + visualArea.w - clientWidth;
		}
		if (top + clientHeight > grid.y + visualArea.h) {
			top = grid.y + visualArea.h - clientHeight;
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
		this.page = 1;

		// 图表背景
		this.backgroundColor = "rgb(255,255,255)";

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
			bottom: 0,
			value: 0
		};

		this.visualArea = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};

		// 气泡图最大半径
		this.BUBBLE_MAX_RADIUS = 16;
		this.bubble_vtr = 1;

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
		this.valuePageCapacity = 6;

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
		this.legendWidthPercent = 0.6;

		// 事件类型
		this.touchType = {
			CLICK: 0,
			SCROLL: 1,
			CANCEL: 2
		};

		// 触发事件的对象
		this.touchTargetType = {
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
		// 值轴的小数点个数
		this.precision = {
			left: 2,
			right: 2,
			bottom: 2,
			top: 2
		};
		// 当前的系统类型
		this.runPlatform = "mobile";
		// 存放缩放的数组（用于回退操作）
		this.zoomArray = [];
	};


	/*
		线条样式
	*/
	var LineStyle = function(style) {
		this.default = {
			color: getStrokeColorByIndex(globalIndex++),
			width: 1,
			type: "solid", // dotted
			cap: "butt"
		};
		this.style = util.extend(true, {}, this.default, style);
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
		阴影样式
	*/
	var ShadowStyle = function(style) {
		this.default = {
			x: 0,
			y: 0,
			color: "black",
			blur: 2
		};
		this.style = util.extend(true, {}, this.default, style);
	};
	ShadowStyle.prototype.useStyle = function(context) {
		context.shadowBlur = this.style.blur;
		context.shadowColor = this.style.color;
		context.shadowOffsetX = this.style.x;
		context.shadowOffsetY = this.style.y;
	};


	/*
		形状样式
	*/
	var ShapeStyle = function(style) {
		this.lineStyle = null;
		this.shadowStyle = null;
		this.type = "rect";
		this.default = {
			color: getStrokeColorByIndex(globalIndex++),
			lineStyle: {},
			shadowStyle: {

			}
		};
		this.style = util.extend(true, {}, this.default, style);
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
		轴样式
	*/
	var AxisStyle = function(style) {
		this.default = {
			lineStyle: {
				width: 1,
				color: "rgba(0,138,205,1)"
			},
			fontStyle: {

			},
			shadowStyle: {

			}
		};
		this.style = util.extend(true, {}, this.default, style);
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
		散点图样式
	*/
	var ScatterStyle = function(style) {
		var defaultStyle = {
			normal: {
				color: getStrokeColorByIndex(globalIndex++)
				// radius: 1
			}
		};
		this.style = util.extend(true, {}, defaultStyle, style);
		this.shapeStyle = new ShapeStyle(this.style.normal);
	};
	ScatterStyle.prototype.useStyle = function(context) {
		this.shapeStyle.useStyle(context);
	};



	/*
		触摸事件
	*/
	var Touch = function(element, parameters) {
		this.parameters = parameters;
		this.element = element;
		this.eventType = {
			CLICK: "click",
			SCROLL: "scroll",
			TOUCH: "touch",
			MOVE: "move"
		};
	};
	Touch.prototype = {
		// getPoint: function(e) {
		// 	var point = {
		// 		x: 0,
		// 		y: 0
		// 	};
		// 	if (e.touches) {
		// 		point.x = e.touches[0].pageX - e.currentTarget.offsetLeft;
		// 		point.y = e.touches[0].pageY - e.currentTarget.offsetTop;
		// 	} else {
		// 		point.x = e.pageX - e.currentTarget.offsetLeft;
		// 		point.y = e.pageY - e.currentTarget.offsetTop;
		// 	}
		// 	return point;
		// },
		getXY: function(obj) {
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
		},
		getPoint: function(e) {
			var point = {
				x: 0,
				y: 0
			};
			point = this.getXY(this.element);

			if (e.touches) {
				// point.x = e.touches[0].pageX - e.currentTarget.offsetLeft;
				// point.y = e.touches[0].pageY - e.currentTarget.offsetTop;
				point = {
					x: e.touches[0].pageX - point.x,
					y: e.touches[0].pageY - point.y
				};
			} else {
				// point.x = e.pageX - e.currentTarget.offsetLeft;
				// point.y = e.pageY - e.currentTarget.offsetTop;
				point = {
					x: e.pageX - point.x,
					y: e.pageY - point.y
				};
			}

			return point;
		},
		/*
			web端鼠标移动（不需要点击的移动，移动端只能点击，没有鼠标）
			鼠标移动的回调函数 argument[0]
			超过指定区域的回调函数 argument[1]
		*/
		move: function(moveCallback) {
			var _this = this;
			this.mousemove = function(e) {
				moveCallback && moveCallback(_this.getPoint(e));
			}


			this.element.addEventListener("mousemove", this.mousemove, false);
		},
		/*
			整合click和鼠标按下的滑动事件
			暂时没用到(因为取消scroll事件的时候同时click事件也没有了)
		*/
		touch: function(startCallback, moveCallback, endCallback) {
			var _this = this;
			var runPlatform = this.parameters.runPlatform;
			var range = 10;
			var startPoint = {};
			var currentPoint = {};

			this.touchstart = function(e) {
				startPoint = _this.getPoint(e);
				currentPoint = startPoint;
				startCallback && startCallback(startPoint);
				_this.element.addEventListener(runPlatform == "web" ? "mousemove" : "touchmove", _this.touchmove, false);
			};
			this.touchmove = function(e) {
				var point = _this.getPoint(e);
				currentPoint = point;
				moveCallback && moveCallback(point);
			};
			this.touchend = function(e) {
				if (Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2) < Math.pow(range, 2)) {
					endCallback && endCallback(startPoint);
				}
				_this.element.removeEventListener(runPlatform == "web" ? "mousemove" : "touchmove", _this.touchmove, false);
			};

			this.element.addEventListener(runPlatform == "web" ? "mousedown" : "touchstart", this.touchstart, false);
			this.element.addEventListener(runPlatform == "web" ? "mouseup" : "touchend", this.touchend, false)
		},
		/*
			单独实现click事件
		*/
		click: function(callback) {
			var _this = this;
			var runPlatform = this.parameters.runPlatform;
			var range = 10;
			var startPoint = {};
			var currentPoint = {};

			this.clickstart = function(e) {
				startPoint = _this.getPoint(e);
				currentPoint = startPoint;
				_this.element.addEventListener(runPlatform == "web" ? "mousemove" : "touchmove", _this.clickmove, false);
			};
			this.clickmove = function(e) {
				currentPoint = _this.getPoint(e);;
			};
			this.clickend = function(e) {
				if (Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2) < Math.pow(range, 2)) {
					callback && callback(startPoint);
				}
				_this.element.removeEventListener(runPlatform == "web" ? "mousemove" : "touchmove", _this.clickmove, false);
			};

			this.element.addEventListener(runPlatform == "web" ? "mousedown" : "touchstart", this.clickstart, false);
			this.element.addEventListener(runPlatform == "web" ? "mouseup" : "touchend", this.clickend, false)
		},
		/*
			单独实现scroll事件
		*/
		scroll: function(startCallback, moveCallback, endCallback) {
			var _this = this;
			var runPlatform = this.parameters.runPlatform;
			var range = 10;
			var startPoint = {};
			var currentPoint = {};

			this.touchstart = function(e) {
				startPoint = _this.getPoint(e);
				currentPoint = startPoint;
				startCallback && startCallback(e, startPoint);
				_this.element.addEventListener(runPlatform == "web" ? "mousemove" : "touchmove", _this.touchmove, false);
			};
			this.touchmove = function(e) {
				var point = _this.getPoint(e);
				currentPoint = point;
				moveCallback && moveCallback(point);
			};
			this.touchend = function(e) {
				if (Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2) > Math.pow(range, 2)) {
					endCallback && endCallback(startPoint);
				}
				_this.element.removeEventListener(runPlatform == "web" ? "mousemove" : "touchmove", _this.touchmove, false);
			};

			this.element.addEventListener(runPlatform == "web" ? "mousedown" : "touchstart", this.touchstart, false);
			this.element.addEventListener(runPlatform == "web" ? "mouseup" : "touchend", this.touchend, false)
		},
		bind: function(type) {
			if (type == this.eventType.CLICK) {
				this.click(arguments[1]);
			} else if (type == this.eventType.MOVE) {
				if (this.parameters.runPlatform == "web") {
					this.move(arguments[1], arguments[2]);
				}
			} else if (type == this.eventType.SCROLL) {
				this.scroll(arguments[1], arguments[2], arguments[3]);
			}

			return this;
		},
		removeScroll: function() {
			this.element.removeEventListener(this.parameters.runPlatform == "web" ? "mousedown" : "touchstart", this.touchstart, false);
			this.element.removeEventListener(this.parameters.runPlatform == "web" ? "mouseup" : "touchend", this.touchend, false);
		},
		unbind: function(type) {
			if (type == this.eventType.SCROLL) {
				this.removeScroll();
			}
		},
		isInRect: function(point, rect) {
			if (point.x > rect.x && point.x < rect.x + rect.w && point.y > rect.y && point.y < rect.y + rect.h)
				return true;
			return false;
		}
	};



	/*
		时间补间动画
	*/
	var Tween = function(time) {
		this.animateBegin = null;
		this.animateStep = null;
		this.animateEnd = null;
		this.udata = null;
		this.startTime = null;
		this.timeout = time || 1000;
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
			this.animateStep && this.animateStep(1 - Math.pow(1 - (now - this.startTime) / this.timeout, 3), this.udata);
			this.handle = requestAnimationFrame(this.step.bind(this));

			if (now - this.startTime >= this.timeout) {
				this.stop();
				this.animateStep && this.animateStep(1, this.udata);
				this.animateEnd && this.animateEnd(this.udata);
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
			var max = Math.MAX_VALUE;
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
				pixels = pixels.colorRgb();
			}
			var d = getPixelArray(pixels);
			res = inner(d);
		} else if (pixels instanceof Array) {
			res = [];
			for (var i = 0; i < pixels.length; i++) {
				if (hexReg.test(pixels)) {
					pixels = pixels.colorRgb();
				}
				var d = getPixelArray(pixels);
				res.push(inner(d));
			}
		}
		return res;
	};


	function getStrokeColorByIndex(globalIndex) {
		var i = (globalIndex + 3) % 13;
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

	/**
		获取线条色相对应的填充色
	*/
	function getFillColorByIndex(globalIndex) {
		var i = globalIndex % 9;
		switch (i) {
			case 0:
				return "rgba(0,128,179,0.1)";
			case 1:
				return "rgba(230,77,0,0.1)";
			case 2:
				return "rgba(0,179,0,0.1)";
			case 3:
				return "rgba(128,0,179,0.1)";
			case 4:
				return "rgba(230,128,0,0.1)";
			case 5:
				return "rgba(128,230,179,0.1)";
			case 6:
				return "rgba(222,54,117,0.1)";
			case 7:
				return "rgba(219,230,56,0.1)";
			case 8:
				return "rgba(140,212,51,0.1)";
			default:
				return "rgba(255,255,255,0.1)"; //never
		}
	}


	function GridQuery_rectContainsRect(p, sub) {
		if (
			(p.x < sub.x) &&
			(p.y < sub.y) &&
			(p.x + p.width > sub.x + sub.width) &&
			(p.y + p.height > sub.y + sub.height)
		)
			return true;
		return false;
	}

	function GridQuery_rectContainsPoint(rect, point) {
		return GridQuery_rectContainsRect(rect, {
			x: point.x,
			y: point.y,
			width: 0,
			height: 0
		});
	}
	var GridQuery = function(bounds, row, column) {
		this.reset(bounds, row, column);
	};
	GridQuery.prototype = {
		insertRadius: function(radiusObj, ignoreBounds) {
			radiusObj.bounds.x = radiusObj.bounds.x - radiusObj.bounds.radius;
			radiusObj.bounds.y = radiusObj.bounds.y - radiusObj.bounds.radius;
			radiusObj.bounds.width = radiusObj.bounds.radius * 2;
			radiusObj.bounds.height = radiusObj.bounds.radius * 2;
			this.insert(radiusObj);
		},
		insert: function(obj, ignoreBounds) {
			var bounds = obj.bounds;

			var row = Math.floor(bounds.y / this.cellHeight);
			var column = Math.floor(bounds.x / this.cellWidth);

			this.createCellIfIsNotExists(row, column);

			this.cells[row][column].push(obj);

			if (!ignoreBounds) {
				var prect = {
					x: column * this.cellWidth,
					y: row * this.cellHeight,
					width: this.cellWidth,
					height: this.cellHeight
				};

				if (!GridQuery_rectContainsRect(prect, bounds)) {
					var tempCol = Math.ceil(bounds.width / this.cellWidth);
					var tempRow = Math.ceil(bounds.height / this.cellHeight);

					if (tempCol >= this.column)
						tempCol = this.column - 1;
					if (tempRow >= this.row)
						tempRow = this.row - 1;


					for (var i = 0; i <= tempRow; i++) {
						for (var j = 0; j <= tempCol; j++) {
							if (i == 0 && j == 0)
								continue;
							this.createCellIfIsNotExists(row + i, column + j);
							this.cells[row + i][column + j].push(obj);
						}
					}
				}
			}
		},
		searchItem: function(point) {
			if (GridQuery_rectContainsPoint(this.bounds, point)) {
				var row = Math.floor(point.y / this.cellHeight);
				var column = Math.floor(point.x / this.cellWidth);
				if (this.cells[row] && this.cells[row][column]) {
					var objs = this.cells[row][column];
					if (objs) {
						for (var i = 0; i < objs.length; i++) {
							var obj = objs[i];
							if (GridQuery_rectContainsPoint(obj.bounds, point)) {
								return obj;
							}
						}
					}
				}
			}

			return null;
		},
		searchItems: function(point) {
			var items = [];
			if (GridQuery_rectContainsPoint(this.bounds, point)) {
				var row = Math.floor(point.y / this.cellHeight);
				var column = Math.floor(point.x / this.cellWidth);

				if (this.cells[row] && this.cells[row][column]) {
					var objs = this.cells[row][column];
					if (objs) {
						for (var i = 0; i < objs.length; i++) {
							var obj = objs[i];
							if (GridQuery_rectContainsPoint(obj.bounds, point)) {
								items.push(obj);
							}
						}
					}
				}
			}

			return items;
		},
		reset: function(bounds, row, column) {
			this.bounds = bounds;
			this.row = row || 6;
			this.column = column || 6;

			this.cellWidth = bounds.width / this.column;
			this.cellHeight = bounds.height / this.row;

			this.cells = {};
		},
		clear: function() {
			this.cells = {};
		},
		createCellIfIsNotExists: function(row, column) {
			if (!this.cells[row])
				this.cells[row] = {};
			if (!this.cells[row][column])
				this.cells[row][column] = [];
		},
		testDraw: function(canvas) {
			var ctx = canvas.getContext("2d");
			ctx.save();

			ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

			for (var i = 0; i < this.row; i++) {
				ctx.beginPath();
				ctx.moveTo(this.bounds.x, this.bounds.y + i * this.cellHeight);
				ctx.lineTo(this.bounds.x + this.bounds.width, this.bounds.y + i * this.cellHeight);
				ctx.stroke();
				ctx.closePath();
			}

			for (var i = 0; i < this.column; i++) {
				ctx.beginPath();
				ctx.moveTo(this.bounds.x + i * this.cellWidth, this.bounds.y);
				ctx.lineTo(this.bounds.x + i * this.cellWidth, this.bounds.y + this.bounds.height);
				ctx.stroke();
				ctx.closePath();
			}

			for (row in this.cells) {
				for (column in this.cells[row]) {
					var objs = this.cells[row][column];

					for (var i = 0; i < objs.length; i++) {
						var obj = objs[i];
						var bounds = obj.bounds;
						ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
					}
				}
			}

			ctx.restore();
		}
	};


	if (!window.Mobilechart)
		window.Mobilechart = new Object();
	window.Mobilechart.scatter = Scatter;
})(window);