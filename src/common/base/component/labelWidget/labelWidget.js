define("common/base/component/labelWidget/labelWidget",function(require,exports,module) {
	function LabelPanel(element,array) {
		if(!array || array.length == 0)
			return; 

		var root_element = null;
		var label_wrapper_element = null;
		var label_scroller_element = null;
		var label_content_element = null;
		var scrollable = true;
		var labels = [];

		this.init = function() {
			createHTML();
		};


		function createHTML() {
			root_element = $(element);
			label_wrapper_element = $("<div class='u-wrapper-label'>");
			label_scroller_element = $("<div class='u-scroller-label'>");
			label_content_element = $("<div class='u-content-label'>");
			label_scroller_element.append(label_content_element); 
			label_wrapper_element.append(label_scroller_element);
			root_element.append(label_wrapper_element);

			for(var i = 0;i < array.length;i++) {
				var label = new Label(array[i]);
				label_content_element.append(label.element);
				labels.push(new Label(array[i]));
			}
		}


		function Label(text) {
			this.text = text;
			this.element = $("<div class='u-label'>");
			this.text_element = $("<span class='text'>").text(text);
			this.close_element = $("<a href='javascript:void(0);' class='close'>");
			this.element.append(this.text_element).append(this.close_element);
		}	





	}

	exports.LabelPanel = LabelPanel;
});