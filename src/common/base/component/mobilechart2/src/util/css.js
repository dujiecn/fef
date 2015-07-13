/**
 * 设置元素样式
 * @author j.d
 */
define(function(require) {
	function css() {
		var _arg = arguments;
		if (_arg.length == 3) {
			_set.call(_arg[0], _arg[1], _arg[2]);
		} else if (_arg.length == 2) {
			for (var prop in _arg[1]) {
				_set.call(_arg[0], prop, _arg[1][prop]);
			}
		}
	}


	function _set(prop, val) {
		var css3 = {
			'transition': '',
			'transform': '',
			'boxSizing': '',
			'borderRadius': '',
			'userSelect': ''
		};

		if (css3[prop]) {
			var _fristWord = prop.substr(0, 1).toLocaleUpperCase();
			var _nextWord = prop.substring(1, prop.length);
			var newProp = _fristWord + _nextWord;
			this.style['webkit' + newProp] =
				this.style['Moz' + newProp] =
				this.style['ms' + newProp] =
				this.style['O' + newProp] =
				this.style[prop] = val;
		} else {
			this.style[prop] = val
		}
	}

	return css;
});