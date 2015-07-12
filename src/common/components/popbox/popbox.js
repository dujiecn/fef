/*
	改写默认的alert confirm
*/
define(function(require) {
	require('./popbox.css');

	var tpl = require('./popbox.html');

	window.alert = function(title,msg) {
		if(arguments.length == 1) {
			msg = title;
			title = "提示";
		}

		$(document.body).append(ejs.render(tpl,{poptype:'alert',title:title,msg:msg}));
	}	
})