define(function(require,exports,module) {

	function Mask(element,side) {
		if($(element).length == 0) {
			this.element = $("<div>").addClass("u-mask").appendTo(document.body);//.appendTo("div[data-role='page']");
		}else {
			this.element = $(element);
		}
		this.side = side;
	}
	Mask.prototype.show = function() {
		this.bind();
		
		this.element.css("display","block");
		setTimeout(function() {
			this.element.removeClass("hide").addClass("show");
			// $(document).on("touchmove",function(e) {e.preventDefault()});
		}.bind(this),10);
	};
	Mask.prototype.hide = function() {
		this.element.removeClass("show").addClass("hide");
		setTimeout(function() {
			this.unbind();
			this.element.css("display","none");
			// $(document).off("touchmove");
		}.bind(this),300);
		
	};
	Mask.prototype.bind = function() {
		this.element.on("click",function() {
			this.hide();
			if(this.side) {
				this.side.hide();
				// this.side = null;
			}
		}.bind(this));
	};
	Mask.prototype.unbind = function() {
		this.element.off("click");
	};

	module.exports.Mask = Mask;
});