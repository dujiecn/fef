define(function(require, exports, module) {
	module.exports = function(callback) {
		var request = require('./request');
		var util = require('./util');
		var env = require('./env');

		if (util.isEmpty(sessionStorage.getItem("userId")) ||
			 util.isEmpty(sessionStorage.getItem("consId"))) {
			window.getLoginInfo = function(unique, module, method, json) {
				var data = JSON.parse(json);
				if (data == 3)
					return;

				sessionStorage.setItem("userId", data.userId);
				sessionStorage.setItem("consId", data.codes.split(",")[1].split("|")[0]);
				callback();
			};

			window.logout = function() {
				localStorage.clear();
				sessionStorage.clear();
			};

			if (env.isPc()) {
				getLoginInfo(null, null, null, JSON.stringify({
					userId: "201672",
					codes: "100009|320581,42|2"
				}));
			} else {
				// 移动端
				native.sendDataToNative({
					version: 1,
					errorCb: "getLoginInfo",
					successCb: "getLoginInfo",
					description: {
						unique: 1,
						module: 4,
						method: 60,
						params: ""
					}
				});
			}
		} else {
			callback();
		}
	}
});