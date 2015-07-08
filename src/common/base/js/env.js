define(function(require,exports,module) {
	var ua = navigator.userAgent;

	function test(reg) {
		return reg.test(ua);
	}

	module.exports = {
		isPc:function() {
			return test(/(mac|window)/i);
		},
		isMobile:function() {
			return test(/(android|iphone)/i);
		}
	};
});