var scripts = document.scripts;
var baseScriptEl = scripts[scripts.length - 1];
var baseUrl = baseScriptEl.getAttribute("src").match(/^(\.\.\/)*/g);
// 保存app应用的前缀路径（发布应用包的时候应用名称会改变）
window.APP_PATH = location.pathname.match(/\bapp\/.+\//);

seajs.config({
	debug:true,
	base:baseUrl,
	paths:{
		"base":"common/base",
		"lib":"common/lib",
		"components":"common/components"
	},
	alias:{
		"seajs-css":"lib/seajs/seajs-css",
		"seajs-text":"lib/seajs/seajs-text",
		"seajs-log":"lib/seajs/seajs-log",
		"jquery":"lib/jquery/jquery.min",
		"ejs":"lib/ejs/ejs.min",
		"hammer":"lib/hammer/hammer.min",
		"d3":"lib/d3/d3.min",
		"login":"base/js/login"
	}
});

seajs.use(["jquery","seajs-css","seajs-text","seajs-log","ejs"]);





