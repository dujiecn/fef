/*
	包含ajax请求和native请求
*/
define(function(require, exports, module) {
	$.ajaxSetup({
		type: "GET",
		timeout: 60000,
		dataType: "jsonp",
		error: function(jqXHR, textStatus, errorThrown) {
			console.error(textStatus);
		}
	});

	module.exports = {
		send2native: function(data) {
			setTimeout(function() {
				window.location.href = "native-call?data=" + JSON.stringify(data);
			}, 300);
		},
		send2server: function(data) {
			return $.ajax(data);
		}
	};
});