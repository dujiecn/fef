/**
 * 数字运算相关
 * @author j.d
 */
define(function() {
	function _trim(str) {
		return str.replace(/^\s+/, '').replace(/\s+$/, '');
	}

	/**
	 *  百分比计算 如果是百分比的值，则需要传最大值参数，如果不是百分比则直接返回
	 * @param {String|Number} value
	 * @param {Number} [maxValue]
	 */
	function parsePercent(value, maxValue) {
		if (typeof value === 'string') {
			if (_trim(value).match(/%$/)) {
				return parseFloat(value) / 100 * maxValue;
			}

			return parseFloat(value);
		}

		return value;
	}

	/**
	 * 获取中心坐标
	 */
	function parseCenter(zr, center) {
		return [
			parsePercent(center[0], zr.getWidth()),
			parsePercent(center[1], zr.getHeight())
		];
	}

	/**
	 * 获取自适应半径
	 */
	function parseRadius(zr, radius) {
		// 传数组实现环形图，[内半径，外半径]，传单个则默认为外半径为
		if (!(radius instanceof Array)) {
			radius = [0, radius];
		}
		var zrSize = Math.min(zr.getWidth(), zr.getHeight()) / 2;
		return [
			parsePercent(radius[0], zrSize),
			parsePercent(radius[1], zrSize)
		];
	}

	/**
	 * 每三位默认加,格式化
	 */
	function addCommas(x) {
		if (isNaN(x)) {
			return '-';
		}
		x = (x + '').split('.');
		return x[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,') + (x.length > 1 ? ('.' + x[1]) : '');
	}

	/**
	 * 将有断点的二位数组返回为多个无断点的二维数组
	 */
	 function getLinePoints(pointArray){
	 	var resultPoint = [];
	 	var _pointArr = [];
	 	for(var i=0;i < pointArray.length;i++){
	 		if(!isNaN(pointArray[i][1])){	//不是'-'的情况
	 			_pointArr.push(pointArray[i]);
	 		}else{
	 			if(_pointArr.length > 1){
	 				resultPoint.push(_pointArr);
					_pointArr = [];
	 			}
	 		}
	 	}
	 	if (_pointArr.length > 0) {
				resultPoint.push(_pointArr);
		}

	 	return resultPoint;
	 }



	return {
		parsePercent: parsePercent,
		parseCenter: parseCenter,
		parseRadius: parseRadius,
		addCommas: addCommas,
		getLinePoints:getLinePoints
	};
});