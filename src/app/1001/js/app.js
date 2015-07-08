define(function(require) {
	var tpl = require('../tpl/t.tpl');
	console.log(ejs.render(tpl,{msg:'hello dujie'}));
});