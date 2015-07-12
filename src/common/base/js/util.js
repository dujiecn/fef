/*
	工具模块
*/
define(function(require,exports,module) {
	module.exports = {
		isEmpty:function(str) {
			return str === '' || 
				str === null || 
				str === undefined || 
				str === 'null' ||
				str === 'undefined';
		},
		isEmptyObject:function(obj) {
			for(var k in obj) {}
			return k === undefined;
		}
	};
})