/*
	模块头的进度条样式
	<div class="g-grid" id="info">
		<div class="title">
		</div>
		<div class="content">
			<div class="wrapper">
			</div>
		</div>
	</div>
*/

define(function(require, exports, module) {
	// require('./progress.css');

	function Progress(element) {
		if(element) {
			this.rootElement = $(element).addClass('u-progress-container');
		}else {
			this.rootElement = $(document.body).addClass('u-progress-container');
		}

		this.element = null;
		this.PRECENT_NUM = 80;
		this.handler = null;
		this.TIMEOUT = 60000;
		this.STATUS_TYPE = {RUNNING:1,STOPED:2}; 
		this.status = this.STATUS_TYPE.STOPED;
		this.isRun = false;
	};
	Progress.prototype.create = function() {
		this.element = $("<div>").addClass("progress").appendTo(this.rootElement);
	};
	Progress.prototype.start = function() {
		this.shutdown();
		this.create();

		this.status = this.STATUS_TYPE.RUNNING;
		this.isRun = true;

		var count = 0;
		var maxCount = Math.round(Math.random() * 6) + 1;
		var startValue = Math.random() * 30;
		this.element.width(startValue + "%");
		this.handler && clearInterval(this.handler);
		this.handler = setInterval(function() {
			if (maxCount == count)
				clearInterval(this.handler);
			startValue += Math.random() * (90 - startValue);
			this.element.width(startValue + "%");
			count++;
		}.bind(this), 600);
		
		
		// 设置请求超时之后过多长时间自动停止加载
		setTimeout(function() {
			if(this.status == this.STATUS_TYPE.RUNNING) {
				this.isRun = false;
				this.stop();
			}
		}.bind(this),this.TIMEOUT);
	};
	Progress.prototype.reset = function() {
		this.status = this.STATUS_TYPE.STOPED;
		this.isRun = false;
		this.element.css({
			width : "0",
			opacity : "1"
		});
	};
	Progress.prototype.stop = function() {
		this.status = this.STATUS_TYPE.STOPED;
		this.isRun = false;
		clearInterval(this.handler);
		this.handler = null;
		this.element.width("100%");
		setTimeout(function() {
			this.element.css("opacity", "0");
			this.element.remove();
		}.bind(this), 600);
	};
	Progress.prototype.getStatus = function() {
		return this.status;
	};
	/*
		外部强制停止（删除进度条元素）
	*/
	Progress.prototype.shutdown = function() {
		this.element && this.element.remove();
	}


	module.exports.Progress = Progress;
});