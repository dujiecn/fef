(function() {
	/*
		添加工具步骤
		1.Box.createTool
		2.getToolImage();
		3.创建Tool对象
	*/


	var ToolBox = function(chart) {
		var self = this;
		this.chart = chart;
		this.option = this.chart.option;
		this.element = this.chart.container.parentElement;
		this.box = null;


		/*
			抽象的box类
		*/
		var Box = function() {
			this.option = self.option.toolbox;
			if (!this.option.position)
				this.option.position = 'right-bottom';

			this.boxElement = null;
			this.hanlderElement = null;
			this.tools = [];
			this.open = false;
			this.touch = null;
			this.handlerSize = 33;
			this.toolSize = 30;
			this.handlerTop = 2;
			this.handlerRight = 2;
		};
		Box.prototype.init = function() {
			this.createElements();
			this.bind();

			for (var i = 0; i < this.tools.length; i++) {
				var tool = this.tools[i];
				if (!tool.disable)
					tool.init();
			}
		};
		Box.prototype.createTool = function(type, element) {
			var object = null;
			var chartType = self.chart.type;
			var img = getToolImage(type);
			if (type == 'zoom') {
				object = new ZoomTool(element, img, chartType != 'scatter');
			} else if (type == 'zoomback') {
				object = new ZoomBackTool(element, img, chartType != 'scatter');
			} else if (type == 'scatter') {
				object = new ScatterTool(element, img, chartType != 'scatter');
			} else if (type == 'bar') {
				object = new BarTool(element, img, chartType != 'basic' && chartType != 'pie' && chartType != 'radar' && chartType != 'rose');
			} else if (type == 'pie') {
				object = new PieTool(element, img, chartType != 'basic');
			} else if (type == 'radar') {
				object = new RadarTool(element, img, chartType != 'basic');
			} else if (type == 'stack') {
				object = new StackTool(element, img, chartType != 'basic');
			} else if (type == 'table') {
				object = new TableTool(element, img, false);
			} else if (type == 'smooth') {
				object = new SmoothTool(element, img, chartType != 'basic');
			} else if (type == 'line') {
				object = new LineTool(element, img, chartType != 'basic');
			} else if (type == 'page') {
				object = new PagePanelTool(element, img, chartType != 'basic');
			} else if (type == 'swap') {
				object = new SwapTool(element, img, chartType != 'basic');
			} else if (type == 'restore') {
				object = new RestoreTool(element, img, false);
			} else if (type == 'save') {
				object = new SaveAsImageTool(element, img, false);
			} else if (type == 'help') {
				object = new HelpTool(element, img, false);
			}


			return object;
		};
		Box.prototype.bind = function() {
			var _this = this;
			this.touch = new Touch(this.hanlderElement);
			this.touch.bind('click', function(e, p) {
				_this.open = !_this.open;
				_this.layout();
			}).bind('scroll', null).bind('move', null);
		};



		/*
			矩形box
		*/
		var RectBox = function() {
			Box.call(this);
		};
		RectBox.prototype.init = Box.prototype.init;
		RectBox.prototype.bind = Box.prototype.bind;
		RectBox.prototype.createTool = Box.prototype.createTool;
		RectBox.prototype.createElements = function() {
			this.boxElement = createTagByParentElement(self.element, 'div');
			this.hanlderElement = createTagByParentElement(self.element, 'div');

			this.hanlderElement.css({
				position: 'absolute',
				boxSizing: 'border-box',
				width: this.handlerSize + 'px',
				height: this.handlerSize + 'px',
				borderRadius: '12em',
				backgroundColor: self.chart.parameters.backgroundColor,
				transition: 'all .2s ease',
				backgroundImage: 'url("' + getToolImage() + '")',
				backgroundSize: 'contain',
				zIndex: 10
			});

			this.boxElement.css({
				position: 'absolute',
				boxSizing: 'border-box',
				overflow: 'hidden',
				zIndex: 10
			});



			var that = this;
			var position = this.option.position; // || 'right-top';
			var orientation = this.option.extension.orientation;
			if (position == 'right-top' || position == 'top-right') {
				r2t();
			}

			function r2t() {
				that.hanlderElement.css({
					top: that.handlerTop + 'px',
					right: that.handlerRight + 'px'
				});

				if (orientation == 'vertical') {
					that.boxElement.css({
						width: that.handlerSize + 'px',
						height: self.element.offsetHeight - that.handlerSize + 'px',
						top: that.handlerTop + 'px',
						right: that.handlerRight + 'px'
					});


					for (var i = 0; i < that.option.tools.length; i++) {
						var element = createTagByParentElement(that.boxElement, 'div');
						element.css({
							position: 'absolute',
							boxSizing: 'border-box',
							width: that.toolSize + 'px',
							height: that.toolSize + 'px',
							backgroundSize: 'contain',
							transition: 'all .2s ease',
							borderRadius : '20px',
							backgroundColor: self.chart.parameters.backgroundColor,
							top: (that.handlerSize - that.toolSize) * 0.5 + 'px',
							right: (that.handlerSize - that.toolSize) * 0.5 + 'px'
						});

						var object = this.createTool(this.option.tools[i], element);
						if (object != null) {
							element.title = object.name;
							element.css('backgroundImage','url("' + object.image + '")');

							// 如果当前工具禁用 灰化按钮
							if (object.disable) {
								element.css({
									backgroundColor: 'rgba(155,155,155,0.5)',
									cursor: 'not-allowed',
									borderRadius: '20em',
									backgroundBlendMode: 'difference'
								});
							}
							that.tools.push(object)
						}
					}
				} else if (orientation == 'horizontal') {
					that.boxElement.css({
						width: self.element.offsetWidth - that.handlerSize + 'px',
						height: that.handlerSize + 'px',
						top: that.handlerTop + 'px',
						right: that.handlerRight + 'px'
					});

					for (var i = that.option.tools.length - 1; i >= 0; i--) {
						var element = createTagByParentElement(that.boxElement, 'div');
						element.css({
							position: 'absolute',
							boxSizing: 'border-box',
							width: that.toolSize + 'px',
							height: that.toolSize + 'px',
							backgroundSize: 'contain',
							transition: 'all .2s ease',
							borderRadius : '20px',
							backgroundColor: self.chart.parameters.backgroundColor,
							top: (that.handlerSize - that.toolSize) * 0.5 + 'px',
							right: (that.handlerSize - that.toolSize) * 0.5 + 'px'
						});

						var object = that.createTool(that.option.tools[i], element);
						if (object != null) {
							element.title = object.name;
							element.css('backgroundImage','url("' + object.image + '")');

							// 如果当前工具禁用 灰化按钮
							if (object.disable) {
								element.css({
									backgroundColor: 'rgba(184, 197, 209, 1)',
									cursor: 'not-allowed',
									borderRadius: '20em',
									backgroundBlendMode: 'multiply'
								});
							}
							that.tools.push(object)
						}
					}
				}
			}
		};
		RectBox.prototype.layout = function() {
			var that = this;
			var position = this.option.position; // || 'right-top';
			var orientation = this.option.extension.orientation;

			if (position == 'right-top' || position == 'top-right') {
				r2t();
			} else if (position == 'right-center' || position == 'center-right') {

			} else if (position == 'right-bottom' || position == 'bottom-right') {

			}

			function r2t() {
				if (orientation == 'vertical') {
					if (that.open) {
						that.hanlderElement.css('transform', 'rotate(45deg)');


						for (var i = 0; i < that.tools.length; i++) {
							that.tools[i].element.css({
								top: that.handlerTop + (that.handlerSize + 2) * (i + 1) + 'px',
								right: (that.handlerSize - that.toolSize) * 0.5 + 'px'
							});
						}
					} else {
						that.hanlderElement.css('transform', 'rotate(0deg)');

						for (var i = 0; i < that.tools.length; i++) {
							that.tools[i].element.css('top',that.handlerTop + 'px');
						}
					}
				} else if (orientation == 'horizontal') {
					if (that.open) {
						that.hanlderElement.css('transform', 'rotate(45deg)');


						for (var i = 0; i < that.tools.length; i++) {
							that.tools[i].element.css({
								top: that.handlerTop + 'px',
								right: (that.handlerSize - that.toolSize) * 0.5 + (that.handlerSize) * (i + 1) + 'px'
							});
						}
					} else {
						that.hanlderElement.css('transform', 'rotate(0deg)');

						for (var i = 0; i < that.tools.length; i++) {
							that.tools[i].element.css('right', (that.handlerSize - that.toolSize) * 0.5 + 'px');
						}
					}
				}
			}

			function r2c() {}

			function r2b() {}
		};




		/*
			圆弧box
		*/
		var ArcBox = function() {
			Box.call(this);
			this.boxRadius = 0;
		};
		ArcBox.prototype.init = Box.prototype.init;
		ArcBox.prototype.bind = Box.prototype.bind;
		ArcBox.prototype.createTool = Box.prototype.createTool;
		ArcBox.prototype.createElements = function() {
			var position = this.option.position; // || 'right-bottom';
			this.boxElement = createTagByParentElement(self.element, 'div');
			this.hanlderElement = createTagByParentElement(self.element, 'div');


			var jd, jd2;
			if (position == 'right-center' || position == 'center-right') {
				jd = Math.PI / ((this.option.tools.length - 1) || 1);
				jd2 = (Math.PI - jd) * 0.5;
			} else if (position == 'right-top' || position == 'top-right') {
				jd = Math.PI * 0.5 / ((this.option.tools.length - 1) || 1);
				jd2 = (Math.PI - jd) * 0.5;
			} else if (position == 'right-bottom' || position == 'bottom-right') {
				jd = Math.PI * 0.5 / ((this.option.tools.length - 1) || 1);
				jd2 = (Math.PI - jd) * 0.5;
			}

			this.boxRadius = (Math.sqrt(Math.pow(this.toolSize, 2) * 2) * 0.5) / Math.cos(jd2);
			if (this.boxRadius < this.handlerSize * 0.5 + this.toolSize)
				this.boxRadius = this.handlerSize * 0.5 + this.toolSize + 6;
			this.hanlderElement.css({
				position: 'absolute',
				boxSizing: 'border-box',
				width: this.handlerSize + 'px',
				height: this.handlerSize + 'px',
				borderRadius: '12em',
				backgroundImage: 'url("' + getToolImage() + '")',
				backgroundSize: 'contain',
				backgroundColor: self.chart.parameters.backgroundColor,
				zIndex: 11,
				userSelect: 'none'
			});

			this.boxElement.css({
				position: 'absolute',
				boxSizing: 'border-box',
				width: this.boxRadius + this.toolSize * 0.6 + 'px',
				userSelect: 'none',
				overflow: 'hidden',
				zIndex: 10,
				userSelect: 'none'
			});


			var animationTimestamp = 0.5 / this.option.tools.length;
			if (position == 'right-top' || position == 'top-right') {
				this.hanlderElement.css({
					top: this.handlerTop + 'px',
					right: this.handlerTop + 'px',
					transition: 'all .3s ease'
				});
				this.boxElement.css({
					height: this.boxRadius + this.toolSize * 0.6 + 'px',
					top: this.handlerTop + 'px',
					right: this.handlerRight + 'px'
				});


				for (var i = 0; i < this.option.tools.length; i++) {
					var element = createTagByParentElement(this.boxElement, 'div');
					element.css({
						position: 'absolute',
						boxSizing: 'border-box',
						top: (this.handlerSize - this.toolSize) * 0.5 + 'px',
						right: (this.handlerSize - this.toolSize) * 0.5 + 'px',
						width: this.toolSize + 'px',
						height: this.toolSize + 'px',
						backgroundSize: '30px',
						cursor: 'pointer',
						borderRadius : '20px',
						backgroundColor: self.chart.parameters.backgroundColor,
						borderRadius: '16em',
						transition: 'all ' + (0.2 + animationTimestamp * i) + 's ease',
						userSelect: 'none'
					});

					var object = this.createTool(this.option.tools[i], element);
					if (object != null) {
						element.title = object.name;
						element.css('backgroundImage', 'url("' + object.image + '")');

						// 如果当前工具禁用 灰化按钮
						if (object.disable) {
							element.css({
								backgroundColor: 'rgba(155,155,155,0.5)',
								cursor: 'not-allowed',
								borderRadius: '20em',
								backgroundBlendMode: 'difference'
							});
						}

						this.tools.push(object)
					}
				}
			} else if (position == 'right-center' || position == 'center-right') {
				var parentHeight = self.element.clientHeight;
				this.hanlderElement.css({
					top: (parentHeight - this.handlerSize) * 0.5 + 'px',
					right: this.handlerRight + 'px',
					transition: 'all .3s ease'
				});
				this.boxElement.css({
					height: this.boxRadius * 2 + 'px',
					top: parentHeight * 0.5 - this.boxRadius + 'px',
					right: this.handlerRight + 'px'
				});

				for (var i = this.option.tools.length - 1; i >= 0; i--) {
					var element = createTagByParentElement(this.boxElement, 'div');
					element.css({
						position: 'absolute',
						boxSizing: 'border-box',
						top: this.boxRadius - this.toolSize * 0.5 + 'px',
						right: (this.handlerSize - this.toolSize) * 0.5 + 'px',
						width: this.toolSize + 'px',
						height: this.toolSize + 'px',
						cursor: 'pointer',
						backgroundSize: '30px',
						borderRadius : '20px',
						backgroundColor: self.chart.parameters.backgroundColor,
						transition: 'all ' + (0.2 + animationTimestamp * i) + 's ease',
						userSelect: 'none'
					});

					var object = this.createTool(this.option.tools[i], element);
					if (object != null) {
						element.title = object.name;
						element.css('backgroundImage', 'url("' + object.image + '")');

						// 如果当前工具禁用 灰化按钮
						if (object.disable) {
							element.css({
								backgroundColor: 'rgba(155,155,155,0.5)',
								cursor: 'not-allowed',
								borderRadius: '20em',
								backgroundBlendMode: 'difference'
							});
						}

						this.tools.push(object);
					}


				}
			} else if (position == 'right-bottom' || position == 'bottom-right') {
				this.hanlderElement.css({
					bottom: this.handlerTop + 'px',
					right: this.handlerTop + 'px',
					transition: 'all .3s ease'
				});
				this.boxElement.css({
					height: this.boxRadius + this.toolSize * 0.6 + 'px',
					bottom: this.handlerTop + 'px',
					right: this.handlerRight + 'px'
				});


				for (var i = 0; i < this.option.tools.length; i++) {
					var element = createTagByParentElement(this.boxElement, 'div');
					element.css({
						position: 'absolute',
						boxSizing: 'border-box',
						bottom: (this.handlerSize - this.toolSize) * 0.5 + 'px',
						right: (this.handlerSize - this.toolSize) * 0.5 + 'px',
						width: this.toolSize + 'px',
						height: this.toolSize + 'px',
						borderRadius : '20px',
						backgroundSize: '30px',
						backgroundColor: self.chart.parameters.backgroundColor,
						cursor: 'pointer',
						transition: 'all ' + (0.2 + animationTimestamp * i) + 's ease',
						userSelect: 'none'
					});

					var object = this.createTool(this.option.tools[i], element);
					if (object != null) {
						element.title = object.name;
						element.css('backgroundImage', 'url("' + object.image + '")');

						// 如果当前工具禁用 灰化按钮
						if (object.disable) {
							element.css({
								backgroundColor: 'rgba(155,155,155,0.5)',
								cursor: 'not-allowed',
								borderRadius: '20em',
								backgroundBlendMode: 'difference'
							});
						}
						this.tools.push(object);
					}
				}
			}
		};
		ArcBox.prototype.layout = function() {
			var that = this;
			var position = this.option.position; // || 'right-top';
			var toolsLength = this.tools.length;
			if (position == 'right-top' || position == 'top-right') {
				r2t();
			} else if (position == 'right-center' || position == 'center-right') {
				r2c();
			} else if (position == 'right-bottom' || position == 'bottom-right') {
				r2b();
			}

			// right-top
			function r2t() {
				if (that.open) {
					that.hanlderElement.css('transform', 'rotate(180deg)');

					if (toolsLength == 1)
						var jd = 0;
					else
						var jd = Math.PI * 0.5 / (toolsLength - 1);

					for (var i = 0; i < toolsLength; i++) {
						that.tools[i].element.css({
							top: (that.boxRadius - that.handlerSize * 0.5) * Math.sin(jd * i) + 'px',
							right: (that.boxRadius - that.handlerSize * 0.5) * Math.cos(jd * i) + 'px'
						});
					}
				} else {
						that.hanlderElement.css('transform', 'rotate(0deg)');

					for (var i = 0; i < toolsLength; i++) {
						that.tools[i].element.css({
							top: -that.toolSize + that.handlerSize * 0.5 + that.toolSize * 0.5 + 'px',
							right: -that.toolSize + that.handlerSize * 0.5 + that.toolSize * 0.5 + 'px'
						});
					}
				}
			}

			// right-center
			function r2c() {
				if (that.open) {
						that.hanlderElement.css('transform', 'rotate(180deg)');

					if (toolsLength == 1)
						var jd = 0;
					else
						var jd = Math.PI / (toolsLength - 1);

					for (var i = 0; i < toolsLength; i++) {
						var top = that.boxRadius - that.toolSize * 0.5 + (that.boxRadius - that.handlerSize * 0.5) * Math.sin(Math.PI * 1.5 + jd * i);
						var right = (that.boxRadius - that.handlerSize * 0.5) * Math.cos(Math.PI * 1.5 + jd * i);
						that.tools[i].element.css({
							top: top + 'px',
							right: right + 'px'
						});
					}

				} else {
						that.hanlderElement.css('transform', 'rotate(0deg)');

					for (var i = 0; i < toolsLength; i++) {
						that.tools[i].element.css({
							top: that.boxRadius - that.toolSize * 0.5 + 'px',
							right: (that.handlerSize - that.toolSize) * 0.5 + 'px'
						});
					}
				}
			}

			// right-bottom
			function r2b() {
				if (that.open) {
						that.hanlderElement.css('transform', 'rotate(180deg)');

					if (toolsLength == 1)
						var jd = 0;
					else
						var jd = Math.PI * 0.5 / (toolsLength - 1);

					for (var i = 0; i < toolsLength; i++) {
						that.tools[i].element.css({
							bottom: (that.boxRadius - that.handlerSize * 0.5) * Math.sin(jd * i) + 'px',
							right: (that.boxRadius - that.handlerSize * 0.5) * Math.cos(jd * i) + 'px'
						});
					}

				} else {
						that.hanlderElement.css('transform', 'rotate(0deg)');

					for (var i = 0; i < toolsLength; i++) {
						that.tools[i].element.css({
							bottom: -that.toolSize + that.handlerSize * 0.5 + that.toolSize * 0.5 + 'px',
							right: -that.toolSize + that.handlerSize * 0.5 + that.toolSize * 0.5 + 'px'
						});
					}
				}
			}
		};



/*=========================== 工具对象 begin================================*/
		/*
			工具抽象类
		*/
		var Tool = function(element, image, disable) {
			this.element = element;
			this.touch = new Touch(element);
			this.image = image;
			this.open = false;
			// 工具是否禁用
			this.disable = disable || false;
		};


		/*
			缩放工具
		*/
		var ZoomTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '放大';
			this.backgroundColor = this.element.style.backgroundColor;
		};
		ZoomTool.prototype = {
			init: function() {
				this.bind();
			},
			bind: function() {
				var _this = this;
				this.touch.bind('click', function(e, p) {
					_this.open = !_this.open;
					self.chart.bindZoom(_this.open);
					_this.layout();
				}).bind('scroll', null);
			},
			layout: function() {
				if (this.open) {
					this.element.css('backgroundColor','rgb(135, 217, 243)');
				} else {
					this.element.css('backgroundColor',this.backgroundColor);
				}
			}
		};



		/*
			缩放回退工具
		*/
		var ZoomBackTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '回退';
		};
		ZoomBackTool.prototype = {
			init: function() {
				this.bind();
			},
			bind: function() {
				this.touch.bind('click', function(e, p) {
					self.chart.zoomBack();
				}).bind('scroll', null);
			}
		};


		/*
			分页工具
		*/
		var PagePanelTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.pagePanelElement = null;
			this.processElement = null;
			this.buttonElement = null;
			this.maxPage = self.chart.parameters.page;
			this.minPage = 1;
			this.name = '分页';
		};
		PagePanelTool.prototype = {
			init: function() {
				this.createPagePanel();
				this.bind();
			},
			createPagePanel: function() {
				this.pagePanelElement = createTagByParentElement(self.element, 'div');
				this.processElement = createTagByParentElement(this.pagePanelElement, 'div');
				this.buttonElement = createTagByParentElement(this.pagePanelElement, 'div');

				this.pagePanelElement.css({
					position: 'absolute',
					bottom: '0px',
					left: '50%',
					width: '200px',
					height: '38px',
					margin: '0 0 0 -100px',
					zIndex: 10,
					display: 'none',
					cursor: 'pointer',
					userSelect: 'none'
				});

				this.processElement.css({
					position: 'absolute',
					top: '50%',
					left: '0',
					width: '100%',
					height: '6px',
					margin: '-3px 0 0',
					background: 'rgba(69,99,123,0.3)',
					border: '1px solid rgba(69,99,123,0.3)',
					boxSizing: 'border-box',
					borderRadius: '0.6em',
					userSelect: 'none'
				});


				this.buttonElement.css({
					position: 'absolute',
					top: '50%',
					left: '175px',
					width: '25px',
					height: '11px',
					margin: '-6px 0 0',
					background: 'rgba(66,148,236,1)',
					borderRadius: '0.6em',
					userSelect: 'none',
					cursor: 'pointer'
				});
			},
			layout: function() {
				if (this.open)
					this.pagePanelElement.css('display','block');
				else
					this.pagePanelElement.css('display','none');
			},
			bind: function() {
				var that = this;
				this.touch.bind('click', function(e, p) {
					that.open = !that.open;
					that.layout();
				}).bind('scroll', null);


				function bodyMoveUp(e) {
					e.stopPropagation();
					var evObj = document.createEvent('MouseEvents');
					evObj.initEvent('mouseup', false, false);
					that.pagePanelElement.dispatchEvent(evObj);
				}

				var startPoint = null;
				var left = null;
				this.touch.bind('scroll', this.pagePanelElement, function(e, p) {
					// if (that.touch.isInElement(p, that.buttonElement)) {
					startPoint = p;
					left = that.buttonElement.offsetLeft;
					// 给body绑定触发mouseup事件
					document.body.addEventListener('mouseup', bodyMoveUp, false);
					// }

				}, function(e, p) {
					if (startPoint == null)
						return;

					var lf = left + (p.x - startPoint.x);
					var maxLeft = that.pagePanelElement.offsetWidth - that.buttonElement.offsetWidth;
					if (lf <= 0)
						lf = 0;
					else if (lf > maxLeft)
						lf = maxLeft;

					that.buttonElement.css('left',lf + 'px');

				}, function(e, p) {
					var btnOffset = that.buttonElement.offsetLeft;
					var length = that.processElement.offsetWidth;
					var categoryDataLength = self.chart.series.option[0].data.length;

					/*
						设置按钮位置 需要计算实际分割的页数情况
						categoryPageCapacity 数值有可能出现一样的情况
					*/
					// 如果数据长度小于页数，则把最大页数置为数据长度
					if (categoryDataLength < that.maxPage)
						that.maxPage = categoryDataLength;

					// 计算一页显示的逻辑轴的个数的情况
					var object = {};
					for (var i = 1; i <= that.maxPage; i++) {
						object[Math.ceil(categoryDataLength / i)] = i;
					}

					// 计算实际分页的情况的个数
					var pageNumber = 0;
					var pageArray = [];
					for (var i in object) {
						pageNumber++;
						pageArray.push(object[i]);
					}
					pageArray.sort();

					var avg = length / (pageNumber - 1);
					var value2 = 1 + (pageNumber - 1) * (btnOffset + that.buttonElement.offsetWidth * 0.5) / length;
					value2 = Math.round(value2);
					var left = 0;
					if (value2 <= 1) {
						left = 0;
					} else if (value2 == pageNumber) {
						left = that.processElement.offsetWidth - that.buttonElement.offsetWidth;
					} else {
						left = (value2 - 1) * avg - that.buttonElement.offsetWidth * 0.5;
					}

					that.buttonElement.css('left',left + 'px');

					self.chart.pageZoom(pageArray[value2 - 1]);


					startPoint = null;
					// 移出body的mouseup事件
					document.body.removeEventListener('mouseup', bodyMoveUp, false);
				});
			}
		};


		/*
			气泡转散点
		*/
		var ScatterTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '散点图';
		};
		ScatterTool.prototype = {
			init: function() {
				this.bind();
			},
			bind: function() {
				this.touch.bind('click', function(e, p) {
					self.chart.series.scatter.ignoreBubble = !self.chart.series.scatter.ignoreBubble;
					self.chart.load();
				}).bind('scroll', null);
			}
		};


		/*
			线转柱子
		*/
		var BarTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '柱状图';
		};
		BarTool.prototype = {
			init: function() {
				this.bind();
			},
			bind: function() {
				var that = this;
				this.touch.bind('click', function(e, p) {
					that.open = !that.open;
					self.chart.toBar(that.open);
				}).bind('scroll', null);
			}
		};


		/*
			柱子转线
		*/
		var LineTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '折线图';
		};
		LineTool.prototype = {
			init: function() {
				this.bind();
			},
			bind: function() {
				var that = this;
				this.touch.bind('click', function(e, p) {
					that.open = !that.open;
					self.chart.toLine(that.open);
				}).bind('scroll', null);
			}
		};

		/*
			启动堆叠工具
		*/
		var StackTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '堆叠';
		};
		StackTool.prototype = {
			init: function() {
				this.bind();
			},
			bind: function() {
				var that = this;
				this.touch.bind('click', function(e, p) {
					that.open = !that.open;
					self.chart.stackable(that.open);
				}).bind('scroll', null);
			}
		};


		/*
			转曲线
		*/
		var SmoothTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '曲线图';
		};
		SmoothTool.prototype = {
			init: function() {
				this.bind();
			},
			bind: function() {
				var that = this;
				this.touch.bind('click', function(e, p) {
					that.open = !that.open;
					self.chart.toSmooth(that.open);
				}).bind('scroll', null);
			}
		};


		/*
			转饼图
		*/
		var PieTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '饼图';
		};
		PieTool.prototype = {
			init: function() {
				this.bind();
			},
			bind: function() {
				var that = this;
				this.touch.bind('click', function(e, p) {
					that.open = !that.open;
					self.chart.toPie(that.open);
				}).bind('scroll', null);
			}
		};


		/*
			转雷达图
		*/
		var RadarTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '雷达图';
		};
		RadarTool.prototype = {
			init: function() {
				this.bind();
			},
			bind: function() {
				var that = this;
				this.touch.bind('click', function(e, p) {
					that.open = !that.open;
					self.chart.toRadar(that.open);
				}).bind('scroll', null);
			}
		};



		/*
			旋转
		*/
		var SwapTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '旋转';
		}
		SwapTool.prototype = {
			init: function() {
				// this.parse();
				this.bind();
			},
			bind: function() {
				var that = this;
				this.touch.bind('click', function(e, p) {
					that.parse();
					self.chart.swap();
				});
			},
			parse: function() {
				var axisConfig = self.chart.parameters.axisConfig;
				var axisType = self.chart.parameters.axisType;
				var option = self.chart.option;
				var oldCategoryData = [];
				var series = []
				var newCategoryData = [];
				var seriesData = [];
				if (axisConfig.bottom == axisType.CATEGORY || axisConfig.top == axisType.CATEGORY) {
					oldCategoryData = option.xAxis[0].data;
				} else if (axisConfig.right == axisType.CATEGORY || axisConfig.left == axisType.CATEGORY) {
					oldCategoryData = option.yAxis[0].data;
				}
				series = option.series;

				// 获取新的逻辑轴data
				for (var i = 0; i < series.length; i++) {
					newCategoryData.push(series[i].name);
					seriesData.push(series[i].data);
				}


				// 处理新的series
				if (series.length > oldCategoryData.length)
					series.splice(oldCategoryData.length, series.length - oldCategoryData.length);

				var types = [];
				var j;
				for (var i = 0; i < oldCategoryData.length; i++) {
					var data = [];
					for (j = 0; j < seriesData.length; j++)
						data.push(seriesData[j][i]);

					if (series[i]) {
						series[i].name = oldCategoryData[i];
						series[i].data = data;
						types.push(series[i].type);
					} else {
						var serie = {};
						serie.name = oldCategoryData[i];
						serie.data = data;
						serie.type = types[0];
						series.push(serie);
					}
				}

				if (axisConfig.bottom == axisType.CATEGORY || axisConfig.top == axisType.CATEGORY) {
					option.xAxis[0].data = newCategoryData;
				} else if (axisConfig.right == axisType.CATEGORY || axisConfig.left == axisType.CATEGORY) {
					option.yAxis[0].data = newCategoryData;
				}
			}
		};


		/*
			还原工具
		*/
		var RestoreTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '还原';
		};
		RestoreTool.prototype = {
			init: function() {
				this.bind();
			},
			bind: function() {
				var that = this;
				this.touch.bind('click', function(e, p) {
					self.chart.restore();
				});
			}
		};


		/*
			保存为图片
		*/
		var SaveAsImageTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '保存为图片';
		};
		SaveAsImageTool.prototype = {
			init: function() {
				this.bind();
			},
			bind: function() {
				var that = this;
				this.touch.bind('click', function(e, p) {
					self.chart.saveAsImage();
				});
			}
		};


		var HelpTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '帮助';
			this.imageArray = [];
			this.handle = null;
		};
		HelpTool.prototype = {
			init: function() {
				this.bind();
			},
			layout: function(status) {
				if (status) {
					this.imageArray = [];
					for (var i = 0; i < self.box.tools.length; i++) {
						var tool = self.box.tools[i];
						var image = tool.image;
						this.imageArray.push(image);


						image = image.replace('.png', '_help.png');
						tool.element.css({
							transform: 'scaleX(-1)',
							backgroundImage: 'url("' + image + '")'
						});
					}
					
					this.handle && clearTimeout(this.handle);
					this.handle = setTimeout(function() {
						this.open = false;
						this.layout(this.open);
					}.bind(this), 6000);

				} else {
					for (var i = 0; i < self.box.tools.length; i++) {
						var tool = self.box.tools[i];
						tool.element.css({
							transform: 'scaleX(1)',
							backgroundImage: 'url("' + this.imageArray[i] + '")'
						});
					}
				}
			},
			bind: function() {
				var that = this;
				this.touch.bind('click', function(e, p) {
					that.open = !that.open;
					that.layout(that.open);
				});
			}
		};



		var TableTool = function(element, image, disable) {
			Tool.call(this, element, image, disable);
			this.name = '表格';
			this.wrapper = null;
			this.contentBox = null;
			this.closeButton = null;
		};
		TableTool.prototype = {
			init: function() {
				this.createTable();
				this.bind();
			},
			createTable: function() {
				this.wrapper = createTagByParentElement(self.element, 'div');
				// this.wrapper.style.cssText = 'background:red';
				this.wrapper.css({
					width: '100%',
					height: '100%',
					position: 'absolute',
					top: '0',
					left: '0',
					zIndex: 100,
					background: 'none',
					visibility: 'hidden',
					transition: 'all .3s linear',
					boxSizing: 'border-box',
					userSelect: 'none',
				});

				this.contentBox = createTagByParentElement(this.wrapper, 'div');
				this.contentBox.css({
					position: 'absolute',
					width: '100%',
					height: '100%',
					background: 'white',
					fontSize : '12px',
					fontFamily: '"微软雅黑","宋体",Arial',
					boxSizing: 'border-box',
					boxShadow: '0 0 5px',
					overflowX: 'hidden',
					overflowY: 'visible',
					borderRadius: '3px',
					userSelect: 'none',
					cursor : 'default'
				});


				this.closeButton = createTagByParentElement(this.wrapper, 'a');
				this.closeButton.innerHTML = '关闭';
				this.closeButton.css({
					position: 'absolute',
					display: 'block',
					backgroundColor: '#0d9572',
					font: '12px/18px "微软雅黑","宋体",Arial',
					padding: '5px',
					height: '20px',
					lineHeight: '20px',
					width: '42px',
					bottom: '16px',
					right: '16px',
					cursor: 'pointer',
					textAlign: 'center',
					userSelect: 'none'
				});
			},
			layout: function() {
				if (this.open) {
					this.wrapper.css({
						opacity: '1',
						background: 'white',
						visibility: 'visible'
					});

				} else {
					this.wrapper.css({
						opacity: '0',
						background: 'none',
						visibility: 'hidden'
					});
				}
			},
			bind: function() {
				var that = this;
				var right_top_table = null;
				var right_bottom_table = null;
				var left_bottom_table = null;
				var right_td_width = null;
				var right_bottom_table_width = null;
				var right_td_height = null;
				var right_bottom_table_height = null;
				this.touch.bind('click', function(e, p) {
					that.open = !that.open;
					if (that.contentBox.hasChildNodes())
						that.contentBox.removeChild(that.contentBox.firstChild);
					that.contentBox.appendChild(self.chart.toTable(that.open));

					var contentTable = that.contentBox.firstChild;
					for(var i = 0;i < contentTable.childNodes.length;i++) {
						var tr = contentTable.childNodes[i];
						for(var j = 0;j < tr.childNodes.length;j++) {
							var element = tr.childNodes[j].firstChild;
							if(i == 0 && j == 1) {
								right_top_table = element;
							}else if(i == 1 && j == 0){
								left_bottom_table = element;
							}else if(i == 1 && j == 1) {
								right_bottom_table = element;
							}
						}
					}

					that.layout();


					right_td_width = that.contentBox.firstChild.childNodes[1].childNodes[1].offsetWidth;
					right_td_height = that.contentBox.firstChild.childNodes[1].childNodes[1].offsetHeight;
					right_bottom_table_width = right_bottom_table.offsetWidth;
					right_bottom_table_height = right_bottom_table.offsetHeight;
				});

				// 关闭按钮事件
				this.touch.bind('click', this.closeButton, function(e, p) {
					that.open = !that.open;
					that.layout();
				});


				// 滑动事件
				var startPoint = null;
				var oldOffsetLeft = null;
				var oldOffsetTop = null;
				that.touch.bind('scroll', that.contentBox, function(e,p) {
					e.preventDefault();
					startPoint = p;
					oldOffsetLeft = right_bottom_table.offsetLeft;
					oldOffsetTop = right_bottom_table.offsetTop;
					if(that.touch.parameters.runPlatform == 'web') {
						document.body.addEventListener('mouseup',bodyMouseup, false);
					}else if(that.touch.parameters.runPlatform == 'mobile') {
						document.body.addEventListener('touchend', bodyMouseup, false);
					}
				},function(e, p) {
					// 左右滑动
					var left = 0;
					var minusWidth = right_td_width - right_bottom_table_width;
					if(minusWidth >= 0) {
						left = 0;
					}else {
						left = p.x - startPoint.x;
						left += oldOffsetLeft;
						if(left > 0)
							left = 0;
						else if(left < minusWidth)
							left = minusWidth;
					}
					right_top_table.css('left',left + 'px');
					right_bottom_table.css('left',left + 'px');


					// 上下滑动
					var top = 0;
					var minusHeight = right_td_height - right_bottom_table_height;
					if(minusHeight >= 0) {
						top = 0;
					}else {
						top = p.y - startPoint.y;
						top += oldOffsetTop;
						if(top > 0)
							top = 0;
						else if(top < minusHeight) {
								top = minusHeight;
						}
					}
					left_bottom_table.css('top',top + 'px');
					right_bottom_table.css('top',top + 'px');
				},function(e,p) {
					startPoint = null;
					if(that.touch.parameters.runPlatform == 'web') {
						document.body.removeEventListener('mouseup',bodyMouseup, false);
					}else if(that.touch.parameters.runPlatform == 'mobile') {
						document.body.removeEventListener('touchend', bodyMouseup, false);
					}
				});

				function bodyMouseup() {
					var evObj = document.createEvent('MouseEvents');
					if(that.touch.parameters.runPlatform == 'web') {
						evObj.initEvent('mouseup', false, false);
					}else if(that.touch.parameters.runPlatform == 'mobile') {
						evObj.initEvent('touchend', false, false);
					}
					that.contentBox.dispatchEvent(evObj);
				}

				

			}
		};


