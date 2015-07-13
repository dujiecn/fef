define(function(require,exports,module) {

	/*
		u-panel 节点 
	*/
	function Side(element,useMaskview,scrollable) {
		if($(element).length == 0)
			throw new Error("create side menu error...");
		
		this.element = $(element);

		this.closeElement = this.element.find(".header .close");

		this.contentElement = this.element.find(".content");
		
		this.useMaskview = useMaskview || true;
		if(this.useMaskview) {
			var mask = require("./maskview");
			this.mask = new mask.Mask(null,this);
		}

		this.myScroll = null;
		if(scrollable != false)
			this.scrollable = true;
		else
			this.scrollable = scrollable;
	}
	Side.prototype.show = function() {
		this.setStyle();

		this.mask && this.mask.show();
		
		if(this.myScroll == null && this.scrollable) {
			this.myScroll = new IScroll(this.contentElement[0],{
				mouseWheel: false,
				scrollbars: false,
				click: true,
				// fixedScrollbar: true,
				// bounce: true,
				// momentum: true,
				// interactiveScrollbars: true,
				shrinkScrollbars: 'scale',
				fadeScrollbars: true
			});
			this.element.data("myScroll",this.myScroll);
		}
		this.element.addClass("show");
		this.bind();
	};
	Side.prototype.setStyle = function() {
		// this.element.css({
		// 	top:$(document).scrollTop()
		// });
	};
	Side.prototype.hide = function() {
		this.element.removeClass("show");
		this.mask && this.mask.hide();
		this.unbind();
	};
	Side.prototype.bind = function() {
		this.closeElement.on("click",function() {
			this.hide();
			if(this.mask) {
				this.mask.hide();
			}
		}.bind(this));

		$(document).off("touchmove").on("touchmove",function(e) {e.preventDefault()});
	};
	Side.prototype.unbind = function() {
		this.closeElement.off("click");
		$(document).off("touchmove");
	};
	

	module.exports.Side = Side;
});