/*=========================== 工具对象 end================================*/




		/*
			触摸事件
		*/
		var Touch = function(element) {
			this.parameters = {};
			this.element = element;

			// 保存当前运行js的平台 mobile // web
			if (window.navigator.platform.indexOf("Win") != -1 || window.navigator.platform.indexOf("Mac") != -1) {
				this.parameters.runPlatform = "web";
			} else {
				this.parameters.runPlatform = "mobile";
			}

			this.eventType = {
				CLICK: "click",
				SCROLL: "scroll",
				TOUCH: "touch",
				MOVE: "move"
			};
		};
		Touch.prototype = {
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
			move: function(moveCallback) {
				var _this = this;
				this.mousemove = function(e) {
					e.stopPropagation();
					moveCallback && moveCallback(e, _this.getPoint(e));
				}
				this.element.addEventListener("mousemove", this.mousemove, false);
			},
			click: function(callback) {
				var _this = this;
				var runPlatform = this.parameters.runPlatform;
				var range = 10;
				var startPoint = {};
				var currentPoint = {};

				this.clickstart = function(e) {
					e.stopPropagation();
					startPoint = _this.getPoint(e);
					currentPoint = startPoint;
					_this.element.addEventListener(runPlatform == "web" ? "mousemove" : "touchmove", _this.clickmove, false);
				};
				this.clickmove = function(e) {
					e.stopPropagation();
					currentPoint = _this.getPoint(e);;
				};
				this.clickend = function(e) {
					e.stopPropagation();
					if (Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2) < Math.pow(range, 2)) {
						callback && callback(e, startPoint);
					}
					_this.element.removeEventListener(runPlatform == "web" ? "mousemove" : "touchmove", _this.clickmove, false);
				};

				this.element.addEventListener(runPlatform == "web" ? "mousedown" : "touchstart", this.clickstart, false);
				this.element.addEventListener(runPlatform == "web" ? "mouseup" : "touchend", this.clickend, false)
			},
			scroll: function(startCallback, moveCallback, endCallback) {
				var _this = this;
				var runPlatform = this.parameters.runPlatform;
				var range = 10;
				var startPoint = {};
				var currentPoint = {};

				this.touchstart = function(e) {
					e.stopPropagation();
					startPoint = _this.getPoint(e);
					currentPoint = startPoint;
					startCallback && startCallback(e, startPoint);
					_this.element.addEventListener(runPlatform == "web" ? "mousemove" : "touchmove", _this.touchmove, false);
				};
				this.touchmove = function(e) {
					e.stopPropagation();
					var point = _this.getPoint(e);
					moveCallback && moveCallback(e, point);
					currentPoint = point;
				};
				this.touchend = function(e) {
					e.stopPropagation();
					// if (Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2) > Math.pow(range, 2)) {
					endCallback && endCallback(e, startPoint);
					// }
					_this.element.removeEventListener(runPlatform == "web" ? "mousemove" : "touchmove", _this.touchmove, false);
				};
				this.element.addEventListener(runPlatform == "web" ? "mousedown" : "touchstart", this.touchstart, false);
				this.element.addEventListener(runPlatform == "web" ? "mouseup" : "touchend", this.touchend, false)
			},
			bind: function(type) {
				if (typeof arguments[1] == 'function') {
					if (type == this.eventType.CLICK) {
						this.click(arguments[1]);
					} else if (type == this.eventType.MOVE) {
						if (this.parameters.runPlatform == "web") {
							this.move(arguments[1], arguments[2]);
						}
					} else if (type == this.eventType.SCROLL) {
						this.scroll(arguments[1], arguments[2], arguments[3]);
					}
				} else if (arguments[1] != null && typeof arguments[1] == 'object') {
					this.element = arguments[1];
					if (type == this.eventType.CLICK) {
						this.click(arguments[2]);
					} else if (type == this.eventType.MOVE) {
						if (this.parameters.runPlatform == "web") {
							this.move(arguments[3], arguments[4]);
						}
					} else if (type == this.eventType.SCROLL) {
						this.scroll(arguments[2], arguments[3], arguments[4]);
					}
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
			},
			isInElement: function(point, element) {
				var x = element.offsetLeft;
				var y = element.offsetTop;
				var w = element.clientWidth;
				var h = element.clientHeight;

				if (point.x > x && point.x < x + w && point.y > y && point.y < y + h)
					return true;
				return false;
			}
		};



		(function() {
			var type = self.option.toolbox.type || 'arc';
			if (type == 'rect') {
				self.box = new RectBox();
			} else if (type == 'arc') {
				self.box = new ArcBox();
			}
			self.box.init();
		})();
	};



	/*
		创建html标签
	*/
	function createTagByParentElement(parentElement, tag) {
		var element = document.createElement(tag);
		parentElement.appendChild(element);
		return element;
	}

	function getToolImage(type, arg) {
		var image = '';
		arg = arg || '';

		var scripts = document.getElementsByTagName('script');
		for (var i = 0; i < scripts.length; i++) {
			var path = scripts[i].src;
			if (path.lastIndexOf('mobilechart-tools.js') != -1) {
				image = path.replace('mobilechart-tools.js', '');
				break;
			}
		}

		if (type == 'zoom') {
			image += 'res/zoom' + arg + '.png';
		} else if (type == 'zoomback') {
			image += 'res/zoomback' + arg + '.png';
		} else if (type == 'scatter') {
			image += 'res/scatter' + arg + '.png';
		} else if (type == 'bar') {
			image += 'res/bar' + arg + '.png';
		} else if (type == 'stack') {
			image += 'res/stack' + arg + '.png';
		} else if (type == 'smooth') {
			image += 'res/smooth' + arg + '.png';
		} else if (type == 'line') {
			image += 'res/line' + arg + '.png';
		} else if (type == 'page') {
			image += 'res/scroll' + arg + '.png';
		} else if (type == 'swap') {
			image += 'res/swap' + arg + '.png';
		} else if (type == 'restore') {
			image += 'res/restore' + arg + '.png';
		} else if (type == 'save') {
			image += 'res/save' + arg + '.png';
		} else if (type == 'table') {
			image += 'res/table' + arg + '.png';
		} else if (type == 'pie') {
			image += 'res/pie' + arg + '.png';
		} else if (type == 'radar') {
			image += 'res/radar' + arg + '.png';
		} else if (type == 'help') {
			image += 'res/help' + arg + '.png';
		} else {
			image += 'res/tools' + arg + '.png';
		}
		return image;
	}

	function clone(object) {
		function f() {}
		f.prototype = object;
		f.prototype.constructor = f;
		return new f();
	}

	if (!window.Mobilechart)
		window.Mobilechart = new Object();
	window.Mobilechart.toolbox = ToolBox;
})();